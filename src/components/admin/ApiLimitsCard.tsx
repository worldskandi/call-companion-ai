import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useApiLimits } from '@/hooks/useAdminStats';
import { AlertTriangle } from 'lucide-react';

const LimitItem = ({ 
  label, 
  used, 
  limit, 
  unit 
}: { 
  label: string; 
  used: number; 
  limit: number; 
  unit?: string;
}) => {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          {isAtLimit && <AlertTriangle className="w-4 h-4 text-destructive" />}
          <span className="text-sm text-muted-foreground">
            {used.toLocaleString()}{unit ? ` ${unit}` : ''} 
            {isUnlimited ? (
              <span className="text-primary ml-1">/ Unbegrenzt</span>
            ) : (
              <span> / {limit.toLocaleString()}{unit ? ` ${unit}` : ''}</span>
            )}
          </span>
        </div>
      </div>
      {!isUnlimited && (
        <Progress 
          value={percentage} 
          className={isAtLimit ? 'bg-destructive/20' : isNearLimit ? 'bg-warning/20' : ''} 
        />
      )}
    </div>
  );
};

const getPlanDisplayName = (planId: string): string => {
  const names: Record<string, string> = {
    free: 'Free',
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise',
  };
  return names[planId] || planId;
};

const getPlanBadgeVariant = (planId: string): 'default' | 'secondary' | 'outline' => {
  if (planId === 'enterprise') return 'default';
  if (planId === 'professional') return 'default';
  return 'secondary';
};

export const ApiLimitsCard = () => {
  const { data: limits, isLoading } = useApiLimits();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API-Limits & Kontingente</CardTitle>
          <CardDescription>Nutzungslimits basierend auf Ihrem Plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>API-Limits & Kontingente</CardTitle>
            <CardDescription>Nutzungslimits basierend auf Ihrem Plan</CardDescription>
          </div>
          <Badge variant={getPlanBadgeVariant(limits?.planId || 'free')}>
            {getPlanDisplayName(limits?.planId || 'free')} Plan
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <LimitItem 
            label="Anrufminuten" 
            used={limits?.callMinutesUsed || 0} 
            limit={limits?.callMinutesLimit || 100}
            unit="min"
          />
          <LimitItem 
            label="API-Aufrufe" 
            used={limits?.apiCallsUsed || 0} 
            limit={limits?.apiCallsLimit || 1000}
          />
          <LimitItem 
            label="Leads" 
            used={limits?.leadsUsed || 0} 
            limit={limits?.leadsLimit || 100}
          />
          <LimitItem 
            label="Team-Mitglieder" 
            used={limits?.teamMembersUsed || 1} 
            limit={limits?.teamMembersLimit || 1}
          />
        </div>
      </CardContent>
    </Card>
  );
};
