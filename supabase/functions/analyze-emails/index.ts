import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailToAnalyze {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  preview: string;
  date: string;
}

interface AnalyzedEmail {
  id: string;
  summary: string;
  relevance: 'high' | 'medium' | 'low' | 'spam';
  relevanceScore: number;
  category: string;
  actionRequired: boolean;
  suggestedAction?: string;
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user context
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

    // Get company profile for context
    const { data: companyProfile } = await supabase
      .from('company_profiles')
      .select('company_name, industry, short_description, products_services')
      .eq('user_id', user.id)
      .maybeSingle();

    const { emails } = await req.json() as { emails: EmailToAnalyze[] };

    if (!emails || emails.length === 0) {
      return new Response(
        JSON.stringify({ analyzedEmails: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context about the business
    const businessContext = companyProfile 
      ? `Das Unternehmen heißt "${companyProfile.company_name}" und ist in der Branche "${companyProfile.industry || 'nicht angegeben'}". ${companyProfile.short_description || ''}`
      : 'Keine Unternehmensinformationen verfügbar.';

    // Prepare email list for analysis
    const emailList = emails.map((e, idx) => 
      `[${idx + 1}] Von: ${e.from} <${e.fromEmail}>\nBetreff: ${e.subject}\nVorschau: ${e.preview}\nDatum: ${e.date}`
    ).join('\n\n---\n\n');

    const systemPrompt = `Du bist ein intelligenter E-Mail-Assistent für Geschäftskunden. Deine Aufgabe ist es, E-Mails zu analysieren, zusammenzufassen und nach Relevanz zu sortieren.

${businessContext}

Analysiere jede E-Mail und gib für jede folgende Informationen zurück:
- Eine kurze Zusammenfassung (1-2 Sätze, auf Deutsch)
- Relevanz-Einstufung: "high" (geschäftsrelevant, Kundenanfragen, wichtige Partner), "medium" (Newsletter, Updates von bekannten Diensten), "low" (Werbung, unwichtige Benachrichtigungen), "spam" (Spam, Phishing, unseriöse Absender)
- Relevanz-Score (0-100)
- Kategorie (z.B. "Kundenanfrage", "Newsletter", "Werbung", "Rechnung", "Terminanfrage", "Support", "Spam")
- Ob eine Aktion erforderlich ist (true/false)
- Vorgeschlagene Aktion falls relevant (z.B. "Antworten", "Termin planen", "Ignorieren")

Fokussiere dich auf geschäftliche Relevanz. E-Mails von potenziellen Kunden oder wichtigen Partnern sind hochrelevant. Newsletter und Werbung sind niedrig relevant.`;

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
          { role: "user", content: `Analysiere diese E-Mails:\n\n${emailList}` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_emails",
              description: "Gibt die Analyse aller E-Mails zurück",
              parameters: {
                type: "object",
                properties: {
                  analyses: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        index: { type: "number", description: "Index der E-Mail (1-basiert)" },
                        summary: { type: "string", description: "Kurze Zusammenfassung auf Deutsch" },
                        relevance: { type: "string", enum: ["high", "medium", "low", "spam"] },
                        relevanceScore: { type: "number", description: "Score von 0-100" },
                        category: { type: "string" },
                        actionRequired: { type: "boolean" },
                        suggestedAction: { type: "string" }
                      },
                      required: ["index", "summary", "relevance", "relevanceScore", "category", "actionRequired"]
                    }
                  }
                },
                required: ["analyses"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_emails" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit erreicht. Bitte versuche es später erneut." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "KI-Credits aufgebraucht. Bitte lade dein Guthaben auf." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "KI-Analyse fehlgeschlagen" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    console.log("AI Response:", JSON.stringify(aiResponse, null, 2));

    // Extract tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "analyze_emails") {
      return new Response(
        JSON.stringify({ error: "Unerwartete KI-Antwort" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const analysisResult = JSON.parse(toolCall.function.arguments);
    
    // Map analysis results back to email IDs
    const analyzedEmails: AnalyzedEmail[] = analysisResult.analyses.map((analysis: any) => {
      const emailIndex = analysis.index - 1;
      const email = emails[emailIndex];
      return {
        id: email?.id || `unknown-${analysis.index}`,
        summary: analysis.summary,
        relevance: analysis.relevance,
        relevanceScore: analysis.relevanceScore,
        category: analysis.category,
        actionRequired: analysis.actionRequired,
        suggestedAction: analysis.suggestedAction
      };
    });

    return new Response(
      JSON.stringify({ analyzedEmails }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Analyze emails error:", error);
    const err = error as Error;
    return new Response(
      JSON.stringify({ error: err.message || "Analyse fehlgeschlagen" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
