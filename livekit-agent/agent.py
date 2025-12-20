import asyncio
import logging
import os
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import xai

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("grok-voice-agent")


class GrokVoiceAgent(Agent):
    def __init__(self, custom_instructions: str = None):
        default_instructions = """
        Du bist ein freundlicher und professioneller KI-Assistent für Kaltakquise.
        Deine Aufgabe ist es, potenzielle Kunden anzurufen und ihr Interesse an unseren Produkten zu wecken.
        
        Wichtige Verhaltensregeln:
        - Sei professionell, freundlich und respektiere die Zeit des Gesprächspartners
        - Stelle dich zu Beginn vor und erkläre kurz den Grund deines Anrufs
        - Höre aktiv zu und gehe auf Fragen und Einwände ein
        - Wenn jemand kein Interesse hat, bedanke dich höflich und beende das Gespräch
        - Versuche bei Interesse einen Folgetermin zu vereinbaren
        """
        
        instructions = custom_instructions if custom_instructions else default_instructions
        
        super().__init__(instructions=instructions)

    async def on_enter(self):
        # Greet the user when they join
        self.session.generate_reply(
            instructions="Begrüße den Anrufer freundlich und stelle dich kurz vor."
        )


async def entrypoint(ctx: agents.JobContext):
    logger.info(f"Connecting to room: {ctx.room.name}")
    
    await ctx.connect()
    
    # Get custom instructions from room metadata if available
    custom_instructions = None
    if ctx.room.metadata:
        try:
            import json
            metadata = json.loads(ctx.room.metadata)
            custom_instructions = metadata.get("ai_prompt")
            lead_name = metadata.get("lead_name", "")
            lead_company = metadata.get("lead_company", "")
            
            if lead_name or lead_company:
                context = f"\n\nKontext zum Anruf:\n- Name des Kontakts: {lead_name}\n- Firma: {lead_company}"
                if custom_instructions:
                    custom_instructions += context
                else:
                    custom_instructions = context
                    
            logger.info(f"Using custom instructions from metadata")
        except Exception as e:
            logger.warning(f"Failed to parse room metadata: {e}")
    
    session = AgentSession(
        llm=xai.realtime.RealtimeModel(
            voice="Grok-2",
            temperature=0.8,
            model="grok-2-voice",
        )
    )
    
    await session.start(
        room=ctx.room,
        agent=GrokVoiceAgent(custom_instructions=custom_instructions),
        room_input_options=RoomInputOptions(
            audio_enabled=True,
        ),
    )
    
    logger.info("Agent session started successfully")


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
