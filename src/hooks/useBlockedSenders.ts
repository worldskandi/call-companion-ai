import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface BlockedSender {
  id: string;
  user_id: string;
  email_address: string;
  sender_name: string | null;
  blocked_at: string;
  reason: string | null;
}

export function useBlockedSenders() {
  const { user } = useAuth();
  const [blockedSenders, setBlockedSenders] = useState<BlockedSender[]>([]);
  const [blockedEmails, setBlockedEmails] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchBlockedSenders = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('blocked_senders')
        .select('*')
        .eq('user_id', user.id)
        .order('blocked_at', { ascending: false });

      if (error) throw error;

      const senders = (data || []) as BlockedSender[];
      setBlockedSenders(senders);
      setBlockedEmails(new Set(senders.map(s => s.email_address.toLowerCase())));
    } catch (error) {
      console.error('Error fetching blocked senders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBlockedSenders();
  }, [fetchBlockedSenders]);

  const blockSender = useCallback(async (emailAddress: string, senderName?: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('blocked_senders')
        .insert({
          user_id: user.id,
          email_address: emailAddress.toLowerCase(),
          sender_name: senderName || null,
          reason: 'spam'
        });

      if (error) {
        if (error.code === '23505') {
          toast.info('Dieser Absender ist bereits blockiert');
          return true;
        }
        throw error;
      }

      toast.success('Absender als Spam markiert', {
        description: `E-Mails von ${emailAddress} werden künftig ausgeblendet`
      });

      await fetchBlockedSenders();
      return true;
    } catch (error) {
      console.error('Error blocking sender:', error);
      toast.error('Fehler beim Blockieren des Absenders');
      return false;
    }
  }, [user, fetchBlockedSenders]);

  const unblockSender = useCallback(async (emailAddress: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('blocked_senders')
        .delete()
        .eq('user_id', user.id)
        .eq('email_address', emailAddress.toLowerCase());

      if (error) throw error;

      toast.success('Absender entsperrt', {
        description: `E-Mails von ${emailAddress} werden wieder angezeigt`
      });

      await fetchBlockedSenders();
      return true;
    } catch (error) {
      console.error('Error unblocking sender:', error);
      toast.error('Fehler beim Entsperren des Absenders');
      return false;
    }
  }, [user, fetchBlockedSenders]);

  const isBlocked = useCallback((emailAddress: string) => {
    return blockedEmails.has(emailAddress.toLowerCase());
  }, [blockedEmails]);

  return {
    blockedSenders,
    blockedEmails,
    isLoading,
    blockSender,
    unblockSender,
    isBlocked,
    refetch: fetchBlockedSenders
  };
}
