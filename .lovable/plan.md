
# ElevenLabs Agent Integration als Pro-Feature

## Uebersicht
ElevenLabs Conversational AI Agents werden als Premium-Feature (ab Growth/Pro Plan) in das bestehende Anrufsystem integriert. Nutzer koennen ihren eigenen ElevenLabs API-Key und Agent-ID hinterlegen und dann waehlen, ob Anrufe ueber den eingebauten LiveKit-Agent oder ueber ihren ElevenLabs-Agent laufen.

## Aenderungen im Detail

### 1. Datenbank: ElevenLabs-Konfiguration speichern
Neue Spalten in der bestehenden `ai_agent_settings` Tabelle:
- `elevenlabs_api_key` (text, nullable) -- verschluesselt gespeichert
- `elevenlabs_agent_id` (text, nullable) -- die Agent-ID des Nutzers
- `voice_provider` (text, default 'builtin') -- 'builtin' oder 'elevenlabs'

### 2. Settings: ElevenLabs-Integration in den Einstellungen
**Datei: `src/components/settings/AIAgentSettings.tsx`**
- Neuer Abschnitt "Voice Provider" mit Toggle zwischen "Beavy (eingebaut)" und "ElevenLabs (Pro)"
- Wenn ElevenLabs gewaehlt: Eingabefelder fuer API-Key und Agent-ID
- Pro-Badge und Hinweis, dass dies ein Growth-Feature ist
- Link zur ElevenLabs-Dokumentation zum Erstellen eigener Agents

### 3. Integrations-Settings: ElevenLabs als Integration anzeigen
**Datei: `src/components/settings/IntegrationsSettings.tsx`**
- Neue IntegrationCard fuer "ElevenLabs Conversational AI" im Bereich "Marketing & KI"
- Leitet zum AI Agent Settings weiter fuer die Konfiguration

### 4. Anruf-Seite: Provider-Auswahl beim Anruf
**Datei: `src/pages/NewCall.tsx`**
- Dritter Tab neben "Web-Anruf (LiveKit)" und "Telefon (Twilio)": **"ElevenLabs Agent"**
- Tab nur sichtbar wenn ElevenLabs konfiguriert ist (agent_id + api_key vorhanden)
- Wenn ausgewaehlt: Zeigt den `ElevenLabsAgent`-Komponenten inline an, angepasst mit der gespeicherten Agent-ID des Nutzers

### 5. Voice-Kampagnen: ElevenLabs-Option
**Datei: `src/pages/VoiceCampaigns.tsx`**
- Die bestehende ElevenLabs-Karte zeigt dynamisch den konfigurierten Agent des Nutzers an (statt hartcodierter ID)
- Falls nicht konfiguriert: Hinweis mit Link zu den Settings

### 6. ElevenLabsAgent-Komponente erweitern
**Datei: `src/components/ElevenLabsAgent.tsx`**
- `agentId` als optionaler Prop (faellt zurueck auf die konfigurierte ID aus den Settings)
- Laedt die ElevenLabs-Konfiguration aus `ai_agent_settings` via Hook
- Zeigt "Pro Feature"-Hinweis wenn nicht konfiguriert

### 7. Kampagnen-Wizard: Voice-Provider Auswahl
**Datei: `src/components/wizard/StepVoiceSettings.tsx`**
- Neuer Abschnitt ganz oben: "Voice Provider" Toggle
- Option 1: "Beavy Agent" (Standard) -- behaelt alle bisherigen Einstellungen
- Option 2: "ElevenLabs Agent (Pro)" -- zeigt Agent-ID Feld, blendet Stimm-/LLM-Auswahl aus
- Die Auswahl wird im `ai_prompt` JSON der Kampagne gespeichert als `voiceProvider: 'builtin' | 'elevenlabs'`

### 8. Hook: useElevenLabsConfig
**Neue Datei: `src/hooks/useElevenLabsConfig.ts`**
- Liest die ElevenLabs-Konfiguration aus `ai_agent_settings`
- Bietet `isConfigured`, `agentId`, `hasProAccess` Properties
- Wiederverwendbar in allen Komponenten

## Technische Details

### Datenbank-Migration
```sql
ALTER TABLE ai_agent_settings 
  ADD COLUMN elevenlabs_api_key text,
  ADD COLUMN elevenlabs_agent_id text,
  ADD COLUMN voice_provider text DEFAULT 'builtin';
```

### Kampagnen-JSON Erweiterung (ai_prompt Feld)
```text
{
  "voiceProvider": "elevenlabs",        // NEU
  "elevenlabsAgentId": "agent_xxx",     // NEU
  "voiceSettings": { ... },
  "llmProvider": "openai",
  ...
}
```

### Sicherheit
- Der ElevenLabs API-Key wird nur in der Datenbank gespeichert (RLS geschuetzt)
- Fuer WebRTC-Verbindungen wird der Agent direkt im Browser mit der Agent-ID angesprochen (public agents brauchen keinen API-Key serverseitig)
- Falls authentifizierte Agents genutzt werden: Edge Function `elevenlabs-conversation-token` erstellen, die den API-Key aus der DB liest und einen Token generiert

### Dateien die erstellt/geaendert werden
| Datei | Aktion |
|---|---|
| `src/hooks/useElevenLabsConfig.ts` | Neu |
| `src/components/settings/AIAgentSettings.tsx` | Erweitern |
| `src/components/settings/IntegrationsSettings.tsx` | Erweitern |
| `src/components/ElevenLabsAgent.tsx` | Erweitern (dynamische Agent-ID) |
| `src/pages/NewCall.tsx` | Erweitern (dritter Tab) |
| `src/pages/VoiceCampaigns.tsx` | Anpassen (dynamische Config) |
| `src/components/wizard/StepVoiceSettings.tsx` | Erweitern (Provider-Wahl) |
| DB Migration | Neue Spalten in ai_agent_settings |
