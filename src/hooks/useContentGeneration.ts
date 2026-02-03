import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ContentGeneration {
  id: string;
  user_id: string;
  workflow_id: string | null;
  content_type: 'social_post' | 'ad_copy' | 'blog_intro' | 'email' | 'image_prompt';
  platform: string | null;
  prompt: string;
  generated_content: string | null;
  brand_context: Record<string, unknown> | null;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface GenerateContentInput {
  content_type: 'social_post' | 'ad_copy' | 'blog_intro' | 'email' | 'image_prompt';
  platform?: string;
  prompt: string;
  tone?: 'professional' | 'casual' | 'funny' | 'inspirational';
  include_hashtags?: boolean;
  variations?: number;
}

export const useContentGeneration = (filters?: {
  status?: string;
  content_type?: string;
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch content generations
  const { data: generations = [], isLoading, error, refetch } = useQuery({
    queryKey: ['content-generations', filters],
    queryFn: async () => {
      let query = supabase
        .from('content_generations')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.content_type) {
        query = query.eq('content_type', filters.content_type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ContentGeneration[];
    },
    enabled: !!user,
  });

  // Create content generation request
  const createGeneration = useMutation({
    mutationFn: async (input: GenerateContentInput) => {
      // First, create the record
      const { data: record, error: insertError } = await supabase
        .from('content_generations')
        .insert({
          user_id: user!.id,
          content_type: input.content_type,
          platform: input.platform || null,
          prompt: input.prompt,
          status: 'pending',
          metadata: {
            tone: input.tone || 'professional',
            include_hashtags: input.include_hashtags || false,
            variations: input.variations || 1,
          },
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Then, call the edge function to generate content
      try {
        const { data: result, error: fnError } = await supabase.functions.invoke(
          'generate-marketing-content',
          {
            body: {
              generationId: record.id,
              contentType: input.content_type,
              platform: input.platform,
              prompt: input.prompt,
              tone: input.tone,
              includeHashtags: input.include_hashtags,
              variations: input.variations,
            },
          }
        );

        if (fnError) throw fnError;
        return result;
      } catch (error) {
        // Update status to failed if edge function fails
        await supabase
          .from('content_generations')
          .update({ status: 'failed' })
          .eq('id', record.id);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-generations'] });
      toast.success('Content wird generiert...');
    },
    onError: (error) => {
      console.error('Error generating content:', error);
      toast.error('Fehler bei der Content-Generierung');
    },
  });

  // Delete content generation
  const deleteGeneration = useMutation({
    mutationFn: async (generationId: string) => {
      const { error } = await supabase
        .from('content_generations')
        .delete()
        .eq('id', generationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-generations'] });
      toast.success('Content gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting content:', error);
      toast.error('Fehler beim Löschen');
    },
  });

  return {
    generations,
    isLoading,
    error,
    refetch,
    createGeneration,
    deleteGeneration,
  };
};
