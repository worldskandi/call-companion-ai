import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { StandardWebSocketClient } from "https://deno.land/x/websocket@v0.1.4/mod.ts";

const XAI_API_KEY = Deno.env.get('XAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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

  let grokSocket: StandardWebSocketClient | null = null;
  let grokOpen = false;
  const grokPending: string[] = [];

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
      if (grokSocket && !grokSocket.isClosed) {
        grokSocket.close();
      }
    } catch (_) {
      // ignore
    }
    grokSocket = null;
    grokOpen = false;
    grokPending.length = 0;
  };

  const flushGrok = () => {
    if (!grokSocket || grokSocket.isClosed) return;

    // deno-lint-ignore no-explicit-any
    const readyState = (grokSocket as any).webSocket?.readyState;
    if (readyState !== 1) return;

    while (grokPending.length > 0) {
      const msg = grokPending.shift();
      if (!msg) continue;
      try {
        grokSocket.send(msg);
      } catch (err) {
        console.error('Error flushing to Grok:', err);
        break;
      }
    }
  };

  const sendToGrok = (payload: unknown) => {
    if (!grokSocket || grokSocket.isClosed) return;

    const msg = JSON.stringify(payload);

    // deno-lint-ignore no-explicit-any
    const readyState = (grokSocket as any).webSocket?.readyState;
    if (readyState === 1) {
      try {
        grokSocket.send(msg);
      } catch (err) {
        console.error('Error sending to Grok:', err);
      }
      return;
    }

    // Not open yet (CONNECTING) -> buffer
    grokPending.push(msg);
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

          // Prefer the sessionId provided by Twilio <Stream><Parameter/></Stream>
          const sessionIdFromTwilio = data.start?.customParameters?.sessionId ?? null;
          const effectiveSessionId = sessionIdFromTwilio ?? sessionIdFromUrl;
          console.log('Effective sessionId:', effectiveSessionId);

          // Load session context (prompt + lead info) if possible
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

                console.log('Session loaded successfully:', {
                  leadName,
                  leadCompany,
                  promptLength: campaignPrompt.length,
                });
              }
            } catch (err) {
              console.error('Error fetching session:', err);
            }
          } else {
            console.log('No session context available (missing sessionId or Supabase creds).');
          }

          // Connect to Grok Voice API using StandardWebSocketClient for custom headers
          if (!XAI_API_KEY) {
            console.error('XAI_API_KEY is not set');
            break;
          }

          try {
            closeGrok();
            
            console.log('Connecting to Grok Voice API...');
            
            // Use type assertion to access internal headers property
            grokSocket = new StandardWebSocketClient('wss://api.x.ai/v1/realtime');
            // deno-lint-ignore no-explicit-any
            (grokSocket as any).headers = { "Authorization": `Bearer ${XAI_API_KEY}` };

            grokSocket.on("open", () => {
              grokOpen = true;
              console.log('Connected to Grok Voice API');
              flushGrok();
            });

            grokSocket.on("message", (message: { data: string }) => {
              try {
                const grokData = JSON.parse(message.data);

                switch (grokData.type) {
                  case 'session.created': {
                    console.log('Grok session created');

                    const sessionConfig = {
                      type: 'session.update',
                      session: {
                        modalities: ['text', 'audio'],
                        instructions: systemPrompt,
                        voice: 'Ara',
                        input_audio_format: 'pcmu',
                        output_audio_format: 'pcmu',
                        input_audio_transcription: {
                          model: 'whisper-1',
                        },
                        turn_detection: {
                          type: 'server_vad',
                          threshold: 0.5,
                          prefix_padding_ms: 300,
                          silence_duration_ms: 800,
                        },
                        temperature: 0.7,
                      },
                    };

                    sendToGrok(sessionConfig);
                    console.log('Session configured');

                    setTimeout(() => {
                      const greetingEvent = {
                        type: 'conversation.item.create',
                        item: {
                          type: 'message',
                          role: 'assistant',
                          content: [
                            {
                              type: 'input_text',
                              text: greeting,
                            },
                          ],
                        },
                      };

                      sendToGrok(greetingEvent);
                      sendToGrok({ type: 'response.create' });
                      console.log('Greeting sent');
                    }, 500);
                    break;
                  }

                  case 'response.audio.delta':
                    if (grokData.delta && streamSid) {
                      const audioMessage = {
                        event: 'media',
                        streamSid,
                        media: {
                          payload: grokData.delta,
                        },
                      };
                      twilioSocket.send(JSON.stringify(audioMessage));
                    }
                    break;

                  case 'response.audio_transcript.delta':
                    console.log('AI speaking:', grokData.delta);
                    break;

                  case 'conversation.item.input_audio_transcription.completed':
                    console.log('User said:', grokData.transcript);
                    break;

                  case 'error':
                    console.error('Grok error:', grokData.error);
                    break;

                  default:
                    // keep noise low
                    break;
                }
              } catch (err) {
                console.error('Error parsing Grok message:', err);
              }
            });

            grokSocket.on("error", (error: Error) => {
              console.error('Grok WebSocket error:', error);
            });

            grokSocket.on("close", () => {
              console.log('Grok WebSocket closed');
            });

          } catch (err) {
            console.error('Failed to connect to Grok Voice API:', err);
            closeGrok();
          }

          break;

        case 'media':
          // Forward audio from Twilio to Grok
          if (grokSocket && !grokSocket.isClosed) {
            const audioEvent = {
              type: 'input_audio_buffer.append',
              audio: data.media.payload,
            };
            sendToGrok(audioEvent);
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
    console.error('Twilio WebSocket error:', error);
    closeGrok();
  };

  twilioSocket.onclose = () => {
    console.log('Twilio WebSocket closed');
    closeGrok();
  };

  return response;
});
