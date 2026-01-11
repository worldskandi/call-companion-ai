import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CallAnalytics {
  date: string;
  inbound_count: number;
  outbound_count: number;
  total_duration: number;
  success_count: number;
}

export interface CampaignAnalytics {
  campaign_id: string;
  campaign_name: string;
  total_calls: number;
  successful_calls: number;
  avg_duration: number;
  success_rate: number;
}

export const useCallAnalytics = (days: number = 30) => {
  return useQuery({
    queryKey: ['call-analytics', days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_call_analytics', {
        p_days: days,
      });

      if (error) throw error;
      return data as CallAnalytics[];
    },
  });
};

export const useCampaignAnalytics = () => {
  return useQuery({
    queryKey: ['campaign-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_campaign_analytics');

      if (error) throw error;
      return data as CampaignAnalytics[];
    },
  });
};