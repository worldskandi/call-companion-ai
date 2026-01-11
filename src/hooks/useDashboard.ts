import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  total_leads: number;
  total_campaigns: number;
  total_calls: number;
  calls_today: number;
  inbound_calls_today: number;
  outbound_calls_today: number;
  missed_calls_today: number;
  interested_leads: number;
  avg_call_duration_seconds: number;
  success_rate: number;
}

export interface RecentActivity {
  activity_type: 'call' | 'lead';
  activity_id: string;
  title: string;
  description: string;
  created_at: string;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_stats');

      if (error) throw error;
      return (data as DashboardStats[])[0] || {
        total_leads: 0,
        total_campaigns: 0,
        total_calls: 0,
        calls_today: 0,
        inbound_calls_today: 0,
        outbound_calls_today: 0,
        missed_calls_today: 0,
        interested_leads: 0,
        avg_call_duration_seconds: 0,
        success_rate: 0,
      };
    },
  });
};

export const useRecentActivity = (limit: number = 10) => {
  return useQuery({
    queryKey: ['recent-activity', limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_recent_activity', {
        p_limit: limit,
      });

      if (error) throw error;
      return data as RecentActivity[];
    },
  });
};

export const formatDuration = (seconds: number): string => {
  if (!seconds || seconds === 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};