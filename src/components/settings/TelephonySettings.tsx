import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { usePhoneNumbers } from '@/hooks/usePhoneNumbers';
import { 
  Phone, 
  Plus, 
  Trash2, 
  Loader2, 
  Settings2,
  PhoneIncoming,
  PhoneOutgoing
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
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('DE');
  const [friendlyName, setFriendlyName] = useState('');

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
            {phoneNumbers.map((phone) => (
              <div 
                key={phone.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50"
              >
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
                    {phone.capabilities?.voice && (
                      <PhoneOutgoing className="w-4 h-4 text-muted-foreground" />
                    )}
                    {phone.capabilities?.sms && (
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
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Phone className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Keine Telefonnummern vorhanden</p>
            <p className="text-sm">Füge eine Nummer hinzu, um Anrufe zu tätigen.</p>
          </div>
        )}
      </div>

      {/* Inbound Routing Info */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <PhoneIncoming className="w-5 h-5 text-primary" />
          Eingehende Anrufe
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Konfiguriere, wie eingehende Anrufe behandelt werden sollen. Du kannst Anrufe an den KI-Agenten weiterleiten oder auf eine Voicemail umstellen.
        </p>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="w-4 h-4" />
          Routing konfigurieren
        </Button>
      </div>
    </div>
  );
};
