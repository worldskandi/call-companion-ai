import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
