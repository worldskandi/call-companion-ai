-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'call', 'lead', 'meeting'
  resource_type TEXT, -- 'call', 'lead', 'campaign', etc.
  resource_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create index for faster queries
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- Function to create notification (can be called from triggers or edge functions)
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, resource_type, resource_id)
  VALUES (p_user_id, p_title, p_message, p_type, p_resource_type, p_resource_id)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Trigger function to create notification on new lead
CREATE OR REPLACE FUNCTION public.notify_on_new_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.create_notification(
    NEW.user_id,
    'Neuer Lead hinzugefügt',
    'Lead "' || NEW.first_name || COALESCE(' ' || NEW.last_name, '') || '" wurde erstellt.',
    'lead',
    'lead',
    NEW.id
  );
  RETURN NEW;
END;
$$;

-- Trigger for new leads
CREATE TRIGGER on_new_lead_notify
AFTER INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_new_lead();

-- Trigger function to create notification on call completion
CREATE OR REPLACE FUNCTION public.notify_on_call_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead_name TEXT;
  v_outcome_text TEXT;
BEGIN
  -- Only trigger when call ends (ended_at changes from NULL to a value)
  IF OLD.ended_at IS NULL AND NEW.ended_at IS NOT NULL THEN
    -- Get lead name
    SELECT first_name || COALESCE(' ' || last_name, '') INTO v_lead_name
    FROM public.leads WHERE id = NEW.lead_id;
    
    -- Map outcome to German text
    v_outcome_text := CASE NEW.outcome
      WHEN 'interested' THEN 'Interessiert'
      WHEN 'not_interested' THEN 'Kein Interesse'
      WHEN 'callback_scheduled' THEN 'Rückruf vereinbart'
      WHEN 'qualified' THEN 'Qualifiziert'
      WHEN 'no_answer' THEN 'Keine Antwort'
      WHEN 'busy' THEN 'Besetzt'
      WHEN 'voicemail' THEN 'Mailbox'
      ELSE 'Abgeschlossen'
    END;
    
    PERFORM public.create_notification(
      NEW.user_id,
      'Anruf beendet: ' || v_outcome_text,
      'Anruf mit ' || COALESCE(v_lead_name, 'Unbekannt') || ' wurde beendet. Dauer: ' || 
        COALESCE(ROUND(NEW.duration_seconds / 60.0, 1)::TEXT || ' Min.', 'N/A'),
      'call',
      'call',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for call completion
CREATE TRIGGER on_call_completed_notify
AFTER UPDATE ON public.call_logs
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_call_completed();

-- Trigger function to notify on meeting scheduled
CREATE OR REPLACE FUNCTION public.notify_on_meeting_scheduled()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead_name TEXT;
BEGIN
  -- Only trigger when meeting_scheduled_at changes from NULL to a value
  IF OLD.meeting_scheduled_at IS NULL AND NEW.meeting_scheduled_at IS NOT NULL THEN
    -- Get lead name
    SELECT first_name || COALESCE(' ' || last_name, '') INTO v_lead_name
    FROM public.leads WHERE id = NEW.lead_id;
    
    PERFORM public.create_notification(
      NEW.user_id,
      'Meeting geplant! 🎉',
      'Ein Meeting mit ' || COALESCE(v_lead_name, 'Unbekannt') || ' wurde für ' || 
        TO_CHAR(NEW.meeting_scheduled_at, 'DD.MM.YYYY HH24:MI') || ' geplant.',
      'meeting',
      'call',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for meeting scheduled
CREATE TRIGGER on_meeting_scheduled_notify
AFTER UPDATE ON public.call_logs
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_meeting_scheduled();