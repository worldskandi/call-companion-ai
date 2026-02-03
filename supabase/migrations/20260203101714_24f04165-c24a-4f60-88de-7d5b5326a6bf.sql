-- =============================================
-- WORKFLOWS & AUTOMATION TABLES
-- =============================================

-- 1. Workflows - Haupt-Workflow-Tabelle
CREATE TABLE public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  template_id TEXT,
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'draft',
  trigger_type TEXT NOT NULL,
  trigger_config JSONB DEFAULT '{}',
  is_pomelli BOOLEAN DEFAULT false,
  run_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Workflow Steps - Workflow-Schritte/Aktionen
CREATE TABLE public.workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  action_config JSONB DEFAULT '{}',
  condition_config JSONB,
  delay_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Workflow Runs - Ausführungsprotokoll
CREATE TABLE public.workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  triggered_by TEXT,
  trigger_data JSONB,
  status TEXT DEFAULT 'running',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  steps_completed INTEGER DEFAULT 0,
  steps_total INTEGER DEFAULT 0
);

-- 4. Workflow Run Steps - Step-Ausführungsdetails
CREATE TABLE public.workflow_run_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES public.workflow_steps(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Content Generations - KI-generierte Inhalte (Pomelli-Alternative)
CREATE TABLE public.content_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL,
  platform TEXT,
  prompt TEXT NOT NULL,
  generated_content TEXT,
  brand_context JSONB,
  status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Tasks - Aufgaben-Tabelle
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workflow_run_id UUID REFERENCES public.workflow_runs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'todo',
  due_date TIMESTAMP WITH TIME ZONE,
  category TEXT,
  source TEXT DEFAULT 'manual',
  related_resource_type TEXT,
  related_resource_id UUID,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_workflows_user_id ON public.workflows(user_id);
CREATE INDEX idx_workflows_status ON public.workflows(status);
CREATE INDEX idx_workflows_category ON public.workflows(category);
CREATE INDEX idx_workflow_steps_workflow_id ON public.workflow_steps(workflow_id);
CREATE INDEX idx_workflow_runs_workflow_id ON public.workflow_runs(workflow_id);
CREATE INDEX idx_workflow_runs_status ON public.workflow_runs(status);
CREATE INDEX idx_workflow_run_steps_run_id ON public.workflow_run_steps(run_id);
CREATE INDEX idx_content_generations_user_id ON public.content_generations(user_id);
CREATE INDEX idx_content_generations_status ON public.content_generations(status);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);

-- =============================================
-- ENABLE RLS
-- =============================================
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_run_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - Workflows
-- =============================================
CREATE POLICY "Users can view own workflows"
  ON public.workflows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workflows"
  ON public.workflows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflows"
  ON public.workflows FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workflows"
  ON public.workflows FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - Workflow Steps
-- =============================================
CREATE POLICY "Users can view steps of own workflows"
  ON public.workflow_steps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.workflows 
    WHERE workflows.id = workflow_steps.workflow_id 
    AND workflows.user_id = auth.uid()
  ));

CREATE POLICY "Users can create steps for own workflows"
  ON public.workflow_steps FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.workflows 
    WHERE workflows.id = workflow_steps.workflow_id 
    AND workflows.user_id = auth.uid()
  ));

CREATE POLICY "Users can update steps of own workflows"
  ON public.workflow_steps FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.workflows 
    WHERE workflows.id = workflow_steps.workflow_id 
    AND workflows.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete steps of own workflows"
  ON public.workflow_steps FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.workflows 
    WHERE workflows.id = workflow_steps.workflow_id 
    AND workflows.user_id = auth.uid()
  ));

-- =============================================
-- RLS POLICIES - Workflow Runs
-- =============================================
CREATE POLICY "Users can view runs of own workflows"
  ON public.workflow_runs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.workflows 
    WHERE workflows.id = workflow_runs.workflow_id 
    AND workflows.user_id = auth.uid()
  ));

CREATE POLICY "Users can create runs for own workflows"
  ON public.workflow_runs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.workflows 
    WHERE workflows.id = workflow_runs.workflow_id 
    AND workflows.user_id = auth.uid()
  ));

CREATE POLICY "Users can update runs of own workflows"
  ON public.workflow_runs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.workflows 
    WHERE workflows.id = workflow_runs.workflow_id 
    AND workflows.user_id = auth.uid()
  ));

-- =============================================
-- RLS POLICIES - Workflow Run Steps
-- =============================================
CREATE POLICY "Users can view run steps of own workflows"
  ON public.workflow_run_steps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.workflow_runs wr
    JOIN public.workflows w ON w.id = wr.workflow_id
    WHERE wr.id = workflow_run_steps.run_id 
    AND w.user_id = auth.uid()
  ));

CREATE POLICY "Users can create run steps for own workflows"
  ON public.workflow_run_steps FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.workflow_runs wr
    JOIN public.workflows w ON w.id = wr.workflow_id
    WHERE wr.id = workflow_run_steps.run_id 
    AND w.user_id = auth.uid()
  ));

CREATE POLICY "Users can update run steps of own workflows"
  ON public.workflow_run_steps FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.workflow_runs wr
    JOIN public.workflows w ON w.id = wr.workflow_id
    WHERE wr.id = workflow_run_steps.run_id 
    AND w.user_id = auth.uid()
  ));

-- =============================================
-- RLS POLICIES - Content Generations
-- =============================================
CREATE POLICY "Users can view own content generations"
  ON public.content_generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own content generations"
  ON public.content_generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content generations"
  ON public.content_generations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content generations"
  ON public.content_generations FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - Tasks
-- =============================================
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- TRIGGER FOR updated_at
-- =============================================
CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- RPC FUNCTIONS
-- =============================================

-- Get workflow stats for dashboard
CREATE OR REPLACE FUNCTION public.get_workflow_stats()
RETURNS TABLE (
  total_workflows BIGINT,
  active_workflows BIGINT,
  total_runs_today BIGINT,
  total_runs_week BIGINT,
  success_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM workflows WHERE user_id = auth.uid())::BIGINT as total_workflows,
    (SELECT COUNT(*) FROM workflows WHERE user_id = auth.uid() AND status = 'active')::BIGINT as active_workflows,
    (SELECT COUNT(*) FROM workflow_runs wr 
     JOIN workflows w ON w.id = wr.workflow_id 
     WHERE w.user_id = auth.uid() 
     AND wr.started_at >= CURRENT_DATE)::BIGINT as total_runs_today,
    (SELECT COUNT(*) FROM workflow_runs wr 
     JOIN workflows w ON w.id = wr.workflow_id 
     WHERE w.user_id = auth.uid() 
     AND wr.started_at >= CURRENT_DATE - INTERVAL '7 days')::BIGINT as total_runs_week,
    COALESCE(
      (SELECT ROUND(
        (COUNT(*) FILTER (WHERE wr.status = 'completed')::NUMERIC / 
         NULLIF(COUNT(*)::NUMERIC, 0)) * 100, 1
      )
      FROM workflow_runs wr 
      JOIN workflows w ON w.id = wr.workflow_id 
      WHERE w.user_id = auth.uid() 
      AND wr.started_at >= CURRENT_DATE - INTERVAL '30 days'),
      0
    )::NUMERIC as success_rate;
END;
$$;

-- Toggle workflow status
CREATE OR REPLACE FUNCTION public.toggle_workflow_status(p_workflow_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_status TEXT;
BEGIN
  SELECT status INTO current_status 
  FROM workflows 
  WHERE id = p_workflow_id AND user_id = auth.uid();
  
  IF current_status IS NULL THEN
    RETURN FALSE;
  END IF;
  
  UPDATE workflows 
  SET status = CASE 
    WHEN current_status = 'active' THEN 'paused'
    WHEN current_status = 'paused' THEN 'active'
    WHEN current_status = 'draft' THEN 'active'
    ELSE current_status
  END,
  updated_at = now()
  WHERE id = p_workflow_id AND user_id = auth.uid();
  
  RETURN TRUE;
END;
$$;

-- Complete a task
CREATE OR REPLACE FUNCTION public.complete_task(p_task_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE tasks 
  SET status = 'done',
      completed_at = now(),
      updated_at = now()
  WHERE id = p_task_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- Get tasks with filters
CREATE OR REPLACE FUNCTION public.get_tasks(
  p_status TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  workflow_run_id UUID,
  title TEXT,
  description TEXT,
  priority TEXT,
  status TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  category TEXT,
  source TEXT,
  related_resource_type TEXT,
  related_resource_id UUID,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT t.*
  FROM tasks t
  WHERE t.user_id = auth.uid()
    AND (p_status IS NULL OR t.status = p_status)
    AND (p_priority IS NULL OR t.priority = p_priority)
    AND (p_category IS NULL OR t.category = p_category)
  ORDER BY 
    CASE t.priority
      WHEN 'urgent' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
    END,
    t.due_date NULLS LAST,
    t.created_at DESC;
END;
$$;