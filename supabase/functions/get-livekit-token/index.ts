import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple JWT creation for LiveKit (no external dependencies needed)
function createLiveKitToken(
  apiKey: string,
  apiSecret: string,
  roomName: string,
  participantIdentity: string,
  participantName: string,
  ttlSeconds: number = 3600
): string {
  const now = Math.floor(Date.now() / 1000);
  
  const header = {
    alg: "HS256",
    typ: "JWT",
  };
  
  const payload = {
    iss: apiKey,
    sub: participantIdentity,
    name: participantName,
    iat: now,
    nbf: now,
    exp: now + ttlSeconds,
    video: {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    },
  };
  
  const base64UrlEncode = (obj: Record<string, unknown>): string => {
    const jsonStr = JSON.stringify(obj);
    const base64 = btoa(jsonStr);
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };
  
  const headerEncoded = base64UrlEncode(header);
  const payloadEncoded = base64UrlEncode(payload);
  const dataToSign = `${headerEncoded}.${payloadEncoded}`;
  
  // HMAC-SHA256 signing
  const encoder = new TextEncoder();
  const keyData = encoder.encode(apiSecret);
  const data = encoder.encode(dataToSign);
  
  // Use Web Crypto API for HMAC
  const cryptoKey = Deno.env.get("LIVEKIT_API_SECRET");
  
  // For now, use a simpler approach with the crypto module
  const hmac = async (): Promise<string> => {
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, data);
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
    return signatureBase64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };
  
  // Since we need async, we'll use a different approach
  return `${headerEncoded}.${payloadEncoded}`;  // Will be completed with signature
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
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
      console.error("Missing LiveKit configuration");
      return new Response(
        JSON.stringify({ 
          error: "LiveKit not configured. Please add LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL to secrets." 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user from authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { roomName, leadId, campaignId, metadata } = await req.json();

    if (!roomName) {
      return new Response(
        JSON.stringify({ error: "roomName is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create participant identity and name
    const participantIdentity = `user-${user.id}`;
    const participantName = user.email || "User";

    // Create JWT token for LiveKit
    const now = Math.floor(Date.now() / 1000);
    const ttlSeconds = 3600; // 1 hour
    
    const header = {
      alg: "HS256",
      typ: "JWT",
    };
    
    const payload = {
      iss: LIVEKIT_API_KEY,
      sub: participantIdentity,
      name: participantName,
      iat: now,
      nbf: now,
      exp: now + ttlSeconds,
      video: {
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      },
      metadata: JSON.stringify({
        leadId,
        campaignId,
        userId: user.id,
        ...metadata,
      }),
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
    const payloadEncoded = base64UrlEncode(payload);
    const dataToSign = `${headerEncoded}.${payloadEncoded}`;
    
    // HMAC-SHA256 signing using Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(LIVEKIT_API_SECRET);
    const signData = encoder.encode(dataToSign);
    
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", key, signData);
    const signatureBytes = new Uint8Array(signature);
    let signatureBinary = "";
    for (let i = 0; i < signatureBytes.length; i++) {
      signatureBinary += String.fromCharCode(signatureBytes[i]);
    }
    const signatureBase64 = btoa(signatureBinary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    
    const token = `${headerEncoded}.${payloadEncoded}.${signatureBase64}`;

    console.log(`Generated LiveKit token for room: ${roomName}, participant: ${participantIdentity}`);

    return new Response(
      JSON.stringify({
        token,
        url: LIVEKIT_URL,
        roomName,
        participantIdentity,
        participantName,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
