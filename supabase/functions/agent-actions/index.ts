import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface ActionRequest {
  action: string;
  data: Record<string, any>;
}

async function sendEmail(data: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.error("RESEND_API_KEY not configured");
    return { success: false, error: "Email service not configured" };
  }

  // Use custom domain if configured, otherwise fall back to resend.dev (only works for test emails)
  const emailFrom = Deno.env.get("EMAIL_FROM") || "AI Caller <onboarding@resend.dev>";
  const resend = new Resend(resendKey);
  
  try {
    const response = await resend.emails.send({
      from: emailFrom,
      to: [data.to],
      subject: data.subject,
      html: data.body.replace(/\n/g, '<br>'),
    });
    console.log(`Email sent to ${data.to}`, response);
    return { success: true };
  } catch (error: any) {
    console.error("Email send error:", error);
    return { success: false, error: error?.message || "Unknown error" };
  }
}

async function sendMeetingLink(data: Record<string, any>): Promise<{ success: boolean; error?: string; meeting_link?: string }> {
  const { to, date, time, title, lead_id, lead_name, call_log_id, method } = data;
  
  // Create meeting datetime
  const meetingDateTime = parseMeetingDateTime(date, time);
  
  // Generate Google Meet link
  const meetingLink = await createGoogleMeetEvent(title || "Demo-Termin", meetingDateTime);
  
  if (!meetingLink) {
    // Fallback to a simple meeting link if Google Meet fails
    console.warn("Could not create Google Meet, using fallback");
  }
  
  const finalLink = meetingLink || `https://meet.google.com/lookup/${Date.now()}`;
  
  // Update call_logs if call_log_id provided
  if (call_log_id) {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    await supabase
      .from("call_logs")
      .update({
        meeting_link: finalLink,
        meeting_scheduled_at: meetingDateTime.toISOString(),
        meeting_link_sent_via: method,
      })
      .eq("id", call_log_id);
  }
  
  // Send via email or SMS
  if (method === "email") {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return { success: false, error: "Email not configured" };
    }
    
    const emailFrom = Deno.env.get("EMAIL_FROM") || "AI Caller <onboarding@resend.dev>";
    const resend = new Resend(resendKey);
    const formattedDate = formatDateGerman(meetingDateTime);
    
    const response = await resend.emails.send({
      from: emailFrom,
      to: [to],
      subject: `Terminbestätigung: ${title || "Demo-Termin"}`,
      html: `
        <h2>Ihr Termin wurde bestätigt!</h2>
        <p>Hallo ${lead_name || ""},</p>
        <p>Ihr Termin wurde für den <strong>${formattedDate}</strong> um <strong>${time}</strong> eingeplant.</p>
        <p><a href="${finalLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Zum Meeting beitreten</a></p>
        <p>Meeting-Link: ${finalLink}</p>
        <p>Wir freuen uns auf das Gespräch!</p>
      `,
    });
    console.log("Meeting email sent:", response);
    
    return { success: true, meeting_link: finalLink };
  } else if (method === "sms") {
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");
    
    if (!twilioSid || !twilioToken || !twilioPhone) {
      return { success: false, error: "SMS not configured" };
    }
    
    const formattedDate = formatDateGerman(meetingDateTime);
    const message = `Ihr Termin: ${formattedDate} um ${time}. Meeting-Link: ${finalLink}`;
    
    const auth = btoa(`${twilioSid}:${twilioToken}`);
    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: to,
        From: twilioPhone,
        Body: message,
      }),
    });
    
    return { success: true, meeting_link: finalLink };
  }
  
  return { success: false, error: "Invalid method" };
}

async function scheduleCallback(data: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  const { lead_id, date, time, notes } = data;
  
  if (!lead_id) {
    return { success: false, error: "No lead_id provided" };
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Update lead status to callback
  const { error } = await supabase
    .from("leads")
    .update({
      status: "callback",
      notes: `${notes ? notes + " | " : ""}Rückruf geplant: ${date} ${time}`,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lead_id);
  
  if (error) {
    console.error("Schedule callback error:", error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

async function updateLeadStatus(data: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  const { lead_id, status, notes } = data;
  
  if (!lead_id) {
    return { success: false, error: "No lead_id provided" };
  }
  
  // Map status to valid lead_status enum values
  const statusMap: Record<string, string> = {
    "interested": "interested",
    "not_interested": "not_interested",
    "callback": "callback",
    "qualified": "qualified",
    "appointment_scheduled": "qualified", // Map to qualified
    "no_answer": "new", // Keep as new if no answer
  };
  
  const mappedStatus = statusMap[status] || "called";
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const updateData: Record<string, any> = {
    status: mappedStatus,
    updated_at: new Date().toISOString(),
  };
  
  if (notes) {
    // Append notes to existing notes
    const { data: currentLead } = await supabase
      .from("leads")
      .select("notes")
      .eq("id", lead_id)
      .single();
    
    updateData.notes = currentLead?.notes 
      ? `${currentLead.notes}\n${new Date().toLocaleDateString("de-DE")}: ${notes}`
      : `${new Date().toLocaleDateString("de-DE")}: ${notes}`;
  }
  
  const { error } = await supabase
    .from("leads")
    .update(updateData)
    .eq("id", lead_id);
  
  if (error) {
    console.error("Update lead status error:", error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

async function addNote(data: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  const { lead_id, call_log_id, note } = data;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const timestamp = new Date().toLocaleDateString("de-DE");
  
  // Add note to lead
  if (lead_id) {
    const { data: currentLead } = await supabase
      .from("leads")
      .select("notes")
      .eq("id", lead_id)
      .single();
    
    const newNotes = currentLead?.notes 
      ? `${currentLead.notes}\n${timestamp}: ${note}`
      : `${timestamp}: ${note}`;
    
    await supabase
      .from("leads")
      .update({ notes: newNotes, updated_at: new Date().toISOString() })
      .eq("id", lead_id);
  }
  
  // Add note to call_log summary
  if (call_log_id) {
    const { data: currentLog } = await supabase
      .from("call_logs")
      .select("summary")
      .eq("id", call_log_id)
      .single();
    
    const newSummary = currentLog?.summary 
      ? `${currentLog.summary}\n${note}`
      : note;
    
    await supabase
      .from("call_logs")
      .update({ summary: newSummary })
      .eq("id", call_log_id);
  }
  
  return { success: true };
}

// Helper functions
function parseMeetingDateTime(date: string, time: string): Date {
  const now = new Date();
  let meetingDate = new Date();
  
  // Parse relative dates
  const dateLower = date.toLowerCase();
  if (dateLower.includes("morgen")) {
    meetingDate.setDate(now.getDate() + 1);
  } else if (dateLower.includes("übermorgen")) {
    meetingDate.setDate(now.getDate() + 2);
  } else if (dateLower.includes("montag")) {
    meetingDate = getNextWeekday(1);
  } else if (dateLower.includes("dienstag")) {
    meetingDate = getNextWeekday(2);
  } else if (dateLower.includes("mittwoch")) {
    meetingDate = getNextWeekday(3);
  } else if (dateLower.includes("donnerstag")) {
    meetingDate = getNextWeekday(4);
  } else if (dateLower.includes("freitag")) {
    meetingDate = getNextWeekday(5);
  } else {
    // Try to parse as date
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      meetingDate = parsed;
    }
  }
  
  // Parse time
  const timeMatch = time.match(/(\d{1,2}):?(\d{2})?/);
  if (timeMatch) {
    meetingDate.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2] || "0"), 0, 0);
  } else if (time.toLowerCase().includes("vormittag")) {
    meetingDate.setHours(10, 0, 0, 0);
  } else if (time.toLowerCase().includes("nachmittag")) {
    meetingDate.setHours(14, 0, 0, 0);
  } else if (time.toLowerCase().includes("abend")) {
    meetingDate.setHours(18, 0, 0, 0);
  }
  
  return meetingDate;
}

function getNextWeekday(dayOfWeek: number): Date {
  const now = new Date();
  const currentDay = now.getDay();
  let daysUntil = dayOfWeek - currentDay;
  if (daysUntil <= 0) daysUntil += 7;
  const result = new Date(now);
  result.setDate(now.getDate() + daysUntil);
  return result;
}

function formatDateGerman(date: Date): string {
  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

async function createGoogleMeetEvent(title: string, dateTime: Date): Promise<string | null> {
  const serviceAccountKey = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY");
  if (!serviceAccountKey) {
    console.warn("GOOGLE_SERVICE_ACCOUNT_KEY not configured");
    return null;
  }
  
  try {
    const keyData = JSON.parse(serviceAccountKey);
    const accessToken = await getGoogleAccessToken(keyData);
    
    const endTime = new Date(dateTime.getTime() + 30 * 60 * 1000); // 30 min meeting
    
    const event = {
      summary: title,
      start: { dateTime: dateTime.toISOString(), timeZone: "Europe/Berlin" },
      end: { dateTime: endTime.toISOString(), timeZone: "Europe/Berlin" },
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };
    
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );
    
    if (!response.ok) {
      console.error("Google Calendar API error:", await response.text());
      return null;
    }
    
    const result = await response.json();
    return result.conferenceData?.entryPoints?.[0]?.uri || null;
  } catch (error) {
    console.error("Google Meet creation error:", error);
    return null;
  }
}

async function getGoogleAccessToken(keyData: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: keyData.client_email,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  
  const key = await importPrivateKey(keyData.private_key);
  const signature = await signData(signatureInput, key);
  const jwt = `${signatureInput}.${signature}`;
  
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  
  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\n/g, "");
  
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  
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
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, encoder.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data }: ActionRequest = await req.json();
    console.log(`Agent action: ${action}`, data);

    let result: { success: boolean; error?: string; [key: string]: any };

    switch (action) {
      case "send_email":
        result = await sendEmail(data);
        break;
      case "send_meeting_link":
        result = await sendMeetingLink(data);
        break;
      case "schedule_callback":
        result = await scheduleCallback(data);
        break;
      case "update_lead_status":
        result = await updateLeadStatus(data);
        break;
      case "add_note":
        result = await addNote(data);
        break;
      default:
        result = { success: false, error: `Unknown action: ${action}` };
    }

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Agent action error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
