import { useParams, useNavigate } from 'react-router-dom';
import { useLead, useUpdateLead, LeadStatus } from '@/hooks/useLeads';
import { useCallLogs, CallOutcome } from '@/hooks/useCallLogs';
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
  Mail,
  MessageSquare,
  FileText,
  Edit2,
  PhoneCall,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const statusLabels: Record<LeadStatus, string> = {
  new: 'Neu',
  called: 'Angerufen',
  interested: 'Interessiert',
  callback: 'Rückruf',
  not_interested: 'Kein Interesse',
  qualified: 'Qualifiziert',
};

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  called: 'bg-gray-100 text-gray-700 border-gray-200',
  interested: 'bg-green-100 text-green-700 border-green-200',
  callback: 'bg-purple-100 text-purple-700 border-purple-200',
  not_interested: 'bg-red-100 text-red-700 border-red-200',
  qualified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

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

const outcomeIcons: Record<CallOutcome, typeof CheckCircle2> = {
  answered: PhoneCall,
  no_answer: XCircle,
  busy: AlertCircle,
  voicemail: MessageSquare,
  interested: CheckCircle2,
  not_interested: XCircle,
  callback_scheduled: Calendar,
  qualified: CheckCircle2,
};

const LeadDetail = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const { data: lead, isLoading: leadLoading } = useLead(leadId || null);
  const { data: callLogs, isLoading: callsLoading } = useCallLogs({ leadId: leadId || undefined });

  const formatCallDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (leadLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Laden...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Lead nicht gefunden</p>
        <Button variant="outline" onClick={() => navigate('/app/leads')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zur Übersicht
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/leads')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              {lead.first_name} {lead.last_name}
            </h1>
            <Badge className={statusColors[lead.status]}>
              {statusLabels[lead.status]}
            </Badge>
          </div>
          {lead.company && (
            <p className="text-muted-foreground flex items-center gap-1 mt-1">
              <Building2 className="w-4 h-4" />
              {lead.company}
            </p>
          )}
        </div>
        <Button 
          className="gap-2"
          onClick={() => navigate(`/app/calls/new?leadId=${lead.id}`)}
        >
          <Phone className="w-4 h-4" />
          Anrufen
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Aktivitäten</h2>
            </div>

            {callsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse text-muted-foreground">Laden...</div>
              </div>
            ) : callLogs && callLogs.length > 0 ? (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                
                <div className="space-y-6">
                  {callLogs.map((call, index) => {
                    const OutcomeIcon = call.outcome ? outcomeIcons[call.outcome] : PhoneCall;
                    
                    return (
                      <div 
                        key={call.id}
                        className="relative flex gap-4 cursor-pointer group"
                        onClick={() => navigate(`/app/calls/${call.id}`)}
                      >
                        {/* Timeline dot */}
                        <div className="relative z-10 w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <OutcomeIcon className="w-4 h-4 text-primary" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 glass-card p-4 group-hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-medium">
                                Anruf
                                {call.outcome && (
                                  <span className="text-muted-foreground font-normal ml-2">
                                    — {outcomeLabels[call.outcome]}
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {format(new Date(call.started_at), 'PPp', { locale: de })}
                              </p>
                            </div>
                            <div className="text-right text-sm">
                              <p className="text-muted-foreground">
                                {formatCallDuration(call.duration_seconds)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(call.started_at), { addSuffix: true, locale: de })}
                              </p>
                            </div>
                          </div>
                          
                          {call.summary && (
                            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                              {call.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <PhoneCall className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">Noch keine Anrufe mit diesem Lead</p>
                <Button 
                  onClick={() => navigate(`/app/calls/new?leadId=${lead.id}`)}
                  className="gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Ersten Anruf starten
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Kontaktdaten</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {lead.first_name} {lead.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Lead
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{lead.phone_number}</span>
              </div>
              
              {lead.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${lead.email}`} className="hover:text-primary">
                    {lead.email}
                  </a>
                </div>
              )}
              
              {lead.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span>{lead.company}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Notizen</h2>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {lead.notes}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Statistiken</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">
                  {callLogs?.length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Anrufe</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">
                  {callLogs?.reduce((acc, call) => acc + (call.duration_seconds || 0), 0) 
                    ? formatCallDuration(callLogs.reduce((acc, call) => acc + (call.duration_seconds || 0), 0))
                    : '-'}
                </p>
                <p className="text-xs text-muted-foreground">Gesamtdauer</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Erstellt</span>
                <span>{format(new Date(lead.created_at), 'dd.MM.yyyy', { locale: de })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aktualisiert</span>
                <span>{formatDistanceToNow(new Date(lead.updated_at), { addSuffix: true, locale: de })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
