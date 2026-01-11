import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface InboundRouting {
  id: string;
  phone_number_id: string;
  user_id: string;
  campaign_id: string | null;
  routing_type: 'ai_agent' | 'forward' | 'voicemail';
  forward_to: string | null;
  ai_greeting: string | null;
  business_hours_only: boolean;
  business_hours_start: string | null;
  business_hours_end: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InboundRoutingUpdate {
  routing_type?: 'ai_agent' | 'forward' | 'voicemail';
  forward_to?: string | null;
  ai_greeting?: string | null;
  business_hours_only?: boolean;
  business_hours_start?: string | null;
  business_hours_end?: string | null;
  is_active?: boolean;
  campaign_id?: string | null;
}

export const useInboundRouting = (phoneNumberId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch routing for a specific phone number
  const { data: routing, isLoading } = useQuery({
    queryKey: ['inbound_routing', phoneNumberId],
    queryFn: async () => {
      if (!phoneNumberId || !user) return null;
      
      const { data, error } = await supabase
        .from('inbound_routing')
        .select('*')
        .eq('phone_number_id', phoneNumberId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as InboundRouting | null;
    },
    enabled: !!phoneNumberId && !!user,
  });

  // Create or update routing
  const upsertRouting = useMutation({
    mutationFn: async ({ phoneNumberId, updates }: { phoneNumberId: string; updates: InboundRoutingUpdate }) => {
      if (!user) throw new Error('Not authenticated');

      // Check if routing exists
      const { data: existing } = await supabase
        .from('inbound_routing')
        .select('id')
        .eq('phone_number_id', phoneNumberId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('inbound_routing')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('inbound_routing')
          .insert({
            phone_number_id: phoneNumberId,
            user_id: user.id,
            routing_type: updates.routing_type || 'ai_agent',
            forward_to: updates.forward_to,
            ai_greeting: updates.ai_greeting,
            business_hours_only: updates.business_hours_only ?? false,
            business_hours_start: updates.business_hours_start || '09:00',
            business_hours_end: updates.business_hours_end || '18:00',
            is_active: updates.is_active ?? true,
            campaign_id: updates.campaign_id,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inbound_routing', variables.phoneNumberId] });
      queryClient.invalidateQueries({ queryKey: ['phone_numbers'] });
    },
  });

  // Delete routing
  const deleteRouting = useMutation({
    mutationFn: async (routingId: string) => {
      const { error } = await supabase
        .from('inbound_routing')
        .delete()
        .eq('id', routingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbound_routing', phoneNumberId] });
    },
  });

  return {
    routing,
    isLoading,
    upsertRouting,
    deleteRouting,
  };
};

// Hook to fetch all routing rules for all phone numbers
export const useAllInboundRouting = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['inbound_routing', 'all', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('inbound_routing')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as InboundRouting[];
    },
    enabled: !!user,
  });
};
