import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from 'sonner';

interface EmailMessage {
  id: string;
  seq: number;
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
}

interface EmailAnalysis {
  id: string;
  summary: string;
  relevance: 'high' | 'medium' | 'low' | 'spam';
  relevanceScore: number;
  category: string;
  actionRequired: boolean;
  suggestedAction?: string;
}

interface FetchEmailsResponse {
  emails: EmailMessage[];
  total: number;
  folder: string;
  providerEmail?: string;
  error?: string;
  code?: string;
}

export function useEmails(folder: string = 'INBOX', limit: number = 20) {
  const queryClient = useQueryClient();

  const fetchEmails = async (): Promise<FetchEmailsResponse> => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return {
        emails: [],
        total: 0,
        folder,
        error: 'Nicht angemeldet',
        code: 'NOT_AUTHENTICATED'
      };
    }

    const response = await supabase.functions.invoke('fetch-emails', {
      body: { folder, limit },
    });

    if (response.error) {
      console.error('Fetch emails error:', response.error);
      throw new Error(response.error.message || 'Failed to fetch emails');
    }

    return response.data as FetchEmailsResponse;
  };

  const query = useQuery({
    queryKey: ['emails', folder, limit],
    queryFn: fetchEmails,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });

  const refetchEmails = () => {
    queryClient.invalidateQueries({ queryKey: ['emails'] });
  };

  return {
    emails: query.data?.emails || [],
    total: query.data?.total || 0,
    providerEmail: query.data?.providerEmail,
    error: query.data?.error,
    errorCode: query.data?.code,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: refetchEmails,
  };
}

export function useEmailIntegration() {
  const checkIntegration = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'imap_email')
      .eq('is_active', true)
      .maybeSingle();

    return data;
  };

  return useQuery({
    queryKey: ['email-integration'],
    queryFn: checkIntegration,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useEmailAnalysis() {
  const [analyses, setAnalyses] = useState<Record<string, EmailAnalysis>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const analyzeEmails = async (emails: EmailMessage[]) => {
    if (emails.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await supabase.functions.invoke('analyze-emails', {
        body: { 
          emails: emails.map(e => ({
            id: e.id,
            from: e.from,
            fromEmail: e.fromEmail,
            subject: e.subject,
            preview: e.preview,
            date: e.date
          }))
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Analyse fehlgeschlagen');
      }

      if (response.data?.error) {
        if (response.data.error.includes('Rate limit')) {
          toast.error('Rate-Limit erreicht', {
            description: 'Bitte versuche es in einer Minute erneut.'
          });
        } else if (response.data.error.includes('Credits')) {
          toast.error('KI-Credits aufgebraucht', {
            description: 'Bitte lade dein Guthaben auf.'
          });
        }
        throw new Error(response.data.error);
      }

      const analyzedEmails = response.data?.analyzedEmails || [];
      
      // Store analyses by email ID
      const newAnalyses: Record<string, EmailAnalysis> = {};
      analyzedEmails.forEach((analysis: EmailAnalysis) => {
        newAnalyses[analysis.id] = analysis;
      });
      
      setAnalyses(prev => ({ ...prev, ...newAnalyses }));
      toast.success('E-Mail-Analyse abgeschlossen', {
        description: `${analyzedEmails.length} E-Mails wurden analysiert.`
      });

    } catch (error) {
      console.error('Email analysis error:', error);
      const err = error as Error;
      setAnalysisError(err.message);
      toast.error('Analyse fehlgeschlagen', {
        description: err.message
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAnalysis = (emailId: string): EmailAnalysis | undefined => {
    return analyses[emailId];
  };

  const clearAnalyses = () => {
    setAnalyses({});
    setAnalysisError(null);
  };

  return {
    analyses,
    isAnalyzing,
    analysisError,
    analyzeEmails,
    getAnalysis,
    clearAnalyses
  };
}
