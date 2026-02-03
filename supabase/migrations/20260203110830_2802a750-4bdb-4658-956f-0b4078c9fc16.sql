-- Create email_analyses table for caching AI analysis results
CREATE TABLE public.email_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_id TEXT NOT NULL,
  email_from TEXT,
  email_subject TEXT,
  summary TEXT NOT NULL,
  relevance TEXT NOT NULL CHECK (relevance IN ('high', 'medium', 'low', 'spam')),
  relevance_score INTEGER NOT NULL DEFAULT 50,
  category TEXT,
  action_required BOOLEAN DEFAULT false,
  suggested_action TEXT,
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint to prevent duplicate analyses for same email
  UNIQUE(user_id, email_id)
);

-- Enable Row Level Security
ALTER TABLE public.email_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own analyses" 
ON public.email_analyses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses" 
ON public.email_analyses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses" 
ON public.email_analyses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses" 
ON public.email_analyses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_email_analyses_user_email ON public.email_analyses(user_id, email_id);
CREATE INDEX idx_email_analyses_analyzed_at ON public.email_analyses(analyzed_at DESC);