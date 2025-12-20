import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');

    console.log('Voice webhook called with sessionId:', sessionId);

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch session data
    const { data: session, error: sessionError } = await supabase
      .from('call_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error('Error fetching session:', sessionError);
      throw new Error('Session not found');
    }

    console.log('Session loaded:', {
      leadName: session.lead_name,
      leadCompany: session.lead_company,
      promptLength: session.campaign_prompt?.length || 0,
    });

    const leadName = session.lead_name || 'der Kunde';
    const leadCompany = session.lead_company || '';
    const campaignPrompt = session.campaign_prompt || '';

    // Get the base URL for WebSocket connection
    const wsUrl = `wss://${url.host}/functions/v1/grok-voice-stream?sessionId=${sessionId}`;

    // TwiML response that connects to our WebSocket stream
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${wsUrl}">
      <Parameter name="sessionId" value="${sessionId}" />
    </Stream>
  </Connect>
</Response>`;

    console.log('Returning TwiML with stream URL:', wsUrl);

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
