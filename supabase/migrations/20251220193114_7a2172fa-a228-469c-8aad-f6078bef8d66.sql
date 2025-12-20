-- Create call sessions table to store call context data
CREATE TABLE public.call_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lead_id UUID REFERENCES public.leads(id),
  campaign_id UUID REFERENCES public.campaigns(id),
  campaign_prompt TEXT,
  lead_name TEXT,
  lead_company TEXT,
  call_sid TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour')
);

-- Enable RLS
ALTER TABLE public.call_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own sessions" 
ON public.call_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" 
ON public.call_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
ON public.call_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow edge functions to read sessions (service role or anon for webhook)
CREATE POLICY "Allow public read for webhook" 
ON public.call_sessions 
FOR SELECT 
USING (true);

-- Index for quick lookup
CREATE INDEX idx_call_sessions_id ON public.call_sessions(id);
CREATE INDEX idx_call_sessions_expires ON public.call_sessions(expires_at);