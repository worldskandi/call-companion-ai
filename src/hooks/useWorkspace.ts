import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useWorkspace = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isInviting, setIsInviting] = useState(false);

  const { data: workspace, isLoading: loading } = useQuery({
    queryKey: ['workspace', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('workspace_members')
        .select('workspace_id, workspaces(*)')
        .eq('user_id', user.id)
        .maybeSingle();
      return data?.workspaces || null;
    },
    enabled: !!user,
  });

  const { data: members } = useQuery({
    queryKey: ['workspace_members', workspace?.id],
    queryFn: async () => {
      if (!workspace) return [];
      const { data } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspace.id);
      return data || [];
    },
    enabled: !!workspace,
  });

  const { data: invitations } = useQuery({
    queryKey: ['workspace_invitations', workspace?.id],
    queryFn: async () => {
      if (!workspace) return [];
      const { data } = await supabase
        .from('workspace_invitations')
        .select('*')
        .eq('workspace_id', workspace.id)
        .is('accepted_at', null);
      return data || [];
    },
    enabled: !!workspace,
  });

  const createWorkspace = async (name: string) => {
    if (!user) return;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const { data, error } = await supabase
      .from('workspaces')
      .insert({ name, slug, owner_id: user.id })
      .select()
      .single();
    if (error) throw error;
    await supabase.from('workspace_members').insert({
      workspace_id: data.id,
      user_id: user.id,
      role: 'owner'
    });
    queryClient.invalidateQueries({ queryKey: ['workspace'] });
  };

  const inviteMember = async (email: string, role: string) => {
    if (!workspace || !user) return;
    setIsInviting(true);
    try {
      await supabase.from('workspace_invitations').insert({
        workspace_id: workspace.id,
        email,
        role,
        invited_by: user.id
      });
      queryClient.invalidateQueries({ queryKey: ['workspace_invitations'] });
    } finally {
      setIsInviting(false);
    }
  };

  const removeMember = async (memberId: string) => {
    await supabase.from('workspace_members').delete().eq('id', memberId);
    queryClient.invalidateQueries({ queryKey: ['workspace_members'] });
  };

  return { workspace, members, invitations, loading, createWorkspace, inviteMember, removeMember, isInviting };
};
