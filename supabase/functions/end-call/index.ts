import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      call_log_id, 
      duration_seconds, 
      outcome, 
      summary, 
      transcript,
      room_name 
    } = await req.json();

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find the call log by ID or room name
    let callLogId = call_log_id;
    
    if (!callLogId && room_name) {
      // Try to find by room name in summary
      const { data: callLogs } = await supabase
        .from("call_logs")
        .select("id")
        .ilike("summary", `%${room_name}%`)
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (callLogs && callLogs.length > 0) {
        callLogId = callLogs[0].id;
      }
    }

    if (!callLogId) {
      console.log("No call_log_id provided and couldn't find by room_name");
      return new Response(
        JSON.stringify({ success: false, error: "No call log found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the call log
    const updateData: Record<string, unknown> = {
      ended_at: new Date().toISOString(),
    };

    if (duration_seconds !== undefined) {
      updateData.duration_seconds = duration_seconds;
    }

    if (outcome) {
      updateData.outcome = outcome;
    }

    if (summary) {
      // Append to existing summary
      const { data: existingLog } = await supabase
        .from("call_logs")
        .select("summary")
        .eq("id", callLogId)
        .single();
      
      updateData.summary = existingLog?.summary 
        ? `${existingLog.summary}\n\n${summary}`
        : summary;
    }

    if (transcript) {
      updateData.transcript = transcript;
    }

    const { error: updateError } = await supabase
      .from("call_logs")
      .update(updateData)
      .eq("id", callLogId);

    if (updateError) {
      console.error("Error updating call log:", updateError);
      throw updateError;
    }

    console.log(`Call ended: ${callLogId}, duration: ${duration_seconds}s, outcome: ${outcome}`);

    return new Response(
      JSON.stringify({ success: true, call_log_id: callLogId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error ending call:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to end call";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
