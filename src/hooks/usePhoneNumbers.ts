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
      // Would call edge function to provision Twilio number
      await new Promise(r => setTimeout(r, 1000));
      queryClient.invalidateQueries({ queryKey: ['phone_numbers'] });
    } finally {
      setIsProvisioning(false);
    }
  };

  const deleteNumber = async (id: string) => {
    await supabase.from('phone_numbers').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['phone_numbers'] });
  };

  return { phoneNumbers, loading, provisionNumber, deleteNumber, isProvisioning };
};
