
-- Table to store ElevenLabs agents created via the platform
CREATE TABLE public.elevenlabs_agents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  elevenlabs_agent_id text, -- ID returned from ElevenLabs API after creation
  name text NOT NULL,
  description text,
  
  -- Agent config
  first_message text,
  system_prompt text,
  language text DEFAULT 'de',
  
  -- Voice config
  voice_id text,
  voice_name text,
  tts_model text DEFAULT 'eleven_flash_v2',
  
  -- Advanced settings
  temperature numeric DEFAULT 0.7,
  max_tokens integer DEFAULT 1024,
  
  -- Metadata
  status text DEFAULT 'draft', -- draft, active, error
  error_message text,
  tags text[] DEFAULT '{}',
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.elevenlabs_agents ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own agents"
ON public.elevenlabs_agents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own agents"
ON public.elevenlabs_agents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agents"
ON public.elevenlabs_agents FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own agents"
ON public.elevenlabs_agents FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_elevenlabs_agents_updated_at
BEFORE UPDATE ON public.elevenlabs_agents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
