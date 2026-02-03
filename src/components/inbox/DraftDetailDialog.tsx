import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PenLine,
  Send,
  Copy,
  Save,
  Trash2,
  Eye,
  Code,
  Palette,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useEmailBranding } from '@/hooks/useEmailBranding';
import { useSendEmail } from '@/hooks/useSendEmail';

interface DraftDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftContent: string;
  onDraftContentChange: (content: string) => void;
  replySubject?: string;
  toEmail?: string;
  toName?: string;
  agentName?: string;
  draftId?: string;
  onSave: () => Promise<void>;
  onSend?: () => Promise<void>;
  onDelete?: () => void;
  isSaving?: boolean;
  onOpenBrandingSettings?: () => void;
}

export function DraftDetailDialog({
  open,
  onOpenChange,
  draftContent,
  onDraftContentChange,
  replySubject,
  toEmail,
  toName,
  agentName = 'Steffi',
  draftId,
  onSave,
  onDelete,
  isSaving = false,
  onOpenBrandingSettings
}: DraftDetailDialogProps) {
  const { generateEmailHtml } = useEmailBranding();
  const { sendEmail, isSending } = useSendEmail();
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const handleCopy = () => {
    navigator.clipboard.writeText(draftContent);
    toast.success('Entwurf kopiert');
  };

  const handleSend = async () => {
    if (!toEmail || !replySubject) {
      toast.error('Empfänger oder Betreff fehlt');
      return;
    }

    const success = await sendEmail({
      draftId,
      to: toEmail,
      subject: replySubject,
      textContent: draftContent
    });

    if (success) {
      onOpenChange(false);
    }
  };

  const previewHtml = generateEmailHtml(draftContent);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <PenLine className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2">
                Antwort-Entwurf
                <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/30">
                  {agentName}
                </Badge>
              </DialogTitle>
              <DialogDescription className="mt-1">
                {replySubject && <span className="font-medium">{replySubject}</span>}
                {toEmail && (
                  <span className="text-muted-foreground"> • An: {toName ? `${toName} <${toEmail}>` : toEmail}</span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-4 border-b">
            <TabsList className="grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="edit" className="gap-2">
                <Code className="w-4 h-4" />
                Bearbeiten
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="w-4 h-4" />
                Vorschau
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="edit" className="flex-1 p-6 pt-4 m-0">
            <Textarea
              value={draftContent}
              onChange={(e) => onDraftContentChange(e.target.value)}
              rows={15}
              className="resize-none font-mono text-sm h-full min-h-[300px]"
              placeholder="Entwurf wird geladen..."
            />
          </TabsContent>

          <TabsContent value="preview" className="flex-1 p-6 pt-4 m-0 overflow-hidden">
            <div className="h-full border rounded-xl overflow-hidden bg-muted/30">
              <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Eye className="w-3 h-3" />
                  E-Mail-Vorschau mit Branding
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs gap-1"
                  onClick={onOpenBrandingSettings}
                >
                  <Palette className="w-3 h-3" />
                  Design anpassen
                </Button>
              </div>
              <ScrollArea className="h-[350px]">
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-[500px] border-0"
                  title="Email Preview"
                />
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions Footer */}
        <div className="p-4 border-t bg-muted/30 flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleCopy}
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            Kopieren
          </Button>
          <Button
            variant="outline"
            onClick={onSave}
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Ablegen
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              onClick={onDelete}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
              Löschen
            </Button>
          )}
          <div className="flex-1" />
          <Button 
            onClick={handleSend} 
            disabled={isSending || !toEmail}
            className="gap-2"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isSending ? 'Senden...' : 'Senden'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
