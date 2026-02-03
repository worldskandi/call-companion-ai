import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  template_id: string | null;
  category: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  trigger_type: 'schedule' | 'event' | 'manual' | 'webhook';
  trigger_config: Json;
  is_pomelli: boolean;
  run_count: number;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  action_type: string;
  action_config: Json;
  condition_config: Json | null;
  delay_minutes: number;
  created_at: string;
}

export interface WorkflowRun {
  id: string;
  workflow_id: string;
  triggered_by: string | null;
  trigger_data: Json | null;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  steps_completed: number;
  steps_total: number;
}

export interface WorkflowStats {
  total_workflows: number;
  active_workflows: number;
  total_runs_today: number;
  total_runs_week: number;
  success_rate: number;
}

export interface CreateWorkflowInput {
  name: string;
  description?: string;
  template_id?: string;
  category?: string;
  trigger_type: 'schedule' | 'event' | 'manual' | 'webhook';
  trigger_config?: Json;
  is_pomelli?: boolean;
}

export interface UpdateWorkflowInput {
  name?: string;
  description?: string;
  category?: string;
  trigger_type?: 'schedule' | 'event' | 'manual' | 'webhook';
  trigger_config?: Json;
  status?: 'draft' | 'active' | 'paused' | 'archived';
}

export const useWorkflowsData = (filters?: {
  status?: string;
  category?: string;
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch workflows
  const { data: workflows = [], isLoading, error, refetch } = useQuery({
    queryKey: ['workflows', filters],
    queryFn: async () => {
      let query = supabase
        .from('workflows')
        .select('*')
        .order('updated_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Workflow[];
    },
    enabled: !!user,
  });

  // Fetch workflow stats
  const { data: stats } = useQuery({
    queryKey: ['workflow-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_workflow_stats');

      if (error) throw error;
      return (data as WorkflowStats[])?.[0] || {
        total_workflows: 0,
        active_workflows: 0,
        total_runs_today: 0,
        total_runs_week: 0,
        success_rate: 0,
      };
    },
    enabled: !!user,
  });

  // Create workflow
  const createWorkflow = useMutation({
    mutationFn: async (input: CreateWorkflowInput) => {
      const { data, error } = await supabase
        .from('workflows')
        .insert({
          user_id: user!.id,
          name: input.name,
          description: input.description || null,
          template_id: input.template_id || null,
          category: input.category || 'general',
          trigger_type: input.trigger_type,
          trigger_config: input.trigger_config || {},
          is_pomelli: input.is_pomelli || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-stats'] });
      toast.success('Workflow erstellt');
    },
    onError: (error) => {
      console.error('Error creating workflow:', error);
      toast.error('Fehler beim Erstellen des Workflows');
    },
  });

  // Update workflow
  const updateWorkflow = useMutation({
    mutationFn: async ({ id, ...input }: UpdateWorkflowInput & { id: string }) => {
      const { data, error } = await supabase
        .from('workflows')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-stats'] });
    },
    onError: (error) => {
      console.error('Error updating workflow:', error);
      toast.error('Fehler beim Aktualisieren des Workflows');
    },
  });

  // Toggle workflow status
  const toggleWorkflowStatus = useMutation({
    mutationFn: async (workflowId: string) => {
      const { data, error } = await supabase.rpc('toggle_workflow_status', {
        p_workflow_id: workflowId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-stats'] });
      toast.success('Workflow-Status geändert');
    },
    onError: (error) => {
      console.error('Error toggling workflow:', error);
      toast.error('Fehler beim Ändern des Workflow-Status');
    },
  });

  // Delete workflow
  const deleteWorkflow = useMutation({
    mutationFn: async (workflowId: string) => {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflowId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-stats'] });
      toast.success('Workflow gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting workflow:', error);
      toast.error('Fehler beim Löschen des Workflows');
    },
  });

  return {
    workflows,
    stats,
    isLoading,
    error,
    refetch,
    createWorkflow,
    updateWorkflow,
    toggleWorkflowStatus,
    deleteWorkflow,
  };
};

// Hook for workflow runs
export const useWorkflowRuns = (workflowId?: string) => {
  const { user } = useAuth();

  const { data: runs = [], isLoading, error } = useQuery({
    queryKey: ['workflow-runs', workflowId],
    queryFn: async () => {
      let query = supabase
        .from('workflow_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(50);

      if (workflowId) {
        query = query.eq('workflow_id', workflowId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as WorkflowRun[];
    },
    enabled: !!user,
  });

  return { runs, isLoading, error };
};

// Hook for workflow steps
export const useWorkflowSteps = (workflowId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: steps = [], isLoading, error } = useQuery({
    queryKey: ['workflow-steps', workflowId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('step_order', { ascending: true });

      if (error) throw error;
      return data as WorkflowStep[];
    },
    enabled: !!user && !!workflowId,
  });

  const addStep = useMutation({
    mutationFn: async (input: {
      workflow_id: string;
      step_order: number;
      action_type: string;
      action_config?: Json;
      condition_config?: Json;
      delay_minutes?: number;
    }) => {
      const { data, error } = await supabase
        .from('workflow_steps')
        .insert({
          workflow_id: input.workflow_id,
          step_order: input.step_order,
          action_type: input.action_type,
          action_config: input.action_config || {},
          condition_config: input.condition_config || null,
          delay_minutes: input.delay_minutes || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-steps', workflowId] });
    },
  });

  const updateStep = useMutation({
    mutationFn: async ({ id, ...input }: {
      id: string;
      step_order?: number;
      action_type?: string;
      action_config?: Json;
      condition_config?: Json;
      delay_minutes?: number;
    }) => {
      const { data, error } = await supabase
        .from('workflow_steps')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-steps', workflowId] });
    },
  });

  const deleteStep = useMutation({
    mutationFn: async (stepId: string) => {
      const { error } = await supabase
        .from('workflow_steps')
        .delete()
        .eq('id', stepId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-steps', workflowId] });
    },
  });

  return { steps, isLoading, error, addStep, updateStep, deleteStep };
};
