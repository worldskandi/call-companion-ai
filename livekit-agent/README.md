# Grok Voice Agent für LiveKit

Dieser Agent verbindet sich mit LiveKit Cloud und nutzt xAI's Grok Voice API für Sprachanrufe.

## Deployment auf Fly.io

### 1. Fly CLI installieren

```bash
# macOS
brew install flyctl

# Windows (PowerShell)
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Linux
curl -L https://fly.io/install.sh | sh
```

### 2. Bei Fly.io anmelden

```bash
fly auth login
```

### 3. App erstellen

```bash
cd livekit-agent
fly launch --no-deploy
```

Wähle "Frankfurt" (fra) als Region für beste Latenz in Deutschland.

### 4. Secrets setzen

```bash
fly secrets set LIVEKIT_URL=wss://dein-projekt.livekit.cloud
fly secrets set LIVEKIT_API_KEY=dein-api-key
fly secrets set LIVEKIT_API_SECRET=dein-api-secret
fly secrets set XAI_API_KEY=dein-xai-api-key
```

### 5. Deployen

```bash
fly deploy
```

### 6. Logs prüfen

```bash
fly logs
```

## Lokales Testen

```bash
# .env Datei erstellen
cp .env.example .env
# Werte in .env eintragen

# Dependencies installieren
pip install -r requirements.txt

# Agent starten
python agent.py dev
```

## Anpassungen

- **Sprache ändern**: In `agent.py` die `instructions` anpassen
- **Stimme ändern**: `voice` Parameter in `RealtimeModel` ändern
- **Kampagnen-Prompts**: Werden automatisch aus Room-Metadata geladen
