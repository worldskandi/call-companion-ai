
ALTER TABLE public.ai_agent_settings 
  ADD COLUMN IF NOT EXISTS elevenlabs_api_key text,
  ADD COLUMN IF NOT EXISTS elevenlabs_agent_id text,
  ADD COLUMN IF NOT EXISTS voice_provider text DEFAULT 'builtin';
