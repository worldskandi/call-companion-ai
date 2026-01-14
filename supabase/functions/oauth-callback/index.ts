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
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const provider = url.searchParams.get('provider') || 'google_calendar';

    if (!code || !state) {
      return new Response(
        JSON.stringify({ error: 'Missing code or state parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decode state to get user_id and redirect_url
    let stateData: { user_id: string; redirect_url: string };
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid state parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exchange code for tokens based on provider
    let tokenData: {
      access_token: string;
      refresh_token: string | null;
      expires_in: number | null;
      scope: string;
      email: string;
      metadata?: Record<string, unknown>;
    };
    
    if (provider === 'google_calendar' || provider === 'gmail') {
      tokenData = await exchangeGoogleToken(code);
    } else if (provider === 'slack') {
      tokenData = await exchangeSlackToken(code);
    } else if (provider === 'whatsapp_business') {
      tokenData = await exchangeWhatsAppToken(code);
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported provider' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store tokens in database
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error: upsertError } = await supabaseAdmin
      .from('user_integrations')
      .upsert({
        user_id: stateData.user_id,
        provider,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
        scope: tokenData.scope,
        provider_email: tokenData.email,
        metadata: tokenData.metadata || {},
        is_active: true,
      }, { onConflict: 'user_id,provider' });

    if (upsertError) {
      console.error('Error storing tokens:', upsertError);
      return new Response(
        JSON.stringify({ error: 'Failed to store tokens' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Redirect back to app
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': `${stateData.redirect_url}?success=true&provider=${provider}`,
      },
    });

  } catch (error: unknown) {
    console.error('OAuth callback error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function exchangeGoogleToken(code: string) {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-callback?provider=google_calendar`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId!,
      client_secret: clientSecret!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error_description || 'Failed to exchange token');
  }

  // Get user email from token
  const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const userInfoData = await userInfo.json();

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    scope: data.scope,
    email: userInfoData.email,
  };
}

async function exchangeSlackToken(code: string) {
  const clientId = Deno.env.get('SLACK_CLIENT_ID');
  const clientSecret = Deno.env.get('SLACK_CLIENT_SECRET');
  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-callback?provider=slack`;

  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId!,
      client_secret: clientSecret!,
      redirect_uri: redirectUri,
    }),
  });

  const data = await response.json();
  
  if (!data.ok) {
    throw new Error(data.error || 'Failed to exchange Slack token');
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: null,
    scope: data.scope,
    email: data.authed_user?.email,
  };
}

async function exchangeWhatsAppToken(code: string) {
  const clientId = Deno.env.get('META_APP_ID');
  const clientSecret = Deno.env.get('META_APP_SECRET');
  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-callback?provider=whatsapp_business`;

  // Exchange code for short-lived token
  const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
    method: 'GET',
  });

  const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
  tokenUrl.searchParams.set('client_id', clientId!);
  tokenUrl.searchParams.set('client_secret', clientSecret!);
  tokenUrl.searchParams.set('redirect_uri', redirectUri);
  tokenUrl.searchParams.set('code', code);

  const response = await fetch(tokenUrl.toString());
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || 'Failed to exchange WhatsApp token');
  }

  // Exchange short-lived token for long-lived token
  const longLivedUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
  longLivedUrl.searchParams.set('grant_type', 'fb_exchange_token');
  longLivedUrl.searchParams.set('client_id', clientId!);
  longLivedUrl.searchParams.set('client_secret', clientSecret!);
  longLivedUrl.searchParams.set('fb_exchange_token', data.access_token);

  const longLivedResponse = await fetch(longLivedUrl.toString());
  const longLivedData = await longLivedResponse.json();

  if (longLivedData.error) {
    // Fall back to short-lived token if long-lived exchange fails
    console.warn('Failed to get long-lived token, using short-lived:', longLivedData.error);
  }

  const accessToken = longLivedData.access_token || data.access_token;
  const expiresIn = longLivedData.expires_in || data.expires_in;

  // Get WhatsApp Business Account info
  const meResponse = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${accessToken}`);
  const meData = await meResponse.json();

  // Get WhatsApp Business Account ID
  const wbaResponse = await fetch(`https://graph.facebook.com/v18.0/me/businesses?access_token=${accessToken}`);
  const wbaData = await wbaResponse.json();

  return {
    access_token: accessToken,
    refresh_token: null, // Meta doesn't provide refresh tokens for long-lived tokens
    expires_in: expiresIn,
    scope: 'whatsapp_business_management,whatsapp_business_messaging',
    email: meData.email || meData.name,
    metadata: {
      facebook_user_id: meData.id,
      businesses: wbaData.data || [],
    }
  };
}
