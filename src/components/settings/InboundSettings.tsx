import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PhoneIncoming, 
  Clock, 
  Bot, 
  Phone, 
  Settings2, 
  Save,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { usePhoneNumbers } from '@/hooks/usePhoneNumbers';
import { useAllInboundRouting } from '@/hooks/useInboundRouting';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GlobalInboundSettings {
  defaultGreeting: string;
  afterHoursMessage: string;
  businessHoursEnabled: boolean;
  businessHoursStart: string;
  businessHoursEnd: string;
  weekendEnabled: boolean;
  weekendStart: string;
  weekendEnd: string;
  defaultInboundPrompt: string;
  callReasonDetection: boolean;
  escalationEnabled: boolean;
  escalationPhrase: string;
  callbackOffer: boolean;
}

export function InboundSettings() {
  const { phoneNumbers, loading: phoneNumbersLoading } = usePhoneNumbers();
  const { data: routingRules, isLoading: routingLoading } = useAllInboundRouting();
  const { data: campaigns } = useCampaigns();

  const [settings, setSettings] = useState<GlobalInboundSettings>({
    defaultGreeting: 'Guten Tag, Sie sprechen mit dem KI-Assistenten von [Firma]. Wie kann ich Ihnen helfen?',
    afterHoursMessage: 'Vielen Dank für Ihren Anruf. Leider rufen Sie außerhalb unserer Geschäftszeiten an. Bitte versuchen Sie es morgen wieder oder hinterlassen Sie eine Nachricht.',
    businessHoursEnabled: true,
    businessHoursStart: '09:00',
    businessHoursEnd: '18:00',
    weekendEnabled: false,
    weekendStart: '10:00',
    weekendEnd: '14:00',
    defaultInboundPrompt: 'Du bist ein freundlicher Kundenservice-Agent. Deine Aufgabe ist es, Anrufern zu helfen und ihre Anliegen zu verstehen. Bei komplexen Themen biete an, einen Rückruf zu vereinbaren.',
    callReasonDetection: true,
    escalationEnabled: true,
    escalationPhrase: 'Ich verbinde Sie mit einem Mitarbeiter',
    callbackOffer: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof GlobalInboundSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Save to database when global settings table is created
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
  };

  const getCampaignName = (campaignId: string | null) => {
    if (!campaignId) return 'Keine';
    const campaign = campaigns?.find(c => c.id === campaignId);
    return campaign?.name || 'Unbekannt';
  };

  const getRoutingTypeLabel = (type: string | null) => {
    switch (type) {
      case 'ai': return 'KI-Agent';
      case 'forward': return 'Weiterleitung';
      case 'voicemail': return 'Mailbox';
      default: return 'Standard';
    }
  };

  const isLoading = phoneNumbersLoading || routingLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inbound-Einstellungen</h2>
          <p className="text-muted-foreground">
            Konfigurieren Sie, wie eingehende Anrufe behandelt werden
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Speichern
        </Button>
      </div>

      <Tabs defaultValue="global" className="space-y-4">
        <TabsList>
          <TabsTrigger value="global">
            <Settings2 className="h-4 w-4 mr-2" />
            Globale Einstellungen
          </TabsTrigger>
          <TabsTrigger value="hours">
            <Clock className="h-4 w-4 mr-2" />
            Geschäftszeiten
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Bot className="h-4 w-4 mr-2" />
            KI-Konfiguration
          </TabsTrigger>
          <TabsTrigger value="numbers">
            <Phone className="h-4 w-4 mr-2" />
            Nummern-Übersicht
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhoneIncoming className="h-5 w-5" />
                Standard-Begrüßung
              </CardTitle>
              <CardDescription>
                Diese Begrüßung wird verwendet, wenn keine spezifische Routing-Regel greift
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultGreeting">Begrüßungstext</Label>
                <Textarea
                  id="defaultGreeting"
                  value={settings.defaultGreeting}
                  onChange={(e) => handleChange('defaultGreeting', e.target.value)}
                  placeholder="Guten Tag, Sie sprechen mit..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Tipp: Verwenden Sie [Firma] als Platzhalter für den Firmennamen
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="afterHoursMessage">Außerhalb-Geschäftszeiten-Nachricht</Label>
                <Textarea
                  id="afterHoursMessage"
                  value={settings.afterHoursMessage}
                  onChange={(e) => handleChange('afterHoursMessage', e.target.value)}
                  placeholder="Vielen Dank für Ihren Anruf..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Geschäftszeiten
              </CardTitle>
              <CardDescription>
                Legen Sie fest, wann Anrufe entgegengenommen werden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Geschäftszeiten aktivieren</Label>
                  <p className="text-sm text-muted-foreground">
                    Außerhalb dieser Zeiten wird die Außerhalb-Nachricht abgespielt
                  </p>
                </div>
                <Switch
                  checked={settings.businessHoursEnabled}
                  onCheckedChange={(checked) => handleChange('businessHoursEnabled', checked)}
                />
              </div>

              {settings.businessHoursEnabled && (
                <>
                  <div className="space-y-4">
                    <Label>Montag - Freitag</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessHoursStart" className="text-sm text-muted-foreground">
                          Von
                        </Label>
                        <Input
                          id="businessHoursStart"
                          type="time"
                          value={settings.businessHoursStart}
                          onChange={(e) => handleChange('businessHoursStart', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="businessHoursEnd" className="text-sm text-muted-foreground">
                          Bis
                        </Label>
                        <Input
                          id="businessHoursEnd"
                          type="time"
                          value={settings.businessHoursEnd}
                          onChange={(e) => handleChange('businessHoursEnd', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Wochenend-Erreichbarkeit</Label>
                      <p className="text-sm text-muted-foreground">
                        Anrufe auch am Wochenende entgegennehmen
                      </p>
                    </div>
                    <Switch
                      checked={settings.weekendEnabled}
                      onCheckedChange={(checked) => handleChange('weekendEnabled', checked)}
                    />
                  </div>

                  {settings.weekendEnabled && (
                    <div className="space-y-4">
                      <Label>Samstag & Sonntag</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="weekendStart" className="text-sm text-muted-foreground">
                            Von
                          </Label>
                          <Input
                            id="weekendStart"
                            type="time"
                            value={settings.weekendStart}
                            onChange={(e) => handleChange('weekendStart', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="weekendEnd" className="text-sm text-muted-foreground">
                            Bis
                          </Label>
                          <Input
                            id="weekendEnd"
                            type="time"
                            value={settings.weekendEnd}
                            onChange={(e) => handleChange('weekendEnd', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                KI-Agent für Inbound
              </CardTitle>
              <CardDescription>
                Spezielle Einstellungen für den KI-Agent bei eingehenden Anrufen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="defaultInboundPrompt">Standard-Inbound-Prompt</Label>
                <Textarea
                  id="defaultInboundPrompt"
                  value={settings.defaultInboundPrompt}
                  onChange={(e) => handleChange('defaultInboundPrompt', e.target.value)}
                  placeholder="Du bist ein freundlicher Kundenservice-Agent..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Dieser Prompt wird verwendet, wenn keine kampagnenspezifische Konfiguration existiert
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Anrufgrund-Erkennung</Label>
                  <p className="text-sm text-muted-foreground">
                    KI erkennt automatisch den Grund des Anrufs (Support, Verkauf, etc.)
                  </p>
                </div>
                <Switch
                  checked={settings.callReasonDetection}
                  onCheckedChange={(checked) => handleChange('callReasonDetection', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Eskalation zu Mitarbeiter</Label>
                  <p className="text-sm text-muted-foreground">
                    Ermöglicht Übergabe an einen menschlichen Mitarbeiter bei Bedarf
                  </p>
                </div>
                <Switch
                  checked={settings.escalationEnabled}
                  onCheckedChange={(checked) => handleChange('escalationEnabled', checked)}
                />
              </div>

              {settings.escalationEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="escalationPhrase">Eskalations-Phrase</Label>
                  <Input
                    id="escalationPhrase"
                    value={settings.escalationPhrase}
                    onChange={(e) => handleChange('escalationPhrase', e.target.value)}
                    placeholder="Ich verbinde Sie mit einem Mitarbeiter"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rückruf-Angebot</Label>
                  <p className="text-sm text-muted-foreground">
                    KI bietet automatisch einen Rückruf an, wenn kein Mitarbeiter verfügbar ist
                  </p>
                </div>
                <Switch
                  checked={settings.callbackOffer}
                  onCheckedChange={(checked) => handleChange('callbackOffer', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="numbers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Telefonnummern-Übersicht
              </CardTitle>
              <CardDescription>
                Alle konfigurierten Telefonnummern und deren Routing-Regeln
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : !phoneNumbers?.length ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Noch keine Telefonnummern konfiguriert. Gehen Sie zu "Telefonie" um Nummern hinzuzufügen.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {phoneNumbers.map((number) => {
                    const routing = routingRules?.find(r => r.phone_number_id === number.id);
                    
                    return (
                      <div
                        key={number.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{number.phone_number}</span>
                            {number.friendly_name && (
                              <span className="text-sm text-muted-foreground">
                                ({number.friendly_name})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant={routing?.is_active ? 'default' : 'secondary'}>
                              {routing?.is_active ? 'Aktiv' : 'Inaktiv'}
                            </Badge>
                            <Badge variant="outline">
                              {getRoutingTypeLabel(routing?.routing_type || null)}
                            </Badge>
                            {routing?.campaign_id && (
                              <Badge variant="outline">
                                Kampagne: {getCampaignName(routing.campaign_id)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Bearbeiten
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
