import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MeetingEmailRequest {
  email: string;
  lead_name: string;
  meeting_date: string;
  meeting_time: string;
  call_log_id?: string;
  company_name?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const googleServiceAccountKey = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }
    if (!googleServiceAccountKey) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not configured");
    }

    const { email, lead_name, meeting_date, meeting_time, call_log_id, company_name }: MeetingEmailRequest = await req.json();

    if (!email || !meeting_date || !meeting_time) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, meeting_date, meeting_time" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Google Meet link using Google Calendar API
    const meetLink = await createGoogleMeetEvent(googleServiceAccountKey, {
      summary: `Meeting mit ${lead_name || 'Kunde'}${company_name ? ` - ${company_name}` : ''}`,
      dateTime: `${meeting_date}T${meeting_time}:00`,
      duration: 30, // 30 minutes default
    });

    // Send email with Resend API directly
    const formattedDateStr = formatDate(meeting_date);
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Ihr Termin wurde bestätigt!</h1>
        <p>Hallo${lead_name ? ` ${lead_name}` : ''},</p>
        <p>Vielen Dank für Ihr Interesse! Hier sind die Details zu Ihrem Termin:</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Datum:</strong> ${formattedDateStr}</p>
          <p style="margin: 10px 0 0;"><strong>Uhrzeit:</strong> ${meeting_time} Uhr</p>
        </div>
        
        <p>Klicken Sie auf den folgenden Link, um am Meeting teilzunehmen:</p>
        
        <a href="${meetLink}" 
           style="display: inline-block; background: #4285f4; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin: 10px 0;">
          Am Meeting teilnehmen
        </a>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Meeting-Link: <a href="${meetLink}">${meetLink}</a>
        </p>
        
        <p style="margin-top: 30px;">Wir freuen uns auf das Gespräch!</p>
        <p>Mit freundlichen Grüßen</p>
      </div>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Termine <onboarding@resend.dev>",
        to: [email],
        subject: `Ihr Termin am ${formattedDateStr} um ${meeting_time} Uhr`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);

    // Update call_logs if call_log_id provided
    if (call_log_id && supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      await supabase
        .from("call_logs")
        .update({
          meeting_link: meetLink,
          meeting_scheduled_at: `${meeting_date}T${meeting_time}:00`,
          meeting_link_sent_via: "email",
        })
        .eq("id", call_log_id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        meeting_link: meetLink,
        email_sent: true 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-meeting-link-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("de-DE", { 
    weekday: "long", 
    day: "numeric", 
    month: "long", 
    year: "numeric" 
  });
}

async function createGoogleMeetEvent(
  serviceAccountKey: string,
  options: { summary: string; dateTime: string; duration: number }
): Promise<string> {
  const keyData = JSON.parse(serviceAccountKey);
  
  // Create JWT for Google API authentication
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: keyData.client_email,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const accessToken = await getGoogleAccessToken(keyData);

  // Calculate end time
  const startTime = new Date(options.dateTime);
  const endTime = new Date(startTime.getTime() + options.duration * 60 * 1000);

  // Create calendar event with Google Meet
  const calendarResponse = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: options.summary,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: "Europe/Berlin",
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: "Europe/Berlin",
        },
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      }),
    }
  );

  if (!calendarResponse.ok) {
    const errorText = await calendarResponse.text();
    console.error("Calendar API error:", errorText);
    throw new Error(`Failed to create calendar event: ${errorText}`);
  }

  const eventData = await calendarResponse.json();
  const meetLink = eventData.conferenceData?.entryPoints?.find(
    (ep: any) => ep.entryPointType === "video"
  )?.uri;

  if (!meetLink) {
    throw new Error("Failed to generate Google Meet link");
  }

  return meetLink;
}

async function getGoogleAccessToken(keyData: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  // Create JWT header and payload
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    iss: keyData.client_email,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));

  const signatureInput = `${header}.${payload}`;
  
  // Import the private key and sign
  const privateKey = await importPrivateKey(keyData.private_key);
  const signature = await signData(signatureInput, privateKey);
  
  const jwt = `${signatureInput}.${signature}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`Failed to get access token: ${errorText}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\n/g, "");
  
  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  return await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function signData(data: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    encoder.encode(data)
  );
  
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
