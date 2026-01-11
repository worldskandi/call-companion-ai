import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function generateSummary(transcript: string, openaiKey: string): Promise<string> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Du bist ein Experte für Vertriebsgespräche. Erstelle eine kurze Zusammenfassung des Telefonats mit folgenden Punkten:
- Gesprächsverlauf (2-3 Sätze)
- Ergebnis/Outcome
- Interesse des Kunden (hoch/mittel/niedrig/keins)
- Nächste Schritte (falls vereinbart)
- Wichtige Notizen

Antworte auf Deutsch und halte die Zusammenfassung kurz und prägnant.`
          },
          {
            role: "user",
            content: `Hier ist das Transkript des Gesprächs:\n\n${transcript}`
          }
        ],
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Zusammenfassung konnte nicht erstellt werden.";
  } catch (error) {
    console.error("Summary generation error:", error);
    return "Fehler bei der Zusammenfassung.";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { call_log_id, transcript, generate_summary, duration_seconds, outcome } = await req.json();

    if (!call_log_id) {
      return new Response(
        JSON.stringify({ success: false, error: "call_log_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const updateData: Record<string, any> = {
      ended_at: new Date().toISOString(),
    };

    if (duration_seconds !== undefined) {
      updateData.duration_seconds = duration_seconds;
    }

    if (outcome) {
      updateData.outcome = outcome;
    }

    if (transcript) {
      updateData.transcript = transcript;

      // Generate summary if requested and OpenAI key available
      if (generate_summary && openaiKey) {
        const summary = await generateSummary(transcript, openaiKey);
        updateData.summary = summary;
      }
    }

    const { data, error } = await supabase
      .from("call_logs")
      .update(updateData)
      .eq("id", call_log_id)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Call ${call_log_id} ended. Duration: ${duration_seconds}s, Outcome: ${outcome}, Has transcript: ${!!transcript}`);

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("End call error:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
