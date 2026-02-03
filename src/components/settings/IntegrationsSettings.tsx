import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useIntegrations } from '@/hooks/useIntegrations';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Link2, 
  Calendar, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Loader2,
  Phone,
  ExternalLink,
  Sparkles,
  Palette,
  Share2,
  Inbox,
  Settings2
} from 'lucide-react';

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  loading?: boolean;
  providerEmail?: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'outline';
}

const IntegrationCard = ({ 
  name, 
  description, 
  icon, 
  connected, 
  onConnect, 
  onDisconnect,
  loading,
  providerEmail,
  badge,
  badgeVariant = 'secondary'
}: IntegrationCardProps) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-all">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-medium flex items-center gap-2">
          {name}
          {connected && <CheckCircle2 className="w-4 h-4 text-success" />}
          {badge && <Badge variant={badgeVariant} className="text-xs">{badge}</Badge>}
        </h3>
        <p className="text-sm text-muted-foreground">
          {connected && providerEmail ? providerEmail : description}
        </p>
      </div>
    </div>
    <Button
      variant={connected ? "outline" : "default"}
      size="sm"
      onClick={connected ? onDisconnect : onConnect}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : connected ? (
        'Trennen'
      ) : (
        'Verbinden'
      )}
    </Button>
  </div>
);

export const IntegrationsSettings = () => {
  const { toast } = useToast();
  const { 
    integrations, 
    loading, 
    connectGoogle, 
    connectGmail,
    connectSlack,
    connectWhatsApp, 
    disconnectIntegration, 
    isConnecting 
  } = useIntegrations();

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailConfig, setEmailConfig] = useState({
    email: '',
    password: '',
    imapHost: '',
    imapPort: '993',
    smtpHost: '',
    smtpPort: '587',
  });
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  
  const googleIntegration = integrations?.find(i => i.provider === 'google_calendar');
  const gmailIntegration = integrations?.find(i => i.provider === 'gmail');
  const slackIntegration = integrations?.find(i => i.provider === 'slack');
  const hubspotIntegration = integrations?.find(i => i.provider === 'hubspot');
  const whatsappIntegration = integrations?.find(i => i.provider === 'whatsapp_business');
  const imapIntegration = integrations?.find(i => i.provider === 'imap_email');

  const handleConnectGoogle = async () => {
    try {
      await connectGoogle();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Google Calendar-Verbindung konnte nicht hergestellt werden.",
        variant: "destructive",
      });
    }
  };

  const handleConnectGmail = async () => {
    try {
      await connectGmail();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Gmail-Verbindung konnte nicht hergestellt werden.",
        variant: "destructive",
      });
    }
  };

  const handleConnectSlack = async () => {
    try {
      await connectSlack();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Slack-Verbindung konnte nicht hergestellt werden.",
        variant: "destructive",
      });
    }
  };

  const handleConnectWhatsApp = async () => {
    try {
      await connectWhatsApp();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "WhatsApp-Verbindung konnte nicht hergestellt werden.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async (provider: string) => {
    try {
      await disconnectIntegration(provider);
      toast({
        title: "Verbindung getrennt",
        description: `${provider} wurde erfolgreich getrennt.`,
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Verbindung konnte nicht getrennt werden.",
        variant: "destructive",
      });
    }
  };

  const handleComingSoon = (name: string) => {
    toast({
      title: "Demnächst verfügbar",
      description: `${name} Integration kommt bald!`,
    });
  };

  const handleOpenPomelli = () => {
    window.open('https://labs.google.com/pomelli', '_blank');
    toast({
      title: "Pomelli öffnen",
      description: "Pomelli wird in einem neuen Tab geöffnet.",
    });
  };

  const handleSaveEmailConfig = async () => {
    if (!emailConfig.email || !emailConfig.password || !emailConfig.imapHost || !emailConfig.smtpHost) {
      toast({
        title: "Fehler",
        description: "Bitte fülle alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingEmail(true);
    try {
      // TODO: Save to database via edge function (encrypted)
      toast({
        title: "E-Mail-Postfach verbunden",
        description: `${emailConfig.email} wurde erfolgreich verbunden.`,
      });
      setIsEmailModalOpen(false);
      setEmailConfig({
        email: '',
        password: '',
        imapHost: '',
        imapPort: '993',
        smtpHost: '',
        smtpPort: '587',
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "E-Mail-Konfiguration konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setIsSavingEmail(false);
    }
  };

  const detectEmailProvider = (email: string) => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return;

    const providers: Record<string, { imap: string; smtp: string }> = {
      'gmail.com': { imap: 'imap.gmail.com', smtp: 'smtp.gmail.com' },
      'googlemail.com': { imap: 'imap.gmail.com', smtp: 'smtp.gmail.com' },
      'outlook.com': { imap: 'outlook.office365.com', smtp: 'smtp.office365.com' },
      'hotmail.com': { imap: 'outlook.office365.com', smtp: 'smtp.office365.com' },
      'live.com': { imap: 'outlook.office365.com', smtp: 'smtp.office365.com' },
      'yahoo.com': { imap: 'imap.mail.yahoo.com', smtp: 'smtp.mail.yahoo.com' },
      'icloud.com': { imap: 'imap.mail.me.com', smtp: 'smtp.mail.me.com' },
      'me.com': { imap: 'imap.mail.me.com', smtp: 'smtp.mail.me.com' },
      'aol.com': { imap: 'imap.aol.com', smtp: 'smtp.aol.com' },
      'gmx.de': { imap: 'imap.gmx.net', smtp: 'mail.gmx.net' },
      'gmx.net': { imap: 'imap.gmx.net', smtp: 'mail.gmx.net' },
      'web.de': { imap: 'imap.web.de', smtp: 'smtp.web.de' },
      't-online.de': { imap: 'secureimap.t-online.de', smtp: 'securesmtp.t-online.de' },
      'freenet.de': { imap: 'mx.freenet.de', smtp: 'mx.freenet.de' },
      'posteo.de': { imap: 'posteo.de', smtp: 'posteo.de' },
      'mailbox.org': { imap: 'imap.mailbox.org', smtp: 'smtp.mailbox.org' },
    };

    const provider = providers[domain];
    if (provider) {
      setEmailConfig(prev => ({
        ...prev,
        imapHost: provider.imap,
        smtpHost: provider.smtp,
      }));
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
      {/* Communication Integrations */}
      <div className="glass-card p-6 animate-fade-in">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" />
          Kommunikation & Kalender
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Verbinde deine E-Mail, Kalender und Messaging-Dienste.
        </p>

        <div className="space-y-4">
          <IntegrationCard
            name="Google Calendar"
            description="Termine automatisch synchronisieren"
            icon={<Calendar className="w-6 h-6 text-primary" />}
            connected={!!googleIntegration}
            providerEmail={googleIntegration?.provider_email || undefined}
            onConnect={handleConnectGoogle}
            onDisconnect={() => handleDisconnect('google_calendar')}
            loading={isConnecting === 'google_calendar'}
          />

          <IntegrationCard
            name="Gmail"
            description="E-Mails direkt aus Beavy senden (OAuth)"
            icon={<Mail className="w-6 h-6 text-primary" />}
            connected={!!gmailIntegration}
            providerEmail={gmailIntegration?.provider_email || undefined}
            onConnect={handleConnectGmail}
            onDisconnect={() => handleDisconnect('gmail')}
            loading={isConnecting === 'gmail'}
          />

          <IntegrationCard
            name="E-Mail Postfach (IMAP/SMTP)"
            description="Beliebiges E-Mail-Konto verbinden"
            icon={<Inbox className="w-6 h-6 text-primary" />}
            connected={!!imapIntegration}
            providerEmail={imapIntegration?.provider_email || undefined}
            onConnect={() => setIsEmailModalOpen(true)}
            onDisconnect={() => handleDisconnect('imap_email')}
          />

          <IntegrationCard
            name="Slack"
            description="Benachrichtigungen und Team-Updates"
            icon={<MessageSquare className="w-6 h-6 text-primary" />}
            connected={!!slackIntegration}
            providerEmail={slackIntegration?.provider_email || undefined}
            onConnect={handleConnectSlack}
            onDisconnect={() => handleDisconnect('slack')}
            loading={isConnecting === 'slack'}
          />

          <IntegrationCard
            name="WhatsApp Business"
            description="Nachrichten und Follow-ups senden"
            icon={<Phone className="w-6 h-6 text-primary" />}
            connected={!!whatsappIntegration}
            providerEmail={whatsappIntegration?.provider_email || undefined}
            onConnect={handleConnectWhatsApp}
            onDisconnect={() => handleDisconnect('whatsapp_business')}
            loading={isConnecting === 'whatsapp_business'}
          />
        </div>
      </div>

      {/* Marketing & AI Integrations */}
      <div className="glass-card p-6 animate-fade-in">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Marketing & KI
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          KI-gestützte Tools für Content-Erstellung und Marketing.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-orange-500/10 border border-pink-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-medium flex items-center gap-2">
                  Pomelli by Google Labs
                  <Badge className="text-xs bg-gradient-to-r from-pink-500 to-orange-500 text-white border-0">
                    Neu
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                  KI-generierte Social-Media-Inhalte mit Brand-Konsistenz
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleOpenPomelli}
              className="gap-2 bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90"
            >
              <ExternalLink className="w-4 h-4" />
              Öffnen
            </Button>
          </div>

          <IntegrationCard
            name="HubSpot"
            description="Leads und Kontakte synchronisieren"
            icon={<Share2 className="w-6 h-6 text-primary" />}
            connected={!!hubspotIntegration}
            providerEmail={hubspotIntegration?.provider_email || undefined}
            onConnect={() => handleComingSoon('HubSpot')}
            onDisconnect={() => handleDisconnect('hubspot')}
            badge="Bald"
            badgeVariant="outline"
          />
        </div>
      </div>

      {/* IMAP/SMTP Email Configuration Modal */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              E-Mail Postfach verbinden
            </DialogTitle>
            <DialogDescription>
              Verbinde ein beliebiges E-Mail-Konto via IMAP/SMTP. Unterstützt werden alle gängigen Anbieter.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail-Adresse *</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@beispiel.de"
                value={emailConfig.email}
                onChange={(e) => {
                  setEmailConfig(prev => ({ ...prev, email: e.target.value }));
                  detectEmailProvider(e.target.value);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Server-Einstellungen werden automatisch erkannt
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Passwort / App-Passwort *</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={emailConfig.password}
                onChange={(e) => setEmailConfig(prev => ({ ...prev, password: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Bei Gmail/Outlook: App-Passwort verwenden
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="imapHost">IMAP Server *</Label>
                <Input
                  id="imapHost"
                  placeholder="imap.beispiel.de"
                  value={emailConfig.imapHost}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, imapHost: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imapPort">IMAP Port</Label>
                <Input
                  id="imapPort"
                  placeholder="993"
                  value={emailConfig.imapPort}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, imapPort: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Server *</Label>
                <Input
                  id="smtpHost"
                  placeholder="smtp.beispiel.de"
                  value={emailConfig.smtpHost}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  placeholder="587"
                  value={emailConfig.smtpPort}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpPort: e.target.value }))}
                />
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="font-medium mb-1">Unterstützte Anbieter (Auto-Erkennung):</p>
              <p className="text-muted-foreground text-xs">
                Gmail, Outlook, Yahoo, iCloud, GMX, Web.de, T-Online, Posteo, Mailbox.org und mehr
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailModalOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveEmailConfig} disabled={isSavingEmail}>
              {isSavingEmail ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Verbinden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
