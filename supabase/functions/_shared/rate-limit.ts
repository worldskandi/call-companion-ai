import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

interface RateLimitConfig {
  endpoint: string;
  limitPerMinute?: number;
}

/**
 * Check rate limit for a user and endpoint.
 * Returns rate limit status and adds appropriate headers.
 */
export async function checkRateLimit(
  userId: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { endpoint, limitPerMinute = 60 } = config;
  
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_user_id: userId,
    p_endpoint: endpoint,
    p_limit_per_minute: limitPerMinute,
  });
  
  if (error) {
    console.error("Rate limit check error:", error);
    // On error, allow the request but log it
    return {
      allowed: true,
      remaining: limitPerMinute,
      resetAt: new Date(Date.now() + 60000),
    };
  }
  
  const result = data?.[0];
  
  return {
    allowed: result?.allowed ?? true,
    remaining: result?.remaining ?? limitPerMinute,
    resetAt: result?.reset_at ? new Date(result.reset_at) : new Date(Date.now() + 60000),
  };
}

/**
 * Get rate limit headers to add to responses.
 */
export function getRateLimitHeaders(result: RateLimitResult, limitPerMinute: number): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(limitPerMinute),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": result.resetAt.toISOString(),
  };
}

/**
 * Create a rate limit exceeded response.
 */
export function createRateLimitResponse(result: RateLimitResult, corsHeaders: Record<string, string>): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: "Rate limit exceeded",
      error_code: "RATE_LIMIT_EXCEEDED",
      retry_after: Math.ceil((result.resetAt.getTime() - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": String(Math.ceil((result.resetAt.getTime() - Date.now()) / 1000)),
        ...getRateLimitHeaders(result, 0),
      },
    }
  );
}
