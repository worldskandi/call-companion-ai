import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Calendar, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Subscription {
  id: string;
  plan_id: string;
  status: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_ends_at: string | null;
  cancel_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

const getPlanDetails = (planId: string) => {
  const plans: Record<string, { name: string; price: string; features: string[] }> = {
    free: {
      name: 'Free',
      price: '€0/Monat',
      features: ['100 Anrufminuten', '100 Leads', '1 Team-Mitglied'],
    },
    starter: {
      name: 'Starter',
      price: '€49/Monat',
      features: ['500 Anrufminuten', '1.000 Leads', '3 Team-Mitglieder'],
    },
    professional: {
      name: 'Professional',
      price: '€149/Monat',
      features: ['2.000 Anrufminuten', '10.000 Leads', '10 Team-Mitglieder'],
    },
    enterprise: {
      name: 'Enterprise',
      price: 'Individuell',
      features: ['Unbegrenzte Anrufminuten', 'Unbegrenzte Leads', 'Unbegrenzte Team-Mitglieder'],
    },
  };
  return plans[planId] || plans.free;
};

const getStatusBadge = (status: string | null) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Aktiv</Badge>;
    case 'trialing':
      return <Badge variant="secondary"><Calendar className="w-3 h-3 mr-1" /> Testphase</Badge>;
    case 'canceled':
      return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" /> Gekündigt</Badge>;
    case 'past_due':
      return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" /> Überfällig</Badge>;
    default:
      return <Badge variant="outline">{status || 'Unbekannt'}</Badge>;
  }
};

export const SubscriptionCard = () => {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['admin-subscription'],
    queryFn: async (): Promise<Subscription | null> => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Abonnement</CardTitle>
          <CardDescription>Plan und Rechnungsinformationen</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40" />
        </CardContent>
      </Card>
    );
  }

  const plan = getPlanDetails(subscription?.plan_id || 'free');
  const daysRemaining = subscription?.current_period_end
    ? Math.max(0, Math.ceil((new Date(subscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const periodProgress = subscription?.current_period_start && subscription?.current_period_end
    ? Math.min(100, ((Date.now() - new Date(subscription.current_period_start).getTime()) /
        (new Date(subscription.current_period_end).getTime() - new Date(subscription.current_period_start).getTime())) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Abonnement
            </CardTitle>
            <CardDescription>Plan und Rechnungsinformationen</CardDescription>
          </div>
          {getStatusBadge(subscription?.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan */}
        <div className="p-4 rounded-lg border bg-muted/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-muted-foreground">{plan.price}</p>
            </div>
            <Button variant="outline" disabled>
              <ExternalLink className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
          </div>
          <ul className="space-y-1">
            {plan.features.map((feature, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Billing Period */}
        {subscription?.current_period_end && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Abrechnungszeitraum</span>
              <span className="font-medium">{daysRemaining} Tage verbleibend</span>
            </div>
            <Progress value={periodProgress} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {subscription.current_period_start && format(new Date(subscription.current_period_start), 'dd.MM.yyyy', { locale: de })}
              </span>
              <span>
                {format(new Date(subscription.current_period_end), 'dd.MM.yyyy', { locale: de })}
              </span>
            </div>
          </div>
        )}

        {/* Trial Info */}
        {subscription?.trial_ends_at && new Date(subscription.trial_ends_at) > new Date() && (
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              <Calendar className="w-4 h-4 inline mr-2" />
              Testphase endet am {format(new Date(subscription.trial_ends_at), 'dd.MM.yyyy', { locale: de })}
            </p>
          </div>
        )}

        {/* Cancellation Notice */}
        {subscription?.cancel_at && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              Abonnement wird am {format(new Date(subscription.cancel_at), 'dd.MM.yyyy', { locale: de })} beendet
            </p>
          </div>
        )}

        {/* No Subscription */}
        {!subscription && (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Kein aktives Abonnement</p>
            <p className="text-sm mt-1">Du verwendest den kostenlosen Plan.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
