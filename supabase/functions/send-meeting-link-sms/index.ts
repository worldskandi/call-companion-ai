import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MeetingSmsRequest {
  phone_number: string;
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
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
    const googleServiceAccountKey = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error("Twilio credentials not configured");
    }
    if (!googleServiceAccountKey) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not configured");
    }

    const { phone_number, lead_name, meeting_date, meeting_time, call_log_id, company_name }: MeetingSmsRequest = await req.json();

    if (!phone_number || !meeting_date || !meeting_time) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: phone_number, meeting_date, meeting_time" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Google Meet link using Google Calendar API
    const meetLink = await createGoogleMeetEvent(googleServiceAccountKey, {
      summary: `Meeting mit ${lead_name || 'Kunde'}${company_name ? ` - ${company_name}` : ''}`,
      dateTime: `${meeting_date}T${meeting_time}:00`,
      duration: 30, // 30 minutes default
    });

    // Format message
    const formattedDate = formatDate(meeting_date);
    const smsMessage = `Ihr Termin am ${formattedDate} um ${meeting_time} Uhr wurde bestätigt!\n\nMeeting-Link:\n${meetLink}\n\nWir freuen uns auf das Gespräch!`;

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const authHeader = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    const smsResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: twilioPhoneNumber,
        To: phone_number,
        Body: smsMessage,
      }),
    });

    if (!smsResponse.ok) {
      const errorText = await smsResponse.text();
      console.error("Twilio error:", errorText);
      throw new Error(`Failed to send SMS: ${errorText}`);
    }

    const smsData = await smsResponse.json();
    console.log("SMS sent successfully:", smsData.sid);

    // Update call_logs if call_log_id provided
    if (call_log_id && supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      await supabase
        .from("call_logs")
        .update({
          meeting_link: meetLink,
          meeting_scheduled_at: `${meeting_date}T${meeting_time}:00`,
          meeting_link_sent_via: "sms",
        })
        .eq("id", call_log_id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        meeting_link: meetLink,
        sms_sent: true,
        sms_sid: smsData.sid
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-meeting-link-sms:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("de-DE", { 
    day: "numeric", 
    month: "long"
  });
}

async function createGoogleMeetEvent(
  serviceAccountKey: string,
  options: { summary: string; dateTime: string; duration: number }
): Promise<string> {
  const keyData = JSON.parse(serviceAccountKey);
  
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
