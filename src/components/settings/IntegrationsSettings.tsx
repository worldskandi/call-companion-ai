import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useIntegrations } from '@/hooks/useIntegrations';
import { EmailIntegrationWizard } from './EmailIntegrationWizard';
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
  Inbox
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

  const [isEmailWizardOpen, setIsEmailWizardOpen] = useState(false);
  
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
            description="Gmail, Outlook, GMX, Web.de und mehr"
            icon={<Inbox className="w-6 h-6 text-primary" />}
            connected={!!imapIntegration}
            providerEmail={imapIntegration?.provider_email || undefined}
            onConnect={() => setIsEmailWizardOpen(true)}
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

      {/* Email Integration Wizard */}
      <EmailIntegrationWizard
        open={isEmailWizardOpen}
        onClose={() => setIsEmailWizardOpen(false)}
      />
    </div>
  );
};
