-- Add call_type column to call_logs
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS call_type TEXT DEFAULT 'outbound';

-- Drop existing functions to recreate with new return types
DROP FUNCTION IF EXISTS public.get_call_logs(uuid, uuid, call_outcome, integer, integer);
DROP FUNCTION IF EXISTS public.get_call_log(uuid);
DROP FUNCTION IF EXISTS public.create_call_log(uuid, uuid);
DROP FUNCTION IF EXISTS public.get_dashboard_stats();

-- Recreate get_call_logs function with call_type filter
CREATE OR REPLACE FUNCTION public.get_call_logs(
  p_lead_id uuid DEFAULT NULL,
  p_campaign_id uuid DEFAULT NULL,
  p_outcome call_outcome DEFAULT NULL,
  p_call_type TEXT DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  lead_id uuid,
  campaign_id uuid,
  duration_seconds integer,
  outcome call_outcome,
  transcript text,
  summary text,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  created_at timestamp with time zone,
  call_type text,
  lead_first_name text,
  lead_last_name text,
  lead_company text,
  campaign_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cl.id, cl.user_id, cl.lead_id, cl.campaign_id, cl.duration_seconds,
    cl.outcome, cl.transcript, cl.summary, cl.started_at, cl.ended_at, cl.created_at,
    cl.call_type,
    l.first_name as lead_first_name,
    l.last_name as lead_last_name,
    l.company as lead_company,
    c.name as campaign_name
  FROM public.call_logs cl
  LEFT JOIN public.leads l ON l.id = cl.lead_id
  LEFT JOIN public.campaigns c ON c.id = cl.campaign_id
  WHERE cl.user_id = auth.uid()
    AND (p_lead_id IS NULL OR cl.lead_id = p_lead_id)
    AND (p_campaign_id IS NULL OR cl.campaign_id = p_campaign_id)
    AND (p_outcome IS NULL OR cl.outcome = p_outcome)
    AND (p_call_type IS NULL OR cl.call_type = p_call_type)
  ORDER BY cl.started_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Recreate get_call_log function with call_type
CREATE OR REPLACE FUNCTION public.get_call_log(p_call_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  lead_id uuid,
  campaign_id uuid,
  duration_seconds integer,
  outcome call_outcome,
  transcript text,
  summary text,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  created_at timestamp with time zone,
  call_type text,
  lead_first_name text,
  lead_last_name text,
  lead_company text,
  lead_phone_number text,
  campaign_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cl.id, cl.user_id, cl.lead_id, cl.campaign_id, cl.duration_seconds,
    cl.outcome, cl.transcript, cl.summary, cl.started_at, cl.ended_at, cl.created_at,
    cl.call_type,
    l.first_name as lead_first_name,
    l.last_name as lead_last_name,
    l.company as lead_company,
    l.phone_number as lead_phone_number,
    c.name as campaign_name
  FROM public.call_logs cl
  LEFT JOIN public.leads l ON l.id = cl.lead_id
  LEFT JOIN public.campaigns c ON c.id = cl.campaign_id
  WHERE cl.id = p_call_id AND cl.user_id = auth.uid();
END;
$$;

-- Recreate create_call_log with call_type parameter
CREATE OR REPLACE FUNCTION public.create_call_log(
  p_lead_id uuid,
  p_campaign_id uuid DEFAULT NULL,
  p_call_type TEXT DEFAULT 'outbound'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_call_id UUID;
BEGIN
  INSERT INTO public.call_logs (user_id, lead_id, campaign_id, call_type, started_at)
  VALUES (auth.uid(), p_lead_id, p_campaign_id, p_call_type, now())
  RETURNING id INTO v_call_id;
  
  RETURN v_call_id;
END;
$$;

-- Recreate dashboard stats with inbound data
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE(
  total_leads bigint,
  total_campaigns bigint,
  total_calls bigint,
  calls_today bigint,
  inbound_calls_today bigint,
  outbound_calls_today bigint,
  missed_calls_today bigint,
  interested_leads bigint,
  avg_call_duration_seconds numeric,
  success_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.leads WHERE leads.user_id = auth.uid())::BIGINT,
    (SELECT COUNT(*) FROM public.campaigns WHERE campaigns.user_id = auth.uid())::BIGINT,
    (SELECT COUNT(*) FROM public.call_logs WHERE call_logs.user_id = auth.uid())::BIGINT,
    (SELECT COUNT(*) FROM public.call_logs WHERE call_logs.user_id = auth.uid() AND DATE(started_at) = CURRENT_DATE)::BIGINT,
    (SELECT COUNT(*) FROM public.call_logs WHERE call_logs.user_id = auth.uid() AND DATE(started_at) = CURRENT_DATE AND call_logs.call_type = 'inbound')::BIGINT,
    (SELECT COUNT(*) FROM public.call_logs WHERE call_logs.user_id = auth.uid() AND DATE(started_at) = CURRENT_DATE AND call_logs.call_type = 'outbound')::BIGINT,
    (SELECT COUNT(*) FROM public.call_logs WHERE call_logs.user_id = auth.uid() AND DATE(started_at) = CURRENT_DATE AND outcome = 'no_answer' AND call_logs.call_type = 'inbound')::BIGINT,
    (SELECT COUNT(*) FROM public.leads WHERE leads.user_id = auth.uid() AND status IN ('interested', 'qualified'))::BIGINT,
    (SELECT COALESCE(AVG(duration_seconds), 0) FROM public.call_logs WHERE call_logs.user_id = auth.uid() AND duration_seconds IS NOT NULL)::NUMERIC,
    (SELECT 
      CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE (COUNT(*) FILTER (WHERE outcome IN ('interested', 'qualified', 'callback_scheduled'))::NUMERIC / COUNT(*)::NUMERIC * 100)
      END
     FROM public.call_logs WHERE call_logs.user_id = auth.uid())::NUMERIC;
END;
$$;

-- Create analytics function for call statistics
CREATE OR REPLACE FUNCTION public.get_call_analytics(p_days integer DEFAULT 30)
RETURNS TABLE(
  date date,
  inbound_count bigint,
  outbound_count bigint,
  total_duration bigint,
  success_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(cl.started_at) as date,
    COUNT(*) FILTER (WHERE cl.call_type = 'inbound')::BIGINT as inbound_count,
    COUNT(*) FILTER (WHERE cl.call_type = 'outbound')::BIGINT as outbound_count,
    COALESCE(SUM(cl.duration_seconds), 0)::BIGINT as total_duration,
    COUNT(*) FILTER (WHERE cl.outcome IN ('interested', 'qualified', 'callback_scheduled'))::BIGINT as success_count
  FROM public.call_logs cl
  WHERE cl.user_id = auth.uid()
    AND cl.started_at >= CURRENT_DATE - p_days
  GROUP BY DATE(cl.started_at)
  ORDER BY date DESC;
END;
$$;

-- Create campaign analytics function
CREATE OR REPLACE FUNCTION public.get_campaign_analytics()
RETURNS TABLE(
  campaign_id uuid,
  campaign_name text,
  total_calls bigint,
  successful_calls bigint,
  avg_duration numeric,
  success_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as campaign_id,
    c.name as campaign_name,
    COUNT(cl.id)::BIGINT as total_calls,
    COUNT(cl.id) FILTER (WHERE cl.outcome IN ('interested', 'qualified', 'callback_scheduled'))::BIGINT as successful_calls,
    COALESCE(AVG(cl.duration_seconds), 0)::NUMERIC as avg_duration,
    CASE 
      WHEN COUNT(cl.id) = 0 THEN 0
      ELSE (COUNT(cl.id) FILTER (WHERE cl.outcome IN ('interested', 'qualified', 'callback_scheduled'))::NUMERIC / COUNT(cl.id)::NUMERIC * 100)
    END::NUMERIC as success_rate
  FROM public.campaigns c
  LEFT JOIN public.call_logs cl ON cl.campaign_id = c.id
  WHERE c.user_id = auth.uid()
  GROUP BY c.id, c.name
  ORDER BY total_calls DESC;
END;
$$;