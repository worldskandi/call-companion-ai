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
    const { to, campaignPrompt, leadName, leadCompany, leadId, campaignId } = await req.json();

    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio credentials not configured');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    if (!to) {
      throw new Error('Phone number is required');
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Decode user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    // Create a call session to store the context data
    const { data: session, error: sessionError } = await supabase
      .from('call_sessions')
      .insert({
        user_id: user.id,
        lead_id: leadId || null,
        campaign_id: campaignId || null,
        campaign_prompt: campaignPrompt || '',
        lead_name: leadName || '',
        lead_company: leadCompany || '',
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      throw new Error('Failed to create call session');
    }

    console.log('Created call session:', session.id);

    // Get the base URL for the webhook
    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    // Create TwiML webhook URL with only the session ID
    const webhookUrl = `${baseUrl}/functions/v1/twilio-voice-webhook?sessionId=${session.id}`;

    console.log('Starting call to:', to);
    console.log('Webhook URL:', webhookUrl);

    // Make the call using Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`;
    
    const formData = new URLSearchParams();
    formData.append('To', to);
    formData.append('From', TWILIO_PHONE_NUMBER);
    formData.append('Url', webhookUrl);
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

    // Update session with call SID
    await supabase
      .from('call_sessions')
      .update({ call_sid: data.sid })
      .eq('id', session.id);

    return new Response(JSON.stringify({
      success: true,
      callSid: data.sid,
      status: data.status,
      sessionId: session.id,
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
