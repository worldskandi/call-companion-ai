import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEmailBranding } from './useEmailBranding';

interface SendEmailParams {
  draftId?: string;
  to: string;
  subject: string;
  textContent: string;
}

export function useSendEmail() {
  const [isSending, setIsSending] = useState(false);
  const { generateEmailHtml } = useEmailBranding();

  const sendEmail = async (params: SendEmailParams): Promise<boolean> => {
    setIsSending(true);
    try {
      const { draftId, to, subject, textContent } = params;

      // Generate branded HTML from text content
      const htmlContent = generateEmailHtml(textContent);

      const response = await supabase.functions.invoke('send-inbox-email', {
        body: {
          draftId,
          to,
          subject,
          htmlContent,
          textContent
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'E-Mail konnte nicht gesendet werden');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Unbekannter Fehler');
      }

      toast.success('E-Mail gesendet', {
        description: `Die E-Mail wurde erfolgreich an ${to} gesendet.`
      });

      return true;

    } catch (error) {
      console.error('Send email error:', error);
      const err = error as Error;
      toast.error('E-Mail-Versand fehlgeschlagen', {
        description: err.message
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendEmail,
    isSending
  };
}
