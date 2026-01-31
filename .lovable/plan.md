
# OpenClawd Chat-Integration im Dashboard

## Übersicht
Integration deines selbst gehosteten OpenClawd KI-Assistenten als Chat-Widget im Dashboard. Die Kommunikation erfolgt über eine Edge Function, die mit deinem VPS kommuniziert.

## Was wird erstellt

### 1. Secrets für die Konfiguration
- **OPENCLAWD_URL**: Die Basis-URL deines OpenClawd Servers (z.B. `https://dein-server.de/v1`)
- **OPENCLAWD_API_KEY** (optional): Falls dein Server einen API-Key benötigt

### 2. Edge Function: `openclawd-chat`
Eine neue Edge Function, die als Proxy zwischen der App und deinem VPS fungiert:
- Nimmt Nachrichten vom Frontend entgegen
- Leitet sie an deinen OpenClawd Server weiter (`/chat/completions`)
- Streamt die Antwort Token für Token zurück (SSE)
- Unterstützt Konversationshistorie

### 3. React Hook: `useOpenClawdChat`
Ein neuer Hook für die Chat-Logik:
- Verwaltet Nachrichten-Historie
- Handled SSE-Streaming Token für Token
- Bietet `sendMessage`, `clearChat`, `isLoading` States

### 4. Chat-Komponente: `OpenClawdChat`
Ein elegantes Chat-Widget für das Dashboard:
- Markdown-Rendering für formatierte Antworten
- Echtzeit-Streaming mit Typing-Indikator
- Scroll-to-bottom bei neuen Nachrichten
- Eingabefeld mit Enter-zum-Senden
- "Chat leeren" Button
- Responsive Design passend zum Dashboard-Stil

### 5. Dashboard Integration
Das Chat-Widget wird als neue Karte im Dashboard eingefügt:
- Platziert neben den Quick Actions oder darunter
- Gleiche Höhe wie die anderen Cards
- Collapsible/Erweiterbar bei Bedarf

## Architektur

```text
┌─────────────────────────────────────────────────────────────────┐
│                         Dashboard                                │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │ Stats Cards  │  │ Quick Actions│  │  OpenClawd Chat       │  │
│  │              │  │              │  │  ┌─────────────────┐  │  │
│  │              │  │              │  │  │ Nachricht...    │  │  │
│  │              │  │              │  │  │ Antwort...      │  │  │
│  └──────────────┘  └──────────────┘  │  ├─────────────────┤  │  │
│                                      │  │ [Eingabe...]    │  │  │
│                                      │  └─────────────────┘  │  │
│                                      └───────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Edge Function: openclawd-chat                       │
│  - Empfängt Nachrichten vom Frontend                            │
│  - Fügt System-Prompt hinzu                                     │
│  - Ruft OPENCLAWD_URL/chat/completions auf                      │
│  - Streamt Antwort als SSE zurück                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Dein VPS: OpenClawd Server                          │
│  - OpenAI-kompatible API                                        │
│  - SSE Streaming Support                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Technische Details

### Edge Function (vereinfacht)
```typescript
// POST { messages: [...] }
// -> Weiterleitung an OPENCLAWD_URL/chat/completions mit stream: true
// -> SSE Response zurück ans Frontend
```

### Frontend Streaming
- Line-by-line SSE Parsing
- Jeder Token wird sofort gerendert
- Handling von `[DONE]` Signal
- Fehlerbehandlung für Netzwerkprobleme

### Chat UI Features
- Markdown-Support (via `react-markdown`)
- Code-Blöcke mit Syntax-Highlighting
- Kopieren von Antworten
- Zeitstempel für Nachrichten
- Scroll-Management

## Dateien die erstellt/geändert werden

| Datei | Aktion |
|-------|--------|
| `supabase/functions/openclawd-chat/index.ts` | Neu |
| `supabase/config.toml` | Ändern (neue Function eintragen) |
| `src/hooks/useOpenClawdChat.ts` | Neu |
| `src/components/OpenClawdChat.tsx` | Neu |
| `src/pages/Dashboard.tsx` | Ändern (Chat-Widget einfügen) |

## Nächste Schritte nach Genehmigung
1. Ich werde nach deiner OpenClawd Server-URL fragen (als Secret)
2. Falls dein Server einen API-Key braucht, auch diesen
3. Dann implementiere ich alles und deploye die Edge Function
