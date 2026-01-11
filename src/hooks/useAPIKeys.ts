import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAPIKeys = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const { data: apiKeys, isLoading: loading } = useQuery({
    queryKey: ['api_keys', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createKey = async (name: string) => {
    if (!user) throw new Error('Not authenticated');
    setIsCreating(true);
    try {
      const key = `sk_live_${crypto.randomUUID().replace(/-/g, '')}`;
      const keyHash = btoa(key);
      const keyPrefix = key.substring(0, 12);
      
      await supabase.from('api_keys').insert({
        user_id: user.id,
        name,
        key_hash: keyHash,
        key_prefix: keyPrefix
      });
      queryClient.invalidateQueries({ queryKey: ['api_keys'] });
      return key;
    } finally {
      setIsCreating(false);
    }
  };

  const deleteKey = async (id: string) => {
    await supabase.from('api_keys').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['api_keys'] });
  };

  return { apiKeys, loading, createKey, deleteKey, isCreating };
};
