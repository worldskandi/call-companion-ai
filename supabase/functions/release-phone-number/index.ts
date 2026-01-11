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

    const { phone_number_id } = await req.json();

    if (!phone_number_id) {
      return new Response(
        JSON.stringify({ error: 'Missing phone_number_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the phone number record
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: phoneNumber, error: fetchError } = await supabaseAdmin
      .from('phone_numbers')
      .select('*')
      .eq('id', phone_number_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Phone number not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Release the number from Twilio
    if (phoneNumber.twilio_sid) {
      const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

      const releaseUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers/${phoneNumber.twilio_sid}.json`;
      
      const releaseResponse = await fetch(releaseUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        },
      });

      if (!releaseResponse.ok && releaseResponse.status !== 404) {
        const errorData = await releaseResponse.json();
        console.error('Twilio release error:', errorData);
        return new Response(
          JSON.stringify({ error: 'Failed to release phone number from Twilio' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Delete from database
    const { error: deleteError } = await supabaseAdmin
      .from('phone_numbers')
      .delete()
      .eq('id', phone_number_id);

    if (deleteError) {
      console.error('Database delete error:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete phone number from database' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Phone number ${phoneNumber.phone_number} has been released`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Release phone number error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
