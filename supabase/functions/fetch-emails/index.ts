import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ImapClient } from "jsr:@bobbyg603/deno-imap@0.2.1";
import { decode as base64Decode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Decode MIME encoded-word format (RFC 2047)
// Handles =?charset?encoding?encoded_text?= format
function decodeMimeWord(text: string): string {
  if (!text) return text;
  
  // Regex to match encoded words: =?charset?encoding?text?=
  const encodedWordRegex = /=\?([^?]+)\?([BQbq])\?([^?]*)\?=/g;
  
  return text.replace(encodedWordRegex, (match, charset, encoding, encodedText) => {
    try {
      const enc = encoding.toUpperCase();
      let decodedBytes: Uint8Array;
      
      if (enc === 'B') {
        // Base64 encoding
        decodedBytes = base64Decode(encodedText);
      } else if (enc === 'Q') {
        // Quoted-Printable encoding
        // Replace underscores with spaces, decode =XX hex sequences
        const qpDecoded = encodedText
          .replace(/_/g, ' ')
          .replace(/=([0-9A-Fa-f]{2})/g, (_: string, hex: string) => 
            String.fromCharCode(parseInt(hex, 16))
          );
        decodedBytes = new TextEncoder().encode(qpDecoded);
      } else {
        return match; // Unknown encoding, return original
      }
      
      // Decode bytes using the specified charset
      const decoder = new TextDecoder(charset.toLowerCase());
      return decoder.decode(decodedBytes);
    } catch (e) {
      console.error(`Failed to decode MIME word: ${match}`, e);
      return match; // Return original on error
    }
  });
}

// Clean up subject line - decode and remove excessive whitespace
function cleanSubject(subject: string | undefined): string {
  if (!subject) return "(Kein Betreff)";
  
  // Decode MIME encoded words
  let decoded = decodeMimeWord(subject);
  
  // Multiple encoded words might be separated by whitespace, join them
  decoded = decoded.replace(/\s+/g, ' ').trim();
  
  return decoded || "(Kein Betreff)";
}

// Clean sender name
function cleanSenderName(name: string | undefined, mailbox: string | undefined): string {
  if (name) {
    return decodeMimeWord(name);
  }
  return mailbox || "Unknown";
}

interface EmailMessage {
  id: string;
  seq: number;
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
}

interface FetchEmailsRequest {
  folder?: string;
  limit?: number;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get request body
    const body: FetchEmailsRequest = req.method === "POST" ? await req.json() : {};
    const folder = body.folder || "INBOX";
    const limit = body.limit || 20;

    // Get user's IMAP integration
    const { data: integration, error: integrationError } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "imap_email")
      .eq("is_active", true)
      .maybeSingle();

    if (integrationError) {
      console.error("Integration fetch error:", integrationError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch email integration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!integration) {
      return new Response(
        JSON.stringify({ 
          error: "No email integration found",
          code: "NO_INTEGRATION",
          emails: []
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse IMAP credentials from metadata
    const metadata = integration.metadata as {
      imapHost: string;
      imapPort: number;
      smtpHost: string;
      smtpPort: number;
      displayName?: string;
    };

    if (!metadata?.imapHost) {
      return new Response(
        JSON.stringify({ error: "Invalid IMAP configuration" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Connecting to IMAP server: ${metadata.imapHost}:${metadata.imapPort}`);

    // Connect to IMAP server using deno-imap
    const client = new ImapClient({
      host: metadata.imapHost,
      port: metadata.imapPort || 993,
      tls: true,
      username: integration.provider_email!,
      password: integration.access_token, // Password stored in access_token field
    });

    await client.connect();
    console.log("Connected to IMAP server");

    await client.authenticate();
    console.log("Authenticated to IMAP server");

    // Select mailbox
    const mailboxInfo = await client.selectMailbox(folder);
    console.log(`Selected mailbox ${folder} with ${mailboxInfo.exists} messages`);

    const emails: EmailMessage[] = [];

    if (mailboxInfo.exists && mailboxInfo.exists > 0) {
      // Calculate range for fetching (newest messages)
      const messageCount = mailboxInfo.exists;
      const start = Math.max(1, messageCount - limit + 1);
      const fetchRange = `${start}:${messageCount}`;

      // Fetch messages with envelope and flags
      const messages = await client.fetch(fetchRange, {
        envelope: true,
        flags: true,
        headers: ["Subject", "From", "Date", "To"],
      });

      for (const message of messages) {
        const envelope = message.envelope;
        if (envelope) {
          const fromAddress = envelope.from?.[0];
          const toAddress = envelope.to?.[0];
          
          const subject = cleanSubject(envelope.subject);
          const senderName = cleanSenderName(fromAddress?.name, fromAddress?.mailbox);
          
          emails.push({
            id: message.seq?.toString() || "",
            seq: message.seq || 0,
            from: senderName,
            fromEmail: fromAddress?.mailbox && fromAddress?.host 
              ? `${fromAddress.mailbox}@${fromAddress.host}` 
              : "",
            to: toAddress?.mailbox && toAddress?.host 
              ? `${toAddress.mailbox}@${toAddress.host}` 
              : "",
            subject: subject,
            preview: subject,
            date: envelope.date || new Date().toISOString(),
            isRead: message.flags?.includes("\\Seen") || false,
            isStarred: message.flags?.includes("\\Flagged") || false,
          });
        }
      }
    }

    // Disconnect
    client.disconnect();
    console.log("Disconnected from IMAP server");

    // Sort by date (newest first)
    emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return new Response(
      JSON.stringify({ 
        emails,
        total: mailboxInfo.exists || 0,
        folder,
        providerEmail: integration.provider_email
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: unknown) {
    console.error("Fetch emails error:", error);
    
    const err = error as Error;
    
    // Handle specific IMAP errors
    let errorMessage = "Failed to fetch emails";
    let errorCode = "FETCH_ERROR";
    
    if (err.message?.includes("AUTHENTICATIONFAILED") || err.message?.includes("Invalid credentials") || err.message?.includes("LOGIN")) {
      errorMessage = "E-Mail-Zugangsdaten ungültig. Bitte prüfen Sie Ihr Passwort.";
      errorCode = "AUTH_FAILED";
    } else if (err.message?.includes("ECONNREFUSED") || err.message?.includes("getaddrinfo") || err.message?.includes("Connection")) {
      errorMessage = "IMAP-Server nicht erreichbar. Bitte prüfen Sie die Server-Einstellungen.";
      errorCode = "CONNECTION_FAILED";
    } else if (err.message?.includes("certificate") || err.message?.includes("TLS")) {
      errorMessage = "SSL-Zertifikatfehler. Bitte prüfen Sie die Server-Einstellungen.";
      errorCode = "SSL_ERROR";
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        code: errorCode,
        details: err.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
