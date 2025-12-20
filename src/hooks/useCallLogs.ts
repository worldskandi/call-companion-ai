import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type CallOutcome = 'answered' | 'no_answer' | 'busy' | 'voicemail' | 'interested' | 'not_interested' | 'callback_scheduled' | 'qualified';

export interface CallLog {
  id: string;
  user_id: string;
  lead_id: string;
  campaign_id: string | null;
  duration_seconds: number | null;
  outcome: CallOutcome | null;
  transcript: string | null;
  summary: string | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  lead_first_name?: string;
  lead_last_name?: string;
  lead_company?: string;
  lead_phone_number?: string;
  campaign_name?: string;
}

interface GetCallLogsParams {
  leadId?: string;
  campaignId?: string;
  outcome?: CallOutcome;
  limit?: number;
  offset?: number;
}

interface CreateCallLogParams {
  leadId: string;
  campaignId?: string;
}

interface UpdateCallLogParams {
  callId: string;
  durationSeconds?: number;
  outcome?: CallOutcome;
  transcript?: string;
  summary?: string;
  endedAt?: string;
}

export const useCallLogs = (params?: GetCallLogsParams) => {
  return useQuery({
    queryKey: ['call-logs', params],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_call_logs', {
        p_lead_id: params?.leadId || null,
        p_campaign_id: params?.campaignId || null,
        p_outcome: params?.outcome || null,
        p_limit: params?.limit || 50,
        p_offset: params?.offset || 0,
      });

      if (error) throw error;
      return data as CallLog[];
    },
  });
};

export const useCallLog = (callId: string | null) => {
  return useQuery({
    queryKey: ['call-log', callId],
    queryFn: async () => {
      if (!callId) return null;
      
      const { data, error } = await supabase.rpc('get_call_log', {
        p_call_id: callId,
      });

      if (error) throw error;
      return (data as CallLog[])[0] || null;
    },
    enabled: !!callId,
  });
};

export const useCreateCallLog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: CreateCallLogParams) => {
      const { data, error } = await supabase.rpc('create_call_log', {
        p_lead_id: params.leadId,
        p_campaign_id: params.campaignId || null,
      });

      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call-logs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
    },
    onError: (error) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateCallLog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: UpdateCallLogParams) => {
      const { data, error } = await supabase.rpc('update_call_log', {
        p_call_id: params.callId,
        p_duration_seconds: params.durationSeconds ?? null,
        p_outcome: params.outcome || null,
        p_transcript: params.transcript || null,
        p_summary: params.summary || null,
        p_ended_at: params.endedAt || null,
      });

      if (error) throw error;
      return data as boolean;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call-logs'] });
      queryClient.invalidateQueries({ queryKey: ['call-log'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Anruf aktualisiert',
        description: 'Die Anrufdaten wurden gespeichert.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
