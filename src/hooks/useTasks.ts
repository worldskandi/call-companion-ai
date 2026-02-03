import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Task {
  id: string;
  user_id: string;
  workflow_run_id: string | null;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'done' | 'cancelled';
  due_date: string | null;
  category: string | null;
  source: 'manual' | 'workflow' | 'email' | 'ai';
  related_resource_type: string | null;
  related_resource_id: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string | null;
  category?: string;
  source?: 'manual' | 'workflow' | 'email' | 'ai';
  related_resource_type?: string;
  related_resource_id?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'todo' | 'in_progress' | 'done' | 'cancelled';
  due_date?: string | null;
  category?: string;
}

export const useTasks = (filters?: {
  status?: string;
  priority?: string;
  category?: string;
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error, refetch } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_tasks', {
        p_status: filters?.status || null,
        p_priority: filters?.priority || null,
        p_category: filters?.category || null,
      });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  const createTask = useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user!.id,
          title: input.title,
          description: input.description || null,
          priority: input.priority || 'medium',
          due_date: input.due_date || null,
          category: input.category || null,
          source: input.source || 'manual',
          related_resource_type: input.related_resource_type || null,
          related_resource_id: input.related_resource_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Aufgabe erstellt');
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast.error('Fehler beim Erstellen der Aufgabe');
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...input }: UpdateTaskInput & { id: string }) => {
      const updateData: Record<string, unknown> = { ...input };
      
      // If marking as done, set completed_at
      if (input.status === 'done') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast.error('Fehler beim Aktualisieren der Aufgabe');
    },
  });

  const completeTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { data, error } = await supabase.rpc('complete_task', {
        p_task_id: taskId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Aufgabe erledigt');
    },
    onError: (error) => {
      console.error('Error completing task:', error);
      toast.error('Fehler beim Abschließen der Aufgabe');
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Aufgabe gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast.error('Fehler beim Löschen der Aufgabe');
    },
  });

  const toggleTaskStatus = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: string }) => {
      const newStatus = currentStatus === 'done' ? 'todo' : 'done';
      const updateData: Record<string, unknown> = { status: newStatus };
      
      if (newStatus === 'done') {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      console.error('Error toggling task:', error);
      toast.error('Fehler beim Aktualisieren der Aufgabe');
    },
  });

  return {
    tasks,
    isLoading,
    error,
    refetch,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    toggleTaskStatus,
  };
};
