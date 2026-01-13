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

const defaultTemplate = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #333;">Vielen Dank für das Gespräch!</h2>
  <p>Hallo {{lead_name}},</p>
  <p>vielen Dank für das freundliche Gespräch heute. Wie besprochen, sende ich Ihnen hiermit die besprochenen Informationen.</p>
  <p>{{custom_content}}</p>
  <p>Bei Fragen stehe ich Ihnen jederzeit zur Verfügung.</p>
  <p>Mit freundlichen Grüßen,<br><strong>{{ai_name}}</strong><br>{{company_name}}</p>
</div>`;

const exampleData: Record<string, string> = {
  lead_name: 'Max Mustermann',
  lead_first_name: 'Max',
  lead_company: 'Beispiel GmbH',
  lead_email: 'max@beispiel.de',
  ai_name: 'Lisa',
  company_name: 'SBS Marketing',
  meeting_link: 'https://meet.google.com/abc-defg-hij',
  meeting_date: '15. Januar 2026',
  meeting_time: '14:00 Uhr',
  current_date: new Date().toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
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
