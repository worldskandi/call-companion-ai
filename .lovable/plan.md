

# OpenClaw Chat Upgrade Plan

## Übersicht

Upgrade des OpenClaw Chat-Assistenten mit Session-Persistenz, Kontext-Awareness und Quick Actions.

---

## Status Quo

| Feature | Status |
|---------|--------|
| Markdown-Rendering | ✅ Vorhanden (react-markdown) |
| Typing Indicator | ✅ Vorhanden ("Denkt nach...") |
| Session-Persistenz | ❌ Fehlt |
| Kontext-Awareness | ❌ Fehlt |
| Quick Actions | ❌ Fehlt |

---

## Architektur

```text
+------------------+      +-------------------+      +------------------+
|   OpenClawChat   | ---> |  useOpenClawChat  | ---> |  Edge Function   |
|   (Component)    |      |     (Hook)        |      |  openclaw-chat   |
+------------------+      +-------------------+      +------------------+
        |                         |                          |
        |                         v                          v
        |                 +---------------+          +---------------+
        +---------------> |   Supabase    | <------> |   OpenClaw    |
           Quick Actions  | chat_messages |          |   Gateway     |
           Page Context   | conversations |          +---------------+
                          +---------------+
```

---

## Änderungen

### 1. Datenbank-Schema (Migration)

Neue Tabellen für Chat-Persistenz:

**chat_conversations**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → auth.users)
- `title` (TEXT, auto-generiert aus erster Nachricht)
- `created_at`, `updated_at` (Timestamps)

**chat_messages**
- `id` (UUID, Primary Key)
- `conversation_id` (UUID, Foreign Key)
- `role` ('user' | 'assistant')
- `content` (TEXT)
- `page_context` (TEXT, nullable - z.B. "/app/leads")
- `created_at` (Timestamp)

RLS-Policies: Nur eigene Conversations lesen/schreiben.

---

### 2. Hook Refactoring: `useOpenClawChat.ts`

| Änderung | Beschreibung |
|----------|--------------|
| Conversation Loading | Beim Mount: Lade aktive Conversation oder erstelle neue |
| Message Persistence | Nach jeder Nachricht: Speichere in `chat_messages` |
| Page Context | Nutze `useLocation()` um aktuelle Route mitzuschicken |
| LocalStorage Fallback | Speichere `conversation_id` für Session-Wiederherstellung |

**Neue Funktionen:**
- `loadConversation(conversationId?)` - Lade bestehende oder neue Conversation
- `saveMessage(role, content, pageContext)` - Speichere in DB

---

### 3. Edge Function Update: `openclaw-chat/index.ts`

Erweiterter Request-Body:
```json
{
  "messages": [...],
  "pageContext": "/app/leads",
  "conversationId": "uuid"
}
```

Erweiterter System-Prompt:
```text
"Du bist ein hilfreicher KI-Assistent im FlowCRM Dashboard. 
Der User befindet sich aktuell auf: {pageContext}. 
Nutze diesen Kontext um proaktiv zu helfen..."
```

---

### 4. UI-Erweiterungen: `OpenClawChat.tsx`

**Quick Actions Bar** (unter dem Empty State):

| Button | Aktion |
|--------|--------|
| "Leads analysieren" | Sendet: "Analysiere meine aktuellen Leads" |
| "Workflow erstellen" | Sendet: "Hilf mir einen neuen Workflow zu erstellen" |
| "Report generieren" | Sendet: "Erstelle einen Performance-Report" |

**Kontext-Badge** (im Header):
- Zeigt aktuelle Seite an: "📍 Leads"
- Klickbar: Erklärt dem AI den Kontext

**Verbesserte Ladeanimation:**
- Pulsierende Dots statt nur Spinner
- "OpenClaw denkt nach..." mit Animation

---

### 5. Conversation Management

**Neue Conversation starten:**
- "Neuer Chat" Button im Header
- Alte Conversation wird archiviert, neue ID erstellt

**Conversation-Historie** (Optional für später):
- Dropdown mit letzten 5 Conversations
- Möglichkeit alte Chats wiederherzustellen

---

## Technische Details

### Datei-Änderungen

| Datei | Aktion |
|-------|--------|
| `supabase/migrations/xxx_chat_tables.sql` | Neu: DB-Schema |
| `src/integrations/supabase/types.ts` | Regenerieren nach Migration |
| `src/hooks/useOpenClawChat.ts` | Refactoring: Persistenz + Context |
| `src/components/OpenClawChat.tsx` | Update: Quick Actions + Context Badge |
| `supabase/functions/openclaw-chat/index.ts` | Update: Context im Prompt |

### Dependencies

Keine neuen Dependencies nötig - alle Funktionalität mit bestehendem Stack:
- `react-router-dom` (useLocation für Page Context)
- `@supabase/supabase-js` (DB-Zugriff)
- `react-markdown` (bereits installiert)

---

## Implementierungs-Reihenfolge

1. **Migration erstellen** → DB-Tabellen + RLS
2. **Hook refactoren** → Persistenz-Logik
3. **Edge Function updaten** → Context-aware Prompt
4. **UI erweitern** → Quick Actions + Context Badge
5. **Testen** → End-to-End Flow prüfen

---

## Erwartetes Ergebnis

- Chat-History bleibt nach Reload erhalten
- AI weiß auf welcher Seite der User ist und kann proaktiv helfen
- Quick Actions erleichtern den Einstieg
- Typing-Indicator zeigt klar dass AI arbeitet

