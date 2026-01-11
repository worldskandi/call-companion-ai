import { useState } from 'react';
import { usePhoneNumbers } from '@/hooks/usePhoneNumbers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Phone, 
  Plus, 
  Settings2, 
  Trash2, 
  PhoneIncoming, 
  PhoneOutgoing,
  MessageSquare,
  Globe,
} from 'lucide-react';
import { motion } from 'framer-motion';

const PhoneNumbers = () => {
  const { phoneNumbers, loading: isLoading, provisionNumber, deleteNumber, isProvisioning } = usePhoneNumbers();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newNumberCountry, setNewNumberCountry] = useState('DE');
  const [newNumberName, setNewNumberName] = useState('');
  const [deleteNumberId, setDeleteNumberId] = useState<string | null>(null);

  const handleProvisionNumber = async () => {
    try {
      await provisionNumber({
        country: newNumberCountry,
        friendlyName: newNumberName || '',
      });
      setIsAddDialogOpen(false);
      setNewNumberName('');
    } catch (error) {
      console.error('Failed to provision number:', error);
    }
  };

  const handleReleaseNumber = async () => {
    if (deleteNumberId) {
      await deleteNumber(deleteNumberId);
      setDeleteNumberId(null);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Telefonnummern</h1>
          <p className="text-muted-foreground">
            Verwalte deine Inbound & Outbound Telefonnummern
          </p>
        </div>
        <Button 
          className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Nummer hinzufügen
        </Button>
      </motion.div>

      {/* Phone Numbers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-muted mb-4" />
              <div className="w-3/4 h-6 bg-muted rounded mb-2" />
              <div className="w-full h-4 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : phoneNumbers && phoneNumbers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {phoneNumbers.map((phone, index) => {
            const capabilities = phone.capabilities as { voice?: boolean; sms?: boolean; mms?: boolean } | null;
            return (
              <motion.div 
                key={phone.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 group hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    phone.is_active ? 'bg-gradient-to-br from-primary to-accent' : 'bg-muted'
                  }`}>
                    <Phone className={`w-6 h-6 ${phone.is_active ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={phone.is_active ? 'default' : 'secondary'}>
                      {phone.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setDeleteNumberId(phone.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-1">{phone.phone_number}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {phone.friendly_name || 'Keine Bezeichnung'}
                </p>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {capabilities?.voice && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                      <PhoneOutgoing className="w-3 h-3" />
                      Sprache
                    </span>
                  )}
                  {capabilities?.sms && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs">
                      <MessageSquare className="w-3 h-3" />
                      SMS
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                    <Globe className="w-3 h-3" />
                    {phone.country_code || 'DE'}
                  </span>
                </div>

                {/* Inbound Status */}
                <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <PhoneIncoming className="w-4 h-4" />
                    Inbound Routing
                  </span>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Settings2 className="w-4 h-4" />
                    Konfigurieren
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-16 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Phone className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Keine Telefonnummern vorhanden</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Füge deine erste Telefonnummer hinzu, um Inbound-Anrufe zu empfangen und Outbound-Kampagnen zu starten.
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Erste Nummer hinzufügen
          </Button>
        </motion.div>
      )}

      {/* Add Number Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Telefonnummer</DialogTitle>
            <DialogDescription>
              Wähle ein Land und eine Bezeichnung für deine neue Nummer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Land</label>
              <Select value={newNumberCountry} onValueChange={setNewNumberCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DE">Deutschland (+49)</SelectItem>
                  <SelectItem value="AT">Österreich (+43)</SelectItem>
                  <SelectItem value="CH">Schweiz (+41)</SelectItem>
                  <SelectItem value="US">USA (+1)</SelectItem>
                  <SelectItem value="GB">UK (+44)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bezeichnung (optional)</label>
              <Input
                placeholder="z.B. Support-Hotline"
                value={newNumberName}
                onChange={(e) => setNewNumberName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleProvisionNumber} 
              disabled={isProvisioning}
              className="gap-2"
            >
              {isProvisioning ? 'Wird erstellt...' : 'Nummer kaufen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteNumberId} onOpenChange={() => setDeleteNumberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nummer freigeben?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Nummer wird freigegeben und kann nicht wiederhergestellt werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReleaseNumber}
              className="bg-destructive hover:bg-destructive/90"
            >
              Nummer freigeben
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PhoneNumbers;
