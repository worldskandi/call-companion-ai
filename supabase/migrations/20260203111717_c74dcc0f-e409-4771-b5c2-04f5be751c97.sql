-- Create table for blocked email senders
CREATE TABLE public.blocked_senders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_address TEXT NOT NULL,
  sender_name TEXT,
  blocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT DEFAULT 'spam',
  UNIQUE(user_id, email_address)
);

-- Enable Row Level Security
ALTER TABLE public.blocked_senders ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their blocked senders" 
ON public.blocked_senders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can block senders" 
ON public.blocked_senders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unblock senders" 
ON public.blocked_senders 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_blocked_senders_user_email ON public.blocked_senders(user_id, email_address);