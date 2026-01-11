import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { usePhoneNumbers } from '@/hooks/usePhoneNumbers';
import { useAllInboundRouting } from '@/hooks/useInboundRouting';
import { InboundRoutingDialog } from './InboundRoutingDialog';
import { 
  Phone, 
  Plus, 
  Trash2, 
  Loader2, 
  Settings2,
  PhoneIncoming,
  PhoneOutgoing,
  Bot,
  PhoneForwarded,
  Voicemail
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';

export const TelephonySettings = () => {
  const { toast } = useToast();
  const { phoneNumbers, loading, provisionNumber, deleteNumber, isProvisioning } = usePhoneNumbers();
  const { data: allRoutingRules } = useAllInboundRouting();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('DE');
  const [friendlyName, setFriendlyName] = useState('');
  const [routingDialogPhone, setRoutingDialogPhone] = useState<{ id: string; number: string } | null>(null);

  // Helper to get routing for a phone number
  const getRoutingForPhone = (phoneId: string) => {
    return allRoutingRules?.find(r => r.phone_number_id === phoneId);
  };

  // Helper to get routing type label and icon
  const getRoutingInfo = (phoneId: string) => {
    const routing = getRoutingForPhone(phoneId);
    if (!routing) return { label: 'Nicht konfiguriert', icon: Settings2, color: 'text-muted-foreground' };
    
    switch (routing.routing_type) {
      case 'ai_agent':
        return { label: 'KI-Agent', icon: Bot, color: 'text-primary' };
      case 'forward':
        return { label: 'Weiterleitung', icon: PhoneForwarded, color: 'text-blue-500' };
      case 'voicemail':
        return { label: 'Voicemail', icon: Voicemail, color: 'text-orange-500' };
      default:
        return { label: 'Nicht konfiguriert', icon: Settings2, color: 'text-muted-foreground' };
    }
  };
  const handleProvision = async () => {
    try {
      await provisionNumber({ country: selectedCountry, friendlyName });
      toast({
        title: "Nummer bereitgestellt",
        description: "Deine neue Telefonnummer wurde erfolgreich eingerichtet.",
      });
      setShowAddDialog(false);
      setFriendlyName('');
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Nummer konnte nicht bereitgestellt werden.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNumber(id);
      toast({
        title: "Nummer gelöscht",
        description: "Die Telefonnummer wurde entfernt.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Nummer konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Telefonnummern
            </h2>
            <p className="text-sm text-muted-foreground">
              Verwalte deine Twilio-Telefonnummern für ein- und ausgehende Anrufe.
            </p>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Nummer hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neue Telefonnummer</DialogTitle>
                <DialogDescription>
                  Kaufe eine neue Twilio-Telefonnummer für deine Kampagnen.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Land
                  </label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DE">🇩🇪 Deutschland (+49)</SelectItem>
                      <SelectItem value="AT">🇦🇹 Österreich (+43)</SelectItem>
                      <SelectItem value="CH">🇨🇭 Schweiz (+41)</SelectItem>
                      <SelectItem value="US">🇺🇸 USA (+1)</SelectItem>
                      <SelectItem value="GB">🇬🇧 UK (+44)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Bezeichnung (optional)
                  </label>
                  <Input
                    placeholder="z.B. Vertrieb Hauptnummer"
                    value={friendlyName}
                    onChange={(e) => setFriendlyName(e.target.value)}
                  />
                </div>

                <div className="p-4 rounded-xl bg-muted/30">
                  <p className="text-sm font-medium">Kosten</p>
                  <p className="text-2xl font-bold text-primary">€1.00<span className="text-sm font-normal text-muted-foreground">/Monat</span></p>
                  <p className="text-xs text-muted-foreground mt-1">
                    + Nutzungskosten pro Minute
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleProvision} disabled={isProvisioning}>
                  {isProvisioning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Nummer kaufen'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {phoneNumbers && phoneNumbers.length > 0 ? (
          <div className="space-y-3">
            {phoneNumbers.map((phone) => {
              const routingInfo = getRoutingInfo(phone.id);
              const RoutingIcon = routingInfo.icon;
              
              return (
                <div 
                  key={phone.id}
                  className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium font-mono">{phone.phone_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {phone.friendly_name || 'Keine Bezeichnung'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={phone.is_active ? "default" : "secondary"}>
                        {phone.is_active ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {(phone.capabilities as { voice?: boolean; sms?: boolean } | null)?.voice && (
                          <PhoneOutgoing className="w-4 h-4 text-muted-foreground" />
                        )}
                        {(phone.capabilities as { voice?: boolean; sms?: boolean } | null)?.sms && (
                          <PhoneIncoming className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(phone.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Inbound Routing Status */}
                  <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RoutingIcon className={`w-4 h-4 ${routingInfo.color}`} />
                      <span className="text-sm text-muted-foreground">
                        Inbound: <span className={routingInfo.color}>{routingInfo.label}</span>
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => setRoutingDialogPhone({ id: phone.id, number: phone.phone_number })}
                    >
                      <Settings2 className="w-4 h-4" />
                      Konfigurieren
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Phone className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Keine Telefonnummern vorhanden</p>
            <p className="text-sm">Füge eine Nummer hinzu, um Anrufe zu tätigen.</p>
          </div>
        )}
      </div>
      {/* Inbound Routing Dialog */}
      {routingDialogPhone && (
        <InboundRoutingDialog
          open={!!routingDialogPhone}
          onOpenChange={(open) => !open && setRoutingDialogPhone(null)}
          phoneNumberId={routingDialogPhone.id}
          phoneNumber={routingDialogPhone.number}
        />
      )}
    </div>
  );
};
