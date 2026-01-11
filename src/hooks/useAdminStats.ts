import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useWorkspace } from './useWorkspace';

export interface UsageStats {
  totalCalls: number;
  totalCallMinutes: number;
  totalLeads: number;
  totalCampaigns: number;
  apiCallsThisMonth: number;
  storageUsedMB: number;
}

export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_email?: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface ApiLimits {
  planId: string;
  callMinutesLimit: number;
  callMinutesUsed: number;
  apiCallsLimit: number;
  apiCallsUsed: number;
  leadsLimit: number;
  leadsUsed: number;
  teamMembersLimit: number;
  teamMembersUsed: number;
}

const PLAN_LIMITS: Record<string, Omit<ApiLimits, 'callMinutesUsed' | 'apiCallsUsed' | 'leadsUsed' | 'teamMembersUsed' | 'planId'>> = {
  free: {
    callMinutesLimit: 100,
    apiCallsLimit: 1000,
    leadsLimit: 100,
    teamMembersLimit: 1,
  },
  starter: {
    callMinutesLimit: 500,
    apiCallsLimit: 10000,
    leadsLimit: 1000,
    teamMembersLimit: 3,
  },
  professional: {
    callMinutesLimit: 2000,
    apiCallsLimit: 50000,
    leadsLimit: 10000,
    teamMembersLimit: 10,
  },
  enterprise: {
    callMinutesLimit: -1, // Unlimited
    apiCallsLimit: -1,
    leadsLimit: -1,
    teamMembersLimit: -1,
  },
};

export const useUsageStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-usage-stats', user?.id],
    queryFn: async (): Promise<UsageStats> => {
      if (!user) throw new Error('Not authenticated');

      // Get total calls and minutes
      const { data: callData } = await supabase
        .from('call_logs')
        .select('duration_seconds')
        .eq('user_id', user.id);

      const totalCalls = callData?.length || 0;
      const totalCallMinutes = Math.round(
        (callData?.reduce((acc, call) => acc + (call.duration_seconds || 0), 0) || 0) / 60
      );

      // Get total leads
      const { count: leadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get total campaigns
      const { count: campaignsCount } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get API calls this month (from usage_records if available)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: usageData } = await supabase
        .from('usage_records')
        .select('quantity')
        .eq('user_id', user.id)
        .eq('metric', 'api_calls')
        .gte('period_start', startOfMonth.toISOString().split('T')[0]);

      const apiCallsThisMonth = usageData?.reduce((acc, r) => acc + (r.quantity || 0), 0) || 0;

      return {
        totalCalls,
        totalCallMinutes,
        totalLeads: leadsCount || 0,
        totalCampaigns: campaignsCount || 0,
        apiCallsThisMonth,
        storageUsedMB: 0, // Placeholder for storage
      };
    },
    enabled: !!user,
  });
};

export const useAuditLog = (limit = 50) => {
  const { user } = useAuth();
  const { workspace } = useWorkspace();

  return useQuery({
    queryKey: ['admin-audit-log', workspace?.id, limit],
    queryFn: async (): Promise<AuditLogEntry[]> => {
      if (!user) throw new Error('Not authenticated');

      // Get activity logs - if workspace exists, get workspace logs, otherwise user logs
      let query = supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (workspace) {
        query = query.eq('workspace_id', workspace.id);
      } else {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get user emails for the log entries
      const userIds = [...new Set((data || []).map(log => log.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      const emailMap = new Map(profiles?.map(p => [p.id, p.email]) || []);

      return (data || []).map(log => ({
        ...log,
        user_email: emailMap.get(log.user_id) || 'Unbekannt',
        ip_address: log.ip_address ? String(log.ip_address) : null,
        metadata: log.metadata as Record<string, unknown> | null,
      }));
    },
    enabled: !!user,
  });
};

export const useApiLimits = () => {
  const { user } = useAuth();
  const { workspace, members } = useWorkspace();

  return useQuery({
    queryKey: ['admin-api-limits', user?.id, workspace?.id],
    queryFn: async (): Promise<ApiLimits> => {
      if (!user) throw new Error('Not authenticated');

      // Get subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan_id')
        .eq('user_id', user.id)
        .maybeSingle();

      const planId = subscription?.plan_id || 'free';
      const limits = PLAN_LIMITS[planId] || PLAN_LIMITS.free;

      // Get current usage
      const { data: callData } = await supabase
        .from('call_logs')
        .select('duration_seconds')
        .eq('user_id', user.id);

      const callMinutesUsed = Math.round(
        (callData?.reduce((acc, call) => acc + (call.duration_seconds || 0), 0) || 0) / 60
      );

      // Get leads count
      const { count: leadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get API calls this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: usageData } = await supabase
        .from('usage_records')
        .select('quantity')
        .eq('user_id', user.id)
        .eq('metric', 'api_calls')
        .gte('period_start', startOfMonth.toISOString().split('T')[0]);

      const apiCallsUsed = usageData?.reduce((acc, r) => acc + (r.quantity || 0), 0) || 0;

      return {
        planId,
        ...limits,
        callMinutesUsed,
        apiCallsUsed,
        leadsUsed: leadsCount || 0,
        teamMembersUsed: members?.length || 1,
      };
    },
    enabled: !!user,
  });
};

export const useLogActivity = () => {
  const { user } = useAuth();
  const { workspace } = useWorkspace();

  const logActivity = async (
    action: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: Record<string, string | number | boolean>
  ) => {
    if (!user) return;

    await supabase.from('activity_log').insert([{
      user_id: user.id,
      workspace_id: workspace?.id || undefined,
      action,
      resource_type: resourceType || null,
      resource_id: resourceId || null,
      metadata: metadata as Record<string, string | number | boolean> | null,
      user_agent: navigator.userAgent,
    }]);
  };

  return { logActivity };
};
