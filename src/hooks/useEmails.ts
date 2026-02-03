import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useCallback } from 'react';
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
  htmlBody?: string;
  textBody?: string;
  hasHtml: boolean;
}

export interface EmailAnalysis {
  id: string;
  summary: string;
  relevance: 'high' | 'medium' | 'low' | 'spam';
  relevanceScore: number;
  category: string;
  actionRequired: boolean;
  suggestedAction?: string;
}

export interface EmailDraft {
  draft: string;
  replySubject: string;
  replyTo: string;
  aiSource: string;
  agentName: string;
}

export interface SavedDraft {
  id: string;
  user_id: string;
  original_email_id: string;
  original_from_email: string;
  original_from_name: string | null;
  original_subject: string;
  reply_subject: string;
  draft_content: string;
  ai_source: string | null;
  agent_name: string | null;
  status: 'draft' | 'sent' | 'discarded';
  created_at: string;
  updated_at: string;
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

  const analyzeEmails = async (emails: EmailMessage[]): Promise<EmailAnalysis[]> => {
    if (emails.length === 0) return [];

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

      return analyzedEmails;

    } catch (error) {
      console.error('Email analysis error:', error);
      const err = error as Error;
      setAnalysisError(err.message);
      toast.error('Analyse fehlgeschlagen', {
        description: err.message
      });
      return [];
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

export function useEmailDraft() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<EmailDraft | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState<EmailMessage | null>(null);

  const generateDraft = async (email: EmailMessage, analysis?: EmailAnalysis): Promise<EmailDraft | null> => {
    setIsGenerating(true);
    setDraftError(null);
    setDraft(null);
    setCurrentEmail(email);

    try {
      const response = await supabase.functions.invoke('generate-email-draft', {
        body: {
          emailId: email.id,
          fromEmail: email.fromEmail,
          fromName: email.from,
          subject: email.subject,
          preview: email.preview,
          analysis: analysis ? {
            summary: analysis.summary,
            category: analysis.category,
            suggestedAction: analysis.suggestedAction
          } : undefined
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Draft-Generierung fehlgeschlagen');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      const generatedDraft: EmailDraft = response.data;
      setDraft(generatedDraft);
      
      toast.success(`Antwort-Entwurf von ${generatedDraft.agentName} erstellt`, {
        description: 'Der Entwurf kann jetzt bearbeitet und gesendet werden.'
      });

      return generatedDraft;

    } catch (error) {
      console.error('Draft generation error:', error);
      const err = error as Error;
      setDraftError(err.message);
      toast.error('Entwurf-Generierung fehlgeschlagen', {
        description: err.message
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearDraft = () => {
    setDraft(null);
    setDraftError(null);
    setCurrentEmail(null);
  };

  return {
    draft,
    currentEmail,
    isGenerating,
    draftError,
    generateDraft,
    clearDraft
  };
}

export function useSavedDrafts() {
  const queryClient = useQueryClient();

  const fetchDrafts = async (): Promise<SavedDraft[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('email_drafts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'draft')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch drafts error:', error);
      throw error;
    }

    return (data || []) as SavedDraft[];
  };

  const query = useQuery({
    queryKey: ['email-drafts'],
    queryFn: fetchDrafts,
    staleTime: 1000 * 60, // 1 minute
  });

  const saveDraftMutation = useMutation({
    mutationFn: async (params: {
      originalEmailId: string;
      originalFromEmail: string;
      originalFromName: string;
      originalSubject: string;
      replySubject: string;
      draftContent: string;
      aiSource?: string;
      agentName?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht angemeldet');

      const { data, error } = await supabase
        .from('email_drafts')
        .insert({
          user_id: user.id,
          original_email_id: params.originalEmailId,
          original_from_email: params.originalFromEmail,
          original_from_name: params.originalFromName,
          original_subject: params.originalSubject,
          reply_subject: params.replySubject,
          draft_content: params.draftContent,
          ai_source: params.aiSource,
          agent_name: params.agentName,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      return data as SavedDraft;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-drafts'] });
      toast.success('Entwurf gespeichert');
    },
    onError: (error) => {
      toast.error('Fehler beim Speichern', {
        description: (error as Error).message
      });
    }
  });

  const updateDraftMutation = useMutation({
    mutationFn: async (params: { id: string; draftContent: string }) => {
      const { error } = await supabase
        .from('email_drafts')
        .update({ draft_content: params.draftContent })
        .eq('id', params.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-drafts'] });
    }
  });

  const deleteDraftMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_drafts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-drafts'] });
      toast.success('Entwurf gelöscht');
    }
  });

  return {
    drafts: query.data || [],
    isLoading: query.isLoading,
    saveDraft: saveDraftMutation.mutateAsync,
    updateDraft: updateDraftMutation.mutateAsync,
    deleteDraft: deleteDraftMutation.mutateAsync,
    isSaving: saveDraftMutation.isPending,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['email-drafts'] })
  };
}
