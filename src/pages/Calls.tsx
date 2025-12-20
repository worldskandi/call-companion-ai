import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCallLogs, CallOutcome } from '@/hooks/useCallLogs';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Phone, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Megaphone,
  PhoneCall,
  Plus,
  Clock,
  User,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const outcomeLabels: Record<CallOutcome, string> = {
  answered: 'Angenommen',
  no_answer: 'Keine Antwort',
  busy: 'Besetzt',
  voicemail: 'Mailbox',
  interested: 'Interessiert',
  not_interested: 'Kein Interesse',
  callback_scheduled: 'Rückruf geplant',
  qualified: 'Qualifiziert',
};

const outcomeColors: Record<CallOutcome, string> = {
  answered: 'bg-blue-100 text-blue-700',
  no_answer: 'bg-gray-100 text-gray-700',
  busy: 'bg-yellow-100 text-yellow-700',
  voicemail: 'bg-orange-100 text-orange-700',
  interested: 'bg-green-100 text-green-700',
  not_interested: 'bg-red-100 text-red-700',
  callback_scheduled: 'bg-purple-100 text-purple-700',
  qualified: 'bg-emerald-100 text-emerald-700',
};

const Calls = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [outcomeFilter, setOutcomeFilter] = useState<CallOutcome | 'all'>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');

  const { data: callLogs, isLoading } = useCallLogs({
    outcome: outcomeFilter === 'all' ? undefined : outcomeFilter,
    campaignId: campaignFilter === 'all' ? undefined : campaignFilter,
  });
  const { data: campaigns } = useCampaigns();

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

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-2">Anruf-Historie</h1>
            <p className="text-muted-foreground">
              Alle durchgeführten Anrufe und deren Ergebnisse
            </p>
          </div>
          <Button 
            className="gap-2 bg-primary hover:bg-primary/90 shadow-glow"
            onClick={() => navigate('/calls/new')}
          >
            <Plus className="w-4 h-4" />
            Neuer Anruf
          </Button>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={outcomeFilter} onValueChange={(v) => setOutcomeFilter(v as CallOutcome | 'all')}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Ergebnis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Ergebnisse</SelectItem>
                <SelectItem value="answered">Angenommen</SelectItem>
                <SelectItem value="interested">Interessiert</SelectItem>
                <SelectItem value="callback_scheduled">Rückruf geplant</SelectItem>
                <SelectItem value="qualified">Qualifiziert</SelectItem>
                <SelectItem value="not_interested">Kein Interesse</SelectItem>
                <SelectItem value="no_answer">Keine Antwort</SelectItem>
                <SelectItem value="busy">Besetzt</SelectItem>
                <SelectItem value="voicemail">Mailbox</SelectItem>
              </SelectContent>
            </Select>
            <Select value={campaignFilter} onValueChange={setCampaignFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Kampagne" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kampagnen</SelectItem>
                {campaigns?.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Call Logs */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="glass-card p-8 text-center">
              <div className="animate-pulse text-muted-foreground">Laden...</div>
            </div>
          ) : callLogs && callLogs.length > 0 ? (
            callLogs.map((call, index) => (
              <div 
                key={call.id}
                className="glass-card p-6 animate-fade-in cursor-pointer hover:shadow-lg transition-shadow"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Lead Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {call.lead_first_name} {call.lead_last_name}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {call.lead_company && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {call.lead_company}
                          </span>
                        )}
                        {call.campaign_name && (
                          <span className="flex items-center gap-1">
                            <Megaphone className="w-3 h-3" />
                            {call.campaign_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Call Details */}
                  <div className="flex flex-wrap items-center gap-3">
                    {call.duration_seconds && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {formatDuration(call.duration_seconds)}
                      </span>
                    )}
                    
                    {call.outcome && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${outcomeColors[call.outcome]}`}>
                        {outcomeLabels[call.outcome]}
                      </span>
                    )}

                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(call.started_at), { addSuffix: true, locale: de })}
                    </span>
                  </div>
                </div>

                {/* Summary */}
                {call.summary && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {call.summary}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="glass-card p-16 text-center animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Keine Anrufe vorhanden</h3>
              <p className="text-muted-foreground mb-6">
                Starte deinen ersten Anruf, um die Historie zu sehen.
              </p>
              <Button onClick={() => navigate('/calls/new')} className="gap-2">
                <Plus className="w-4 h-4" />
                Ersten Anruf starten
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Calls;
