import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAPIKeys } from '@/hooks/useAPIKeys';
import { 
  Key, 
  Loader2, 
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Book
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
import { Badge } from '@/components/ui/badge';

export const APISettings = () => {
  const { toast } = useToast();
  const { apiKeys, loading, createKey, deleteKey, isCreating } = useAPIKeys();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const handleCreateKey = async () => {
    if (!keyName) return;
    
    try {
      const key = await createKey(keyName);
      setNewKey(key);
      setKeyName('');
      toast({
        title: "API-Key erstellt",
        description: "Speichere diesen Key sicher - er wird nur einmal angezeigt.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "API-Key konnte nicht erstellt werden.",
        variant: "destructive",
      });
    }
  };

  const handleCopyKey = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      toast({
        title: "Kopiert",
        description: "API-Key wurde in die Zwischenablage kopiert.",
      });
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await deleteKey(id);
      toast({
        title: "API-Key gelöscht",
        description: "Der API-Key wurde deaktiviert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "API-Key konnte nicht gelöscht werden.",
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
              <Key className="w-5 h-5 text-primary" />
              API-Keys
            </h2>
            <p className="text-sm text-muted-foreground">
              Verwalte API-Keys für den programmatischen Zugriff.
            </p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={(open) => {
            setShowCreateDialog(open);
            if (!open) {
              setNewKey(null);
              setKeyName('');
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Neuer Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {newKey ? 'API-Key erstellt' : 'Neuen API-Key erstellen'}
                </DialogTitle>
                <DialogDescription>
                  {newKey 
                    ? 'Speichere diesen Key sicher - er wird nur einmal angezeigt!'
                    : 'Gib dem API-Key einen Namen zur Identifikation.'
                  }
                </DialogDescription>
              </DialogHeader>
              
              {newKey ? (
                <div className="py-4">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-sm font-mono break-all">
                        {showKey ? newKey : '••••••••••••••••••••••••'}
                      </code>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setShowKey(!showKey)}>
                          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleCopyKey}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-destructive mt-2">
                    ⚠️ Dieser Key wird nur einmal angezeigt. Speichere ihn jetzt!
                  </p>
                </div>
              ) : (
                <div className="py-4">
                  <label className="text-sm font-medium mb-1 block">
                    Key-Name
                  </label>
                  <Input
                    placeholder="z.B. Production, Development"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                  />
                </div>
              )}

              <DialogFooter>
                {newKey ? (
                  <Button onClick={() => {
                    setShowCreateDialog(false);
                    setNewKey(null);
                  }}>
                    Fertig
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Abbrechen
                    </Button>
                    <Button onClick={handleCreateKey} disabled={!keyName || isCreating}>
                      {isCreating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Key erstellen'
                      )}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Keys List */}
        {apiKeys && apiKeys.length > 0 ? (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div 
                key={key.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Key className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{key.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {key.key_prefix}••••••••
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={key.is_active ? "default" : "secondary"}>
                    {key.is_active ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteKey(key.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Keine API-Keys vorhanden</p>
            <p className="text-sm">Erstelle einen Key für API-Zugriff.</p>
          </div>
        )}
      </div>

      {/* API Documentation */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <h3 className="font-medium mb-2">API-Dokumentation</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Lerne, wie du die API verwendest, um Leads zu erstellen, Anrufe zu starten und mehr.
        </p>
        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 mb-4">
          <p className="text-sm font-medium mb-2">Base URL</p>
          <code className="text-sm font-mono text-primary">
            https://dwuelcsawiudvihxeddc.supabase.co/functions/v1
          </code>
        </div>
        <Link to="/app/api-docs">
          <Button variant="outline" size="sm" className="gap-2">
            <Book className="w-4 h-4" />
            Dokumentation öffnen
          </Button>
        </Link>
      </div>
    </div>
  );
};
