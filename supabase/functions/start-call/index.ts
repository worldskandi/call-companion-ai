import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate JWT token for LiveKit
async function generateLiveKitToken(
  apiKey: string,
  apiSecret: string,
  payload: Record<string, unknown>,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "HS256", typ: "JWT" };

  const fullPayload = {
    iss: apiKey,
    iat: now,
    nbf: now,
    ...payload,
  };

  const base64UrlEncode = (obj: Record<string, unknown>): string => {
    const jsonStr = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(jsonStr);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  const headerEncoded = base64UrlEncode(header);
  const payloadEncoded = base64UrlEncode(fullPayload);
  const dataToSign = `${headerEncoded}.${payloadEncoded}`;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(apiSecret);
  const signData = encoder.encode(dataToSign);

  const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);

  const signature = await crypto.subtle.sign("HMAC", key, signData);
  const signatureBytes = new Uint8Array(signature);
  let signatureBinary = "";
  for (let i = 0; i < signatureBytes.length; i++) {
    signatureBinary += String.fromCharCode(signatureBytes[i]);
  }
  const signatureBase64 = btoa(signatureBinary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  return `${headerEncoded}.${payloadEncoded}.${signatureBase64}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, campaignPrompt, leadName, leadCompany, leadId, campaignId, productDescription, callGoal } =
      await req.json();

    const LIVEKIT_API_KEY = Deno.env.get("LIVEKIT_API_KEY");
    const LIVEKIT_API_SECRET = Deno.env.get("LIVEKIT_API_SECRET");
    const LIVEKIT_URL = Deno.env.get("LIVEKIT_URL");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
      throw new Error("LiveKit credentials not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    if (!to) {
      throw new Error("Phone number is required");
    }

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Invalid authentication");
    }

    // Load full lead data if leadId provided
    let leadData = null;
    if (leadId) {
      const { data } = await supabase.from("leads").select("*").eq("id", leadId).single();
      leadData = data;
    }

    // Load full campaign data if campaignId provided
    let campaignData = null;
    if (campaignId) {
      const { data } = await supabase.from("campaigns").select("*").eq("id", campaignId).single();
      campaignData = data;
    }

    // Create call log entry (only use columns that exist in the schema)
    let callLog = null;
    if (leadId) {
      const { data, error: callError } = await supabase
        .from("call_logs")
        .insert({
          user_id: user.id,
          lead_id: leadId,
          campaign_id: campaignId || null,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (callError) {
        console.error("Error creating call log:", callError);
      } else {
        callLog = data;
      }
    }

    // Generate unique room name
    const roomName = `outbound-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Build metadata for the agent
    const metadata = {
      phone_number: to,
      ai_prompt: campaignData?.ai_prompt || campaignPrompt || null,
      product_description: campaignData?.product_description || productDescription || null,
      call_goal: campaignData?.call_goal || callGoal || null,
      campaign_name: campaignData?.name || null,
      lead_name: leadData
        ? `${leadData.first_name}${leadData.last_name ? " " + leadData.last_name : ""}`
        : leadName || null,
      lead_company: leadData?.company || leadCompany || null,
      lead_notes: leadData?.notes || null,
      lead_phone: to,
      lead_email: leadData?.email || null,
      user_id: user.id,
      call_log_id: callLog?.id || null,
    };

    console.log("Starting outbound call to:", to);
    console.log("Room:", roomName);
    console.log("Metadata:", JSON.stringify(metadata));

    // Generate server token
    const now = Math.floor(Date.now() / 1000);
    const serverToken = await generateLiveKitToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      sub: "server",
      exp: now + 300,
      video: {
        // Use explicit admin grant (used by LiveKit server SDKs for admin RPC calls)
        admin: true,
        roomCreate: true,
        roomList: true,
        roomAdmin: true,
        // Required for AgentDispatchService/CreateDispatch
        agent: true,
        // Scope to this room (matches server SDK behavior)
        room: roomName,
      },
    });

    const livekitHttpUrl = LIVEKIT_URL.replace("wss://", "https://").replace("ws://", "http://");

    // Step 1: Create room
    const createRoomResponse = await fetch(`${livekitHttpUrl}/twirp/livekit.RoomService/CreateRoom`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serverToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: roomName,
        empty_timeout: 300,
        max_participants: 2,
      }),
    });

    if (!createRoomResponse.ok) {
      const errorText = await createRoomResponse.text();
      throw new Error(`Failed to create room: ${errorText}`);
    }

    console.log("Room created:", roomName);

    // Step 2: Dispatch agent with metadata (agent will make the call)
    const dispatchResponse = await fetch(`${livekitHttpUrl}/twirp/livekit.AgentDispatchService/CreateDispatch`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serverToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room: roomName,
        agent_name: "ColdCallAgent",
        metadata: JSON.stringify(metadata),
      }),
    });

    if (!dispatchResponse.ok) {
      const errorText = await dispatchResponse.text();
      console.error("Failed to dispatch agent:", errorText);
      throw new Error(`Failed to dispatch agent: ${errorText}`);
    }

    const dispatchData = await dispatchResponse.json();
    console.log("Agent dispatched:", dispatchData);

    // LiveKit returns the dispatch id as `id` (not `dispatch_id`)
    const dispatchId = (dispatchData as { id?: string; dispatch_id?: string })?.id ??
      (dispatchData as { id?: string; dispatch_id?: string })?.dispatch_id ??
      null;

    // Update call log with summary info
    if (callLog?.id) {
      await supabase
        .from("call_logs")
        .update({
          summary: `Outbound call to ${to}, Room: ${roomName}`,
        })
        .eq("id", callLog.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        roomName,
        // keep both fields for compatibility with the UI and future uses
        dispatchId,
        callSid: dispatchId ?? roomName,
        status: "calling",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: unknown) {
    console.error("Error starting call:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to start call";
    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
