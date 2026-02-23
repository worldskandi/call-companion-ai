import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ElevenLabsAgent {
  id: string;
  user_id: string;
  elevenlabs_agent_id: string | null;
  name: string;
  description: string | null;
  first_message: string | null;
  system_prompt: string | null;
  language: string | null;
  voice_id: string | null;
  voice_name: string | null;
  tts_model: string | null;
  temperature: number | null;
  max_tokens: number | null;
  status: string | null;
  error_message: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export const useElevenLabsAgents = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const { data: agents, isLoading } = useQuery({
    queryKey: ['elevenlabs_agents', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('elevenlabs_agents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ElevenLabsAgent[];
    },
    enabled: !!user,
  });

  const createAgent = async (agentData: {
    name: string;
    first_message?: string;
    system_prompt?: string;
    language?: string;
    voice_id?: string;
    voice_name?: string;
    tts_model?: string;
    temperature?: number;
  }) => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-elevenlabs-agent', {
        body: { action: 'create', ...agentData },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      queryClient.invalidateQueries({ queryKey: ['elevenlabs_agents'] });
      return data.agent;
    } finally {
      setIsSaving(false);
    }
  };

  const updateAgent = async (agentId: string, agentData: Record<string, any>) => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-elevenlabs-agent', {
        body: { action: 'update', agent_id: agentId, ...agentData },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      queryClient.invalidateQueries({ queryKey: ['elevenlabs_agents'] });
      return data.agent;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAgent = async (agentId: string) => {
    const { data, error } = await supabase.functions.invoke('manage-elevenlabs-agent', {
      body: { action: 'delete', agent_id: agentId },
    });
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['elevenlabs_agents'] });
  };

  return { agents, isLoading, createAgent, updateAgent, deleteAgent, isSaving };
};
