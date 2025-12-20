import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const campaignPrompt = decodeURIComponent(url.searchParams.get('campaignPrompt') || '');
    const leadName = decodeURIComponent(url.searchParams.get('leadName') || 'der Kunde');
    const leadCompany = decodeURIComponent(url.searchParams.get('leadCompany') || '');

    console.log('Voice webhook called');
    console.log('Lead:', leadName, leadCompany);

    // Get the base URL for WebSocket connection
    const wsUrl = `wss://${url.host}/functions/v1/grok-voice-stream`;
    const streamUrl = new URL(wsUrl);
    streamUrl.searchParams.set('campaignPrompt', encodeURIComponent(campaignPrompt));
    streamUrl.searchParams.set('leadName', encodeURIComponent(leadName));
    streamUrl.searchParams.set('leadCompany', encodeURIComponent(leadCompany));

    // TwiML response that connects to our WebSocket stream
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${streamUrl.toString()}">
      <Parameter name="campaignPrompt" value="${encodeURIComponent(campaignPrompt)}" />
      <Parameter name="leadName" value="${encodeURIComponent(leadName)}" />
      <Parameter name="leadCompany" value="${encodeURIComponent(leadCompany)}" />
    </Stream>
  </Connect>
</Response>`;

    console.log('Returning TwiML:', twiml);

    return new Response(twiml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });

  } catch (error) {
    console.error('Error in voice webhook:', error);
    
    // Return error TwiML
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="de-DE">Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.</Say>
  <Hangup />
</Response>`;

    return new Response(errorTwiml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
});
