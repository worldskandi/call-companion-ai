import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLeads, useLead } from '@/hooks/useLeads';
import { useCampaigns, useCampaign } from '@/hooks/useCampaigns';
import { useCreateCallLog, useUpdateCallLog } from '@/hooks/useCallLogs';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Phone, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Megaphone,
  PhoneCall,
  PhoneOff,
  User,
  Building2,
  Clock,
  Loader2,
  Globe,
  Smartphone
} from 'lucide-react';
import LiveKitCall from '@/components/LiveKitCall';

type CallStatus = 'idle' | 'connecting' | 'ringing' | 'in-progress' | 'completed' | 'failed';
type CallMode = 'twilio' | 'web';

const NewCall = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const preselectedLeadId = searchParams.get('leadId');

  const [selectedLeadId, setSelectedLeadId] = useState<string>(preselectedLeadId || '');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [callMode, setCallMode] = useState<CallMode>('web');
  const [callSid, setCallSid] = useState<string | null>(null);
  const [callLogId, setCallLogId] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);

  const { data: leads } = useLeads();
  const { data: campaigns } = useCampaigns(true);
  const { data: selectedLead } = useLead(selectedLeadId || null);
  const { data: selectedCampaign } = useCampaign(selectedCampaignId || null);
  
  const createCallLog = useCreateCallLog();
  const updateCallLog = useUpdateCallLog();

  // Update duration timer for Twilio calls
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (callStatus === 'in-progress' && callStartTime && callMode === 'twilio') {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTime.getTime()) / 1000);
        setCallDuration(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus, callStartTime, callMode]);

  if (authLoading) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="animate-pulse text-primary">Laden...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Twilio call handlers
  const startTwilioCall = async () => {
    if (!selectedLead) {
      toast({
        title: 'Fehler',
        description: 'Bitte wähle einen Lead aus.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCallStatus('connecting');

      // Create call log entry
      const logId = await createCallLog.mutateAsync({
        leadId: selectedLead.id,
        campaignId: selectedCampaignId || undefined,
      });
      setCallLogId(logId);

      // Start the call via Edge Function
      const { data, error } = await supabase.functions.invoke('start-call', {
        body: {
          to: selectedLead.phone_number,
          campaignPrompt: selectedCampaign?.ai_prompt || '',
          leadName: `${selectedLead.first_name} ${selectedLead.last_name || ''}`.trim(),
          leadCompany: selectedLead.company || '',
          leadId: selectedLead.id,
          campaignId: selectedCampaignId || undefined,
        },
      });

      if (error) throw error;

      if (data?.callSid) {
        setCallSid(data.callSid);
        setCallStatus('ringing');
        setCallStartTime(new Date());

        toast({
          title: 'Anruf gestartet',
          description: `Rufe ${selectedLead.first_name} an...`,
        });

        // Simulate call progression (in real scenario, use webhooks)
        setTimeout(() => {
          setCallStatus('in-progress');
        }, 3000);
      } else {
        throw new Error('Kein Call-SID erhalten');
      }

    } catch (error: unknown) {
      console.error('Error starting call:', error);
      setCallStatus('failed');
      
      const errorMessage = error instanceof Error ? error.message : 'Anruf konnte nicht gestartet werden';
      toast({
        title: 'Fehler',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const endTwilioCall = async () => {
    setCallStatus('completed');
    
    if (callLogId && callDuration > 0) {
      await updateCallLog.mutateAsync({
        callId: callLogId,
        durationSeconds: callDuration,
        endedAt: new Date().toISOString(),
        outcome: 'answered',
      });
    }

    toast({
      title: 'Anruf beendet',
      description: `Dauer: ${formatDuration(callDuration)}`,
    });

    // Reset after a short delay
    setTimeout(() => {
      setCallStatus('idle');
      setCallSid(null);
      setCallLogId(null);
      setCallDuration(0);
      setCallStartTime(null);
    }, 2000);
  };

  // LiveKit/Web call handlers
  const handleWebCallStarted = async () => {
    if (!selectedLead) return;
    
    try {
      const logId = await createCallLog.mutateAsync({
        leadId: selectedLead.id,
        campaignId: selectedCampaignId || undefined,
      });
      setCallLogId(logId);
      setCallStatus('in-progress');
    } catch (error) {
      console.error('Error creating call log:', error);
    }
  };

  const handleWebCallEnded = async (durationSeconds: number) => {
    if (callLogId) {
      await updateCallLog.mutateAsync({
        callId: callLogId,
        durationSeconds,
        endedAt: new Date().toISOString(),
        outcome: 'answered',
      });
    }
    
    setCallStatus('idle');
    setCallLogId(null);
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'connecting': return 'Verbinde...';
      case 'ringing': return 'Klingelt...';
      case 'in-progress': return 'Gespräch läuft';
      case 'completed': return 'Beendet';
      case 'failed': return 'Fehlgeschlagen';
      default: return 'Bereit';
    }
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case 'connecting':
      case 'ringing': return 'text-warning';
      case 'in-progress': return 'text-success';
      case 'completed': return 'text-primary';
      case 'failed': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-lg">AI Cold Caller</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" className="gap-2" onClick={() => navigate('/')}>
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="gap-2" onClick={() => navigate('/leads')}>
              <Users className="w-4 h-4" />
              Leads
            </Button>
            <Button variant="ghost" className="gap-2" onClick={() => navigate('/campaigns')}>
              <Megaphone className="w-4 h-4" />
              Kampagnen
            </Button>
            <Button variant="secondary" className="gap-2">
              <PhoneCall className="w-4 h-4" />
              Anrufe
            </Button>
            <Button variant="ghost" className="gap-2">
              <Settings className="w-4 h-4" />
              Einstellungen
            </Button>
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.email}
            </span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2">Neuer Anruf</h1>
            <p className="text-muted-foreground">
              Wähle einen Lead und starte einen KI-gestützten Anruf
            </p>
          </div>

          {/* Call Card */}
          <div className="glass-panel p-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
            {/* Call Mode Tabs */}
            <Tabs 
              value={callMode} 
              onValueChange={(v) => setCallMode(v as CallMode)} 
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="web" className="gap-2" disabled={callStatus !== 'idle'}>
                  <Globe className="w-4 h-4" />
                  Web-Anruf (LiveKit)
                </TabsTrigger>
                <TabsTrigger value="twilio" className="gap-2" disabled={callStatus !== 'idle'}>
                  <Smartphone className="w-4 h-4" />
                  Telefon (Twilio)
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Lead Selection */}
            <div className="space-y-4 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-medium">Lead auswählen</label>
                <Select 
                  value={selectedLeadId} 
                  onValueChange={setSelectedLeadId}
                  disabled={callStatus !== 'idle'}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Lead auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {leads?.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.first_name} {lead.last_name} {lead.company && `- ${lead.company}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Kampagne (optional)</label>
                <Select 
                  value={selectedCampaignId || "none"} 
                  onValueChange={(value) => setSelectedCampaignId(value === "none" ? "" : value)}
                  disabled={callStatus !== 'idle'}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Keine Kampagne" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keine Kampagne</SelectItem>
                    {campaigns?.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Selected Lead Info */}
            {selectedLead && (
              <div className="p-4 rounded-xl bg-muted/50 mb-8 animate-fade-in">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {selectedLead.first_name} {selectedLead.last_name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {selectedLead.company && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {selectedLead.company}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {selectedLead.phone_number}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Call Interface - Web (LiveKit) */}
            {callMode === 'web' && selectedLead && (
              <LiveKitCall
                leadId={selectedLead.id}
                leadName={`${selectedLead.first_name} ${selectedLead.last_name || ''}`.trim()}
                campaignId={selectedCampaignId || undefined}
                campaignPrompt={selectedCampaign?.ai_prompt || undefined}
                onCallStarted={handleWebCallStarted}
                onCallEnded={handleWebCallEnded}
              />
            )}

            {/* Call Interface - Twilio */}
            {callMode === 'twilio' && (
              <>
                {/* Call Status Display */}
                {callStatus !== 'idle' && (
                  <div className="text-center mb-8 animate-scale-in">
                    <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${
                      callStatus === 'in-progress' ? 'bg-success/10' : 'bg-muted'
                    }`}>
                      {(callStatus === 'connecting' || callStatus === 'ringing') && (
                        <Loader2 className="w-5 h-5 animate-spin text-warning" />
                      )}
                      {callStatus === 'in-progress' && (
                        <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                      )}
                      <span className={`font-medium ${getStatusColor()}`}>
                        {getStatusText()}
                      </span>
                      {callStatus === 'in-progress' && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {formatDuration(callDuration)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Call Button */}
                <div className="flex justify-center">
                  {callStatus === 'idle' || callStatus === 'completed' || callStatus === 'failed' ? (
                    <Button
                      size="lg"
                      onClick={startTwilioCall}
                      disabled={!selectedLeadId || createCallLog.isPending}
                      className="h-16 px-12 text-lg gap-3 bg-primary hover:bg-primary/90 rounded-2xl shadow-glow hover:shadow-glow-lg transition-all"
                    >
                      <Phone className="w-6 h-6" />
                      Anruf starten
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={endTwilioCall}
                      variant="destructive"
                      className="h-16 px-12 text-lg gap-3 rounded-2xl"
                    >
                      <PhoneOff className="w-6 h-6" />
                      Auflegen
                    </Button>
                  )}
                </div>
              </>
            )}

            {/* No lead selected message */}
            {!selectedLead && callMode === 'web' && (
              <div className="text-center text-muted-foreground py-8">
                Bitte wähle einen Lead aus, um einen Anruf zu starten.
              </div>
            )}
          </div>

          {/* Info Note */}
          <div className="text-center text-sm text-muted-foreground mt-6 animate-fade-in space-y-2" style={{ animationDelay: '200ms' }}>
            <p>
              {callMode === 'web' 
                ? 'Web-Anrufe nutzen LiveKit für Echtzeit-Kommunikation mit dem KI-Agenten.'
                : 'Telefon-Anrufe nutzen Twilio, um echte Telefonnummern anzurufen.'
              }
            </p>
            <p className="text-xs opacity-75">
              Alle Anrufe werden aufgezeichnet und transkribiert.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewCall;
