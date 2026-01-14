import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowRight, Mail, FileText, Eye, Paperclip } from 'lucide-react';
import { EmailEditor, emailVariables } from './EmailEditor';
import { EmailTemplateLibrary } from './EmailTemplateLibrary';
import { EmailAttachmentUpload, type AttachmentFile } from './EmailAttachmentUpload';
import type { EmailTemplate } from '@/hooks/useEmailTemplates';
import { Badge } from '@/components/ui/badge';

export interface EmailTemplateData {
  enabled: boolean;
  subject: string;
  htmlContent: string;
  attachments: AttachmentFile[];
}

interface StepEmailTemplateProps {
  data: EmailTemplateData;
  onChange: (data: EmailTemplateData) => void;
  onNext: () => void;
  onBack: () => void;
}

const defaultTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 40px 30px; text-align: center;">
              <div style="width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 12px; margin: 0 auto 16px; display: inline-block; line-height: 60px; font-size: 24px;">
                {{company_logo}}
              </div>
              <h1 style="color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 24px; margin: 0; font-weight: 600;">{{company_name}}</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #18181b; font-family: 'Segoe UI', Arial, sans-serif; font-size: 22px; margin: 0 0 24px; font-weight: 600;">
                Vielen Dank für das Gespräch! ✨
              </h2>
              <p style="color: #3f3f46; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                Hallo <strong>{{lead_name}}</strong>,
              </p>
              <p style="color: #3f3f46; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                vielen Dank für das freundliche Gespräch heute. Wie besprochen, sende ich Ihnen hiermit eine kurze Zusammenfassung:
              </p>
              <!-- Info Box -->
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #6366f1; border-radius: 0 12px 12px 0; padding: 20px; margin: 24px 0;">
                <p style="color: #1e40af; font-family: 'Segoe UI', Arial, sans-serif; font-size: 15px; line-height: 1.6; margin: 0;">
                  {{custom_content}}
                </p>
              </div>
              <p style="color: #3f3f46; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 24px 0;">
                Bei Fragen stehe ich Ihnen jederzeit zur Verfügung.
              </p>
              <!-- Signature -->
              <table cellpadding="0" cellspacing="0" style="margin-top: 32px; border-top: 1px solid #e4e4e7; padding-top: 24px; width: 100%;">
                <tr>
                  <td style="width: 50px; vertical-align: top;">
                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 50%; text-align: center; line-height: 48px; color: #fff; font-size: 20px; font-weight: 600;">
                      {{ai_initial}}
                    </div>
                  </td>
                  <td style="padding-left: 16px; vertical-align: top;">
                    <p style="color: #18181b; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; margin: 0; font-weight: 600;">{{ai_name}}</p>
                    <p style="color: #71717a; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 4px 0 0;">{{company_name}}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 24px 40px; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="color: #a1a1aa; font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; margin: 0;">
                © {{current_year}} {{company_name}} • Diese E-Mail wurde automatisch versendet
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const exampleData: Record<string, string> = {
  lead_name: 'Max Mustermann',
  lead_first_name: 'Max',
  lead_company: 'Beispiel GmbH',
  lead_email: 'max@beispiel.de',
  ai_name: 'Lisa',
  ai_initial: 'L',
  ai_role: 'Kundenberaterin',
  company_name: 'SBS Marketing',
  company_logo: '🏢',
  company_email: 'info@sbs-marketing.de',
  company_phone: '+49 123 456789',
  company_website: 'www.sbs-marketing.de',
  meeting_link: 'https://meet.google.com/abc-defg-hij',
  meeting_date: '15. Januar 2026',
  meeting_time: '14:00 Uhr',
  current_date: new Date().toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
  current_year: new Date().getFullYear().toString(),
  offer_total: '2.499,00 €',
  offer_valid_until: '31. Januar 2026',
  custom_content: 'Hier erscheint der dynamische Inhalt vom Gespräch.',
};

function replaceVariables(template: string, data: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || `{{${key}}}`);
}

export function StepEmailTemplate({
  data,
  onChange,
  onNext,
  onBack,
}: StepEmailTemplateProps) {
  const [showLibrary, setShowLibrary] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('edit');

  const handleTemplateSelect = (template: EmailTemplate) => {
    onChange({
      ...data,
      subject: template.subject,
      htmlContent: template.html_content,
    });
    setShowLibrary(false);
  };

  const handleLoadDefault = () => {
    onChange({
      ...data,
      subject: 'Zusammenfassung unseres Gesprächs - {{company_name}}',
      htmlContent: defaultTemplate,
    });
  };

  const previewHtml = replaceVariables(data.htmlContent, exampleData);
  const previewSubject = replaceVariables(data.subject, exampleData);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">E-Mail-Vorlage</h2>
          <p className="text-sm text-muted-foreground">
            Erstelle eine E-Mail, die der Agent nach dem Gespräch senden kann
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="email-enabled" className="text-sm">
            Aktivieren
          </Label>
          <Switch
            id="email-enabled"
            checked={data.enabled}
            onCheckedChange={(enabled) => onChange({ ...data, enabled })}
          />
        </div>
      </div>

      {data.enabled && (
        <div className="space-y-4">
          {/* Subject Line */}
          <div>
            <Label htmlFor="email-subject">Betreff</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="email-subject"
                value={data.subject}
                onChange={(e) => onChange({ ...data, subject: e.target.value })}
                placeholder="z.B. Zusammenfassung unseres Gesprächs"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Variablen wie {'{{lead_name}}'} werden automatisch ersetzt
            </p>
          </div>

          {/* Template Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLibrary(true)}
              className="gap-1"
            >
              <FileText className="w-4 h-4" />
              Vorlagen
            </Button>
            <Button variant="outline" size="sm" onClick={handleLoadDefault} className="gap-1">
              <Mail className="w-4 h-4" />
              Standard-Vorlage laden
            </Button>
          </div>

          {/* Editor / Preview Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit" className="gap-1">
                <Mail className="w-4 h-4" />
                Bearbeiten
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-1">
                <Eye className="w-4 h-4" />
                Vorschau
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="mt-4">
              <EmailEditor
                content={data.htmlContent}
                onChange={(htmlContent) => onChange({ ...data, htmlContent })}
                placeholder="Schreibe deine E-Mail-Vorlage..."
              />

              {/* Variables Legend */}
              <div className="mt-4">
                <Label className="text-xs text-muted-foreground">
                  Verfügbare Variablen
                </Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {emailVariables.map((v) => (
                    <Badge
                      key={v.key}
                      variant="secondary"
                      className="text-xs font-mono cursor-help"
                      title={v.example}
                    >
                      {`{{${v.key}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="preview" className="mt-4">
              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="bg-muted/50 p-3 border-b">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Betreff: </span>
                    <span className="font-medium">{previewSubject}</span>
                  </p>
                </div>
                <div
                  className="p-4 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Attachments */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Paperclip className="w-4 h-4" />
              Anhänge
            </Label>
            <EmailAttachmentUpload
              attachments={data.attachments}
              onAdd={(file) =>
                onChange({ ...data, attachments: [...data.attachments, file] })
              }
              onRemove={(id) =>
                onChange({
                  ...data,
                  attachments: data.attachments.filter((a) => a.id !== id),
                })
              }
            />
          </div>
        </div>
      )}

      {!data.enabled && (
        <div className="text-center py-12 text-muted-foreground">
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>E-Mail-Funktion ist deaktiviert</p>
          <p className="text-sm">
            Aktiviere die Funktion, um nach Gesprächen automatisch E-Mails zu senden
          </p>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} className="gap-2">
          Weiter
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <EmailTemplateLibrary
        open={showLibrary}
        onClose={() => setShowLibrary(false)}
        onSelect={handleTemplateSelect}
        currentSubject={data.subject}
        currentContent={data.htmlContent}
      />
    </div>
  );
}
