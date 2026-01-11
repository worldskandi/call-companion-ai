import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TTSRequest {
  voice: string;
  text?: string;
}

const voiceSampleTexts: Record<string, string> = {
  shimmer: "Guten Tag, mein Name ist Shimmer. Wie kann ich Ihnen heute helfen?",
  coral: "Hallo, hier ist Coral. Ich freue mich, mit Ihnen zu sprechen.",
  nova: "Willkommen, ich bin Nova. Schön, dass Sie anrufen.",
  sage: "Willkommen, ich bin Sage. Lassen Sie uns gemeinsam eine Lösung finden.",
  alloy: "Guten Tag, Alloy am Apparat. Was kann ich für Sie tun?",
  fable: "Hallo, hier spricht Fable. Ich erzähle Ihnen gerne mehr.",
  ash: "Hallo, mein Name ist Ash. Ich bin hier, um Ihnen zu helfen.",
  echo: "Guten Tag, Echo hier. Wie darf ich Ihnen behilflich sein?",
  onyx: "Guten Tag, hier ist Onyx. Ich freue mich auf unser Gespräch.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { voice, text }: TTSRequest = await req.json();

    if (!voice) {
      return new Response(
        JSON.stringify({ error: "Voice is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use default sample text or provided text
    const sampleText = text || voiceSampleTexts[voice] || "Guten Tag, ich bin Ihr KI-Assistent.";

    console.log(`Generating TTS preview for voice: ${voice}`);

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: voice,
        input: sampleText,
        response_format: "mp3",
        speed: 1.0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI TTS error:", errorText);
      return new Response(
        JSON.stringify({ error: `OpenAI TTS error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return the audio directly
    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error("TTS Preview error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
