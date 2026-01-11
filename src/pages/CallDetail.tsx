import { useParams, useNavigate } from 'react-router-dom';
import { useCallLog, CallOutcome } from '@/hooks/useCallLogs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Phone, 
  Clock, 
  Calendar, 
  Building2, 
  User, 
  MessageSquare,
  FileText,
  RefreshCw
} from 'lucide-react';
import { format, formatDuration, intervalToDuration } from 'date-fns';
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
  answered: 'bg-blue-100 text-blue-700 border-blue-200',
  no_answer: 'bg-gray-100 text-gray-700 border-gray-200',
  busy: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  voicemail: 'bg-orange-100 text-orange-700 border-orange-200',
  interested: 'bg-green-100 text-green-700 border-green-200',
  not_interested: 'bg-red-100 text-red-700 border-red-200',
  callback_scheduled: 'bg-purple-100 text-purple-700 border-purple-200',
  qualified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

interface TranscriptEntry {
  speaker: 'agent' | 'user';
  text: string;
  timestamp?: number;
}

const CallDetail = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const { data: call, isLoading } = useCallLog(callId || null);

  const formatCallDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
    return formatDuration(duration, { locale: de, format: ['minutes', 'seconds'] });
  };

  const parseTranscript = (transcript: string | null): TranscriptEntry[] => {
    if (!transcript) return [];
    
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(transcript);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // If not JSON, parse as plain text with speaker markers
      const lines = transcript.split('\n').filter(line => line.trim());
      return lines.map(line => {
        const isAgent = line.toLowerCase().startsWith('agent:') || line.toLowerCase().startsWith('ai:');
        const text = line.replace(/^(agent|ai|user|lead|kunde):\s*/i, '');
        return {
          speaker: isAgent ? 'agent' : 'user',
          text: text.trim(),
        };
      });
    }
    return [];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Laden...</div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Anruf nicht gefunden</p>
        <Button variant="outline" onClick={() => navigate('/app/calls')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zur Übersicht
        </Button>
      </div>
    );
  }

  const transcriptEntries = parseTranscript(call.transcript);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/calls')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Anruf-Details</h1>
          <p className="text-muted-foreground">
            {format(new Date(call.started_at), 'PPpp', { locale: de })}
          </p>
        </div>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => navigate(`/app/calls/new?leadId=${call.lead_id}`)}
        >
          <RefreshCw className="w-4 h-4" />
          Erneut anrufen
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Card */}
          {call.summary && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">AI-Zusammenfassung</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {call.summary}
              </p>
            </div>
          )}

          {/* Transcript */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Transkript</h2>
            </div>
            
            {transcriptEntries.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {transcriptEntries.map((entry, index) => (
                  <div 
                    key={index}
                    className={`flex ${entry.speaker === 'agent' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        entry.speaker === 'agent' 
                          ? 'bg-primary/10 text-foreground rounded-tl-sm' 
                          : 'bg-muted text-foreground rounded-tr-sm'
                      }`}
                    >
                      <p className="text-xs font-medium mb-1 opacity-70">
                        {entry.speaker === 'agent' ? 'AI Agent' : 'Kunde'}
                      </p>
                      <p className="text-sm">{entry.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : call.transcript ? (
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {call.transcript}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Kein Transkript verfügbar
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Call Info */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Anruf-Info</h2>
            
            <div className="space-y-4">
              {call.outcome && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ergebnis</span>
                  <Badge className={outcomeColors[call.outcome]}>
                    {outcomeLabels[call.outcome]}
                  </Badge>
                </div>
              )}
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Dauer
                </span>
                <span className="font-medium">
                  {formatCallDuration(call.duration_seconds)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Datum
                </span>
                <span className="font-medium">
                  {format(new Date(call.started_at), 'dd.MM.yyyy', { locale: de })}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Uhrzeit
                </span>
                <span className="font-medium">
                  {format(new Date(call.started_at), 'HH:mm', { locale: de })} Uhr
                </span>
              </div>

              {call.campaign_name && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Kampagne</span>
                    <span className="font-medium">{call.campaign_name}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Lead Info */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Lead-Info</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {call.lead_first_name} {call.lead_last_name}
                  </p>
                  {call.lead_company && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {call.lead_company}
                    </p>
                  )}
                </div>
              </div>
              
              <Separator />
              
              {call.lead_phone_number && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{call.lead_phone_number}</span>
                </div>
              )}
              
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => navigate(`/app/leads/${call.lead_id}`)}
              >
                <User className="w-4 h-4" />
                Lead-Profil öffnen
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CallDetail;
