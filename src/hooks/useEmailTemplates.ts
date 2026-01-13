import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmailTemplate {
  id: string;
  user_id: string | null;
  name: string;
  category: 'follow-up' | 'quote' | 'meeting' | 'info' | 'rejection';
  subject: string;
  html_content: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export const categoryLabels: Record<EmailTemplate['category'], string> = {
  'follow-up': 'Follow-up',
  quote: 'Angebot',
  meeting: 'Termin',
  info: 'Info',
  rejection: 'Absage',
};

export function useEmailTemplates() {
  return useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('is_system', { ascending: false })
        .order('name');

      if (error) throw error;
      return data as EmailTemplate[];
    },
  });
}

export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: {
      name: string;
      category: EmailTemplate['category'];
      subject: string;
      html_content: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Nicht angemeldet');

      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          ...template,
          user_id: userData.user.id,
          is_system: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Vorlage gespeichert');
    },
    onError: (error) => {
      toast.error('Fehler beim Speichern', { description: error.message });
    },
  });
}

export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Vorlage gelöscht');
    },
    onError: (error) => {
      toast.error('Fehler beim Löschen', { description: error.message });
    },
  });
}
