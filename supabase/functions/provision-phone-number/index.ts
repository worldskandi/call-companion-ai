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
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { country, friendly_name, campaign_id } = await req.json();

    // Twilio credentials
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      return new Response(
        JSON.stringify({ error: 'Twilio credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search for available numbers
    const countryCode = country || 'DE';
    const searchUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/AvailablePhoneNumbers/${countryCode}/Local.json?VoiceEnabled=true&SmsEnabled=true&Limit=1`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
      },
    });

    const searchData = await searchResponse.json();

    if (!searchData.available_phone_numbers || searchData.available_phone_numbers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No phone numbers available in this region' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const availableNumber = searchData.available_phone_numbers[0];

    // Purchase the number
    const purchaseUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json`;
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    const purchaseResponse = await fetch(purchaseUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        PhoneNumber: availableNumber.phone_number,
        FriendlyName: friendly_name || 'AI Calling Platform',
        VoiceUrl: `${supabaseUrl}/functions/v1/inbound-call-handler`,
        VoiceMethod: 'POST',
        StatusCallback: `${supabaseUrl}/functions/v1/twilio-status-callback`,
        StatusCallbackMethod: 'POST',
      }),
    });

    const purchaseData = await purchaseResponse.json();

    if (!purchaseResponse.ok) {
      console.error('Twilio purchase error:', purchaseData);
      return new Response(
        JSON.stringify({ error: purchaseData.message || 'Failed to purchase phone number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store in database
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: phoneNumber, error: insertError } = await supabaseAdmin
      .from('phone_numbers')
      .insert({
        user_id: user.id,
        phone_number: purchaseData.phone_number,
        friendly_name: friendly_name || purchaseData.friendly_name,
        provider: 'twilio',
        country_code: countryCode,
        twilio_sid: purchaseData.sid,
        campaign_id: campaign_id || null,
        capabilities: {
          voice: purchaseData.capabilities?.voice || true,
          sms: purchaseData.capabilities?.sms || true,
        },
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to store phone number' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        phone_number: phoneNumber,
        message: `Phone number ${purchaseData.phone_number} has been provisioned successfully`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Provision phone number error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
