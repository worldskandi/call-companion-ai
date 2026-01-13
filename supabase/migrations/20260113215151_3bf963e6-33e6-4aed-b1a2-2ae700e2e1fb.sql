-- Bucket für E-Mail-Anhänge
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('email-attachments', 'email-attachments', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy für authentifizierte Benutzer - Upload
CREATE POLICY "Users can upload email attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'email-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS Policy für öffentlichen Lesezugriff
CREATE POLICY "Anyone can view email attachments"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'email-attachments');

-- RLS Policy für Löschen eigener Anhänge
CREATE POLICY "Users can delete own email attachments"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'email-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Tabelle für E-Mail-Vorlagen
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('follow-up', 'quote', 'meeting', 'info', 'rejection')),
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS für email_templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Jeder kann System-Vorlagen sehen
CREATE POLICY "Anyone can view system templates"
ON public.email_templates FOR SELECT
USING (is_system = true);

-- Benutzer können eigene Vorlagen sehen
CREATE POLICY "Users can view own templates"
ON public.email_templates FOR SELECT
USING (auth.uid() = user_id);

-- Benutzer können eigene Vorlagen erstellen
CREATE POLICY "Users can create own templates"
ON public.email_templates FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_system = false);

-- Benutzer können eigene Vorlagen aktualisieren
CREATE POLICY "Users can update own templates"
ON public.email_templates FOR UPDATE
USING (auth.uid() = user_id AND is_system = false);

-- Benutzer können eigene Vorlagen löschen
CREATE POLICY "Users can delete own templates"
ON public.email_templates FOR DELETE
USING (auth.uid() = user_id AND is_system = false);

-- System-Vorlagen einfügen
INSERT INTO public.email_templates (user_id, name, category, subject, html_content, is_system) VALUES
(NULL, 'Gesprächszusammenfassung', 'follow-up', 'Zusammenfassung unseres Gesprächs - {{company_name}}', 
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #333;">Vielen Dank für das Gespräch!</h2>
  <p>Hallo {{lead_name}},</p>
  <p>vielen Dank für das freundliche Gespräch heute. Wie besprochen, sende ich Ihnen hiermit eine kurze Zusammenfassung:</p>
  <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
    {{custom_content}}
  </div>
  <p>Bei Fragen stehe ich Ihnen jederzeit zur Verfügung.</p>
  <p>Mit freundlichen Grüßen,<br><strong>{{ai_name}}</strong><br>{{company_name}}</p>
</div>', true),

(NULL, 'Kostenvoranschlag', 'quote', 'Ihr Angebot von {{company_name}}', 
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #333;">Ihr persönliches Angebot</h2>
  <p>Hallo {{lead_name}},</p>
  <p>wie telefonisch besprochen, erhalten Sie anbei Ihr individuelles Angebot.</p>
  <p>{{custom_content}}</p>
  <p>Die Details finden Sie im beigefügten Dokument. Das Angebot ist 14 Tage gültig.</p>
  <p>Bei Rückfragen erreichen Sie uns jederzeit.</p>
  <p>Mit freundlichen Grüßen,<br><strong>{{ai_name}}</strong><br>{{company_name}}</p>
</div>', true),

(NULL, 'Terminbestätigung', 'meeting', 'Terminbestätigung: {{meeting_date}} um {{meeting_time}}', 
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #333;">Ihr Termin ist bestätigt!</h2>
  <p>Hallo {{lead_name}},</p>
  <p>hiermit bestätige ich unseren Termin:</p>
  <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
    <p style="margin: 0;"><strong>📅 Datum:</strong> {{meeting_date}}</p>
    <p style="margin: 10px 0 0 0;"><strong>🕐 Uhrzeit:</strong> {{meeting_time}}</p>
    <p style="margin: 10px 0 0 0;"><strong>🔗 Meeting-Link:</strong> <a href="{{meeting_link}}">Hier klicken zum Beitreten</a></p>
  </div>
  <p>Ich freue mich auf unser Gespräch!</p>
  <p>Mit freundlichen Grüßen,<br><strong>{{ai_name}}</strong><br>{{company_name}}</p>
</div>', true),

(NULL, 'Produktinformationen', 'info', 'Informationen zu {{company_name}}', 
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #333;">Ihre angeforderten Informationen</h2>
  <p>Hallo {{lead_name}},</p>
  <p>vielen Dank für Ihr Interesse an unseren Produkten/Dienstleistungen.</p>
  <p>{{custom_content}}</p>
  <p>Weitere Details finden Sie in den beigefügten Unterlagen.</p>
  <p>Gerne stehe ich Ihnen für ein persönliches Beratungsgespräch zur Verfügung.</p>
  <p>Mit freundlichen Grüßen,<br><strong>{{ai_name}}</strong><br>{{company_name}}</p>
</div>', true),

(NULL, 'Freundliche Absage', 'rejection', 'Vielen Dank für Ihr Interesse - {{company_name}}', 
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #333;">Vielen Dank für das Gespräch</h2>
  <p>Hallo {{lead_name}},</p>
  <p>vielen Dank für das freundliche Gespräch und Ihr Interesse an {{company_name}}.</p>
  <p>Wir verstehen, dass der Zeitpunkt oder unser Angebot aktuell nicht passend ist.</p>
  <p>Sollte sich Ihre Situation ändern, freuen wir uns, von Ihnen zu hören.</p>
  <p>Wir wünschen Ihnen alles Gute!</p>
  <p>Mit freundlichen Grüßen,<br><strong>{{ai_name}}</strong><br>{{company_name}}</p>
</div>', true);

-- Trigger für updated_at
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();