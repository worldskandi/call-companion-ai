import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, campaignPrompt, leadName, leadCompany } = await req.json();

    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio credentials not configured');
    }

    if (!to) {
      throw new Error('Phone number is required');
    }

    // Get the base URL for the webhook
    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    // Create TwiML webhook URL with campaign data
    const webhookUrl = new URL(`${baseUrl}/functions/v1/twilio-voice-webhook`);
    webhookUrl.searchParams.set('campaignPrompt', encodeURIComponent(campaignPrompt || ''));
    webhookUrl.searchParams.set('leadName', encodeURIComponent(leadName || ''));
    webhookUrl.searchParams.set('leadCompany', encodeURIComponent(leadCompany || ''));

    console.log('Starting call to:', to);
    console.log('Webhook URL:', webhookUrl.toString());

    // Make the call using Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`;
    
    const formData = new URLSearchParams();
    formData.append('To', to);
    formData.append('From', TWILIO_PHONE_NUMBER);
    formData.append('Url', webhookUrl.toString());
    formData.append('StatusCallback', `${baseUrl}/functions/v1/twilio-status-callback`);
    formData.append('StatusCallbackEvent', 'initiated ringing answered completed');

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Twilio error:', data);
      throw new Error(data.message || 'Failed to start call');
    }

    console.log('Call started:', data.sid);

    return new Response(JSON.stringify({
      success: true,
      callSid: data.sid,
      status: data.status,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error starting call:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to start call';
    return new Response(JSON.stringify({
      error: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
