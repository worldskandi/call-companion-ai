import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const usePhoneNumbers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isProvisioning, setIsProvisioning] = useState(false);

  const { data: phoneNumbers, isLoading: loading } = useQuery({
    queryKey: ['phone_numbers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const provisionNumber = async ({ country, friendlyName }: { country: string; friendlyName: string }) => {
    setIsProvisioning(true);
    try {
      const { data, error } = await supabase.functions.invoke('provision-phone-number', {
        body: { country, friendly_name: friendlyName },
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['phone_numbers'] });
      return data;
    } finally {
      setIsProvisioning(false);
    }
  };

  const deleteNumber = async (id: string) => {
    const { error } = await supabase.functions.invoke('release-phone-number', {
      body: { phone_number_id: id },
    });
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['phone_numbers'] });
  };

  return { phoneNumbers, loading, provisionNumber, deleteNumber, isProvisioning };
};
