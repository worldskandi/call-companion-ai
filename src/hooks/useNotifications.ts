import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  resource_type: string | null;
  resource_id: string | null;
  is_read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async (): Promise<Notification[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return (data || []) as Notification[];
    },
    enabled: !!user,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications-realtime-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Add new notification to the list
          queryClient.setQueryData(['notifications', user.id], (old: Notification[] = []) => {
            const newNotification = payload.new as Notification;
            // Avoid duplicates
            if (old.some(n => n.id === newNotification.id)) return old;
            return [newNotification, ...old];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Update notification in the list
          queryClient.setQueryData(['notifications', user.id], (old: Notification[] = []) => {
            return old.map(n => n.id === payload.new.id ? payload.new as Notification : n);
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Remove notification from the list
          queryClient.setQueryData(['notifications', user.id], (old: Notification[] = []) => {
            return old.filter(n => n.id !== payload.old.id);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    queryClient.setQueryData(['notifications', user.id], (old: Notification[] = []) => {
      return old.map(n => n.id === notificationId ? { ...n, is_read: true } : n);
    });
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    queryClient.setQueryData(['notifications', user.id], (old: Notification[] = []) => {
      return old.map(n => ({ ...n, is_read: true }));
    });
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    if (!user) return;

    await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id);

    queryClient.setQueryData(['notifications', user.id], (old: Notification[] = []) => {
      return old.filter(n => n.id !== notificationId);
    });
  };

  // Clear all notifications
  const clearAll = async () => {
    if (!user) return;

    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);

    queryClient.setQueryData(['notifications', user.id], []);
  };

  // Computed values
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const unreadNotifications = notifications.filter(n => !n.is_read);

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refetch,
  };
};
