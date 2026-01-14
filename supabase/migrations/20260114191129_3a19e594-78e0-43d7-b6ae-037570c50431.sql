-- Create table for tracking API rate limits
CREATE TABLE public.api_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  window_minute TIMESTAMP WITH TIME ZONE NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint, window_minute)
);

-- Create index for cleanup queries
CREATE INDEX idx_api_rate_limits_window_minute ON public.api_rate_limits (window_minute);

-- Enable RLS
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- No direct access - only through RPC functions
CREATE POLICY "No direct access to rate limits" 
ON public.api_rate_limits 
FOR ALL 
USING (false);

-- Function to check and increment rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_endpoint TEXT,
  p_limit_per_minute INTEGER DEFAULT 60
)
RETURNS TABLE (
  allowed BOOLEAN,
  remaining INTEGER,
  reset_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_window_minute TIMESTAMP WITH TIME ZONE;
  v_current_count INTEGER;
  v_reset_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate current minute window (truncated to minute)
  v_window_minute := date_trunc('minute', now());
  v_reset_at := v_window_minute + INTERVAL '1 minute';
  
  -- Try to insert or update the rate limit record
  INSERT INTO public.api_rate_limits (user_id, endpoint, window_minute, request_count)
  VALUES (p_user_id, p_endpoint, v_window_minute, 1)
  ON CONFLICT (user_id, endpoint, window_minute)
  DO UPDATE SET request_count = api_rate_limits.request_count + 1
  RETURNING api_rate_limits.request_count INTO v_current_count;
  
  -- Return rate limit status
  RETURN QUERY SELECT 
    v_current_count <= p_limit_per_minute AS allowed,
    GREATEST(0, p_limit_per_minute - v_current_count) AS remaining,
    v_reset_at AS reset_at;
END;
$$;

-- Function to get current rate limit status without incrementing
CREATE OR REPLACE FUNCTION public.get_rate_limit_status(
  p_user_id UUID,
  p_endpoint TEXT,
  p_limit_per_minute INTEGER DEFAULT 60
)
RETURNS TABLE (
  current_count INTEGER,
  remaining INTEGER,
  reset_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_window_minute TIMESTAMP WITH TIME ZONE;
  v_current_count INTEGER;
BEGIN
  v_window_minute := date_trunc('minute', now());
  
  SELECT COALESCE(arl.request_count, 0) INTO v_current_count
  FROM public.api_rate_limits arl
  WHERE arl.user_id = p_user_id 
    AND arl.endpoint = p_endpoint
    AND arl.window_minute = v_window_minute;
  
  IF v_current_count IS NULL THEN
    v_current_count := 0;
  END IF;
  
  RETURN QUERY SELECT 
    v_current_count AS current_count,
    GREATEST(0, p_limit_per_minute - v_current_count) AS remaining,
    (v_window_minute + INTERVAL '1 minute') AS reset_at;
END;
$$;

-- Cleanup function to remove old rate limit records (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.api_rate_limits
  WHERE window_minute < now() - INTERVAL '1 hour';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;