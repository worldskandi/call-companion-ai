import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ImapClient } from "jsr:@bobbyg603/deno-imap@0.2.1";
import { decode as base64Decode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Decode Quoted-Printable content
function decodeQuotedPrintable(text: string, charset: string = 'utf-8'): string {
  try {
    const decoded = text
      .replace(/=\r?\n/g, '') // Remove soft line breaks
      .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => 
        String.fromCharCode(parseInt(hex, 16))
      );
    
    // If charset is utf-8, try to properly decode
    if (charset.toLowerCase() === 'utf-8') {
      // Convert to bytes and decode
      const bytes = new Uint8Array(decoded.split('').map(c => c.charCodeAt(0)));
      const decoder = new TextDecoder('utf-8', { fatal: false });
      return decoder.decode(bytes);
    }
    
    return decoded;
  } catch (e) {
    console.error('QP decode error:', e);
    return text;
  }
}

// Decode Base64 content
function decodeBase64Content(text: string, charset: string = 'utf-8'): string {
  try {
    const cleanBase64 = text.replace(/\s/g, '');
    const bytes = base64Decode(cleanBase64);
    const decoder = new TextDecoder(charset.toLowerCase(), { fatal: false });
    return decoder.decode(bytes);
  } catch (e) {
    console.error('Base64 decode error:', e);
    return text;
  }
}

interface FetchEmailBodyRequest {
  emailSeq: string;
  folder?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: FetchEmailBodyRequest = await req.json();
    const { emailSeq, folder = "INBOX" } = body;

    if (!emailSeq) {
      return new Response(
        JSON.stringify({ error: "emailSeq is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: integration, error: integrationError } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "imap_email")
      .eq("is_active", true)
      .maybeSingle();

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ error: "No email integration found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const metadata = integration.metadata as {
      imapHost: string;
      imapPort: number;
    };

    console.log(`Fetching body for email ${emailSeq} from ${folder}`);

    const client = new ImapClient({
      host: metadata.imapHost,
      port: metadata.imapPort || 993,
      tls: true,
      username: integration.provider_email!,
      password: integration.access_token,
    });

    await client.connect();
    await client.authenticate();
    await client.selectMailbox(folder);

    // Fetch the full message body - use any type to work around library typing limitations
    const messages = await client.fetch(emailSeq, {
      envelope: true,
      bodyStructure: true,
    }) as any[];

    let htmlBody: string | undefined;
    let textBody: string | undefined;

    if (messages.length > 0) {
      const message = messages[0];
      
      // Parse body structure to find content
      const structure = message.bodyStructure as any;
      console.log('Body structure:', JSON.stringify(structure, null, 2));
      
      // The IMAP client may not support bodyParts directly, 
      // so we'll fetch the raw body sections
      try {
        // Try to fetch BODY[1] which is typically the first part
        const bodyParts = await client.fetch(emailSeq, {
          bodyParts: ["1", "1.1", "1.2", "2"],
        } as any) as any[];
        
        if (bodyParts.length > 0 && bodyParts[0].bodyParts) {
          for (const [partId, partData] of Object.entries(bodyParts[0].bodyParts)) {
            const data = partData as string;
            if (!data) continue;
            
            console.log(`Part ${partId}: ${data.substring(0, 100)}...`);
            
            let contentType = 'text/plain';
            let charset = 'utf-8';
            let encoding = '7bit';
            
            if (structure) {
              if (structure.type === 'multipart') {
                const parts = structure.childNodes || [];
                const partIndex = parseInt(partId.split('.')[0]) - 1;
                const part = parts[partIndex];
                if (part) {
                  contentType = `${part.type}/${part.subtype}`.toLowerCase();
                  charset = part.parameters?.charset || 'utf-8';
                  encoding = part.encoding?.toLowerCase() || '7bit';
                }
              } else {
                contentType = `${structure.type}/${structure.subtype}`.toLowerCase();
                charset = structure.parameters?.charset || 'utf-8';
                encoding = structure.encoding?.toLowerCase() || '7bit';
              }
            }
            
            let decoded = data;
            
            if (encoding === 'base64') {
              decoded = decodeBase64Content(data, charset);
            } else if (encoding === 'quoted-printable') {
              decoded = decodeQuotedPrintable(data, charset);
            }
            
            if (contentType.includes('html')) {
              htmlBody = decoded;
            } else if (contentType.includes('plain')) {
              textBody = decoded;
            }
          }
        }
      } catch (partError) {
        console.error('Error fetching body parts:', partError);
      }
      
      // If no parts found, try fetching the entire body as TEXT
      if (!htmlBody && !textBody) {
        try {
          const fullBody = await client.fetch(emailSeq, {
            bodyParts: ["TEXT"],
          } as any) as any[];
          
          if (fullBody.length > 0 && fullBody[0].bodyParts?.TEXT) {
            const text = fullBody[0].bodyParts.TEXT as string;
            if (text) {
              if (text.includes('<html') || text.includes('<body') || text.includes('<div') || text.includes('<p>')) {
                htmlBody = text;
              } else {
                textBody = text;
              }
            }
          }
        } catch (e) {
          console.error('Failed to fetch TEXT part:', e);
        }
      }
    }

    client.disconnect();
    console.log("Disconnected from IMAP server");

    return new Response(
      JSON.stringify({ 
        htmlBody,
        textBody,
        success: true
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: unknown) {
    console.error("Fetch email body error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch email body",
        details: (error as Error).message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
