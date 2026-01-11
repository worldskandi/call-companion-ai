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
    const { provider, user_id, redirect_url } = await req.json();

    if (!provider || !user_id || !redirect_url) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create state parameter with user info
    const state = btoa(JSON.stringify({ user_id, redirect_url }));
    
    let authUrl: string;
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (provider === 'google_calendar') {
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const redirectUri = `${supabaseUrl}/functions/v1/oauth-callback?provider=google_calendar`;
      const scopes = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' ');

      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&access_type=offline` +
        `&prompt=consent` +
        `&state=${state}`;

    } else if (provider === 'gmail') {
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const redirectUri = `${supabaseUrl}/functions/v1/oauth-callback?provider=gmail`;
      const scopes = [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' ');

      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&access_type=offline` +
        `&prompt=consent` +
        `&state=${state}`;

    } else if (provider === 'slack') {
      const clientId = Deno.env.get('SLACK_CLIENT_ID');
      const redirectUri = `${supabaseUrl}/functions/v1/oauth-callback?provider=slack`;
      const scopes = ['chat:write', 'users:read.email'].join(',');

      authUrl = `https://slack.com/oauth/v2/authorize?` +
        `client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&state=${state}`;

    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported provider' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ auth_url: authUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('OAuth start error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
