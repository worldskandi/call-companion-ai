# LiveKit Agent Server Setup Guide for Grok Voice Agent

This guide explains how to deploy a LiveKit Agent Server on Fly.io that uses the `livekit-plugins-xai` package to connect with xAI's Grok Voice API.

## Prerequisites

1. **Fly.io Account**: Sign up at https://fly.io
2. **LiveKit Cloud Account**: Sign up at https://cloud.livekit.io (Free tier available)
3. **xAI API Key**: Get from https://console.x.ai

## Architecture Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│   Browser   │────▶│  LiveKit    │────▶│  Your Agent Server  │
│  (WebRTC)   │◀────│   Cloud     │◀────│    (Fly.io)         │
└─────────────┘     └─────────────┘     └─────────────────────┘
                                                   │
                                                   ▼
                                        ┌─────────────────────┐
                                        │   xAI Grok API      │
                                        │   (Voice/Realtime)  │
                                        └─────────────────────┘
```

For Twilio integration:
```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│   Phone     │────▶│   Twilio    │────▶│  LiveKit SIP        │
│  (PSTN)     │◀────│   (SIP)     │◀────│  (SIP Trunk)        │
└─────────────┘     └─────────────┘     └─────────────────────┘
                                                   │
                                                   ▼
                                        ┌─────────────────────┐
                                        │  Your Agent Server  │
                                        └─────────────────────┘
```

## Step 1: Create LiveKit Agent Project

Create a new directory for your agent server:

```bash
mkdir grok-voice-agent
cd grok-voice-agent
```

### Python Version (Recommended)

Create `requirements.txt`:

```
livekit-agents>=0.8.0
livekit-plugins-xai>=0.1.0
python-dotenv
```

Create `agent.py`:

```python
import asyncio
import logging
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import xai

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("grok-agent")

class GrokVoiceAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions="""
            Du bist ein freundlicher KI-Assistent für Kaltakquise.
            Deine Aufgabe ist es, potenzielle Kunden anzurufen und 
            ihr Interesse an unseren Produkten zu wecken.
            
            Sei professionell, freundlich und respektiere die Zeit des Gesprächspartners.
            Wenn jemand kein Interesse hat, bedanke dich höflich und beende das Gespräch.
            """,
        )

    async def on_enter(self):
        # Greet the user when they join
        self.session.generate_reply(
            instructions="Begrüße den Anrufer freundlich und stelle dich vor."
        )

async def entrypoint(ctx: agents.JobContext):
    logger.info(f"Connecting to room: {ctx.room.name}")
    
    await ctx.connect()
    
    session = AgentSession(
        llm=xai.realtime.RealtimeModel(
            voice="Grok-2",
            temperature=0.8,
            model="grok-2-voice",
        )
    )
    
    await session.start(
        room=ctx.room,
        agent=GrokVoiceAgent(),
        room_input_options=RoomInputOptions(
            # Enable audio input from participants
            audio_enabled=True,
        ),
    )
    
    logger.info("Agent session started")

if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
```

Create `.env`:

```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
XAI_API_KEY=your-xai-api-key
```

### Node.js Version (Alternative)

Create `package.json`:

```json
{
  "name": "grok-voice-agent",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node agent.js",
    "dev": "node --watch agent.js"
  },
  "dependencies": {
    "@livekit/agents": "^0.4.0",
    "@livekit/agents-plugin-xai": "^0.1.0",
    "dotenv": "^16.3.1"
  }
}
```

Create `agent.js`:

```javascript
import { WorkerOptions, defineAgent, cli } from '@livekit/agents';
import { xai } from '@livekit/agents-plugin-xai';
import 'dotenv/config';

const agent = defineAgent({
  entry: async (ctx) => {
    await ctx.connect();
    
    console.log(`Connected to room: ${ctx.room.name}`);
    
    const session = new xai.RealtimeSession({
      model: 'grok-2-voice',
      voice: 'Grok-2',
      instructions: `
        Du bist ein freundlicher KI-Assistent für Kaltakquise.
        Sei professionell und respektiere die Zeit des Gesprächspartners.
      `,
    });
    
    await session.start(ctx.room);
    
    // Send initial greeting
    session.generateReply({
      instructions: "Begrüße den Anrufer freundlich und stelle dich vor."
    });
  }
});

cli.runApp(new WorkerOptions({ agent }));
```

## Step 2: Deploy to Fly.io

Install Fly CLI:

```bash
# macOS
brew install flyctl

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Linux
curl -L https://fly.io/install.sh | sh
```

Login and initialize:

```bash
fly auth login
fly launch
```

Create `fly.toml`:

```toml
app = "grok-voice-agent"
primary_region = "fra"  # Frankfurt for German users

[build]
  builder = "paketobuildpacks/builder:base"

[env]
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = false  # Keep running for incoming calls
  auto_start_machines = true
  min_machines_running = 1

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512
```

Set secrets:

```bash
fly secrets set LIVEKIT_URL=wss://your-project.livekit.cloud
fly secrets set LIVEKIT_API_KEY=your-api-key
fly secrets set LIVEKIT_API_SECRET=your-api-secret
fly secrets set XAI_API_KEY=your-xai-api-key
```

Deploy:

```bash
fly deploy
```

## Step 3: Configure LiveKit Cloud

1. Go to https://cloud.livekit.io
2. Create a new project (or use existing)
3. Go to **Settings → API Keys** and create a new key pair
4. Copy the URL, API Key, and API Secret to your Fly.io secrets

## Step 4: Configure SIP for Twilio (Optional)

For phone calls via Twilio, you need to set up SIP Trunking:

### In LiveKit Cloud:
1. Go to **SIP → Inbound Trunks**
2. Create a new trunk with:
   - Name: `twilio-inbound`
   - Authentication: Username/Password or IP whitelist

### In Twilio:
1. Go to **Elastic SIP Trunking**
2. Create a new SIP Trunk
3. Set Origination URI to your LiveKit SIP endpoint:
   ```
   sip:your-project.livekit.cloud:5060
   ```
4. Configure your Twilio phone number to use this SIP Trunk

### Update your agent to handle SIP calls:

```python
# In agent.py, update entrypoint:
async def entrypoint(ctx: agents.JobContext):
    # Check if this is a SIP call
    sip_participant = None
    for participant in ctx.room.remote_participants.values():
        if participant.kind == "SIP":
            sip_participant = participant
            break
    
    if sip_participant:
        logger.info(f"SIP call from: {sip_participant.identity}")
        # Extract caller info from SIP headers if needed
    
    # ... rest of the agent code
```

## Step 5: Test the Setup

### Test via LiveKit Playground:
1. Go to https://agents-playground.livekit.io
2. Enter your LiveKit Cloud credentials
3. Join a room and test voice interaction

### Test via API:

```bash
# Create a room token
curl -X POST https://your-project.livekit.cloud/twirp/livekit.RoomService/CreateRoom \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"name": "test-room"}'
```

## Troubleshooting

### Agent not responding
- Check Fly.io logs: `fly logs`
- Verify all environment variables are set: `fly secrets list`
- Ensure agent is running: `fly status`

### Audio issues
- Verify WebRTC connectivity in browser console
- Check LiveKit Cloud dashboard for room stats
- Ensure microphone permissions are granted

### SIP/Twilio issues
- Verify SIP trunk configuration in both LiveKit and Twilio
- Check Twilio logs for SIP errors
- Test with Twilio's SIP test tools

## Cost Estimation

- **Fly.io**: ~$5/month for minimal instance (always-on)
- **LiveKit Cloud**: Free tier includes 100 minutes/month
- **xAI API**: Based on usage (check x.ai/pricing)

## Next Steps

1. Customize the agent instructions for your use case
2. Add campaign-specific prompts via room metadata
3. Implement call logging and analytics
4. Add tool calling for CRM integration

## Resources

- [LiveKit Agents Documentation](https://docs.livekit.io/agents/)
- [LiveKit xAI Plugin](https://docs.livekit.io/agents/integrations/xai/)
- [xAI API Documentation](https://docs.x.ai/)
- [Fly.io Documentation](https://fly.io/docs/)
