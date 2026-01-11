import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone, Users, Megaphone, Clock, PhoneIncoming, PhoneOutgoing, TrendingUp, Calendar } from 'lucide-react';

interface SystemStats {
  totalUsers: number;
  totalLeads: number;
  totalCampaigns: number;
  totalCalls: number;
  totalCallMinutes: number;
  inboundCalls: number;
  outboundCalls: number;
  totalPhoneNumbers: number;
  callsToday: number;
  callsThisWeek: number;
  callsThisMonth: number;
}

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  colorClass = 'text-primary bg-primary/10'
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number | string;
  subValue?: string;
  colorClass?: string;
}) => (
  <div className="p-4 rounded-xl border bg-card">
    <div className="flex items-center gap-3 mb-2">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
    {subValue && (
      <p className="text-xs text-muted-foreground mt-2">{subValue}</p>
    )}
  </div>
);

export const SystemAnalyticsCard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-system-analytics'],
    queryFn: async (): Promise<SystemStats> => {
      // Get user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get leads count
      const { count: leadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      // Get campaigns count
      const { count: campaignsCount } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true });

      // Get phone numbers count
      const { count: phoneNumbersCount } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true });

      // Get call stats
      const { data: callData } = await supabase
        .from('call_logs')
        .select('duration_seconds, call_type, started_at');

      const totalCalls = callData?.length || 0;
      const totalCallMinutes = Math.round(
        (callData?.reduce((acc, call) => acc + (call.duration_seconds || 0), 0) || 0) / 60
      );
      const inboundCalls = callData?.filter(c => c.call_type === 'inbound').length || 0;
      const outboundCalls = callData?.filter(c => c.call_type === 'outbound').length || 0;

      // Time-based stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const callsToday = callData?.filter(c => new Date(c.started_at) >= today).length || 0;
      const callsThisWeek = callData?.filter(c => new Date(c.started_at) >= weekAgo).length || 0;
      const callsThisMonth = callData?.filter(c => new Date(c.started_at) >= monthAgo).length || 0;

      return {
        totalUsers: userCount || 0,
        totalLeads: leadsCount || 0,
        totalCampaigns: campaignsCount || 0,
        totalCalls,
        totalCallMinutes,
        inboundCalls,
        outboundCalls,
        totalPhoneNumbers: phoneNumbersCount || 0,
        callsToday,
        callsThisWeek,
        callsThisMonth,
      };
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System-Analytics</CardTitle>
          <CardDescription>Gesamtübersicht aller Daten</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          System-Analytics
        </CardTitle>
        <CardDescription>Gesamtübersicht aller Daten im System</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Benutzer"
            value={stats?.totalUsers || 0}
            colorClass="text-blue-500 bg-blue-500/10"
          />
          <StatCard
            icon={Users}
            label="Leads"
            value={stats?.totalLeads || 0}
            colorClass="text-green-500 bg-green-500/10"
          />
          <StatCard
            icon={Megaphone}
            label="Kampagnen"
            value={stats?.totalCampaigns || 0}
            colorClass="text-purple-500 bg-purple-500/10"
          />
          <StatCard
            icon={Phone}
            label="Telefonnummern"
            value={stats?.totalPhoneNumbers || 0}
            colorClass="text-orange-500 bg-orange-500/10"
          />
          <StatCard
            icon={Phone}
            label="Anrufe gesamt"
            value={stats?.totalCalls || 0}
            subValue={`${stats?.totalCallMinutes || 0} Minuten`}
          />
          <StatCard
            icon={PhoneIncoming}
            label="Eingehend"
            value={stats?.inboundCalls || 0}
            colorClass="text-emerald-500 bg-emerald-500/10"
          />
          <StatCard
            icon={PhoneOutgoing}
            label="Ausgehend"
            value={stats?.outboundCalls || 0}
            colorClass="text-amber-500 bg-amber-500/10"
          />
          <StatCard
            icon={Calendar}
            label="Heute"
            value={stats?.callsToday || 0}
            subValue={`Diese Woche: ${stats?.callsThisWeek || 0}`}
            colorClass="text-pink-500 bg-pink-500/10"
          />
        </div>
      </CardContent>
    </Card>
  );
};
