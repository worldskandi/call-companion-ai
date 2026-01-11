import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export interface ProductService {
  id: string;
  name: string;
  description: string;
  price?: string;
  targetGroup?: string;
}

export interface CompanyProfile {
  id: string;
  user_id: string;
  company_name: string;
  industry: string | null;
  website: string | null;
  logo_url: string | null;
  address_street: string | null;
  address_city: string | null;
  address_zip: string | null;
  address_country: string | null;
  phone: string | null;
  email: string | null;
  short_description: string | null;
  long_description: string | null;
  usp: string[];
  products_services: ProductService[];
  brand_colors: Record<string, string> | null;
  brand_fonts: Record<string, string> | null;
  scraped_at: string | null;
  scrape_source: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyProfileUpdate {
  company_name?: string;
  industry?: string;
  website?: string;
  logo_url?: string;
  address_street?: string;
  address_city?: string;
  address_zip?: string;
  address_country?: string;
  phone?: string;
  email?: string;
  short_description?: string;
  long_description?: string;
  usp?: string[];
  products_services?: ProductService[];
  brand_colors?: Record<string, string>;
  brand_fonts?: Record<string, string>;
  scraped_at?: string;
  scrape_source?: string;
  raw_scrape_data?: Record<string, unknown>;
}

export function useCompanyProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['company-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        return {
          ...data,
          usp: (data.usp as string[]) || [],
          products_services: (data.products_services as unknown as ProductService[]) || [],
        } as CompanyProfile;
      }
      
      return null;
    },
    enabled: !!user?.id,
  });

  const upsertMutation = useMutation({
    mutationFn: async (updates: CompanyProfileUpdate) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Convert to database-compatible format
      const payload: Record<string, unknown> = {
        ...updates,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      if (profile?.id) {
        const { error } = await supabase
          .from('company_profiles')
          .update(payload as any)
          .eq('id', profile.id);
        
        if (error) throw error;
      } else {
        if (!updates.company_name) {
          throw new Error('Company name is required');
        }
        
        const { error } = await supabase
          .from('company_profiles')
          .insert({
            ...payload,
            company_name: updates.company_name,
          } as any);
        
        if (error) throw error;
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profile'] });
      toast.success('Firmenprofil gespeichert');
    },
    onError: (error) => {
      console.error('Error saving company profile:', error);
      toast.error('Fehler beim Speichern', {
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error('No profile to delete');

      const { error } = await supabase
        .from('company_profiles')
        .delete()
        .eq('id', profile.id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profile'] });
      toast.success('Firmenprofil gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting company profile:', error);
      toast.error('Fehler beim Löschen');
    },
  });

  return {
    profile,
    isLoading,
    error,
    saveProfile: upsertMutation.mutate,
    isSaving: upsertMutation.isPending,
    deleteProfile: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
