import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface KnowledgeCategory {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeItem {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  content: string;
  source_type: 'manual' | 'url' | 'document' | 'company_profile';
  source_url: string | null;
  source_file_name: string | null;
  source_file_path: string | null;
  metadata: Record<string, any>;
  status: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentKnowledgeLink {
  id: string;
  agent_id: string;
  knowledge_item_id: string;
  user_id: string;
  created_at: string;
}

export const useKnowledgeBase = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  // Categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['knowledge_categories', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_categories')
        .select('*')
        .eq('user_id', user!.id)
        .order('name');
      if (error) throw error;
      return data as KnowledgeCategory[];
    },
    enabled: !!user,
  });

  // Items
  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ['knowledge_items', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_items')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as KnowledgeItem[];
    },
    enabled: !!user,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['knowledge_categories'] });
    qc.invalidateQueries({ queryKey: ['knowledge_items'] });
  };

  // Category mutations
  const createCategory = useMutation({
    mutationFn: async (cat: { name: string; description?: string; icon?: string; color?: string }) => {
      const { error } = await supabase.from('knowledge_categories').insert({ ...cat, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; description?: string; icon?: string; color?: string }) => {
      const { error } = await supabase.from('knowledge_categories').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('knowledge_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  // Item mutations
  const createItem = useMutation({
    mutationFn: async (item: {
      title: string;
      content: string;
      source_type: string;
      category_id?: string | null;
      source_url?: string;
      source_file_name?: string;
      source_file_path?: string;
      metadata?: Record<string, any>;
    }) => {
      const { data, error } = await supabase
        .from('knowledge_items')
        .insert({ ...item, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as KnowledgeItem;
    },
    onSuccess: invalidate,
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; title?: string; content?: string; category_id?: string | null }) => {
      const { error } = await supabase.from('knowledge_items').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('knowledge_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  // Import from URL via edge function
  const importFromUrl = useMutation({
    mutationFn: async ({ url, categoryId }: { url: string; categoryId?: string }) => {
      const { data, error } = await supabase.functions.invoke('crawl-knowledge-url', {
        body: { url, category_id: categoryId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: invalidate,
  });

  // Import from company profile
  const importFromCompanyProfile = useMutation({
    mutationFn: async (categoryId?: string) => {
      if (!user) throw new Error('Nicht eingeloggt');
      const { data: profile, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      if (!profile) throw new Error('Kein Firmenprofil gefunden');

      const itemsToCreate = [];

      // Company description
      if (profile.long_description || profile.short_description) {
        itemsToCreate.push({
          title: `${profile.company_name} – Beschreibung`,
          content: profile.long_description || profile.short_description || '',
          source_type: 'company_profile',
          category_id: categoryId || null,
          user_id: user.id,
          metadata: { company_id: profile.id },
        });
      }

      // Products
      const products = profile.products_services as any[];
      if (products?.length) {
        itemsToCreate.push({
          title: `${profile.company_name} – Produkte & Services`,
          content: products.map((p: any) => `**${p.name || p}**: ${p.description || ''}`).join('\n\n'),
          source_type: 'company_profile',
          category_id: categoryId || null,
          user_id: user.id,
          metadata: { company_id: profile.id },
        });
      }

      // USPs
      if (profile.usp?.length) {
        itemsToCreate.push({
          title: `${profile.company_name} – USPs`,
          content: profile.usp.map((u: string) => `• ${u}`).join('\n'),
          source_type: 'company_profile',
          category_id: categoryId || null,
          user_id: user.id,
          metadata: { company_id: profile.id },
        });
      }

      if (!itemsToCreate.length) throw new Error('Keine Daten im Firmenprofil');

      const { error: insertError } = await supabase.from('knowledge_items').insert(itemsToCreate);
      if (insertError) throw insertError;
      return { count: itemsToCreate.length };
    },
    onSuccess: invalidate,
  });

  // Agent knowledge links
  const getAgentKnowledge = async (agentId: string) => {
    const { data, error } = await supabase
      .from('agent_knowledge_links')
      .select('*, knowledge_items(*)')
      .eq('agent_id', agentId);
    if (error) throw error;
    return data;
  };

  const linkItemToAgent = useMutation({
    mutationFn: async ({ agentId, itemId }: { agentId: string; itemId: string }) => {
      const { error } = await supabase
        .from('agent_knowledge_links')
        .insert({ agent_id: agentId, knowledge_item_id: itemId, user_id: user!.id });
      if (error) throw error;
    },
  });

  const unlinkItemFromAgent = useMutation({
    mutationFn: async ({ agentId, itemId }: { agentId: string; itemId: string }) => {
      const { error } = await supabase
        .from('agent_knowledge_links')
        .delete()
        .eq('agent_id', agentId)
        .eq('knowledge_item_id', itemId);
      if (error) throw error;
    },
  });

  return {
    categories,
    items,
    categoriesLoading,
    itemsLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    createItem,
    updateItem,
    deleteItem,
    importFromUrl,
    importFromCompanyProfile,
    getAgentKnowledge,
    linkItemToAgent,
    unlinkItemFromAgent,
  };
};
