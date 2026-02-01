import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Tool definitions for OpenClaw
const tools = [
  {
    type: "function",
    function: {
      name: "get_leads",
      description: "Ruft alle Leads des Users ab. Kann nach Status und Kampagne gefiltert werden.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["new", "called", "interested", "callback", "not_interested", "qualified"],
            description: "Filtere nach Lead-Status"
          },
          campaign_id: {
            type: "string",
            description: "Filtere nach Kampagnen-ID"
          },
          search: {
            type: "string",
            description: "Suchbegriff für Name, Firma oder Email"
          },
          limit: {
            type: "number",
            description: "Maximale Anzahl Ergebnisse (Standard: 20)"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_campaigns",
      description: "Ruft alle Kampagnen des Users ab.",
      parameters: {
        type: "object",
        properties: {
          is_active: {
            type: "boolean",
            description: "Nur aktive Kampagnen anzeigen"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_call_logs",
      description: "Ruft die Anruf-Historie ab.",
      parameters: {
        type: "object",
        properties: {
          outcome: {
            type: "string",
            enum: ["answered", "no_answer", "busy", "voicemail", "interested", "not_interested", "callback_scheduled", "qualified"],
            description: "Filtere nach Anruf-Ergebnis"
          },
          call_type: {
            type: "string",
            enum: ["inbound", "outbound"],
            description: "Filtere nach Anruf-Typ"
          },
          limit: {
            type: "number",
            description: "Maximale Anzahl Ergebnisse (Standard: 20)"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_dashboard_stats",
      description: "Ruft Dashboard-Statistiken ab: Anzahl Leads, Anrufe, Erfolgsrate etc.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_lead",
      description: "Erstellt einen neuen Lead.",
      parameters: {
        type: "object",
        properties: {
          first_name: {
            type: "string",
            description: "Vorname (Pflichtfeld)"
          },
          last_name: {
            type: "string",
            description: "Nachname"
          },
          phone_number: {
            type: "string",
            description: "Telefonnummer (Pflichtfeld)"
          },
          email: {
            type: "string",
            description: "E-Mail-Adresse"
          },
          company: {
            type: "string",
            description: "Firmenname"
          },
          campaign_id: {
            type: "string",
            description: "Kampagnen-ID für die Zuordnung"
          },
          notes: {
            type: "string",
            description: "Notizen zum Lead"
          }
        },
        required: ["first_name", "phone_number"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_lead",
      description: "Aktualisiert einen bestehenden Lead.",
      parameters: {
        type: "object",
        properties: {
          lead_id: {
            type: "string",
            description: "ID des zu aktualisierenden Leads (Pflichtfeld)"
          },
          first_name: {
            type: "string",
            description: "Neuer Vorname"
          },
          last_name: {
            type: "string",
            description: "Neuer Nachname"
          },
          phone_number: {
            type: "string",
            description: "Neue Telefonnummer"
          },
          email: {
            type: "string",
            description: "Neue E-Mail-Adresse"
          },
          company: {
            type: "string",
            description: "Neuer Firmenname"
          },
          status: {
            type: "string",
            enum: ["new", "called", "interested", "callback", "not_interested", "qualified"],
            description: "Neuer Status"
          },
          notes: {
            type: "string",
            description: "Neue Notizen"
          }
        },
        required: ["lead_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_campaign",
      description: "Erstellt eine neue Kampagne.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name der Kampagne (Pflichtfeld)"
          },
          product_description: {
            type: "string",
            description: "Beschreibung des Produkts/Services"
          },
          target_group: {
            type: "string",
            description: "Zielgruppe der Kampagne"
          },
          call_goal: {
            type: "string",
            description: "Ziel der Anrufe"
          }
        },
        required: ["name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_call_analytics",
      description: "Ruft Anruf-Analytics für die letzten X Tage ab.",
      parameters: {
        type: "object",
        properties: {
          days: {
            type: "number",
            description: "Anzahl Tage für die Analyse (Standard: 30)"
          }
        }
      }
    }
  }
];

// deno-lint-ignore no-explicit-any
type SupabaseClientAny = any;

// Execute tool calls against Supabase
async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  supabase: SupabaseClientAny
): Promise<string> {
  try {
    switch (toolName) {
      case "get_leads": {
        const { data, error } = await supabase.rpc("get_leads", {
          p_status: args.status || null,
          p_campaign_id: args.campaign_id || null,
          p_search: args.search || null
        });
        if (error) throw error;
        const dataArr = (data || []) as Record<string, unknown>[];
        const limit = typeof args.limit === 'number' ? args.limit : 20;
        const leads = dataArr.slice(0, limit);
        return JSON.stringify({
          count: leads.length,
          leads: leads.map((l) => ({
            id: l.id,
            name: `${l.first_name} ${l.last_name || ""}`.trim(),
            company: l.company,
            phone: l.phone_number,
            email: l.email,
            status: l.status,
            notes: l.notes
          }))
        });
      }

      case "get_campaigns": {
        const { data, error } = await supabase.rpc("get_campaigns", {
          p_is_active: args.is_active ?? null
        });
        if (error) throw error;
        const dataArr = (data || []) as Record<string, unknown>[];
        return JSON.stringify({
          count: dataArr.length,
          campaigns: dataArr.map((c) => ({
            id: c.id,
            name: c.name,
            is_active: c.is_active,
            lead_count: c.lead_count,
            target_group: c.target_group,
            call_goal: c.call_goal
          }))
        });
      }

      case "get_call_logs": {
        const { data, error } = await supabase.rpc("get_call_logs", {
          p_outcome: args.outcome || null,
          p_call_type: args.call_type || null,
          p_limit: args.limit || 20
        });
        if (error) throw error;
        const dataArr = (data || []) as Record<string, unknown>[];
        return JSON.stringify({
          count: dataArr.length,
          calls: dataArr.map((c) => ({
            id: c.id,
            lead_name: `${c.lead_first_name || ""} ${c.lead_last_name || ""}`.trim(),
            lead_company: c.lead_company,
            campaign_name: c.campaign_name,
            outcome: c.outcome,
            call_type: c.call_type,
            duration_seconds: c.duration_seconds,
            started_at: c.started_at,
            summary: c.summary
          }))
        });
      }

      case "get_dashboard_stats": {
        const { data, error } = await supabase.rpc("get_dashboard_stats");
        if (error) throw error;
        const dataArr = (data || []) as Record<string, unknown>[];
        const stats = dataArr[0] || {};
        return JSON.stringify({
          total_leads: stats.total_leads || 0,
          total_campaigns: stats.total_campaigns || 0,
          total_calls: stats.total_calls || 0,
          calls_today: stats.calls_today || 0,
          inbound_calls_today: stats.inbound_calls_today || 0,
          outbound_calls_today: stats.outbound_calls_today || 0,
          interested_leads: stats.interested_leads || 0,
          avg_call_duration_seconds: Math.round(Number(stats.avg_call_duration_seconds) || 0),
          success_rate_percent: Math.round(Number(stats.success_rate) || 0)
        });
      }

      case "get_call_analytics": {
        const { data, error } = await supabase.rpc("get_call_analytics", {
          p_days: args.days || 30
        });
        if (error) throw error;
        const dataArr = (data || []) as Record<string, unknown>[];
        return JSON.stringify({
          days_analyzed: args.days || 30,
          analytics: dataArr.map((d) => ({
            date: d.date,
            inbound: d.inbound_count,
            outbound: d.outbound_count,
            success: d.success_count,
            total_duration_seconds: d.total_duration
          }))
        });
      }

      case "create_lead": {
        const { data, error } = await supabase.rpc("create_lead", {
          p_first_name: args.first_name,
          p_phone_number: args.phone_number,
          p_last_name: args.last_name || null,
          p_company: args.company || null,
          p_email: args.email || null,
          p_campaign_id: args.campaign_id || null,
          p_notes: args.notes || null
        });
        if (error) throw error;
        return JSON.stringify({
          success: true,
          lead_id: data,
          message: `Lead "${args.first_name}" wurde erfolgreich erstellt.`
        });
      }

      case "update_lead": {
        const { data, error } = await supabase.rpc("update_lead", {
          p_lead_id: args.lead_id,
          p_first_name: args.first_name || null,
          p_last_name: args.last_name || null,
          p_phone_number: args.phone_number || null,
          p_email: args.email || null,
          p_company: args.company || null,
          p_status: args.status || null,
          p_notes: args.notes || null
        });
        if (error) throw error;
        return JSON.stringify({
          success: data,
          message: data ? "Lead wurde aktualisiert." : "Lead nicht gefunden oder keine Berechtigung."
        });
      }

      case "create_campaign": {
        const { data, error } = await supabase.rpc("create_campaign", {
          p_name: args.name,
          p_product_description: args.product_description || null,
          p_target_group: args.target_group || null,
          p_call_goal: args.call_goal || null
        });
        if (error) throw error;
        return JSON.stringify({
          success: true,
          campaign_id: data,
          message: `Kampagne "${args.name}" wurde erstellt.`
        });
      }

      default:
        return JSON.stringify({ error: `Unbekanntes Tool: ${toolName}` });
    }
  } catch (error) {
    console.error(`Tool execution error (${toolName}):`, error);
    return JSON.stringify({ error: error instanceof Error ? error.message : "Tool-Ausführung fehlgeschlagen" });
  }
}

// Helper to read full stream response
async function readStreamToCompletion(response: Response): Promise<{ content: string; toolCalls: any[] }> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();
  let content = "";
  let toolCalls: any[] = [];
  let toolCallBuffer: Record<string, { id: string; function: { name: string; arguments: string } }> = {};

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") continue;

      try {
        const parsed = JSON.parse(jsonStr);
        const delta = parsed.choices?.[0]?.delta;
        
        if (delta?.content) {
          content += delta.content;
        }
        
        // Handle tool calls in stream
        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            const index = tc.index ?? 0;
            if (!toolCallBuffer[index]) {
              toolCallBuffer[index] = {
                id: tc.id || `call_${index}`,
                function: { name: "", arguments: "" }
              };
            }
            if (tc.id) toolCallBuffer[index].id = tc.id;
            if (tc.function?.name) toolCallBuffer[index].function.name = tc.function.name;
            if (tc.function?.arguments) toolCallBuffer[index].function.arguments += tc.function.arguments;
          }
        }
      } catch {
        // Ignore parse errors
      }
    }
  }

  // Convert buffer to array
  toolCalls = Object.values(toolCallBuffer).filter(tc => tc.function.name);

  return { content, toolCalls };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, pageContext, conversationId } = await req.json();

    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    
    // Create Supabase client with user's auth token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {}
      }
    });

    const OPENCLAW_GATEWAY_URL = Deno.env.get("OPENCLAW_GATEWAY_URL");
    const OPENCLAW_GATEWAY_TOKEN = Deno.env.get("OPENCLAW_GATEWAY_TOKEN");

    if (!OPENCLAW_GATEWAY_URL) {
      throw new Error("OPENCLAW_GATEWAY_URL is not configured");
    }

    const apiUrl = `${OPENCLAW_GATEWAY_URL.replace(/\/$/, "")}/v1/chat/completions`;

    console.log(`Calling OpenClaw Gateway at: ${apiUrl}, pageContext: ${pageContext}, conversationId: ${conversationId}`);

    const gatewayHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (OPENCLAW_GATEWAY_TOKEN) {
      gatewayHeaders["Authorization"] = `Bearer ${OPENCLAW_GATEWAY_TOKEN}`;
    }

    gatewayHeaders["x-openclaw-agent-id"] = "main";

    const pageContextInfo = pageContext 
      ? `\n\nDer User befindet sich aktuell auf der Seite: ${pageContext}. Nutze diesen Kontext um proaktiv und relevant zu helfen.`
      : '';

    // Pre-fetch user context data to inject into the system prompt
    let userContextData = "";
    try {
      const [statsResult, leadsResult, campaignsResult] = await Promise.all([
        supabase.rpc("get_dashboard_stats"),
        supabase.rpc("get_leads", { p_status: null, p_campaign_id: null, p_search: null }),
        supabase.rpc("get_campaigns", { p_is_active: null })
      ]);

      const stats = statsResult.data?.[0] || {};
      const leads = (leadsResult.data || []).slice(0, 10);
      const campaigns = campaignsResult.data || [];

      userContextData = `

AKTUELLE USER-DATEN (nutze diese Daten direkt in deinen Antworten):

📊 Dashboard-Statistiken:
- Leads gesamt: ${stats.total_leads || 0}
- Kampagnen: ${stats.total_campaigns || 0}
- Anrufe gesamt: ${stats.total_calls || 0}
- Anrufe heute: ${stats.calls_today || 0} (Inbound: ${stats.inbound_calls_today || 0}, Outbound: ${stats.outbound_calls_today || 0})
- Interessierte Leads: ${stats.interested_leads || 0}
- Erfolgsrate: ${Math.round(Number(stats.success_rate) || 0)}%

📋 Leads (erste ${leads.length}):
${leads.length > 0 ? leads.map((l: any) => `- ${l.first_name} ${l.last_name || ""} | ${l.company || "Keine Firma"} | ${l.status} | ${l.phone_number}`).join("\n") : "Keine Leads vorhanden."}

🎯 Kampagnen:
${campaigns.length > 0 ? campaigns.map((c: any) => `- ${c.name} (${c.is_active ? "aktiv" : "inaktiv"}) | ${c.lead_count || 0} Leads`).join("\n") : "Keine Kampagnen vorhanden."}

Du hast VOLLSTÄNDIGEN ZUGRIFF auf diese Daten. Beantworte Fragen zu Leads, Kampagnen und Statistiken direkt mit den obigen Informationen.`;

      console.log("User context data loaded successfully");
    } catch (err) {
      console.error("Failed to pre-fetch user context:", err);
      userContextData = "\n\nHinweis: Konnte Benutzerdaten nicht laden. Bitte versuche es erneut.";
    }

    const systemPrompt = `Du bist OpenClaw, der KI-Assistent im Beavy Dashboard. 
Du hilfst Nutzern bei der Verwaltung ihrer Leads, Kampagnen und Anrufe.
Antworte auf Deutsch, präzise und freundlich.
Nutze Markdown für Formatierung (fett, Listen, Tabellen).
${userContextData}${pageContextInfo}

WICHTIG: Du HAST Zugriff auf die Daten! Die obigen Informationen sind DEINE Daten. Wenn jemand nach Leads oder Statistiken fragt, nutze die Daten die dir gegeben wurden.`;

    // Simple streaming response - no tool calling since gateway doesn't support it well
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: gatewayHeaders,
      body: JSON.stringify({
        model: "openclaw",
        messages: [
          { role: "system", content: systemPrompt },
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
