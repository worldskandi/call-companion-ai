import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    const OPENCLAW_GATEWAY_URL = Deno.env.get("OPENCLAW_GATEWAY_URL");
    const OPENCLAW_GATEWAY_TOKEN = Deno.env.get("OPENCLAW_GATEWAY_TOKEN");

    if (!OPENCLAW_GATEWAY_URL) {
      throw new Error("OPENCLAW_GATEWAY_URL is not configured");
    }

    // Build the full URL to the OpenClaw Gateway's OpenAI-compatible endpoint
    const apiUrl = `${OPENCLAW_GATEWAY_URL.replace(/\/$/, "")}/v1/chat/completions`;

    console.log(`Calling OpenClaw Gateway at: ${apiUrl}`);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (OPENCLAW_GATEWAY_TOKEN) {
      headers["Authorization"] = `Bearer ${OPENCLAW_GATEWAY_TOKEN}`;
    }

    // Add header to specify the agent (default to "main")
    headers["x-openclaw-agent-id"] = "main";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "openclaw",
        messages: [
          {
            role: "system",
            content:
              "Du bist ein hilfreicher KI-Assistent im Dashboard. Antworte auf Deutsch, präzise und freundlich. Du hilfst bei Fragen zu Leads, Anrufen, Kampagnen und allgemeinen Geschäftsthemen.",
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenClaw Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 401 || response.status === 403) {
        return new Response(
          JSON.stringify({ error: "Authentication failed. Check your gateway token." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: `OpenClaw Gateway error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream the response back to the client
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("openclaw-chat error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
