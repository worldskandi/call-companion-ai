-- Create email_drafts table for storing draft replies
CREATE TABLE public.email_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_email_id TEXT NOT NULL,
  original_from_email TEXT NOT NULL,
  original_from_name TEXT,
  original_subject TEXT NOT NULL,
  reply_subject TEXT NOT NULL,
  draft_content TEXT NOT NULL,
  ai_source TEXT,
  agent_name TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'discarded')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_drafts ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own drafts" 
ON public.email_drafts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own drafts" 
ON public.email_drafts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drafts" 
ON public.email_drafts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drafts" 
ON public.email_drafts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_email_drafts_updated_at
BEFORE UPDATE ON public.email_drafts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();