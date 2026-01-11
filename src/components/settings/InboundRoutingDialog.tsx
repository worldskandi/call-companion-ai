import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useInboundRouting, InboundRoutingUpdate } from '@/hooks/useInboundRouting';
import { useCampaigns } from '@/hooks/useCampaigns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Bot, 
  PhoneForwarded, 
  Voicemail, 
  Clock,
  Loader2,
  MessageSquare
} from 'lucide-react';

interface InboundRoutingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumberId: string;
  phoneNumber: string;
}

export const InboundRoutingDialog = ({
  open,
  onOpenChange,
  phoneNumberId,
  phoneNumber,
}: InboundRoutingDialogProps) => {
  const { toast } = useToast();
  const { routing, isLoading, upsertRouting } = useInboundRouting(phoneNumberId);
  const { data: campaigns } = useCampaigns();

  // Form state
  const [routingType, setRoutingType] = useState<'ai_agent' | 'forward' | 'voicemail'>('ai_agent');
  const [forwardTo, setForwardTo] = useState('');
  const [aiGreeting, setAiGreeting] = useState('');
  const [businessHoursOnly, setBusinessHoursOnly] = useState(false);
  const [businessHoursStart, setBusinessHoursStart] = useState('09:00');
  const [businessHoursEnd, setBusinessHoursEnd] = useState('18:00');
  const [campaignId, setCampaignId] = useState<string>('');
  const [isActive, setIsActive] = useState(true);

  // Load existing routing data
  useEffect(() => {
    if (routing) {
      setRoutingType(routing.routing_type as 'ai_agent' | 'forward' | 'voicemail');
      setForwardTo(routing.forward_to || '');
      setAiGreeting(routing.ai_greeting || '');
      setBusinessHoursOnly(routing.business_hours_only || false);
      setBusinessHoursStart(routing.business_hours_start || '09:00');
      setBusinessHoursEnd(routing.business_hours_end || '18:00');
      setCampaignId(routing.campaign_id || '');
      setIsActive(routing.is_active ?? true);
    } else {
      // Reset to defaults
      setRoutingType('ai_agent');
      setForwardTo('');
      setAiGreeting('Guten Tag! Wie kann ich Ihnen helfen?');
      setBusinessHoursOnly(false);
      setBusinessHoursStart('09:00');
      setBusinessHoursEnd('18:00');
      setCampaignId('');
      setIsActive(true);
    }
  }, [routing, open]);

  const handleSave = async () => {
    try {
      const updates: InboundRoutingUpdate = {
        routing_type: routingType,
        forward_to: routingType === 'forward' ? forwardTo : null,
        ai_greeting: routingType !== 'forward' ? aiGreeting : null,
        business_hours_only: businessHoursOnly,
        business_hours_start: businessHoursOnly ? businessHoursStart : null,
        business_hours_end: businessHoursOnly ? businessHoursEnd : null,
        campaign_id: campaignId || null,
        is_active: isActive,
      };

      await upsertRouting.mutateAsync({ phoneNumberId, updates });
      
      toast({
        title: "Routing gespeichert",
        description: "Die Einstellungen für eingehende Anrufe wurden aktualisiert.",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Routing konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Inbound Routing</DialogTitle>
          <DialogDescription>
            Konfiguriere wie eingehende Anrufe auf <span className="font-mono">{phoneNumber}</span> behandelt werden.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Active Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Routing aktiv</Label>
              <p className="text-xs text-muted-foreground">
                Schalte das Routing für diese Nummer ein/aus
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {/* Routing Type Tabs */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Routing-Typ</Label>
            <Tabs value={routingType} onValueChange={(v) => setRoutingType(v as typeof routingType)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ai_agent" className="gap-2">
                  <Bot className="w-4 h-4" />
                  KI-Agent
                </TabsTrigger>
                <TabsTrigger value="forward" className="gap-2">
                  <PhoneForwarded className="w-4 h-4" />
                  Weiterleitung
                </TabsTrigger>
                <TabsTrigger value="voicemail" className="gap-2">
                  <Voicemail className="w-4 h-4" />
                  Voicemail
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai_agent" className="space-y-4 mt-4">
                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">
                    Kampagne (optional)
                  </Label>
                  <Select value={campaignId} onValueChange={setCampaignId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Keine Kampagne ausgewählt" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Keine Kampagne</SelectItem>
                      {campaigns?.map((campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Der KI-Agent nutzt den Prompt der verknüpften Kampagne.
                  </p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Begrüßung
                  </Label>
                  <Textarea
                    placeholder="Guten Tag! Wie kann ich Ihnen helfen?"
                    value={aiGreeting}
                    onChange={(e) => setAiGreeting(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Der erste Satz, den der KI-Agent sagt.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="forward" className="space-y-4 mt-4">
                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block">
                    Weiterleiten an
                  </Label>
                  <Input
                    type="tel"
                    placeholder="+49 123 456789"
                    value={forwardTo}
                    onChange={(e) => setForwardTo(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Anrufe werden direkt an diese Nummer weitergeleitet.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="voicemail" className="space-y-4 mt-4">
                <div>
                  <Label className="text-sm text-muted-foreground mb-1 block flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Voicemail-Ansage
                  </Label>
                  <Textarea
                    placeholder="Bitte hinterlassen Sie eine Nachricht nach dem Signalton."
                    value={aiGreeting}
                    onChange={(e) => setAiGreeting(e.target.value)}
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Business Hours */}
          <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Nur während Geschäftszeiten</Label>
              </div>
              <Switch checked={businessHoursOnly} onCheckedChange={setBusinessHoursOnly} />
            </div>
            
            {businessHoursOnly && (
              <div className="flex items-center gap-3 pt-2">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Von</Label>
                  <Input
                    type="time"
                    value={businessHoursStart}
                    onChange={(e) => setBusinessHoursStart(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Bis</Label>
                  <Input
                    type="time"
                    value={businessHoursEnd}
                    onChange={(e) => setBusinessHoursEnd(e.target.value)}
                  />
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Außerhalb der Geschäftszeiten wird eine Abwesenheitsansage abgespielt.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={upsertRouting.isPending}>
            {upsertRouting.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Speichern'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
