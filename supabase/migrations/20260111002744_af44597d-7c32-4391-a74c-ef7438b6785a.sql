-- =============================================
-- PHASE 1: User Integrations (OAuth2 Tokens)
-- =============================================
CREATE TABLE public.user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL, -- 'google_calendar', 'gmail', 'slack', 'hubspot', 'microsoft'
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scope TEXT,
  provider_user_id TEXT,
  provider_email TEXT,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, provider)
);

ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own integrations" ON public.user_integrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own integrations" ON public.user_integrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own integrations" ON public.user_integrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own integrations" ON public.user_integrations FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- PHASE 2: AI Agent Settings
-- =============================================
CREATE TABLE public.ai_agent_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  ai_name TEXT DEFAULT 'Alex',
  ai_voice TEXT DEFAULT 'nova',
  ai_personality TEXT,
  company_name TEXT,
  default_greeting TEXT,
  language TEXT DEFAULT 'de',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ai_agent_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ai settings" ON public.ai_agent_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own ai settings" ON public.ai_agent_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ai settings" ON public.ai_agent_settings FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- PHASE 3: Notification Settings
-- =============================================
CREATE TABLE public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email_on_call_completed BOOLEAN DEFAULT true,
  email_on_meeting_scheduled BOOLEAN DEFAULT true,
  email_on_lead_interested BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,
  daily_summary BOOLEAN DEFAULT true,
  weekly_report BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notification settings" ON public.notification_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own notification settings" ON public.notification_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notification settings" ON public.notification_settings FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- PHASE 4: Phone Numbers (Inbound)
-- =============================================
CREATE TABLE public.phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL UNIQUE,
  friendly_name TEXT,
  provider TEXT DEFAULT 'twilio',
  country_code TEXT DEFAULT 'DE',
  is_active BOOLEAN DEFAULT true,
  monthly_cost_cents INTEGER DEFAULT 100,
  capabilities JSONB DEFAULT '{"voice": true, "sms": true}',
  welcome_message TEXT,
  twilio_sid TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own phone numbers" ON public.phone_numbers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own phone numbers" ON public.phone_numbers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own phone numbers" ON public.phone_numbers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own phone numbers" ON public.phone_numbers FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- PHASE 5: Inbound Routing Rules
-- =============================================
CREATE TABLE public.inbound_routing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number_id UUID REFERENCES public.phone_numbers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  routing_type TEXT DEFAULT 'ai_agent', -- 'ai_agent', 'forward', 'voicemail'
  forward_to TEXT,
  ai_greeting TEXT,
  business_hours_only BOOLEAN DEFAULT false,
  business_hours_start TIME DEFAULT '09:00',
  business_hours_end TIME DEFAULT '18:00',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.inbound_routing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own routing rules" ON public.inbound_routing FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own routing rules" ON public.inbound_routing FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own routing rules" ON public.inbound_routing FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own routing rules" ON public.inbound_routing FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- PHASE 6: Workspaces
-- =============================================
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PHASE 7: Workspace Members
-- =============================================
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
  invited_by UUID,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Workspace Policies (need to check membership)
CREATE POLICY "Members can view workspace" ON public.workspaces FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = id AND user_id = auth.uid()));
CREATE POLICY "Owner can update workspace" ON public.workspaces FOR UPDATE 
  USING (owner_id = auth.uid());
CREATE POLICY "Users can create workspaces" ON public.workspaces FOR INSERT 
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner can delete workspace" ON public.workspaces FOR DELETE 
  USING (owner_id = auth.uid());

-- Workspace Members Policies
CREATE POLICY "Members can view workspace members" ON public.workspace_members FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.workspace_members wm WHERE wm.workspace_id = workspace_id AND wm.user_id = auth.uid()));
CREATE POLICY "Admins can manage members" ON public.workspace_members FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.workspace_members wm WHERE wm.workspace_id = workspace_id AND wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin')));
CREATE POLICY "Admins can update members" ON public.workspace_members FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.workspace_members wm WHERE wm.workspace_id = workspace_id AND wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin')));
CREATE POLICY "Admins can delete members" ON public.workspace_members FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.workspace_members wm WHERE wm.workspace_id = workspace_id AND wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin')));

-- =============================================
-- PHASE 8: Workspace Invitations
-- =============================================
CREATE TABLE public.workspace_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  invited_by UUID NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view invitations" ON public.workspace_invitations FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.workspace_members wm WHERE wm.workspace_id = workspace_id AND wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin')));
CREATE POLICY "Admins can create invitations" ON public.workspace_invitations FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.workspace_members wm WHERE wm.workspace_id = workspace_id AND wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin')));
CREATE POLICY "Public can view invitation by token" ON public.workspace_invitations FOR SELECT 
  USING (true);

-- =============================================
-- PHASE 9: Subscriptions (for Billing)
-- =============================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID, -- for personal plans without workspace
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan_id TEXT NOT NULL DEFAULT 'free', -- 'free', 'starter', 'pro', 'enterprise'
  status TEXT DEFAULT 'active', -- 'active', 'past_due', 'canceled', 'trialing'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT 
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.workspace_members wm WHERE wm.workspace_id = workspace_id AND wm.user_id = auth.uid()));

-- =============================================
-- PHASE 10: Usage Records
-- =============================================
CREATE TABLE public.usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID, -- for personal usage
  metric TEXT NOT NULL, -- 'call_minutes', 'emails_sent', 'sms_sent', 'ai_calls'
  quantity INTEGER DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usage" ON public.usage_records FOR SELECT 
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.workspace_members wm WHERE wm.workspace_id = workspace_id AND wm.user_id = auth.uid()));

-- =============================================
-- PHASE 11: API Keys
-- =============================================
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL, -- hashed API key
  key_prefix TEXT NOT NULL, -- first 8 chars for identification
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  scopes TEXT[] DEFAULT ARRAY['read'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own api keys" ON public.api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own api keys" ON public.api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own api keys" ON public.api_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own api keys" ON public.api_keys FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- PHASE 12: Activity Log
-- =============================================
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'call_started', 'lead_created', 'meeting_scheduled', etc.
  resource_type TEXT, -- 'lead', 'campaign', 'call'
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own activity" ON public.activity_log FOR SELECT 
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.workspace_members wm WHERE wm.workspace_id = workspace_id AND wm.user_id = auth.uid()));
CREATE POLICY "Users can create own activity" ON public.activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_workspace_id ON public.activity_log(workspace_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- =============================================
-- TRIGGERS: Update timestamps
-- =============================================
CREATE TRIGGER update_user_integrations_updated_at BEFORE UPDATE ON public.user_integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ai_agent_settings_updated_at BEFORE UPDATE ON public.ai_agent_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON public.notification_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_phone_numbers_updated_at BEFORE UPDATE ON public.phone_numbers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inbound_routing_updated_at BEFORE UPDATE ON public.inbound_routing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();