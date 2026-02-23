import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claims.claims.sub as string;

    const body = await req.json();
    const { action } = body;

    // Get user's ElevenLabs API key from ai_agent_settings
    const { data: settings } = await supabase
      .from("ai_agent_settings")
      .select("elevenlabs_api_key")
      .eq("user_id", userId)
      .maybeSingle();

    const apiKey = settings?.elevenlabs_api_key;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Kein ElevenLabs API-Key konfiguriert. Bitte unter Einstellungen → KI-Agent hinterlegen.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    switch (action) {
      case "create": {
        const { name, first_message, system_prompt, language, voice_id, tts_model, temperature } = body;

        // Create agent on ElevenLabs
        const elResponse = await fetch(
          "https://api.elevenlabs.io/v1/convai/agents/create",
          {
            method: "POST",
            headers: {
              "xi-api-key": apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: name || "Beavy Agent",
              conversation_config: {
                agent: {
                  prompt: { prompt: system_prompt || "" },
                  first_message: first_message || "",
                  language: language || "de",
                },
                tts: {
                  voice_id: voice_id || undefined,
                  model_id: tts_model || "eleven_flash_v2",
                },
              },
            }),
          }
        );

        const elText = await elResponse.text();
        if (!elResponse.ok) {
          console.error("ElevenLabs create error:", elText);
          // Save as draft with error
          const { data: agent } = await supabase
            .from("elevenlabs_agents")
            .insert({
              user_id: userId,
              name,
              first_message,
              system_prompt,
              language,
              voice_id,
              voice_name: body.voice_name,
              tts_model,
              temperature,
              status: "error",
              error_message: `ElevenLabs API Error: ${elText}`,
            })
            .select()
            .single();

          return new Response(
            JSON.stringify({ error: `ElevenLabs API Fehler: ${elText}`, agent }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const elData = JSON.parse(elText);

        // Save to DB
        const { data: agent, error: dbErr } = await supabase
          .from("elevenlabs_agents")
          .insert({
            user_id: userId,
            elevenlabs_agent_id: elData.agent_id,
            name,
            first_message,
            system_prompt,
            language,
            voice_id,
            voice_name: body.voice_name,
            tts_model,
            temperature,
            status: "active",
          })
          .select()
          .single();

        if (dbErr) throw dbErr;

        return new Response(JSON.stringify({ agent }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update": {
        const { agent_id, name, first_message, system_prompt, language, voice_id, tts_model, temperature } = body;

        // Get existing agent
        const { data: existing } = await supabase
          .from("elevenlabs_agents")
          .select("*")
          .eq("id", agent_id)
          .eq("user_id", userId)
          .single();

        if (!existing) {
          return new Response(JSON.stringify({ error: "Agent nicht gefunden" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Update on ElevenLabs if we have an agent_id
        if (existing.elevenlabs_agent_id) {
          const elResponse = await fetch(
            `https://api.elevenlabs.io/v1/convai/agents/${existing.elevenlabs_agent_id}`,
            {
              method: "PATCH",
              headers: {
                "xi-api-key": apiKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: name || existing.name,
                conversation_config: {
                  agent: {
                    prompt: { prompt: system_prompt || existing.system_prompt || "" },
                    first_message: first_message ?? existing.first_message ?? "",
                    language: language || existing.language || "de",
                  },
                  tts: {
                    voice_id: voice_id || existing.voice_id || undefined,
                    model_id: tts_model || existing.tts_model || "eleven_flash_v2",
                  },
                },
              }),
            }
          );

          if (!elResponse.ok) {
            const errText = await elResponse.text();
            console.error("ElevenLabs update error:", errText);
          } else {
            await elResponse.text();
          }
        }

        // Update DB
        const { data: agent, error: dbErr } = await supabase
          .from("elevenlabs_agents")
          .update({
            name,
            first_message,
            system_prompt,
            language,
            voice_id,
            voice_name: body.voice_name,
            tts_model,
            temperature,
          })
          .eq("id", agent_id)
          .eq("user_id", userId)
          .select()
          .single();

        if (dbErr) throw dbErr;

        return new Response(JSON.stringify({ agent }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete": {
        const { agent_id } = body;

        const { data: existing } = await supabase
          .from("elevenlabs_agents")
          .select("elevenlabs_agent_id")
          .eq("id", agent_id)
          .eq("user_id", userId)
          .single();

        // Delete from ElevenLabs
        if (existing?.elevenlabs_agent_id) {
          const elRes = await fetch(
            `https://api.elevenlabs.io/v1/convai/agents/${existing.elevenlabs_agent_id}`,
            {
              method: "DELETE",
              headers: { "xi-api-key": apiKey },
            }
          );
          await elRes.text();
        }

        // Delete from DB
        await supabase
          .from("elevenlabs_agents")
          .delete()
          .eq("id", agent_id)
          .eq("user_id", userId);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "list": {
        const { data: agents, error } = await supabase
          .from("elevenlabs_agents")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({ agents }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
