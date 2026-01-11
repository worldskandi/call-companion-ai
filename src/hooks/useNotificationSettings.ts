import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useNotificationSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const { data: settings, isLoading: loading } = useQuery({
    queryKey: ['notification_settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateSettings = async (updates: Record<string, any>) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['notification_settings'] });
    } finally {
      setIsSaving(false);
    }
  };

  return { settings, loading, updateSettings, isSaving };
};
