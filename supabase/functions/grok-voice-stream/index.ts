import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const XAI_API_KEY = Deno.env.get('XAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Base64 encode for WebSocket key
function generateWebSocketKey(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

// Create WebSocket with Authorization header using raw TLS connection
// IMPORTANT: We must not drop any bytes that arrive after the HTTP 101 headers.
async function createAuthenticatedWebSocket(
  url: string,
  authHeader: string,
): Promise<{
  reader: ReadableStreamDefaultReader<Uint8Array>;
  writer: WritableStreamDefaultWriter<Uint8Array>;
  close: () => void;
}> {
  const parsedUrl = new URL(url);
  const host = parsedUrl.hostname;
  const port = parsedUrl.port ? parseInt(parsedUrl.port) : 443;
  const path = parsedUrl.pathname + parsedUrl.search;

  // Connect via TLS
  const conn = await Deno.connectTls({ hostname: host, port });

  const wsKey = generateWebSocketKey();

  // Build HTTP upgrade request
  const upgradeRequest = [
    `GET ${path || "/"} HTTP/1.1`,
    `Host: ${host}`,
    `Upgrade: websocket`,
    `Connection: Upgrade`,
    `Sec-WebSocket-Key: ${wsKey}`,
    `Sec-WebSocket-Version: 13`,
    `Authorization: ${authHeader}`,
    ``,
    ``,
  ].join("\r\n");

  const encoder = new TextEncoder();
  await conn.write(encoder.encode(upgradeRequest));

  // Read handshake response (may also include first WS frames in the same TCP chunk)
  const decoder = new TextDecoder();
  const maxHandshakeBytes = 16 * 1024;
  let handshakeBuf = new Uint8Array(0);

  const readMore = async () => {
    const chunk = new Uint8Array(4096);
    const n = await conn.read(chunk);
    if (n === null) return null;
    const next = new Uint8Array(handshakeBuf.length + n);
    next.set(handshakeBuf);
    next.set(chunk.subarray(0, n), handshakeBuf.length);
    handshakeBuf = next;
    return n;
  };

  while (true) {
    const text = decoder.decode(handshakeBuf);
    const headerEnd = text.indexOf("\r\n\r\n");
    if (headerEnd !== -1) {
      const headerText = text.slice(0, headerEnd + 4);
      if (!headerText.includes(" 101 ")) {
        conn.close();
        throw new Error(`WebSocket handshake failed: ${headerText.split("\r\n")[0]}`);
      }

      console.log("WebSocket handshake successful");

      // Preserve any bytes after the headers (could already contain WS frames)
      const headerByteLen = new TextEncoder().encode(headerText).length;
      const leftover = handshakeBuf.subarray(headerByteLen);
      const leftoverCopy = new Uint8Array(leftover.length);
      leftoverCopy.set(leftover);

      const rawReader = conn.readable.getReader();
      const combinedReadable = new ReadableStream<Uint8Array>({
        start(controller) {
          if (leftoverCopy.length) controller.enqueue(leftoverCopy);
          (async () => {
            try {
              while (true) {
                const { value, done } = await rawReader.read();
                if (done) break;
                if (value) controller.enqueue(value);
              }
              controller.close();
            } catch (e) {
              controller.error(e);
            }
          })();
        },
        cancel() {
          try {
            rawReader.cancel();
          } catch (_) {
            // ignore
          }
          try {
            conn.close();
          } catch (_) {
            // ignore
          }
        },
      });

      return {
        reader: combinedReadable.getReader(),
        writer: conn.writable.getWriter(),
        close: () => conn.close(),
      };
    }

    if (handshakeBuf.length > maxHandshakeBytes) {
      conn.close();
      throw new Error("WebSocket handshake too large / malformed");
    }

    const n = await readMore();
    if (n === null) {
      conn.close();
      throw new Error("Connection closed during handshake");
    }
  }
}

// WebSocket frame encoder/decoder
function encodeWebSocketFrame(data: string): Uint8Array {
  const payload = new TextEncoder().encode(data);
  const payloadLength = payload.length;
  
  let header: Uint8Array;
  if (payloadLength < 126) {
    header = new Uint8Array([0x81, 0x80 | payloadLength]);
  } else if (payloadLength < 65536) {
    header = new Uint8Array([0x81, 0x80 | 126, (payloadLength >> 8) & 0xff, payloadLength & 0xff]);
  } else {
    throw new Error('Payload too large');
  }

  // Generate mask
  const mask = new Uint8Array(4);
  crypto.getRandomValues(mask);

  // Mask the payload
  const maskedPayload = new Uint8Array(payloadLength);
  for (let i = 0; i < payloadLength; i++) {
    maskedPayload[i] = payload[i] ^ mask[i % 4];
  }

  const frame = new Uint8Array(header.length + 4 + maskedPayload.length);
  frame.set(header, 0);
  frame.set(mask, header.length);
  frame.set(maskedPayload, header.length + 4);
  
  return frame;
}

function decodeWebSocketFrame(data: Uint8Array): { text: string | null, remaining: Uint8Array<ArrayBuffer> } {
  if (data.length < 2) {
    return { text: null, remaining: new Uint8Array(data) };
  }

  const firstByte = data[0];
  const secondByte = data[1];
  const isMasked = (secondByte & 0x80) !== 0;
  let payloadLength = secondByte & 0x7f;
  let offset = 2;

  if (payloadLength === 126) {
    if (data.length < 4) return { text: null, remaining: new Uint8Array(data) };
    payloadLength = (data[2] << 8) | data[3];
    offset = 4;
  } else if (payloadLength === 127) {
    if (data.length < 10) return { text: null, remaining: new Uint8Array(data) };
    payloadLength = 0;
    for (let i = 0; i < 8; i++) {
      payloadLength = (payloadLength << 8) | data[2 + i];
    }
    offset = 10;
  }

  if (isMasked) offset += 4;

  if (data.length < offset + payloadLength) {
    return { text: null, remaining: new Uint8Array(data) };
  }

  let payload = data.subarray(offset, offset + payloadLength);
  
  if (isMasked) {
    const mask = data.subarray(offset - 4, offset);
    const unmasked = new Uint8Array(payloadLength);
    for (let i = 0; i < payloadLength; i++) {
      unmasked[i] = payload[i] ^ mask[i % 4];
    }
    payload = unmasked;
  }

  const remainingData = new Uint8Array(data.buffer, data.byteOffset + offset + payloadLength, data.length - offset - payloadLength);
  const remainingCopy = new Uint8Array(remainingData.length);
  remainingCopy.set(remainingData);

  const opcode = firstByte & 0x0f;
  if (opcode === 0x01) { // Text frame
    return { 
      text: new TextDecoder().decode(payload), 
      remaining: remainingCopy 
    };
  } else if (opcode === 0x08) { // Close frame
    return { text: null, remaining: new Uint8Array(0) };
  } else if (opcode === 0x09) { // Ping
    return { text: null, remaining: remainingCopy };
  }
  
  return { text: null, remaining: remainingCopy };
}

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const url = new URL(req.url);
  const sessionIdFromUrl = url.searchParams.get('sessionId');

  console.log('WebSocket connection requested with sessionId (url):', sessionIdFromUrl);

  let campaignPrompt = '';
  let leadName = 'der Kunde';
  let leadCompany = '';

  const supabaseAdmin = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

  const { socket: twilioSocket, response } = Deno.upgradeWebSocket(req);

  let grokConn: { reader: ReadableStreamDefaultReader<Uint8Array>, writer: WritableStreamDefaultWriter<Uint8Array>, close: () => void } | null = null;
  let streamSid: string | null = null;
  let callSid: string | null = null;

  const defaultSystemPrompt = `Du bist ein freundlicher Vertriebsmitarbeiter.

DEINE AUFGABE:
- Stelle dich als virtueller Assistent vor
- Erkläre kurz das Angebot
- Finde heraus, ob Interesse besteht
- Bei Interesse: Vereinbare einen Rückruftermin
- Bei Ablehnung: Bedanke dich höflich

WICHTIGE REGELN:
- Stelle immer nur EINE Frage auf einmal
- Höre aktiv zu und gehe auf Einwände ein
- Bleibe immer höflich und professionell
- Respektiere ein "Nein"
- Halte das Gespräch kurz (max. 2-3 Minuten)
- Sprich IMMER auf Deutsch`;

  let systemPrompt = defaultSystemPrompt;
  let greeting = `Guten Tag, hier spricht der virtuelle Assistent. Haben Sie einen Moment Zeit?`;

  const closeGrok = () => {
    try {
      grokConn?.close();
    } catch (_) {
      // ignore
    }
    grokConn = null;
  };

  const sendToGrok = async (payload: unknown) => {
    if (!grokConn) return;
    try {
      const frame = encodeWebSocketFrame(JSON.stringify(payload));
      await grokConn.writer.write(frame);
    } catch (err) {
      console.error('Error sending to Grok:', err);
    }
  };

  twilioSocket.onopen = () => {
    console.log('Twilio WebSocket connected');
  };

  twilioSocket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.event) {
        case 'connected':
          console.log('Twilio stream connected');
          break;

        case 'start':
          streamSid = data.start.streamSid;
          callSid = data.start.callSid;
          console.log('Stream started:', streamSid);
          console.log('Call SID:', callSid);

          const sessionIdFromTwilio = data.start?.customParameters?.sessionId ?? null;
          const effectiveSessionId = sessionIdFromTwilio ?? sessionIdFromUrl;
          console.log('Effective sessionId:', effectiveSessionId);

          if (effectiveSessionId && supabaseAdmin) {
            try {
              const { data: session, error } = await supabaseAdmin
                .from('call_sessions')
                .select('*')
                .eq('id', effectiveSessionId)
                .single();

              if (error) {
                console.error('Error loading session:', error);
              } else if (session) {
                campaignPrompt = session.campaign_prompt || '';
                leadName = session.lead_name || 'der Kunde';
                leadCompany = session.lead_company || '';

                systemPrompt = campaignPrompt || defaultSystemPrompt;
                greeting = leadCompany
                  ? `Guten Tag, hier spricht der virtuelle Assistent. Spreche ich mit jemandem von ${leadCompany}?`
                  : `Guten Tag, hier spricht der virtuelle Assistent. Haben Sie einen Moment Zeit?`;

                console.log('Session loaded:', { leadName, leadCompany, promptLength: campaignPrompt.length });
              }
            } catch (err) {
              console.error('Error fetching session:', err);
            }
          }

          if (!XAI_API_KEY) {
            console.error('XAI_API_KEY is not set');
            break;
          }

          try {
            closeGrok();
            
            // Fetch ephemeral token
            console.log('Fetching ephemeral token...');
            const tokenResponse = await fetch('https://api.x.ai/v1/realtime/client_secrets', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${XAI_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ expires_after: { seconds: 300 } }),
            });

            if (!tokenResponse.ok) {
              const errText = await tokenResponse.text();
              console.error('Failed to fetch token:', tokenResponse.status, errText);
              break;
            }

            const tokenData = await tokenResponse.json();
            const ephemeralToken = tokenData.value;
            
            if (!ephemeralToken) {
              console.error('No token in response');
              break;
            }

            console.log('Got token, connecting to Grok with raw TLS...');
            
            // Connect using raw TLS with Authorization header
            grokConn = await createAuthenticatedWebSocket(
              'wss://api.x.ai/v1/realtime',
              `Bearer ${ephemeralToken}`
            );

            console.log('Connected to Grok Voice API');

            // Start reading from Grok
            let buffer = new Uint8Array(0);
            (async () => {
              if (!grokConn) return;
              
              try {
                while (true) {
                  const { value, done } = await grokConn.reader.read();
                  if (done) break;
                  
                  // Append to buffer
                  const newBuffer = new Uint8Array(buffer.length + value.length);
                  newBuffer.set(buffer);
                  newBuffer.set(value, buffer.length);
                  buffer = newBuffer;

                  // Try to decode frames
                  while (buffer.length > 0) {
                    const { text, remaining } = decodeWebSocketFrame(buffer);
                    if (text === null && remaining.length === buffer.length) break;
                    buffer = remaining;
                    
                    if (text) {
                      try {
                        const grokData = JSON.parse(text);

                        switch (grokData.type) {
                          case 'session.created':
                            console.log('Grok session created');

                            await sendToGrok({
                              type: 'session.update',
                              session: {
                                modalities: ['text', 'audio'],
                                instructions: systemPrompt,
                                voice: 'Grok-2',
                                input_audio_format: 'pcmu',
                                output_audio_format: 'pcmu',
                                input_audio_transcription: { model: 'whisper-1' },
                                turn_detection: {
                                  type: 'server_vad',
                                  threshold: 0.5,
                                  prefix_padding_ms: 300,
                                  silence_duration_ms: 800,
                                },
                                temperature: 0.7,
                              },
                            });
                            console.log('Session configured');

                            setTimeout(async () => {
                              await sendToGrok({
                                type: 'conversation.item.create',
                                item: {
                                  type: 'message',
                                  role: 'assistant',
                                  content: [{ type: 'input_text', text: greeting }],
                                },
                              });
                              await sendToGrok({ type: 'response.create' });
                              console.log('Greeting sent');
                            }, 500);
                            break;

                          case 'response.audio.delta':
                            if (grokData.delta && streamSid) {
                              twilioSocket.send(JSON.stringify({
                                event: 'media',
                                streamSid,
                                media: { payload: grokData.delta },
                              }));
                            }
                            break;

                          case 'response.audio_transcript.delta':
                            console.log('AI:', grokData.delta);
                            break;

                          case 'conversation.item.input_audio_transcription.completed':
                            console.log('User:', grokData.transcript);
                            break;

                          case 'error':
                            console.error('Grok error:', grokData.error);
                            break;
                        }
                      } catch (err) {
                        console.error('Parse error:', err);
                      }
                    }
                  }
                }
              } catch (err) {
                console.error('Grok read error:', err);
              }
              console.log('Grok stream ended');
            })();

          } catch (err) {
            console.error('Failed to connect to Grok:', err);
            closeGrok();
          }

          break;

        case 'media':
          if (grokConn) {
            await sendToGrok({
              type: 'input_audio_buffer.append',
              audio: data.media.payload,
            });
          }
          break;

        case 'stop':
          console.log('Stream stopped');
          closeGrok();
          break;

        default:
          console.log('Twilio event:', data.event);
      }
    } catch (error) {
      console.error('Error handling Twilio message:', error);
    }
  };

  twilioSocket.onerror = (error) => {
    console.error('Twilio error:', error);
    closeGrok();
  };

  twilioSocket.onclose = () => {
    console.log('Twilio closed');
    closeGrok();
  };

  return response;
});
