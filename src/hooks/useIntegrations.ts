import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useIntegrations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const { data: integrations, isLoading: loading } = useQuery({
    queryKey: ['integrations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const connectGoogle = async () => {
    if (!user) return;
    setIsConnecting('google_calendar');
    try {
      const { data, error } = await supabase.functions.invoke('oauth-start', {
        body: {
          provider: 'google_calendar',
          user_id: user.id,
          redirect_url: `${window.location.origin}/settings?tab=integrations`,
        },
      });
      if (error) throw error;
      if (data?.auth_url) {
        window.location.href = data.auth_url;
      }
    } finally {
      setIsConnecting(null);
    }
  };

  const disconnectIntegration = async (provider: string) => {
    if (!user) return;
    await supabase
      .from('user_integrations')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', provider);
    queryClient.invalidateQueries({ queryKey: ['integrations'] });
  };

  return { integrations, loading, connectGoogle, disconnectIntegration, isConnecting };
};
