import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCallLogs, CallOutcome } from '@/hooks/useCallLogs';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Clock,
  User,
  Building2,
  CheckCircle2,
  Megaphone,
  PhoneIncoming,
  PhoneOutgoing
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion } from 'framer-motion';

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
  answered: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  no_answer: 'bg-muted text-muted-foreground',
  busy: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  voicemail: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  interested: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  not_interested: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  callback_scheduled: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  qualified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

type CallTypeFilter = 'all' | 'inbound' | 'outbound';

const Calls = () => {
  const navigate = useNavigate();
  
  const [callTypeFilter, setCallTypeFilter] = useState<CallTypeFilter>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<CallOutcome | 'all'>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');

  const { data: callLogs, isLoading } = useCallLogs({
    outcome: outcomeFilter === 'all' ? undefined : outcomeFilter,
    campaignId: campaignFilter === 'all' ? undefined : campaignFilter,
    callType: callTypeFilter === 'all' ? undefined : callTypeFilter,
  });
  const { data: campaigns } = useCampaigns();

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Anruf-Historie</h1>
          <p className="text-muted-foreground">
            Alle durchgeführten Anrufe und deren Ergebnisse
          </p>
        </div>
        <Button 
          className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg"
          onClick={() => navigate('/app/calls/new')}
        >
          <Plus className="w-4 h-4" />
          Neuer Anruf
        </Button>
      </motion.div>

      {/* Call Type Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Tabs value={callTypeFilter} onValueChange={(v) => setCallTypeFilter(v as CallTypeFilter)}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all" className="gap-2">
              Alle
            </TabsTrigger>
            <TabsTrigger value="outbound" className="gap-2">
              <PhoneOutgoing className="w-4 h-4" />
              Ausgehend
            </TabsTrigger>
            <TabsTrigger value="inbound" className="gap-2">
              <PhoneIncoming className="w-4 h-4" />
              Eingehend
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Additional Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-4 mb-6"
      >
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
      </motion.div>

      {/* Call Logs */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="glass-card p-8 text-center">
            <div className="animate-pulse text-muted-foreground">Laden...</div>
          </div>
        ) : callLogs && callLogs.length > 0 ? (
          callLogs.map((call, index) => (
            <motion.div 
              key={call.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.01]"
              onClick={() => navigate(`/app/calls/${call.id}`)}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Lead Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    {/* Call Type Indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                      call.call_type === 'inbound' 
                        ? 'bg-accent text-white' 
                        : 'bg-primary text-white'
                    }`}>
                      {call.call_type === 'inbound' ? (
                        <PhoneIncoming className="w-3 h-3" />
                      ) : (
                        <PhoneOutgoing className="w-3 h-3" />
                      )}
                    </div>
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
                  {/* Call Type Badge */}
                  <Badge variant={call.call_type === 'inbound' ? 'secondary' : 'outline'}>
                    {call.call_type === 'inbound' ? 'Eingehend' : 'Ausgehend'}
                  </Badge>

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
            </motion.div>
          ))
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-16 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Keine Anrufe vorhanden</h3>
            <p className="text-muted-foreground mb-6">
              {callTypeFilter === 'inbound' 
                ? 'Es wurden noch keine eingehenden Anrufe empfangen.'
                : callTypeFilter === 'outbound'
                ? 'Starte deinen ersten ausgehenden Anruf.'
                : 'Starte deinen ersten Anruf, um die Historie zu sehen.'}
            </p>
            <Button onClick={() => navigate('/app/calls/new')} className="gap-2">
              <Plus className="w-4 h-4" />
              Ersten Anruf starten
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Calls;