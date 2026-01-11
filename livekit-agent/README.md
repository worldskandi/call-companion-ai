# Cold Call AI Agent - Setup Guide

Ein LiveKit Voice Agent für automatisierte Outbound-Calls mit Grok/OpenAI Voice API.

---

## Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                    WEB-ANRUF (LiveKit)                      │
│                                                             │
│  Lovable Frontend → LiveKit Cloud → Agent → Grok/OpenAI    │
│     (Browser)         (WebRTC)                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 TELEFON-ANRUF (Twilio)                      │
│                                                             │
│  Echtes Telefon → Twilio → LiveKit SIP → Agent → Grok      │
│     (PSTN)        (SIP Trunk)                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Voraussetzungen

- LiveKit Cloud Account: https://cloud.livekit.io
- xAI API Key (Grok): https://console.x.ai
- Twilio Account + Telefonnummer (für Telefon-Calls)
- Supabase Projekt (Backend)
- Lovable/React Frontend

---

## 1. LiveKit CLI installieren

```bash
brew install livekit-cli
```

Version prüfen:

```bash
lk --version
```

---

## 2. LiveKit Cloud authentifizieren

```bash
lk cloud auth
```

Das öffnet den Browser - einloggen und Projekt verbinden.

Projekt prüfen:

```bash
lk project list
```

Falls mehrere Projekte:

```bash
lk project set-default "<project-name>"
```

---

## 3. Agent-Projekt erstellen

```bash
mkdir cold-call-agent
cd cold-call-agent
```

---

## 4. requirements.txt erstellen

```bash
cat > requirements.txt << 'EOF'
livekit-agents>=1.2.0
livekit-plugins-openai
livekit-plugins-noise-cancellation
livekit-plugins-silero
python-dotenv
aiohttp
EOF
```

**Hinweis:** `livekit-agents>=1.2.0` ist Pflicht - ältere Versionen werden abgelehnt!

---

## 5. agent.py erstellen

```python
import json
import logging
from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    RunContext,
    cli,
    function_tool,
    room_io,
)
from livekit.agents.llm import ChatContext
from livekit.plugins import (
    noise_cancellation,
    openai,
)

logger = logging.getLogger("ColdCallAgent")
load_dotenv(".env.local")


class ColdCallAgent(Agent):
    def __init__(
        self, 
        instructions: str,
        lead_name: str = None,
        lead_company: str = None,
        lead_email: str = None,
        lead_phone: str = None,
        lead_id: str = None,
        call_log_id: str = None,
        campaign_id: str = None,
        lead_notes: str = None,
        product_description: str = None,
        call_goal: str = None,
        campaign_name: str = None,
        is_outbound: bool = True,
        ai_name: str = "AI Assistent",
        ai_greeting: str = None,
    ) -> None:
        self.lead_name = lead_name
        self.lead_company = lead_company
        self.lead_email = lead_email
        self.lead_phone = lead_phone
        self.lead_id = lead_id
        self.call_log_id = call_log_id
        self.campaign_id = campaign_id
        self.lead_notes = lead_notes
        self.product_description = product_description
        self.call_goal = call_goal
        self.campaign_name = campaign_name
        self.is_outbound = is_outbound
        self.ai_name = ai_name
        self.ai_greeting = ai_greeting
        
        super().__init__(instructions=instructions)

    async def on_enter(self):
        if self.ai_greeting:
            greeting = self.ai_greeting
        elif self.lead_name and self.lead_company:
            greeting = f"Begruesse {self.lead_name} von {self.lead_company} freundlich auf Deutsch."
        elif self.lead_name:
            greeting = f"Begruesse {self.lead_name} freundlich auf Deutsch."
        else:
            greeting = "Begruesse den Anrufer freundlich auf Deutsch."
        
        self.session.generate_reply(instructions=greeting)

    @function_tool
    async def end_call(self, ctx: RunContext):
        """Beende den Anruf hoeflich"""
        await ctx.session.generate_reply(
            instructions="Verabschiede dich hoeflich und beende das Gespraech."
        )


# Server-Instanz erstellen
server = cli.WorkerRunner(name="ColdCallAgent")


@server.rtc_session(agent_name="ColdCallAgent")
async def entrypoint(ctx: JobContext):
    await ctx.connect()
    
    # Room-Metadata lesen
    metadata = {}
    if ctx.room.metadata:
        try:
            raw_metadata = json.loads(ctx.room.metadata)
            if "aiSettings" in raw_metadata:
                metadata = raw_metadata.get("aiSettings", {})
            else:
                metadata = raw_metadata
        except json.JSONDecodeError:
            logger.warning("Could not parse room metadata")
    
    # Werte aus Metadata extrahieren
    ai_prompt = metadata.get("ai_prompt", "")
    product_description = metadata.get("product_description", "")
    call_goal = metadata.get("call_goal", "")
    campaign_name = metadata.get("campaign_name", "")
    lead_name = metadata.get("lead_name", "")
    lead_company = metadata.get("lead_company", "")
    lead_notes = metadata.get("lead_notes", "")
    lead_email = metadata.get("lead_email", "")
    lead_phone = metadata.get("lead_phone", "")
    lead_id = metadata.get("lead_id", "")
    call_log_id = metadata.get("call_log_id", "")
    campaign_id = metadata.get("campaign_id", "")
    is_outbound = metadata.get("is_outbound", True)
    ai_name = metadata.get("ai_name", "AI Assistent")
    ai_greeting = metadata.get("ai_greeting", "")
    custom_prompt = metadata.get("custom_prompt", "")
    
    # Instructions zusammenbauen
    base_instructions = f"""Du bist {ai_name}, ein professioneller deutschsprachiger Telefonassistent.

# Produkt/Service
{product_description if product_description else 'Nicht spezifiziert'}

# Ziel des Anrufs
{call_goal if call_goal else 'Interesse wecken und Termin vereinbaren'}

# Wichtige Regeln
- Sprich IMMER auf Deutsch
- Draenge niemals - akzeptiere ein Nein sofort
- Halte das Gespraech unter 2 Minuten
- Sei hoeflich, professionell aber nicht aufdringlich

# Verfuegbare Tools
- end_call: Gespraech hoeflich beenden

# Zusaetzliche Anweisungen
{custom_prompt if custom_prompt else 'Keine'}
"""

    instructions = ai_prompt if ai_prompt else base_instructions
    
    if lead_name:
        instructions += f"\n\n# Gespraechspartner\nDu sprichst mit {lead_name}"
        if lead_company:
            instructions += f" von {lead_company}"
        instructions += "."
    
    if lead_notes:
        instructions += f"\n\nNotizen zum Lead: {lead_notes}"
    
    session = AgentSession(
        llm=openai.realtime.RealtimeModel(voice="nova"),
    )
    
    await session.start(
        agent=ColdCallAgent(
            instructions=instructions,
            lead_name=lead_name,
            lead_company=lead_company,
            lead_email=lead_email,
            lead_phone=lead_phone,
            lead_id=lead_id,
            call_log_id=call_log_id,
            campaign_id=campaign_id,
            lead_notes=lead_notes,
            product_description=product_description,
            call_goal=call_goal,
            campaign_name=campaign_name,
            is_outbound=is_outbound,
            ai_name=ai_name,
            ai_greeting=ai_greeting,
        ),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: noise_cancellation.BVCTelephony() 
                    if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP 
                    else noise_cancellation.BVC(),
            ),
        ),
    )


if __name__ == "__main__":
    cli.run_app(server)
```

---

## 6. Agent deployen

```bash
lk agent create
```

Das macht automatisch:
- Erstellt `livekit.toml`
- Erstellt `Dockerfile`
- Baut und deployed den Agent

---

## 7. Secrets setzen

```bash
lk cloud secret set OPENAI_API_KEY sk-your-openai-key
```

Für xAI/Grok:

```bash
lk cloud secret set XAI_API_KEY xai-your-key
```

---

## 8. Status prüfen

```bash
lk agent status
```

Sollte zeigen: `Status: Running`

Logs anschauen:

```bash
lk agent logs
lk agent logs -f  # Live-Logs
```

---

## 9. Testen

Im LiveKit Cloud Dashboard → Playground testen.

---

## Supabase Secrets (für Edge Functions)

In Supabase Dashboard → Project Settings → Edge Functions → Secrets:

| Secret | Wert |
|--------|------|
| `LIVEKIT_URL` | `wss://dein-projekt.livekit.cloud` |
| `LIVEKIT_API_KEY` | Aus LiveKit Dashboard |
| `LIVEKIT_API_SECRET` | Aus LiveKit Dashboard |
| `TWILIO_ACCOUNT_SID` | Für Telefon-Calls |
| `TWILIO_AUTH_TOKEN` | Für Telefon-Calls |
| `TWILIO_PHONE_NUMBER` | Deine Twilio-Nummer |
| `XAI_API_KEY` | Für Grok Voice |

---

## Git Workflow

Alle Änderungen commiten und pushen:

```bash
git add . && git commit -m "deine message" && git push
```

### Git Alias einrichten (einmalig)

```bash
git config --global alias.acp '!f() { git add . && git commit -m "$1" && git push; }; f'
```

Dann geht's so:

```bash
git acp "meine commit message"
```

---

## Git Status erklärt

| Status | Bedeutung |
|--------|-----------|
| **Untracked** | Neue Datei, Git ignoriert sie |
| **Staged** | Für nächsten Commit vorgemerkt |
| **Modified** | Datei wurde geändert |
| **Committed** | Im Git-Verlauf gespeichert |

Alle untracked Dateien hinzufügen:

```bash
git add .
```

---

## Cursor Extension: Remote Repositories

VSIX manuell installieren:

```bash
curl -L "https://marketplace.visualstudio.com/_apis/public/gallery/publishers/ms-vscode/vsextensions/remote-repositories/latest/vspackage" | gunzip > ~/remote-repositories.vsix
```

In Cursor: `Cmd + Shift + P` → `Install from VSIX` → `~/remote-repositories.vsix`

**Nutzung:** `Cmd + Shift + P` → `Remote Repositories: Open Remote Repository...`

---

## Troubleshooting

### Agent crashed (CrashLoop)

```bash
lk agent logs --tail 100
```

Häufige Ursachen:
- Falsche `requirements.txt` Version
- Fehlende Secrets
- Python Syntax-Fehler

### Permission Denied beim Dispatch

Token braucht `sfu.admin` Rechte:

```typescript
const serverToken = await generateLiveKitToken({
  video: { roomCreate: true, roomList: true, roomAdmin: true },
  sfu: { admin: true },
});
```

### Edge Function Error 500

Logs in Supabase Dashboard → Edge Functions → Logs prüfen.

---

## Nützliche Befehle

```bash
# Agent Status
lk agent status

# Agent Logs (live)
lk agent logs -f

# Agent neu deployen
lk agent deploy

# Secrets updaten
lk cloud secret set KEY value

# Projekte auflisten
lk project list
```
