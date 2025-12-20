-- =============================================
-- RPC FUNCTIONS FOR LEADS
-- =============================================

-- Get all leads for current user
CREATE OR REPLACE FUNCTION public.get_leads(
  p_status lead_status DEFAULT NULL,
  p_campaign_id UUID DEFAULT NULL,
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  campaign_id UUID,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  phone_number TEXT,
  email TEXT,
  status lead_status,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id, l.user_id, l.campaign_id, l.first_name, l.last_name,
    l.company, l.phone_number, l.email, l.status, l.notes,
    l.created_at, l.updated_at
  FROM public.leads l
  WHERE l.user_id = auth.uid()
    AND (p_status IS NULL OR l.status = p_status)
    AND (p_campaign_id IS NULL OR l.campaign_id = p_campaign_id)
    AND (p_search IS NULL OR 
         l.first_name ILIKE '%' || p_search || '%' OR
         l.last_name ILIKE '%' || p_search || '%' OR
         l.company ILIKE '%' || p_search || '%' OR
         l.email ILIKE '%' || p_search || '%')
  ORDER BY l.created_at DESC;
END;
$$;

-- Get single lead
CREATE OR REPLACE FUNCTION public.get_lead(p_lead_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  campaign_id UUID,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  phone_number TEXT,
  email TEXT,
  status lead_status,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id, l.user_id, l.campaign_id, l.first_name, l.last_name,
    l.company, l.phone_number, l.email, l.status, l.notes,
    l.created_at, l.updated_at
  FROM public.leads l
  WHERE l.id = p_lead_id AND l.user_id = auth.uid();
END;
$$;

-- Create lead
CREATE OR REPLACE FUNCTION public.create_lead(
  p_first_name TEXT,
  p_phone_number TEXT,
  p_last_name TEXT DEFAULT NULL,
  p_company TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_campaign_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead_id UUID;
BEGIN
  INSERT INTO public.leads (user_id, first_name, last_name, company, phone_number, email, campaign_id, notes)
  VALUES (auth.uid(), p_first_name, p_last_name, p_company, p_phone_number, p_email, p_campaign_id, p_notes)
  RETURNING id INTO v_lead_id;
  
  RETURN v_lead_id;
END;
$$;

-- Update lead
CREATE OR REPLACE FUNCTION public.update_lead(
  p_lead_id UUID,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_company TEXT DEFAULT NULL,
  p_phone_number TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_campaign_id UUID DEFAULT NULL,
  p_status lead_status DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.leads
  SET 
    first_name = COALESCE(p_first_name, first_name),
    last_name = COALESCE(p_last_name, last_name),
    company = COALESCE(p_company, company),
    phone_number = COALESCE(p_phone_number, phone_number),
    email = COALESCE(p_email, email),
    campaign_id = COALESCE(p_campaign_id, campaign_id),
    status = COALESCE(p_status, status),
    notes = COALESCE(p_notes, notes),
    updated_at = now()
  WHERE id = p_lead_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- Delete lead
CREATE OR REPLACE FUNCTION public.delete_lead(p_lead_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.leads WHERE id = p_lead_id AND user_id = auth.uid();
  RETURN FOUND;
END;
$$;

-- =============================================
-- RPC FUNCTIONS FOR CAMPAIGNS
-- =============================================

-- Get all campaigns for current user
CREATE OR REPLACE FUNCTION public.get_campaigns(
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  product_description TEXT,
  target_group TEXT,
  call_goal TEXT,
  ai_prompt TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  lead_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id, c.user_id, c.name, c.product_description, c.target_group,
    c.call_goal, c.ai_prompt, c.is_active, c.created_at, c.updated_at,
    COUNT(l.id)::BIGINT as lead_count
  FROM public.campaigns c
  LEFT JOIN public.leads l ON l.campaign_id = c.id
  WHERE c.user_id = auth.uid()
    AND (p_is_active IS NULL OR c.is_active = p_is_active)
  GROUP BY c.id
  ORDER BY c.created_at DESC;
END;
$$;

-- Get single campaign
CREATE OR REPLACE FUNCTION public.get_campaign(p_campaign_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  product_description TEXT,
  target_group TEXT,
  call_goal TEXT,
  ai_prompt TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id, c.user_id, c.name, c.product_description, c.target_group,
    c.call_goal, c.ai_prompt, c.is_active, c.created_at, c.updated_at
  FROM public.campaigns c
  WHERE c.id = p_campaign_id AND c.user_id = auth.uid();
END;
$$;

-- Create campaign
CREATE OR REPLACE FUNCTION public.create_campaign(
  p_name TEXT,
  p_product_description TEXT DEFAULT NULL,
  p_target_group TEXT DEFAULT NULL,
  p_call_goal TEXT DEFAULT NULL,
  p_ai_prompt TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_campaign_id UUID;
BEGIN
  INSERT INTO public.campaigns (user_id, name, product_description, target_group, call_goal, ai_prompt)
  VALUES (auth.uid(), p_name, p_product_description, p_target_group, p_call_goal, p_ai_prompt)
  RETURNING id INTO v_campaign_id;
  
  RETURN v_campaign_id;
END;
$$;

-- Update campaign
CREATE OR REPLACE FUNCTION public.update_campaign(
  p_campaign_id UUID,
  p_name TEXT DEFAULT NULL,
  p_product_description TEXT DEFAULT NULL,
  p_target_group TEXT DEFAULT NULL,
  p_call_goal TEXT DEFAULT NULL,
  p_ai_prompt TEXT DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.campaigns
  SET 
    name = COALESCE(p_name, name),
    product_description = COALESCE(p_product_description, product_description),
    target_group = COALESCE(p_target_group, target_group),
    call_goal = COALESCE(p_call_goal, call_goal),
    ai_prompt = COALESCE(p_ai_prompt, ai_prompt),
    is_active = COALESCE(p_is_active, is_active),
    updated_at = now()
  WHERE id = p_campaign_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- Delete campaign
CREATE OR REPLACE FUNCTION public.delete_campaign(p_campaign_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.campaigns WHERE id = p_campaign_id AND user_id = auth.uid();
  RETURN FOUND;
END;
$$;

-- =============================================
-- RPC FUNCTIONS FOR CALL LOGS
-- =============================================

-- Get all call logs for current user
CREATE OR REPLACE FUNCTION public.get_call_logs(
  p_lead_id UUID DEFAULT NULL,
  p_campaign_id UUID DEFAULT NULL,
  p_outcome call_outcome DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  lead_id UUID,
  campaign_id UUID,
  duration_seconds INTEGER,
  outcome call_outcome,
  transcript TEXT,
  summary TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  lead_first_name TEXT,
  lead_last_name TEXT,
  lead_company TEXT,
  campaign_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cl.id, cl.user_id, cl.lead_id, cl.campaign_id, cl.duration_seconds,
    cl.outcome, cl.transcript, cl.summary, cl.started_at, cl.ended_at, cl.created_at,
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
  ORDER BY cl.started_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Get single call log
CREATE OR REPLACE FUNCTION public.get_call_log(p_call_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  lead_id UUID,
  campaign_id UUID,
  duration_seconds INTEGER,
  outcome call_outcome,
  transcript TEXT,
  summary TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  lead_first_name TEXT,
  lead_last_name TEXT,
  lead_company TEXT,
  lead_phone_number TEXT,
  campaign_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cl.id, cl.user_id, cl.lead_id, cl.campaign_id, cl.duration_seconds,
    cl.outcome, cl.transcript, cl.summary, cl.started_at, cl.ended_at, cl.created_at,
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

-- Create call log
CREATE OR REPLACE FUNCTION public.create_call_log(
  p_lead_id UUID,
  p_campaign_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_call_id UUID;
BEGIN
  INSERT INTO public.call_logs (user_id, lead_id, campaign_id, started_at)
  VALUES (auth.uid(), p_lead_id, p_campaign_id, now())
  RETURNING id INTO v_call_id;
  
  RETURN v_call_id;
END;
$$;

-- Update call log (for ending call, adding transcript, etc.)
CREATE OR REPLACE FUNCTION public.update_call_log(
  p_call_id UUID,
  p_duration_seconds INTEGER DEFAULT NULL,
  p_outcome call_outcome DEFAULT NULL,
  p_transcript TEXT DEFAULT NULL,
  p_summary TEXT DEFAULT NULL,
  p_ended_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.call_logs
  SET 
    duration_seconds = COALESCE(p_duration_seconds, duration_seconds),
    outcome = COALESCE(p_outcome, outcome),
    transcript = COALESCE(p_transcript, transcript),
    summary = COALESCE(p_summary, summary),
    ended_at = COALESCE(p_ended_at, ended_at)
  WHERE id = p_call_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- =============================================
-- DASHBOARD STATISTICS
-- =============================================

-- Get dashboard stats for current user
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE (
  total_leads BIGINT,
  total_campaigns BIGINT,
  total_calls BIGINT,
  calls_today BIGINT,
  interested_leads BIGINT,
  avg_call_duration_seconds NUMERIC,
  success_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.leads WHERE user_id = auth.uid())::BIGINT as total_leads,
    (SELECT COUNT(*) FROM public.campaigns WHERE user_id = auth.uid())::BIGINT as total_campaigns,
    (SELECT COUNT(*) FROM public.call_logs WHERE user_id = auth.uid())::BIGINT as total_calls,
    (SELECT COUNT(*) FROM public.call_logs WHERE user_id = auth.uid() AND DATE(started_at) = CURRENT_DATE)::BIGINT as calls_today,
    (SELECT COUNT(*) FROM public.leads WHERE user_id = auth.uid() AND status IN ('interested', 'qualified'))::BIGINT as interested_leads,
    (SELECT COALESCE(AVG(duration_seconds), 0) FROM public.call_logs WHERE user_id = auth.uid() AND duration_seconds IS NOT NULL)::NUMERIC as avg_call_duration_seconds,
    (SELECT 
      CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE (COUNT(*) FILTER (WHERE outcome IN ('interested', 'qualified', 'callback_scheduled'))::NUMERIC / COUNT(*)::NUMERIC * 100)
      END
     FROM public.call_logs WHERE user_id = auth.uid())::NUMERIC as success_rate;
END;
$$;

-- Get recent activity
CREATE OR REPLACE FUNCTION public.get_recent_activity(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  activity_type TEXT,
  activity_id UUID,
  title TEXT,
  description TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  (
    SELECT 
      'call'::TEXT as activity_type,
      cl.id as activity_id,
      COALESCE(l.first_name || ' ' || COALESCE(l.last_name, ''), 'Unbekannt') as title,
      COALESCE(cl.summary, 'Anruf durchgeführt') as description,
      cl.created_at
    FROM public.call_logs cl
    LEFT JOIN public.leads l ON l.id = cl.lead_id
    WHERE cl.user_id = auth.uid()
  )
  UNION ALL
  (
    SELECT 
      'lead'::TEXT as activity_type,
      l.id as activity_id,
      l.first_name || ' ' || COALESCE(l.last_name, '') as title,
      'Lead hinzugefügt' as description,
      l.created_at
    FROM public.leads l
    WHERE l.user_id = auth.uid()
  )
  ORDER BY created_at DESC
  LIMIT p_limit;
END;
$$;