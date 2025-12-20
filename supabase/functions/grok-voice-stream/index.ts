import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const XAI_API_KEY = Deno.env.get('XAI_API_KEY');

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const url = new URL(req.url);
  const campaignPrompt = decodeURIComponent(url.searchParams.get('campaignPrompt') || '');
  const leadName = decodeURIComponent(url.searchParams.get('leadName') || 'der Kunde');
  const leadCompany = decodeURIComponent(url.searchParams.get('leadCompany') || '');

  console.log('WebSocket connection requested');
  console.log('Campaign prompt length:', campaignPrompt.length);
  console.log('Lead:', leadName, leadCompany);

  const { socket: twilioSocket, response } = Deno.upgradeWebSocket(req);

  let grokSocket: WebSocket | null = null;
  let streamSid: string | null = null;
  let callSid: string | null = null;

  // Build the system prompt
  const systemPrompt = campaignPrompt || `Du bist ein freundlicher Vertriebsmitarbeiter.

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

  const greeting = leadCompany 
    ? `Guten Tag, hier spricht der virtuelle Assistent. Spreche ich mit jemandem von ${leadCompany}?`
    : `Guten Tag, hier spricht der virtuelle Assistent. Haben Sie einen Moment Zeit?`;

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

          // Connect to Grok Voice API
          grokSocket = new WebSocket('wss://api.x.ai/v1/realtime', {
            headers: {
              'Authorization': `Bearer ${XAI_API_KEY}`,
            },
          });

          grokSocket.onopen = () => {
            console.log('Connected to Grok Voice API');
          };

          grokSocket.onmessage = (grokEvent) => {
            try {
              const grokData = JSON.parse(grokEvent.data);
              
              switch (grokData.type) {
                case 'session.created':
                  console.log('Grok session created');
                  
                  // Configure the session
                  const sessionConfig = {
                    type: 'session.update',
                    session: {
                      modalities: ['text', 'audio'],
                      instructions: systemPrompt,
                      voice: 'Ara', // Warm, friendly German-compatible voice
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
                  
                  grokSocket?.send(JSON.stringify(sessionConfig));
                  console.log('Session configured');

                  // Send initial greeting
                  setTimeout(() => {
                    const greetingEvent = {
                      type: 'conversation.item.create',
                      item: {
                        type: 'message',
                        role: 'assistant',
                        content: [{
                          type: 'input_text',
                          text: greeting,
                        }],
                      },
                    };
                    grokSocket?.send(JSON.stringify(greetingEvent));
                    grokSocket?.send(JSON.stringify({ type: 'response.create' }));
                    console.log('Greeting sent');
                  }, 500);
                  break;

                case 'response.audio.delta':
                  // Forward audio to Twilio
                  if (grokData.delta && streamSid) {
                    const audioMessage = {
                      event: 'media',
                      streamSid: streamSid,
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

                case 'input_audio_buffer.speech_started':
                  console.log('User started speaking');
                  break;

                case 'input_audio_buffer.speech_stopped':
                  console.log('User stopped speaking');
                  break;

                case 'conversation.item.input_audio_transcription.completed':
                  console.log('User said:', grokData.transcript);
                  break;

                case 'error':
                  console.error('Grok error:', grokData.error);
                  break;

                default:
                  console.log('Grok event:', grokData.type);
              }
            } catch (error) {
              console.error('Error parsing Grok message:', error);
            }
          };

          grokSocket.onerror = (error) => {
            console.error('Grok WebSocket error:', error);
          };

          grokSocket.onclose = () => {
            console.log('Grok WebSocket closed');
          };
          break;

        case 'media':
          // Forward audio from Twilio to Grok
          if (grokSocket && grokSocket.readyState === WebSocket.OPEN) {
            const audioEvent = {
              type: 'input_audio_buffer.append',
              audio: data.media.payload,
            };
            grokSocket.send(JSON.stringify(audioEvent));
          }
          break;

        case 'stop':
          console.log('Stream stopped');
          if (grokSocket) {
            grokSocket.close();
          }
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
    if (grokSocket) {
      grokSocket.close();
    }
  };

  twilioSocket.onclose = () => {
    console.log('Twilio WebSocket closed');
    if (grokSocket) {
      grokSocket.close();
    }
  };

  return response;
});
