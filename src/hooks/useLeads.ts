import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type LeadStatus = 'new' | 'called' | 'interested' | 'callback' | 'not_interested' | 'qualified';

export interface Lead {
  id: string;
  user_id: string;
  campaign_id: string | null;
  first_name: string;
  last_name: string | null;
  company: string | null;
  phone_number: string;
  email: string | null;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface GetLeadsParams {
  status?: LeadStatus;
  campaignId?: string;
  search?: string;
}

interface CreateLeadParams {
  firstName: string;
  phoneNumber: string;
  lastName?: string;
  company?: string;
  email?: string;
  campaignId?: string;
  notes?: string;
}

interface UpdateLeadParams {
  leadId: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phoneNumber?: string;
  email?: string;
  campaignId?: string;
  status?: LeadStatus;
  notes?: string;
}

export const useLeads = (params?: GetLeadsParams) => {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_leads', {
        p_status: params?.status || null,
        p_campaign_id: params?.campaignId || null,
        p_search: params?.search || null,
      });

      if (error) throw error;
      return data as Lead[];
    },
  });
};

export const useLead = (leadId: string | null) => {
  return useQuery({
    queryKey: ['lead', leadId],
    queryFn: async () => {
      if (!leadId) return null;
      
      const { data, error } = await supabase.rpc('get_lead', {
        p_lead_id: leadId,
      });

      if (error) throw error;
      return (data as Lead[])[0] || null;
    },
    enabled: !!leadId,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: CreateLeadParams) => {
      const { data, error } = await supabase.rpc('create_lead', {
        p_first_name: params.firstName,
        p_phone_number: params.phoneNumber,
        p_last_name: params.lastName || null,
        p_company: params.company || null,
        p_email: params.email || null,
        p_campaign_id: params.campaignId || null,
        p_notes: params.notes || null,
      });

      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Lead erstellt',
        description: 'Der Lead wurde erfolgreich hinzugefügt.',
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

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: UpdateLeadParams) => {
      const { data, error } = await supabase.rpc('update_lead', {
        p_lead_id: params.leadId,
        p_first_name: params.firstName || null,
        p_last_name: params.lastName || null,
        p_company: params.company || null,
        p_phone_number: params.phoneNumber || null,
        p_email: params.email || null,
        p_campaign_id: params.campaignId || null,
        p_status: params.status || null,
        p_notes: params.notes || null,
      });

      if (error) throw error;
      return data as boolean;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead'] });
      toast({
        title: 'Lead aktualisiert',
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

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const { data, error } = await supabase.rpc('delete_lead', {
        p_lead_id: leadId,
      });

      if (error) throw error;
      return data as boolean;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Lead gelöscht',
        description: 'Der Lead wurde entfernt.',
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
