import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CARTESIA_VOICES: Record<string, string> = {
  "viktoria": "b9de4a89-2257-424b-94c2-db18ba68c81a",
  "alina": "38aabb6a-f52b-4fb0-a3d1-988518f4dc06",
  "sebastian": "b7187e84-fe22-4344-ba4a-bc013fcb533e",
  "thomas": "384b625b-da5d-49e8-a76d-a2855d4f31eb",
};

const voiceSampleTexts: Record<string, string> = {
  viktoria: "Guten Tag, mein Name ist Viktoria. Wie kann ich Ihnen heute helfen?",
  alina: "Hallo, hier ist Alina. Ich freue mich, mit Ihnen zu sprechen.",
  sebastian: "Guten Tag, Sebastian am Apparat. Was kann ich für Sie tun?",
  thomas: "Hallo, mein Name ist Thomas. Ich bin hier, um Ihnen zu helfen.",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { voice, text } = await req.json();

    if (!voice) {
      return new Response(
        JSON.stringify({ error: "Voice parameter is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const voiceId = CARTESIA_VOICES[voice];
    if (!voiceId) {
      return new Response(
        JSON.stringify({ error: `Unknown voice: ${voice}. Available: ${Object.keys(CARTESIA_VOICES).join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sampleText = text || voiceSampleTexts[voice] || "Hallo, dies ist eine Testansage.";

    const CARTESIA_API_KEY = Deno.env.get("CARTESIA_API_KEY");
    if (!CARTESIA_API_KEY) {
      console.error("CARTESIA_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Cartesia API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating TTS for voice: ${voice} (ID: ${voiceId})`);

    const response = await fetch("https://api.cartesia.ai/tts/bytes", {
      method: "POST",
      headers: {
        "Cartesia-Version": "2025-04-16",
        "X-API-Key": CARTESIA_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_id: "sonic-3",
        transcript: sampleText,
        voice: {
          mode: "id",
          id: voiceId,
        },
        output_format: {
          container: "wav",
          encoding: "pcm_f32le",
          sample_rate: 44100,
        },
        speed: "normal",
        generation_config: {
          speed: 1,
          volume: 1,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Cartesia API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `Cartesia TTS error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audioData = await response.arrayBuffer();
    console.log(`Successfully generated audio: ${audioData.byteLength} bytes`);

    return new Response(audioData, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/wav",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Error in cartesia-tts-preview:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
