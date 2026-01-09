import asyncio
import logging
import os
import json
from dotenv import load_dotenv
from livekit import agents, rtc
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


async def dial_phone_number(ctx: agents.JobContext, phone_number: str):
    """
    Dial an outbound phone call using LiveKit's SIP integration.
    This requires a SIP trunk to be configured in the LiveKit project.
    """
    logger.info(f"Attempting to dial phone number: {phone_number}")
    
    try:
        # Use LiveKit's SIP participant API to dial out
        # The SIP trunk must be configured in LiveKit Cloud
        sip_trunk_id = os.getenv("LIVEKIT_SIP_TRUNK_ID")
        
        if not sip_trunk_id:
            logger.error("LIVEKIT_SIP_TRUNK_ID not configured - cannot make outbound calls")
            return None
        
        # Format phone number for SIP (ensure E.164 format)
        if not phone_number.startswith("+"):
            phone_number = f"+{phone_number}"
        
        # Create SIP participant (outbound call)
        # This uses the LiveKit SIP service to dial the phone number
        # and connect the call audio to the room
        from livekit.api import LiveKitAPI, SIPDispatchRuleIndividual
        
        api = LiveKitAPI()
        
        # Create a SIP participant to dial out
        participant = await api.sip.create_sip_participant(
            sip_trunk_id=sip_trunk_id,
            sip_call_to=f"sip:{phone_number}@trunk",
            room_name=ctx.room.name,
            participant_identity=f"phone-{phone_number}",
            participant_name=f"Phone Call to {phone_number}",
        )
        
        logger.info(f"SIP participant created: {participant}")
        return participant
        
    except Exception as e:
        logger.error(f"Failed to dial phone number: {e}")
        return None


async def entrypoint(ctx: agents.JobContext):
    logger.info(f"Connecting to room: {ctx.room.name}")
    
    await ctx.connect()
    
    # Get custom instructions and phone number from room metadata
    custom_instructions = None
    phone_number = None
    lead_name = ""
    lead_company = ""
    
    # Check dispatch metadata first (from AgentDispatchService)
    if hasattr(ctx, 'job') and ctx.job and ctx.job.metadata:
        try:
            metadata = json.loads(ctx.job.metadata)
            phone_number = metadata.get("phone_number")
            custom_instructions = metadata.get("ai_prompt")
            lead_name = metadata.get("lead_name", "")
            lead_company = metadata.get("lead_company", "")
            logger.info(f"Got metadata from dispatch: phone={phone_number}, lead={lead_name}")
        except Exception as e:
            logger.warning(f"Failed to parse job metadata: {e}")
    
    # Fallback to room metadata
    if not phone_number and ctx.room.metadata:
        try:
            metadata = json.loads(ctx.room.metadata)
            phone_number = metadata.get("phone_number")
            custom_instructions = custom_instructions or metadata.get("ai_prompt")
            lead_name = lead_name or metadata.get("lead_name", "")
            lead_company = lead_company or metadata.get("lead_company", "")
            logger.info(f"Got metadata from room: phone={phone_number}, lead={lead_name}")
        except Exception as e:
            logger.warning(f"Failed to parse room metadata: {e}")
    
    # Add lead context to instructions
    if lead_name or lead_company:
        context = f"\n\nKontext zum Anruf:\n- Name des Kontakts: {lead_name}\n- Firma: {lead_company}"
        if custom_instructions:
            custom_instructions += context
        else:
            custom_instructions = context
    
    # Dial the phone number if provided
    if phone_number:
        logger.info(f"Dialing phone number: {phone_number}")
        sip_participant = await dial_phone_number(ctx, phone_number)
        if not sip_participant:
            logger.warning("Failed to dial - continuing anyway for web-based calls")
    else:
        logger.info("No phone number provided - waiting for participants to join")
    
    # Start the agent session
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
