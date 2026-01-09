import json
import logging
from dotenv import load_dotenv
from livekit import rtc, api
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    RunContext,
    function_tool,
    get_job_context,
    cli,
    room_io,
)
from livekit.plugins import (
    noise_cancellation,
    xai,
)

logger = logging.getLogger("agent-ColdCallAgent")
load_dotenv(".env.local")

SIP_TRUNK_ID = "ST_55KNF9cwavz2"


async def hangup_call():
    ctx = get_job_context()
    if ctx is None:
        return
    await ctx.api.room.delete_room(
        api.DeleteRoomRequest(room=ctx.room.name)
    )


class ColdCallAgent(Agent):
    def __init__(
        self, 
        instructions: str,
        lead_name: str = None,
        lead_company: str = None,
        lead_notes: str = None,
        product_description: str = None,
        call_goal: str = None,
        campaign_name: str = None,
        is_outbound: bool = False,
    ) -> None:
        
        self.lead_name = lead_name
        self.lead_company = lead_company
        self.lead_notes = lead_notes
        self.product_description = product_description
        self.call_goal = call_goal
        self.campaign_name = campaign_name
        self.is_outbound = is_outbound
        
        super().__init__(instructions=instructions)

    @function_tool
    async def end_call(self, ctx: RunContext):
        """Beende den Anruf wenn das Gespraech fertig ist oder der Kunde auflegen moechte"""
        await ctx.session.generate_reply(
            instructions="Verabschiede dich hoeflich und beende das Gespraech."
        )
        await hangup_call()

    async def on_enter(self):
        if self.is_outbound:
            return
            
        if self.lead_name and self.lead_company:
            greeting = f"Begruesse {self.lead_name} von {self.lead_company} freundlich auf Deutsch."
        elif self.lead_name:
            greeting = f"Begruesse {self.lead_name} freundlich auf Deutsch."
        else:
            greeting = "Begruesse den Anrufer freundlich auf Deutsch und stelle dich als virtueller Assistent vor."
        
        await self.session.generate_reply(
            instructions=greeting,
            allow_interruptions=True,
        )


server = AgentServer()


@server.rtc_session(agent_name="ColdCallAgent")
async def entrypoint(ctx: JobContext):
    
    metadata = {}
    is_outbound = False
    phone_number = None
    
    if ctx.job.metadata:
        try:
            metadata = json.loads(ctx.job.metadata)
            phone_number = metadata.get("phone_number")
            is_outbound = phone_number is not None
            logger.info(f"Outbound Call zu: {phone_number}")
        except json.JSONDecodeError:
            pass
    
    if ctx.room.metadata and not metadata:
        try:
            metadata = json.loads(ctx.room.metadata)
        except json.JSONDecodeError:
            pass
    
    ai_prompt = metadata.get("ai_prompt", "")
    product_description = metadata.get("product_description", "")
    call_goal = metadata.get("call_goal", "")
    campaign_name = metadata.get("campaign_name", "")
    lead_name = metadata.get("lead_name", "")
    lead_company = metadata.get("lead_company", "")
    lead_notes = metadata.get("lead_notes", "")
    
    logger.info(f"Call gestartet - Kampagne: {campaign_name}, Lead: {lead_name}, Outbound: {is_outbound}")
    
    if is_outbound and phone_number:
        try:
            await ctx.api.sip.create_sip_participant(
                api.CreateSIPParticipantRequest(
                    room_name=ctx.room.name,
                    sip_trunk_id=SIP_TRUNK_ID,
                    sip_call_to=phone_number,
                    participant_identity=phone_number,
                    wait_until_answered=True,
                )
            )
            logger.info(f"Anruf zu {phone_number} wurde angenommen")
        except api.TwirpError as e:
            logger.error(f"Fehler beim Anruf: {e.message}")
            ctx.shutdown()
            return
    
    base_instructions = """Du bist ein freundlicher und professioneller KI-Assistent fuer Kaltakquise-Telefonate.

# Ausgaberegeln
- Antworte nur in Klartext. Niemals JSON, Markdown, Listen oder Emojis.
- Halte Antworten kurz: ein bis drei Saetze. Stelle immer nur EINE Frage.
- Sprich IMMER auf Deutsch.

# Wichtige Regeln
- Draenge niemals - akzeptiere ein Nein sofort
- Halte das Gespraech unter 2 Minuten
- Sei hoeflich, professionell aber nicht aufdringlich
- Nutze das end_call Tool wenn das Gespraech beendet werden soll"""

    instructions = ai_prompt if ai_prompt else base_instructions
    
    if lead_name:
        instructions += f"\n\nDu sprichst mit {lead_name}"
        if lead_company:
            instructions += f" von {lead_company}"
        instructions += "."
    
    if lead_notes:
        instructions += f"\nNotizen: {lead_notes}"
    
    if product_description:
        instructions += f"\n\nProdukt: {product_description}"
    
    if call_goal:
        instructions += f"\n\nZiel: {call_goal}"
    
    session = AgentSession(
        llm=xai.realtime.RealtimeModel(voice="ara"),
    )
    
    await session.start(
        agent=ColdCallAgent(
            instructions=instructions,
            lead_name=lead_name,
            lead_company=lead_company,
            lead_notes=lead_notes,
            product_description=product_description,
            call_goal=call_goal,
            campaign_name=campaign_name,
            is_outbound=is_outbound,
        ),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: noise_cancellation.BVCTelephony() if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP else noise_cancellation.BVC(),
            ),
        ),
    )


if __name__ == "__main__":
    cli.run_app(server)