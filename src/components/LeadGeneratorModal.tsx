import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLeadGenerator, type GenerationStatus } from '@/hooks/useLeadGenerator';
import { QualityBadgeFromLevel } from '@/components/LeadQualityBadge';
import { Sparkles, Search, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { QualityLevel } from '@/lib/leadQuality';

interface Campaign {
  id: string;
  name: string;
}

interface LeadGeneratorModalProps {
  open: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  defaultCampaignId?: string;
}

const statusMessages: Record<GenerationStatus, { icon: React.ReactNode; text: string }> = {
  idle: { icon: <Sparkles className="w-5 h-5" />, text: 'Bereit zur Suche' },
  searching: { icon: <Search className="w-5 h-5 animate-pulse" />, text: 'Suche nach Unternehmen...' },
  scraping: { icon: <Download className="w-5 h-5 animate-pulse" />, text: 'Extrahiere Kontaktdaten...' },
  importing: { icon: <Loader2 className="w-5 h-5 animate-spin" />, text: 'Importiere Leads...' },
  complete: { icon: <CheckCircle className="w-5 h-5 text-green-500" />, text: 'Abgeschlossen!' },
  error: { icon: <AlertCircle className="w-5 h-5 text-destructive" />, text: 'Fehler aufgetreten' },
};

export function LeadGeneratorModal({ 
  open, 
  onClose, 
  campaigns,
  defaultCampaignId 
}: LeadGeneratorModalProps) {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState('10');
  const [campaignId, setCampaignId] = useState(defaultCampaignId || 'none');
  const [minQuality, setMinQuality] = useState<QualityLevel | 'all'>('all');

  const { generateLeads, status, isLoading, data, reset } = useLeadGenerator();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    generateLeads({
      query: query.trim(),
      options: {
        limit: parseInt(limit),
        campaignId: campaignId !== 'none' ? campaignId : undefined,
        minQuality: minQuality !== 'all' ? minQuality : undefined,
      },
    });
  };

  const handleClose = () => {
    reset();
    setQuery('');
    setLimit('10');
    setCampaignId(defaultCampaignId || 'none');
    setMinQuality('all');
    onClose();
  };

  const statusInfo = statusMessages[status];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            KI Lead-Suche
          </DialogTitle>
          <DialogDescription>
            Beschreibe deine Zielkunden und wir finden automatisch passende Leads mit Kontaktdaten.
          </DialogDescription>
        </DialogHeader>

        {status === 'idle' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="query">Zielkunden beschreiben *</Label>
              <Textarea
                id="query"
                placeholder="z.B. IT-Dienstleister in München, Restaurants in Berlin, Steuerberater in Hamburg..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={3}
                required
              />
              <p className="text-xs text-muted-foreground">
                Je spezifischer die Beschreibung, desto bessere Ergebnisse.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="limit">Anzahl Leads</Label>
                <Select value={limit} onValueChange={setLimit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Leads</SelectItem>
                    <SelectItem value="10">10 Leads</SelectItem>
                    <SelectItem value="25">25 Leads</SelectItem>
                    <SelectItem value="50">50 Leads</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minQuality">Mindestqualität</Label>
                <Select value={minQuality} onValueChange={(v) => setMinQuality(v as QualityLevel | 'all')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="low">🔴 Niedrig+</SelectItem>
                    <SelectItem value="medium">🟡 Mittel+</SelectItem>
                    <SelectItem value="high">🟢 Nur Hoch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign">Kampagne zuweisen (optional)</Label>
              <Select value={campaignId} onValueChange={setCampaignId}>
                <SelectTrigger>
                  <SelectValue placeholder="Keine Kampagne" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keine Kampagne</SelectItem>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={!query.trim()} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Leads generieren
              </Button>
            </div>
          </form>
        ) : status === 'complete' && data?.success ? (
          <div className="space-y-4">
            {/* Success Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">{data.stats?.imported || 0}</p>
                <p className="text-xs text-muted-foreground">Importiert</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">{data.stats?.duplicates || 0}</p>
                <p className="text-xs text-muted-foreground">Duplikate</p>
              </div>
            </div>

            {/* Quality Breakdown */}
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm font-medium mb-3">Nach Qualität:</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <QualityBadgeFromLevel level="high" />
                  <span className="text-sm">{data.stats?.byQuality.high || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <QualityBadgeFromLevel level="medium" />
                  <span className="text-sm">{data.stats?.byQuality.medium || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <QualityBadgeFromLevel level="low" />
                  <span className="text-sm">{data.stats?.byQuality.low || 0}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleClose}>
                Schließen
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 space-y-4">
            {/* Progress Indicator */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                {statusInfo.icon}
              </div>
              <p className="text-lg font-medium">{statusInfo.text}</p>
              
              {status !== 'error' && status !== 'complete' && (
                <div className="w-full max-w-xs">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ 
                        width: status === 'searching' ? '33%' : 
                               status === 'scraping' ? '66%' : 
                               status === 'importing' ? '90%' : '0%' 
                      }}
                    />
                  </div>
                </div>
              )}
              
              {status === 'error' && (
                <div className="text-center">
                  <p className="text-sm text-destructive mb-4">
                    {data?.error || 'Ein Fehler ist aufgetreten'}
                  </p>
                  <Button variant="outline" onClick={reset}>
                    Erneut versuchen
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
