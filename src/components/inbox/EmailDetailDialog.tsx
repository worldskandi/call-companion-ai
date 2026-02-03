import { motion } from 'framer-motion';
import {
  Mail,
  Star,
  Archive,
  Trash2,
  Sparkles,
  Brain,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Zap,
  XCircle,
  PenLine,
  Code,
  FileText,
  Clock,
  CheckCircle2,
  Loader2,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import type { EmailAnalysis } from '@/hooks/useEmails';

interface EmailMessage {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  htmlBody?: string;
  textBody?: string;
  hasHtml: boolean;
}

interface EmailDetailDialogProps {
  email: EmailMessage | null;
  analysis?: EmailAnalysis;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateDraft: (email: EmailMessage, analysis?: EmailAnalysis) => void;
  isGenerating?: boolean;
}

const getRelevanceInfo = (relevance: string) => {
  switch (relevance) {
    case 'high':
      return { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Wichtig' };
    case 'medium':
      return { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Mittel' };
    case 'low':
      return { icon: TrendingDown, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Unwichtig' };
    case 'spam':
      return { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Spam' };
    default:
      return { icon: Mail, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Unbekannt' };
  }
};

export function EmailDetailDialog({
  email,
  analysis,
  open,
  onOpenChange,
  onGenerateDraft,
  isGenerating = false
}: EmailDetailDialogProps) {
  const [showHtml, setShowHtml] = useState(true);

  if (!email) return null;

  const relevanceInfo = analysis ? getRelevanceInfo(analysis.relevance) : null;
  const RelevanceIcon = relevanceInfo?.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl mb-2 pr-8">{email.subject}</DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  Von: <span className="font-medium text-foreground">{email.from}</span> &lt;{email.fromEmail}&gt;
                </span>
                {email.isStarred && (
                  <Star className="w-4 h-4 text-warning fill-warning" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(email.date).toLocaleString('de-DE', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-4">
            {/* AI Analysis Card */}
            {analysis ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">KI-Analyse von Steffi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {relevanceInfo && RelevanceIcon && (
                      <Badge variant="outline" className={`${relevanceInfo.bg} ${relevanceInfo.color} border-0`}>
                        <RelevanceIcon className="w-3 h-3 mr-1" />
                        {relevanceInfo.label}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {analysis.category}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm mb-3">
                  {analysis.summary}
                </p>
                {analysis.actionRequired && analysis.suggestedAction && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/10 text-orange-700">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium">Vorgeschlagene Aktion: {analysis.suggestedAction}</span>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="p-4 rounded-xl bg-muted/50 border border-dashed">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm text-muted-foreground">KI-Analyse ausstehend</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Diese E-Mail wurde noch nicht von Steffi analysiert.
                </p>
              </div>
            )}

            {/* Email Content */}
            <div className="border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
                <span className="text-xs font-medium text-muted-foreground">
                  {email.hasHtml ? 'HTML E-Mail' : 'Text E-Mail'}
                </span>
                {email.hasHtml && (
                  <div className="flex items-center gap-1">
                    <Button 
                      variant={showHtml ? "secondary" : "ghost"} 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={() => setShowHtml(true)}
                    >
                      <Code className="w-3 h-3 mr-1" />
                      HTML
                    </Button>
                    <Button 
                      variant={!showHtml ? "secondary" : "ghost"} 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={() => setShowHtml(false)}
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Text
                    </Button>
                  </div>
                )}
              </div>
              <div className="p-4 bg-background">
                {email.hasHtml && showHtml && email.htmlBody ? (
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: email.htmlBody }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-sm">
                    {email.textBody || email.preview}
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Actions Footer */}
        <div className="p-4 border-t bg-muted/30 flex items-center gap-2 flex-wrap">
          <Button 
            className="gap-2"
            onClick={() => onGenerateDraft(email, analysis)}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <PenLine className="w-4 h-4" />
            )}
            {analysis?.actionRequired ? 'Steffi: Antwort erstellen' : 'Antwort-Entwurf erstellen'}
          </Button>
          <Button variant="outline" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Erledigt
          </Button>
          <Button variant="outline" className="gap-2">
            <Clock className="w-4 h-4" />
            Aufgabe
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="icon">
            <Star className={`w-4 h-4 ${email.isStarred ? 'text-warning fill-warning' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon">
            <Archive className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
