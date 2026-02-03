import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmailBody {
  htmlBody?: string;
  textBody?: string;
}

export function useEmailBody() {
  const [isLoading, setIsLoading] = useState(false);
  const [cachedBodies, setCachedBodies] = useState<Record<string, EmailBody>>({});

  const fetchEmailBody = useCallback(async (emailSeq: string, folder: string = 'INBOX'): Promise<EmailBody | null> => {
    // Check cache first
    const cacheKey = `${folder}:${emailSeq}`;
    if (cachedBodies[cacheKey]) {
      return cachedBodies[cacheKey];
    }

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('fetch-email-body', {
        body: { emailSeq, folder }
      });

      if (response.error) {
        console.error('Failed to fetch email body:', response.error);
        return null;
      }

      const body: EmailBody = {
        htmlBody: response.data?.htmlBody,
        textBody: response.data?.textBody
      };

      // Cache the result
      setCachedBodies(prev => ({
        ...prev,
        [cacheKey]: body
      }));

      return body;
    } catch (error) {
      console.error('Error fetching email body:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [cachedBodies]);

  const getCachedBody = useCallback((emailSeq: string, folder: string = 'INBOX'): EmailBody | undefined => {
    const cacheKey = `${folder}:${emailSeq}`;
    return cachedBodies[cacheKey];
  }, [cachedBodies]);

  return {
    fetchEmailBody,
    getCachedBody,
    isLoading
  };
}
