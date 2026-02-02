
# App-Neuausrichtung: Von Telefonie zu Backoffice-Automatisierung

## Zusammenfassung

Die App wird von einem Telefonie-fokussierten Tool zu einer umfassenden **Backoffice-Automatisierungs-Plattform** umgebaut. Der Fokus liegt jetzt auf:
- **E-Mail-Management** (Inbox, Zusammenfassungen)
- **Tagesplanung & Aufgaben**
- **KI-Assistent für Backoffice-Aufgaben**
- Voice Agent bleibt als wichtige Komponente, aber nicht mehr im Mittelpunkt

---

## Neue Navigation & Seitenstruktur

### Bisherige Navigation:
```text
Dashboard | Leads | Kampagnen | Anrufe | Termine | Firma & Produkte | Analytics | Telefonnummern | Einstellungen
```

### Neue Navigation:
```text
+------------------+----------------------------------------+
| HAUPTBEREICH     |                                        |
+------------------+----------------------------------------+
| Dashboard        | Tagesueberblick mit KI-Zusammenfassung |
| Inbox            | Unified Inbox (E-Mail, Nachrichten)    |
| Aufgaben         | Task-Management & To-Do Listen         |
| Kalender         | Termine & Tagesplanung                 |
| Kontakte         | CRM (ehemals Leads)                    |
+------------------+----------------------------------------+
| AUTOMATISIERUNG  |                                        |
+------------------+----------------------------------------+
| Workflows        | Automatisierungen (ehemals Kampagnen)  |
| Voice Agent      | Anrufe & Telefonie (reduziert)         |
+------------------+----------------------------------------+
| WEITERES         |                                        |
+------------------+----------------------------------------+
| Analytics        | Reports & Statistiken                  |
| Einstellungen    | Alle Einstellungen                     |
+------------------+----------------------------------------+
```

---

## Neue Features & Seiten

### 1. Unified Inbox (`/app/inbox`)
**Zweck:** Alle E-Mails und Nachrichten an einem Ort

**Funktionen:**
- E-Mail-Liste mit Vorschau
- KI-Zusammenfassung pro E-Mail
- Quick Actions (Antworten, Archivieren, Weiterleiten)
- Filter nach Prioritaet, Absender, Status
- Integration mit bestehenden E-Mail-Konten

### 2. Aufgaben-Management (`/app/tasks`)
**Zweck:** Zentrale Aufgabenverwaltung

**Funktionen:**
- Aufgabenliste mit Prioritaeten
- Faelligkeitsdaten & Erinnerungen
- Kategorien/Tags
- KI-generierte Aufgaben aus E-Mails
- Drag & Drop Sortierung

### 3. Erweitertes Dashboard
**Zweck:** Tagesueberblick mit KI-Unterstuetzung

**Neue Elemente:**
- "Dein Tag auf einen Blick" - KI-Zusammenfassung
- Anstehende Termine heute
- Wichtige E-Mails
- Offene Aufgaben
- Quick Actions fuer haeufige Aktionen

### 4. Umbenennung bestehender Seiten
| Alt | Neu |
|-----|-----|
| Leads | Kontakte |
| Kampagnen | Workflows |
| Anrufe | Voice Agent |
| Meetings | Kalender |

---

## Technische Aenderungen

### Dateien die erstellt werden:

```text
src/pages/Inbox.tsx              - Neue Inbox-Seite
src/pages/Tasks.tsx              - Aufgaben-Management
src/components/inbox/            - Inbox-Komponenten
  EmailList.tsx                  - E-Mail-Liste
  EmailPreview.tsx               - E-Mail-Vorschau
  EmailSummary.tsx               - KI-Zusammenfassung
src/components/tasks/            - Task-Komponenten
  TaskList.tsx                   - Aufgabenliste
  TaskItem.tsx                   - Einzelne Aufgabe
  TaskQuickAdd.tsx               - Schnell hinzufuegen
src/hooks/useInbox.ts            - Inbox Hook
src/hooks/useTasks.ts            - Tasks Hook
```

### Dateien die geaendert werden:

```text
src/App.tsx                      - Neue Routen
src/components/layout/DashboardLayout.tsx - Neue Navigation
src/pages/Dashboard.tsx          - Neues Layout mit Tagesueberblick
src/pages/Leads.tsx              - Umbenennung zu Kontakte
src/pages/Campaigns.tsx          - Umbenennung zu Workflows
src/pages/Calls.tsx              - Umbenennung zu Voice Agent
src/pages/Meetings.tsx           - Umbenennung zu Kalender
```

### Navigations-Aenderung (DashboardLayout.tsx):
```typescript
const navigationItems = [
  // Hauptbereich
  { title: 'Dashboard', url: '/app', icon: LayoutDashboard },
  { title: 'Inbox', url: '/app/inbox', icon: Mail },
  { title: 'Aufgaben', url: '/app/tasks', icon: CheckSquare },
  { title: 'Kalender', url: '/app/calendar', icon: CalendarDays },
  { title: 'Kontakte', url: '/app/contacts', icon: Users },
  // Automatisierung
  { title: 'Workflows', url: '/app/workflows', icon: Workflow },
  { title: 'Voice Agent', url: '/app/voice', icon: Phone },
  // Weiteres
  { title: 'Analytics', url: '/app/analytics', icon: BarChart3 },
  { title: 'Einstellungen', url: '/app/settings', icon: Settings },
];
```

---

## Branding-Aenderungen

### Sidebar Header:
- **Alt:** "CallFlow AI" mit Phone-Icon
- **Neu:** "Beavy" mit Workflow/Sparkles-Icon

### Quick Action Button:
- **Alt:** "Neuer Anruf"
- **Neu:** "Neue Aufgabe" oder "KI-Assistent"

---

## Datenbank-Erweiterungen (spaeter)

Fuer die vollstaendige Implementierung werden diese Tabellen benoetigt:
- `emails` - E-Mail-Cache und Metadaten
- `email_summaries` - KI-Zusammenfassungen
- `tasks` - Aufgaben
- `task_categories` - Kategorien

Diese werden in einem separaten Schritt implementiert.

---

## Implementierungsreihenfolge

1. **Navigation & Routing aktualisieren** - Neue Struktur einrichten
2. **Branding aendern** - Beavy statt CallFlow AI
3. **Dashboard ueberarbeiten** - Backoffice-Fokus
4. **Inbox-Seite erstellen** - E-Mail-Management
5. **Tasks-Seite erstellen** - Aufgabenverwaltung
6. **Bestehende Seiten umbenennen** - Leads zu Kontakte, etc.
7. **OpenClaw erweitern** - Backoffice-spezifische Tools

---

## UI-Vorschau

### Neues Dashboard-Layout:
```text
+--------------------------------------------------+
| Guten Morgen! Hier ist dein Tag:                 |
+--------------------------------------------------+
| [KI-Zusammenfassung des Tages]                   |
| - 5 neue E-Mails, 2 davon wichtig                |
| - 3 Termine heute                                 |
| - 8 offene Aufgaben                              |
+--------------------------------------------------+
|                    |                              |
| Anstehende Termine | Wichtige E-Mails            |
| - 10:00 Meeting    | - Anfrage von Max Mueller    |
| - 14:00 Call       | - Rechnung faellig           |
|                    |                              |
+--------------------------------------------------+
| Offene Aufgaben              | OpenClaw Chat     |
| [ ] Angebot erstellen        |                   |
| [ ] Follow-up senden         |                   |
| [ ] Report vorbereiten       |                   |
+--------------------------------------------------+
```

