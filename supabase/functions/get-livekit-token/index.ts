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

  const header = {
    alg: "HS256",
    typ: "JWT",
  };

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

  // HMAC-SHA256 signing
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
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const LIVEKIT_API_KEY = Deno.env.get("LIVEKIT_API_KEY");
    const LIVEKIT_API_SECRET = Deno.env.get("LIVEKIT_API_SECRET");
    const LIVEKIT_URL = Deno.env.get("LIVEKIT_URL");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
      console.error("Missing LiveKit configuration");
      return new Response(
        JSON.stringify({
          error: "LiveKit not configured. Please add LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL to secrets.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Get user from authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create client with user's auth for RLS
    const supabaseUser = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create service role client to read data
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Parse request body
    const { roomName, leadId, campaignId } = await req.json();

    if (!roomName) {
      return new Response(JSON.stringify({ error: "roomName is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load lead data from database
    let leadData = null;
    if (leadId) {
      const { data, error } = await supabase.from("leads").select("*").eq("id", leadId).eq("user_id", user.id).single();

      if (!error && data) {
        leadData = data;
      }
      console.log("Lead data loaded:", leadData?.first_name);
    }

    // Load campaign data from database
    let campaignData = null;
    if (campaignId) {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        campaignData = data;
      }
      console.log("Campaign data loaded:", campaignData?.name);
    }

    // Build room metadata with all relevant info for the agent
    const roomMetadata = {
      // Campaign info
      ai_prompt: campaignData?.ai_prompt || null,
      product_description: campaignData?.product_description || null,
      call_goal: campaignData?.call_goal || null,
      target_group: campaignData?.target_group || null,
      campaign_name: campaignData?.name || null,
      // Lead info
      lead_name: leadData ? `${leadData.first_name}${leadData.last_name ? " " + leadData.last_name : ""}` : null,
      lead_company: leadData?.company || null,
      lead_notes: leadData?.notes || null,
      // User context
      user_id: user.id,
    };

    console.log("Room metadata:", JSON.stringify(roomMetadata));

    // Generate server token for API calls (with admin permissions)
    const now = Math.floor(Date.now() / 1000);
    const serverToken = await generateLiveKitToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      sub: "server",
      exp: now + 60,
      video: {
        roomCreate: true,
        roomList: true,
        roomAdmin: true,
      },
      sfu: {
        admin: true,
      },
    });

    // Get LiveKit HTTP URL from WebSocket URL
    const livekitHttpUrl = LIVEKIT_URL.replace("wss://", "https://").replace("ws://", "http://");

    // Step 1: Create room with metadata
    console.log("Creating room:", roomName);
    const createRoomResponse = await fetch(`${livekitHttpUrl}/twirp/livekit.RoomService/CreateRoom`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serverToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: roomName,
        empty_timeout: 300, // 5 minutes
        max_participants: 2,
        metadata: JSON.stringify(roomMetadata),
      }),
    });

    if (!createRoomResponse.ok) {
      const errorText = await createRoomResponse.text();
      console.error("Failed to create room:", errorText);
      return new Response(JSON.stringify({ error: `Failed to create room: ${errorText}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const roomData = await createRoomResponse.json();
    console.log("Room created:", roomData);

    // Step 2: Dispatch agent to room
    console.log("Dispatching agent to room:", roomName);
    const dispatchResponse = await fetch(`${livekitHttpUrl}/twirp/livekit.AgentDispatchService/CreateDispatch`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serverToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room: roomName,
        agent_name: "ColdCallAgent", // Agent name from LiveKit Dashboard
      }),
    });

    if (!dispatchResponse.ok) {
      const errorText = await dispatchResponse.text();
      console.error("Failed to dispatch agent:", errorText);
      // Don't fail completely - agent might join via room events
      console.warn("Agent dispatch failed, continuing anyway");
    } else {
      const dispatchData = await dispatchResponse.json();
      console.log("Agent dispatched:", dispatchData);
    }

    // Step 3: Generate user token
    const participantIdentity = `user-${user.id}`;
    const participantName = user.email || "User";
    const ttlSeconds = 3600; // 1 hour

    const userToken = await generateLiveKitToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      sub: participantIdentity,
      name: participantName,
      exp: now + ttlSeconds,
      video: {
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      },
    });

    console.log(`Generated LiveKit token for room: ${roomName}, participant: ${participantIdentity}`);

    return new Response(
      JSON.stringify({
        token: userToken,
        url: LIVEKIT_URL,
        roomName,
        participantIdentity,
        participantName,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
