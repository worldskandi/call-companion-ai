import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const callStatus = formData.get('CallStatus') as string;

    console.log('Inbound call:', { callSid, from, to, callStatus });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Find the phone number and its routing rules
    const { data: phoneNumber } = await supabase
      .from('phone_numbers')
      .select('*, inbound_routing(*)')
      .eq('phone_number', to)
      .single();

    if (!phoneNumber) {
      console.error('Phone number not found:', to);
      // Return basic TwiML to handle call gracefully
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say language="de-DE">Diese Nummer ist nicht konfiguriert. Auf Wiederhören.</Say>
          <Hangup/>
        </Response>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
      );
    }

    const routing = phoneNumber.inbound_routing?.[0];
    const routingType = routing?.routing_type || 'ai_agent';

    // Check business hours if configured
    if (routing?.business_hours_only) {
      const now = new Date();
      const currentHour = now.getHours();
      const startHour = parseInt(routing.business_hours_start?.split(':')[0] || '9');
      const endHour = parseInt(routing.business_hours_end?.split(':')[0] || '18');

      if (currentHour < startHour || currentHour >= endHour) {
        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?>
          <Response>
            <Say language="de-DE">Vielen Dank für Ihren Anruf. Unser Büro ist derzeit geschlossen. Bitte rufen Sie während unserer Geschäftszeiten an.</Say>
            <Hangup/>
          </Response>`,
          { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
        );
      }
    }

    // Try to find existing lead by phone number
    const { data: existingLead } = await supabase
      .from('leads')
      .select('*')
      .eq('phone_number', from)
      .eq('user_id', phoneNumber.user_id)
      .maybeSingle();

    // Create call session for context
    const { data: session } = await supabase
      .from('call_sessions')
      .insert({
        user_id: phoneNumber.user_id,
        call_sid: callSid,
        lead_id: existingLead?.id,
        lead_name: existingLead ? `${existingLead.first_name} ${existingLead.last_name || ''}`.trim() : 'Unbekannt',
        lead_company: existingLead?.company,
        campaign_id: phoneNumber.campaign_id,
        campaign_prompt: routing?.ai_greeting || 'Sei freundlich und hilfsbereit.',
      })
      .select()
      .single();

    // Generate TwiML response based on routing type
    let twimlResponse: string;

    switch (routingType) {
      case 'forward':
        // Forward to another number
        twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
          <Response>
            <Say language="de-DE">${routing?.ai_greeting || 'Einen Moment bitte, ich verbinde Sie.'}</Say>
            <Dial>${routing?.forward_to}</Dial>
          </Response>`;
        break;

      case 'voicemail':
        // Go to voicemail
        twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
          <Response>
            <Say language="de-DE">${routing?.ai_greeting || 'Bitte hinterlassen Sie eine Nachricht nach dem Signalton.'}</Say>
            <Record maxLength="120" transcribe="true" />
          </Response>`;
        break;

      case 'ai_agent':
      default:
        // Connect to AI agent via LiveKit or Grok
        const livekitUrl = Deno.env.get('LIVEKIT_URL');
        const greeting = routing?.ai_greeting || 
          `Guten Tag! ${existingLead ? `Hallo ${existingLead.first_name}, schön Sie wieder zu hören.` : 'Wie kann ich Ihnen helfen?'}`;

        // For now, use simple AI response - in production would connect to LiveKit
        twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
          <Response>
            <Say language="de-DE">${greeting}</Say>
            <Gather input="speech" language="de-DE" timeout="5" action="${Deno.env.get('SUPABASE_URL')}/functions/v1/grok-voice-stream">
              <Say language="de-DE">Wie kann ich Ihnen weiterhelfen?</Say>
            </Gather>
          </Response>`;
        break;
    }

    return new Response(twimlResponse, {
      headers: { ...corsHeaders, 'Content-Type': 'text/xml' }
    });

  } catch (error) {
    console.error('Inbound call handler error:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say language="de-DE">Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.</Say>
        <Hangup/>
      </Response>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
    );
  }
});
