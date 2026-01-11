import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUsageStats } from '@/hooks/useAdminStats';
import { Phone, Clock, Users, Megaphone, Zap, HardDrive } from 'lucide-react';

const StatItem = ({ 
  icon: Icon, 
  label, 
  value, 
  unit 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number | string; 
  unit?: string;
}) => (
  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">
        {value}
        {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
      </p>
    </div>
  </div>
);

export const UsageStatsCard = () => {
  const { data: stats, isLoading } = useUsageStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nutzungsstatistiken</CardTitle>
          <CardDescription>Übersicht über die Workspace-Nutzung</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutzungsstatistiken</CardTitle>
        <CardDescription>Übersicht über die Workspace-Nutzung</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatItem 
            icon={Phone} 
            label="Gesamte Anrufe" 
            value={stats?.totalCalls || 0} 
          />
          <StatItem 
            icon={Clock} 
            label="Anrufminuten" 
            value={stats?.totalCallMinutes || 0} 
            unit="min"
          />
          <StatItem 
            icon={Users} 
            label="Leads" 
            value={stats?.totalLeads || 0} 
          />
          <StatItem 
            icon={Megaphone} 
            label="Kampagnen" 
            value={stats?.totalCampaigns || 0} 
          />
          <StatItem 
            icon={Zap} 
            label="API-Aufrufe (Monat)" 
            value={stats?.apiCallsThisMonth || 0} 
          />
          <StatItem 
            icon={HardDrive} 
            label="Speicherplatz" 
            value={stats?.storageUsedMB || 0} 
            unit="MB"
          />
        </div>
      </CardContent>
    </Card>
  );
};
