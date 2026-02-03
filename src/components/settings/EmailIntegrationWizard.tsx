import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Loader2, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Globe,
  Lock,
  Server,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  imapHost: string;
  imapPort: string;
  smtpHost: string;
  smtpPort: string;
  hint?: string;
}

const providers: EmailProvider[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    icon: '📧',
    color: 'from-red-500 to-orange-500',
    imapHost: 'imap.gmail.com',
    imapPort: '993',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    hint: 'App-Passwort erforderlich (2FA aktivieren)',
  },
  {
    id: 'outlook',
    name: 'Outlook / Microsoft 365',
    icon: '📬',
    color: 'from-blue-500 to-cyan-500',
    imapHost: 'outlook.office365.com',
    imapPort: '993',
    smtpHost: 'smtp.office365.com',
    smtpPort: '587',
    hint: 'App-Passwort bei 2FA erforderlich',
  },
  {
    id: 'gmx',
    name: 'GMX',
    icon: '✉️',
    color: 'from-blue-600 to-blue-800',
    imapHost: 'imap.gmx.net',
    imapPort: '993',
    smtpHost: 'mail.gmx.net',
    smtpPort: '587',
  },
  {
    id: 'webde',
    name: 'Web.de',
    icon: '📩',
    color: 'from-yellow-500 to-orange-500',
    imapHost: 'imap.web.de',
    imapPort: '993',
    smtpHost: 'smtp.web.de',
    smtpPort: '587',
  },
  {
    id: 'tonline',
    name: 'T-Online',
    icon: '📨',
    color: 'from-pink-500 to-rose-500',
    imapHost: 'secureimap.t-online.de',
    imapPort: '993',
    smtpHost: 'securesmtp.t-online.de',
    smtpPort: '587',
  },
  {
    id: 'yahoo',
    name: 'Yahoo Mail',
    icon: '💌',
    color: 'from-purple-500 to-violet-500',
    imapHost: 'imap.mail.yahoo.com',
    imapPort: '993',
    smtpHost: 'smtp.mail.yahoo.com',
    smtpPort: '587',
    hint: 'App-Passwort erforderlich',
  },
  {
    id: 'icloud',
    name: 'iCloud Mail',
    icon: '☁️',
    color: 'from-sky-400 to-blue-500',
    imapHost: 'imap.mail.me.com',
    imapPort: '993',
    smtpHost: 'smtp.mail.me.com',
    smtpPort: '587',
    hint: 'App-spezifisches Passwort erforderlich',
  },
  {
    id: 'custom',
    name: 'Anderer Anbieter',
    icon: '⚙️',
    color: 'from-gray-500 to-gray-700',
    imapHost: '',
    imapPort: '993',
    smtpHost: '',
    smtpPort: '587',
  },
];

interface EmailIntegrationWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EmailIntegrationWizard({ open, onClose, onSuccess }: EmailIntegrationWizardProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [config, setConfig] = useState({
    email: '',
    password: '',
    imapHost: '',
    imapPort: '993',
    smtpHost: '',
    smtpPort: '587',
    displayName: '',
  });

  const steps = [
    { title: 'Anbieter wählen', icon: Mail },
    { title: 'Zugangsdaten', icon: Lock },
    { title: 'Server-Einstellungen', icon: Server },
  ];

  const handleProviderSelect = (provider: EmailProvider) => {
    setSelectedProvider(provider);
    setConfig(prev => ({
      ...prev,
      imapHost: provider.imapHost,
      imapPort: provider.imapPort,
      smtpHost: provider.smtpHost,
      smtpPort: provider.smtpPort,
    }));
    setStep(1);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!config.email || !config.password) {
        toast({
          title: "Fehler",
          description: "Bitte E-Mail und Passwort eingeben.",
          variant: "destructive",
        });
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSave = async () => {
    if (!config.imapHost || !config.smtpHost) {
      toast({
        title: "Fehler",
        description: "Bitte Server-Einstellungen vervollständigen.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Save encrypted config via edge function
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "E-Mail verbunden",
        description: `${config.email} wurde erfolgreich verbunden.`,
      });
      
      onSuccess?.();
      handleClose();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Verbindung konnte nicht hergestellt werden.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setStep(0);
    setSelectedProvider(null);
    setConfig({
      email: '',
      password: '',
      imapHost: '',
      imapPort: '993',
      smtpHost: '',
      smtpPort: '587',
      displayName: '',
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            E-Mail Postfach verbinden
          </DialogTitle>
          <DialogDescription>
            Verbinde dein E-Mail-Konto in wenigen Schritten
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-4">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <div 
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all",
                  step === i 
                    ? "bg-primary text-primary-foreground" 
                    : step > i 
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {step > i ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <s.icon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{s.title}</span>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px] overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Step 0: Provider Selection */}
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-3"
              >
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleProviderSelect(provider)}
                    className={cn(
                      "group relative p-4 rounded-xl border-2 border-border/50 bg-card",
                      "hover:border-primary/50 hover:shadow-lg transition-all text-left",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl mb-3 flex items-center justify-center text-2xl",
                      "bg-gradient-to-br", provider.color
                    )}>
                      {provider.icon}
                    </div>
                    <h3 className="font-medium text-sm">{provider.name}</h3>
                    {provider.hint && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {provider.hint}
                      </p>
                    )}
                    <ArrowRight className="absolute top-4 right-4 w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </motion.div>
            )}

            {/* Step 1: Credentials */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {selectedProvider && (
                  <div className={cn(
                    "flex items-center gap-3 p-3 rounded-lg",
                    "bg-gradient-to-r", selectedProvider.color, "bg-opacity-10"
                  )}>
                    <span className="text-2xl">{selectedProvider.icon}</span>
                    <div>
                      <p className="font-medium">{selectedProvider.name}</p>
                      {selectedProvider.hint && (
                        <p className="text-xs text-muted-foreground">{selectedProvider.hint}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="displayName">Anzeigename (optional)</Label>
                  <Input
                    id="displayName"
                    placeholder="z.B. Arbeit, Privat..."
                    value={config.displayName}
                    onChange={(e) => setConfig(prev => ({ ...prev, displayName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail-Adresse *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@beispiel.de"
                    value={config.email}
                    onChange={(e) => setConfig(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    {selectedProvider?.hint?.includes('App-Passwort') 
                      ? 'App-Passwort *' 
                      : 'Passwort *'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={config.password}
                    onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
                  />
                  {selectedProvider?.id === 'gmail' && (
                    <p className="text-xs text-muted-foreground">
                      <a 
                        href="https://myaccount.google.com/apppasswords" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        App-Passwort erstellen →
                      </a>
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Server Settings */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-primary" />
                    <h4 className="font-medium">IMAP (Empfangen)</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1">
                      <Label htmlFor="imapHost" className="text-xs">Server</Label>
                      <Input
                        id="imapHost"
                        placeholder="imap.beispiel.de"
                        value={config.imapHost}
                        onChange={(e) => setConfig(prev => ({ ...prev, imapHost: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="imapPort" className="text-xs">Port</Label>
                      <Input
                        id="imapPort"
                        placeholder="993"
                        value={config.imapPort}
                        onChange={(e) => setConfig(prev => ({ ...prev, imapPort: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Server className="w-4 h-4 text-primary" />
                    <h4 className="font-medium">SMTP (Senden)</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1">
                      <Label htmlFor="smtpHost" className="text-xs">Server</Label>
                      <Input
                        id="smtpHost"
                        placeholder="smtp.beispiel.de"
                        value={config.smtpHost}
                        onChange={(e) => setConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="smtpPort" className="text-xs">Port</Label>
                      <Input
                        id="smtpPort"
                        placeholder="587"
                        value={config.smtpPort}
                        onChange={(e) => setConfig(prev => ({ ...prev, smtpPort: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {selectedProvider?.id !== 'custom' && (
                  <p className="text-xs text-muted-foreground text-center">
                    Server-Einstellungen wurden automatisch für {selectedProvider?.name} konfiguriert
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button 
            variant="outline" 
            onClick={step === 0 ? handleClose : handleBack}
            disabled={isSaving}
          >
            {step === 0 ? 'Abbrechen' : (
              <>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Zurück
              </>
            )}
          </Button>
          
          {step < 2 ? (
            <Button onClick={handleNext} disabled={step === 0}>
              Weiter
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Verbinden
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
