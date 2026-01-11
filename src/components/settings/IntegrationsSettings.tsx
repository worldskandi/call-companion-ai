import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useIntegrations } from '@/hooks/useIntegrations';
import { 
  Link2, 
  Calendar, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  XCircle,
  Loader2,
  ExternalLink
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
}

const IntegrationCard = ({ 
  name, 
  description, 
  icon, 
  connected, 
  onConnect, 
  onDisconnect,
  loading,
  providerEmail 
}: IntegrationCardProps) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-medium flex items-center gap-2">
          {name}
          {connected && <CheckCircle2 className="w-4 h-4 text-success" />}
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
  const { integrations, loading, connectGoogle, disconnectIntegration, isConnecting } = useIntegrations();
  
  const googleIntegration = integrations?.find(i => i.provider === 'google_calendar');
  const slackIntegration = integrations?.find(i => i.provider === 'slack');
  const hubspotIntegration = integrations?.find(i => i.provider === 'hubspot');

  const handleConnectGoogle = async () => {
    try {
      await connectGoogle();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Google-Verbindung konnte nicht hergestellt werden.",
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
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" />
          Integrationen
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Verbinde externe Dienste, um deine Workflows zu automatisieren.
        </p>

        <div className="space-y-4">
          <IntegrationCard
            name="Google Calendar"
            description="Termine automatisch in deinen Kalender eintragen"
            icon={<Calendar className="w-6 h-6 text-primary" />}
            connected={!!googleIntegration}
            providerEmail={googleIntegration?.provider_email || undefined}
            onConnect={handleConnectGoogle}
            onDisconnect={() => handleDisconnect('google_calendar')}
            loading={isConnecting === 'google_calendar'}
          />

          <IntegrationCard
            name="Slack"
            description="Benachrichtigungen bei neuen Anrufen erhalten"
            icon={<MessageSquare className="w-6 h-6 text-primary" />}
            connected={!!slackIntegration}
            providerEmail={slackIntegration?.provider_email || undefined}
            onConnect={() => handleComingSoon('Slack')}
            onDisconnect={() => handleDisconnect('slack')}
          />

          <IntegrationCard
            name="HubSpot"
            description="Leads und Kontakte synchronisieren"
            icon={<Mail className="w-6 h-6 text-primary" />}
            connected={!!hubspotIntegration}
            providerEmail={hubspotIntegration?.provider_email || undefined}
            onConnect={() => handleComingSoon('HubSpot')}
            onDisconnect={() => handleDisconnect('hubspot')}
          />
        </div>
      </div>

      {/* OAuth Setup Instructions */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <h3 className="font-medium mb-2">Google Calendar einrichten</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Um Google Calendar zu verbinden, benötigst du OAuth2-Credentials in der Google Cloud Console.
        </p>
        <Button variant="outline" size="sm" asChild>
          <a 
            href="https://console.cloud.google.com/apis/credentials" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Google Cloud Console öffnen
          </a>
        </Button>
      </div>
    </div>
  );
};
