import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GenerateDraftRequest {
  emailId: string;
  fromEmail: string;
  fromName: string;
  subject: string;
  preview: string;
  analysis?: {
    summary: string;
    category: string;
    suggestedAction?: string;
  };
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

    // Try Lovable AI first, fall back to OpenClaw
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENCLAW_GATEWAY_URL = Deno.env.get("OPENCLAW_GATEWAY_URL");
    const OPENCLAW_GATEWAY_TOKEN = Deno.env.get("OPENCLAW_GATEWAY_TOKEN");

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

    const { fromEmail, fromName, subject, preview, analysis } = await req.json() as GenerateDraftRequest;

    // Get company profile for context
    const { data: companyProfile } = await supabase
      .from('company_profiles')
      .select('company_name, industry, short_description, products_services')
      .eq('user_id', user.id)
      .maybeSingle();

    // Get AI agent settings for tone/style
    const { data: aiSettings } = await supabase
      .from('ai_agent_settings')
      .select('ai_name, ai_personality, company_name')
      .eq('user_id', user.id)
      .maybeSingle();

    const companyName = companyProfile?.company_name || aiSettings?.company_name || 'Unser Unternehmen';
    const companyDesc = companyProfile?.short_description || '';
    const agentName = aiSettings?.ai_name || 'Steffi';
    const personality = aiSettings?.ai_personality || 'professionell und freundlich';

    const systemPrompt = `Du bist ${agentName}, eine KI-Assistentin für ${companyName}. ${companyDesc}

Deine Aufgabe ist es, professionelle E-Mail-Antworten zu verfassen. Dein Stil ist ${personality}.

Wichtige Regeln:
- Schreibe auf Deutsch in einem professionellen, aber freundlichen Ton
- Halte die Antwort präzise und relevant
- Beziehe dich auf den Inhalt der Original-E-Mail
- Verwende eine angemessene Anrede und Grußformel
- Strukturiere längere Antworten mit Absätzen
- Beende die E-Mail mit einer freundlichen Grußformel und dem Firmennamen

Format:
Gib nur den E-Mail-Text zurück, keine zusätzlichen Erklärungen. Beginne direkt mit der Anrede.`;

    const userPrompt = `Erstelle eine professionelle Antwort auf diese E-Mail:

**Von:** ${fromName} <${fromEmail}>
**Betreff:** ${subject}
**Inhalt/Zusammenfassung:** ${preview}
${analysis ? `
**KI-Analyse:**
- Kategorie: ${analysis.category}
- Zusammenfassung: ${analysis.summary}
${analysis.suggestedAction ? `- Vorgeschlagene Aktion: ${analysis.suggestedAction}` : ''}
` : ''}

Erstelle nun eine passende Antwort:`;

    let draft = '';
    let aiSource = 'unknown';

    // Try Lovable AI first
    if (LOVABLE_API_KEY) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          draft = data.choices?.[0]?.message?.content || '';
          aiSource = 'lovable';
        } else if (response.status === 429) {
          console.log("Lovable AI rate limited, trying OpenClaw...");
        } else if (response.status === 402) {
          console.log("Lovable AI credits exhausted, trying OpenClaw...");
        }
      } catch (e) {
        console.error("Lovable AI error:", e);
      }
    }

    // Fall back to OpenClaw if Lovable AI didn't work
    if (!draft && OPENCLAW_GATEWAY_URL) {
      try {
        const apiUrl = `${OPENCLAW_GATEWAY_URL.replace(/\/$/, "")}/v1/chat/completions`;
        
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (OPENCLAW_GATEWAY_TOKEN) {
          headers["Authorization"] = `Bearer ${OPENCLAW_GATEWAY_TOKEN}`;
        }

        const response = await fetch(apiUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            stream: false
          }),
        });

        if (response.ok) {
          const data = await response.json();
          draft = data.choices?.[0]?.message?.content || '';
          aiSource = 'openclaw';
        }
      } catch (e) {
        console.error("OpenClaw error:", e);
      }
    }

    if (!draft) {
      return new Response(
        JSON.stringify({ error: "Keine KI-Verbindung verfügbar. Bitte prüfe die Konfiguration." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate reply subject
    const replySubject = subject.toLowerCase().startsWith('re:') 
      ? subject 
      : `Re: ${subject}`;

    return new Response(
      JSON.stringify({ 
        draft,
        replySubject,
        replyTo: fromEmail,
        aiSource,
        agentName
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Generate draft error:", error);
    const err = error as Error;
    return new Response(
      JSON.stringify({ error: err.message || "Draft-Generierung fehlgeschlagen" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
