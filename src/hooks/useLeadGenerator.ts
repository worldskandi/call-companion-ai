import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { firecrawlApi, type GenerateLeadsOptions, type GenerateLeadsResponse } from '@/lib/api/firecrawl';
import { useToast } from '@/hooks/use-toast';

export type GenerationStatus = 'idle' | 'searching' | 'scraping' | 'importing' | 'complete' | 'error';

export function useLeadGenerator() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [status, setStatus] = useState<GenerationStatus>('idle');

  const mutation = useMutation({
    mutationFn: async ({ query, options }: { query: string; options?: GenerateLeadsOptions }) => {
      setStatus('searching');
      
      // Simulate progress updates (edge function will handle the actual work)
      const progressTimeout = setTimeout(() => setStatus('scraping'), 2000);
      const importTimeout = setTimeout(() => setStatus('importing'), 5000);
      
      try {
        const result = await firecrawlApi.generateLeads(query, options);
        
        clearTimeout(progressTimeout);
        clearTimeout(importTimeout);
        
        if (result.success) {
          setStatus('complete');
        } else {
          setStatus('error');
        }
        
        return result;
      } catch (error) {
        clearTimeout(progressTimeout);
        clearTimeout(importTimeout);
        setStatus('error');
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data.success && data.stats) {
        queryClient.invalidateQueries({ queryKey: ['leads'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        
        toast({
          title: 'Lead-Generierung abgeschlossen',
          description: `${data.stats.imported} Leads importiert (${data.stats.byQuality.high} hoch, ${data.stats.byQuality.medium} mittel, ${data.stats.byQuality.low} niedrig)`,
        });
      } else {
        toast({
          title: 'Fehler bei der Lead-Generierung',
          description: data.error || 'Unbekannter Fehler',
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      setStatus('error');
      toast({
        title: 'Fehler',
        description: error.message || 'Lead-Generierung fehlgeschlagen',
        variant: 'destructive',
      });
    },
  });

  const reset = () => {
    setStatus('idle');
    mutation.reset();
  };

  return {
    generateLeads: mutation.mutate,
    generateLeadsAsync: mutation.mutateAsync,
    status,
    isLoading: mutation.isPending,
    data: mutation.data,
    error: mutation.error,
    reset,
  };
}
