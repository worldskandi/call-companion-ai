
# Workflows & Automatisierungen: Datenbank + Content-AI Integration

## Zusammenfassung

Da **Google Labs Pomelli keine oeffentliche API** bietet (es ist ein geschlossenes Experiment mit Web-Only Zugang), werden wir:
1. Vollstaendige Datenbank-Tabellen fuer Workflows erstellen
2. Eine **alternative KI-Content-Generation** ueber die bestehende OpenAI/Grok Integration implementieren
3. Optional spaeter Pomelli via OAuth/Screen-Scraping integrieren, wenn Google eine API released

---

## Teil 1: Datenbank-Migration

### Neue Tabellen

#### 1. `workflows` - Haupt-Workflow-Tabelle
```sql
CREATE TABLE public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_id TEXT,                    -- Referenz auf Template (z.B. 'email-followup')
  category TEXT DEFAULT 'general',     -- communication, sales, productivity, analytics, content
  status TEXT DEFAULT 'draft',         -- draft, active, paused, archived
  trigger_type TEXT NOT NULL,          -- schedule, event, manual, webhook
  trigger_config JSONB DEFAULT '{}',   -- Trigger-Konfiguration
  is_pomelli BOOLEAN DEFAULT false,    -- Pomelli-Workflow Flag
  run_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 2. `workflow_steps` - Workflow-Schritte/Aktionen
```sql
CREATE TABLE public.workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  action_type TEXT NOT NULL,           -- send_email, create_task, notify_slack, generate_content, etc.
  action_config JSONB DEFAULT '{}',    -- Action-spezifische Konfiguration
  condition_config JSONB,              -- Optionale Bedingungen
  delay_minutes INTEGER DEFAULT 0,     -- Verzoegerung vor Ausfuehrung
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 3. `workflow_runs` - Ausfuehrungsprotokoll
```sql
CREATE TABLE public.workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  triggered_by TEXT,                   -- schedule, event:lead_created, manual, webhook
  trigger_data JSONB,                  -- Kontext-Daten
  status TEXT DEFAULT 'running',       -- running, completed, failed, cancelled
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  steps_completed INTEGER DEFAULT 0,
  steps_total INTEGER DEFAULT 0
);
```

#### 4. `workflow_run_steps` - Step-Ausfuehrungsdetails
```sql
CREATE TABLE public.workflow_run_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES public.workflow_steps(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',       -- pending, running, completed, failed, skipped
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);
```

#### 5. `content_generations` - KI-generierte Inhalte (Pomelli-Alternative)
```sql
CREATE TABLE public.content_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL,          -- social_post, ad_copy, blog_intro, email, image_prompt
  platform TEXT,                       -- instagram, linkedin, facebook, twitter, blog
  prompt TEXT NOT NULL,
  generated_content TEXT,
  brand_context JSONB,                 -- Brand-Farben, Stil, etc. aus company_profiles
  status TEXT DEFAULT 'pending',       -- pending, generating, completed, failed
  metadata JSONB DEFAULT '{}',         -- Zusaetzliche Daten (Hashtags, Varianten, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 6. `tasks` - Aufgaben-Tabelle (fuer Task-Automatisierung)
```sql
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_run_id UUID REFERENCES public.workflow_runs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',      -- low, medium, high, urgent
  status TEXT DEFAULT 'todo',          -- todo, in_progress, done, cancelled
  due_date TIMESTAMP WITH TIME ZONE,
  category TEXT,
  source TEXT DEFAULT 'manual',        -- manual, workflow, email, ai
  related_resource_type TEXT,          -- lead, campaign, call, email
  related_resource_id UUID,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

## Teil 2: RLS Policies

Alle Tabellen erhalten Standard-RLS-Policies:
- Users koennen nur eigene Daten sehen/erstellen/bearbeiten/loeschen
- Workflow-Runs sind read-only fuer normale User (nur System kann erstellen)

---

## Teil 3: Database Functions (RPCs)

### Workflow-Management
- `create_workflow(name, description, template_id, trigger_type, trigger_config)`
- `update_workflow(workflow_id, ...)`
- `delete_workflow(workflow_id)`
- `get_workflows(status, category)`
- `get_workflow(workflow_id)`
- `toggle_workflow_status(workflow_id)` - active/paused umschalten

### Workflow-Ausfuehrung
- `trigger_workflow(workflow_id, trigger_data)` - Workflow manuell starten
- `get_workflow_runs(workflow_id, limit)` - Letzte Ausfuehrungen
- `get_workflow_stats()` - Dashboard-Statistiken

### Task-Management
- `create_task(title, description, priority, due_date, category)`
- `update_task(task_id, ...)`
- `delete_task(task_id)`
- `get_tasks(status, priority, category)`
- `complete_task(task_id)`

### Content-Generation
- `create_content_generation(content_type, platform, prompt, brand_context)`
- `get_content_generations(status, content_type)`

---

## Teil 4: Edge Function fuer Content-Generation

### `generate-marketing-content/index.ts`

Da Pomelli keine API hat, nutzen wir unsere bestehende OpenAI/Grok-Integration:

```typescript
// Generiert Marketing-Content basierend auf:
// - Brand-Daten aus company_profiles (Farben, Logo, USPs)
// - Content-Typ (Social Post, Ad Copy, etc.)
// - Platform-spezifische Anforderungen

interface GenerateContentRequest {
  contentType: 'social_post' | 'ad_copy' | 'blog_intro' | 'email';
  platform?: string;
  topic: string;
  tone?: 'professional' | 'casual' | 'funny' | 'inspirational';
  includeHashtags?: boolean;
  variations?: number; // Anzahl Varianten
}
```

**Features:**
- Laedt automatisch Brand-Daten aus `company_profiles`
- Generiert platform-spezifischen Content (z.B. Instagram vs LinkedIn)
- Erstellt mehrere Varianten fuer A/B-Tests
- Speichert in `content_generations` Tabelle

---

## Teil 5: Frontend-Updates

### Neue Dateien

```text
src/hooks/useWorkflows.ts         - Workflow CRUD Operationen
src/hooks/useTasks.ts             - Task CRUD (erweitert)
src/hooks/useContentGeneration.ts - Content-AI Hook
src/components/workflows/         - Workflow-Komponenten
  WorkflowBuilder.tsx             - Visueller Workflow-Editor
  WorkflowStepConfig.tsx          - Step-Konfiguration
  WorkflowRunHistory.tsx          - Ausfuehrungsverlauf
src/components/content/           - Content-Generation
  ContentGenerator.tsx            - KI-Content-Generator UI
  ContentPreview.tsx              - Vorschau-Komponente
  PlatformSelector.tsx            - Platform-Auswahl
```

### Aktualisierte Dateien

```text
src/pages/Workflows.tsx           - Integration mit echten Daten
src/pages/Tasks.tsx               - Datenbank-Anbindung
```

---

## Teil 6: Pomelli-Alternative Strategie

### Jetzt implementieren: "Beavy Content AI"

Eigene Content-Generation mit:
1. **Brand-Awareness**: Nutzt company_profiles fuer konsistentes Branding
2. **Multi-Platform**: Instagram, LinkedIn, Facebook, Twitter, Blog
3. **Template-System**: Vorgefertigte Prompts fuer verschiedene Content-Typen
4. **Batch-Generation**: Mehrere Posts auf einmal erstellen
5. **Scheduling**: Content fuer Workflows/Kalender planen

### Spaeter (wenn verfuegbar): Echte Pomelli-Integration

Optionen:
- OAuth-Flow wenn Google API released
- Browser-Extension fuer manuellen Export
- Webhooks/Automation via Zapier/Make

---

## Implementierungsreihenfolge

1. **Migration erstellen** - Alle Tabellen + RLS + Functions
2. **Edge Function** - Content-Generation-Logik
3. **Frontend Hooks** - useWorkflows, useTasks, useContentGeneration
4. **Workflows Page** - Mit Datenbank verbinden
5. **Tasks Page** - Mit Datenbank verbinden
6. **Content Generator UI** - Pomelli-Alternative

---

## Geschaetzter Umfang

| Komponente | Dateien | Komplexitaet |
|------------|---------|--------------|
| Migration | 1 | Mittel |
| Edge Function | 1 | Mittel |
| Hooks | 3 | Niedrig |
| UI Komponenten | 5-7 | Mittel |
| Page Updates | 2 | Niedrig |

**Gesamt: ~12-14 Dateien**
