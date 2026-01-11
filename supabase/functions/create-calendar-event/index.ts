import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function refreshGoogleToken(refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    console.error('Failed to refresh token:', await response.text());
    return null;
  }

  return response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.user.id;

    // Parse request body
    const body = await req.json();
    const { title, description, startDateTime, endDateTime, attendees } = body;

    if (!title || !startDateTime || !endDateTime) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title, startDateTime, endDateTime' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's Google Calendar integration
    const { data: integration, error: integrationError } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'google_calendar')
      .eq('is_active', true)
      .single();

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ error: 'Google Calendar not connected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let accessToken = integration.access_token;
    const tokenExpiresAt = integration.token_expires_at ? new Date(integration.token_expires_at) : null;

    // Refresh token if expired or about to expire
    if (tokenExpiresAt && tokenExpiresAt <= new Date(Date.now() + 5 * 60 * 1000)) {
      if (!integration.refresh_token) {
        return new Response(
          JSON.stringify({ error: 'Token expired and no refresh token available' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const newTokens = await refreshGoogleToken(integration.refresh_token);
      if (!newTokens) {
        return new Response(
          JSON.stringify({ error: 'Failed to refresh token' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      accessToken = newTokens.access_token;
      const newExpiresAt = new Date(Date.now() + newTokens.expires_in * 1000);

      await supabase
        .from('user_integrations')
        .update({
          access_token: accessToken,
          token_expires_at: newExpiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', integration.id);
    }

    // Create Google Calendar event with Google Meet
    const event = {
      summary: title,
      description: description || '',
      start: {
        dateTime: startDateTime,
        timeZone: 'Europe/Berlin',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'Europe/Berlin',
      },
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
      attendees: attendees?.map((email: string) => ({ email })) || [],
    };

    const calendarResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!calendarResponse.ok) {
      const errorText = await calendarResponse.text();
      console.error('Google Calendar API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to create calendar event', details: errorText }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const createdEvent = await calendarResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        event: {
          id: createdEvent.id,
          title: createdEvent.summary,
          start: createdEvent.start?.dateTime || createdEvent.start?.date,
          end: createdEvent.end?.dateTime || createdEvent.end?.date,
          htmlLink: createdEvent.htmlLink,
          meetLink: createdEvent.hangoutLink || createdEvent.conferenceData?.entryPoints?.[0]?.uri,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating calendar event:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
