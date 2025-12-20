import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  product_description: string | null;
  target_group: string | null;
  call_goal: string | null;
  ai_prompt: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  lead_count?: number;
}

interface CreateCampaignParams {
  name: string;
  productDescription?: string;
  targetGroup?: string;
  callGoal?: string;
  aiPrompt?: string;
}

interface UpdateCampaignParams {
  campaignId: string;
  name?: string;
  productDescription?: string;
  targetGroup?: string;
  callGoal?: string;
  aiPrompt?: string;
  isActive?: boolean;
}

export const useCampaigns = (isActive?: boolean) => {
  return useQuery({
    queryKey: ['campaigns', isActive],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_campaigns', {
        p_is_active: isActive ?? null,
      });

      if (error) throw error;
      return data as Campaign[];
    },
  });
};

export const useCampaign = (campaignId: string | null) => {
  return useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      if (!campaignId) return null;
      
      const { data, error } = await supabase.rpc('get_campaign', {
        p_campaign_id: campaignId,
      });

      if (error) throw error;
      return (data as Campaign[])[0] || null;
    },
    enabled: !!campaignId,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: CreateCampaignParams) => {
      const { data, error } = await supabase.rpc('create_campaign', {
        p_name: params.name,
        p_product_description: params.productDescription || null,
        p_target_group: params.targetGroup || null,
        p_call_goal: params.callGoal || null,
        p_ai_prompt: params.aiPrompt || null,
      });

      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Kampagne erstellt',
        description: 'Die Kampagne wurde erfolgreich angelegt.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: UpdateCampaignParams) => {
      const { data, error } = await supabase.rpc('update_campaign', {
        p_campaign_id: params.campaignId,
        p_name: params.name || null,
        p_product_description: params.productDescription || null,
        p_target_group: params.targetGroup || null,
        p_call_goal: params.callGoal || null,
        p_ai_prompt: params.aiPrompt || null,
        p_is_active: params.isActive ?? null,
      });

      if (error) throw error;
      return data as boolean;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign'] });
      toast({
        title: 'Kampagne aktualisiert',
        description: 'Die Änderungen wurden gespeichert.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const { data, error } = await supabase.rpc('delete_campaign', {
        p_campaign_id: campaignId,
      });

      if (error) throw error;
      return data as boolean;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Kampagne gelöscht',
        description: 'Die Kampagne wurde entfernt.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
