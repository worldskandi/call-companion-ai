import json
import logging
import os
import httpx
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

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

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
        lead_email: str = None,
        lead_phone: str = None,
        product_description: str = None,
        call_goal: str = None,
        campaign_name: str = None,
        call_log_id: str = None,
        is_outbound: bool = False,
    ) -> None:
        
        self.lead_name = lead_name
        self.lead_company = lead_company
        self.lead_notes = lead_notes
        self.lead_email = lead_email
        self.lead_phone = lead_phone
        self.product_description = product_description
        self.call_goal = call_goal
        self.campaign_name = campaign_name
        self.call_log_id = call_log_id
        self.is_outbound = is_outbound
        
        super().__init__(instructions=instructions)

    @function_tool
    async def end_call(self, ctx: RunContext):
        """Beende den Anruf wenn das Gespraech fertig ist oder der Kunde auflegen moechte"""
        await ctx.session.generate_reply(
            instructions="Verabschiede dich hoeflich und beende das Gespraech."
        )
        await hangup_call()

    @function_tool
    async def send_meeting_link_email(
        self,
        ctx: RunContext,
        meeting_date: str,
        meeting_time: str,
    ):
        """Sende einen Meeting-Link per Email an den Lead. Nutze dieses Tool wenn der Kunde einem Termin zugestimmt hat und den Link per Email erhalten moechte.
        
        Args:
            meeting_date: Das Datum des Meetings im Format TT.MM.JJJJ (z.B. 15.01.2025)
            meeting_time: Die Uhrzeit des Meetings im Format HH:MM (z.B. 14:30)
        """
        if not self.lead_email:
            return "Keine Email-Adresse fuer diesen Lead vorhanden. Frage nach der Email-Adresse oder biete SMS als Alternative an."
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{SUPABASE_URL}/functions/v1/send-meeting-link-email",
                    headers={
                        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "leadEmail": self.lead_email,
                        "leadName": self.lead_name or "Kunde",
                        "meetingDate": meeting_date,
                        "meetingTime": meeting_time,
                        "call_log_id": self.call_log_id,
                    },
                    timeout=30.0,
                )
                
                if response.status_code == 200:
                    logger.info(f"Meeting-Link Email gesendet an {self.lead_email}")
                    return f"Meeting-Link wurde erfolgreich per Email an {self.lead_email} gesendet fuer den {meeting_date} um {meeting_time} Uhr."
                else:
                    logger.error(f"Email-Fehler: {response.text}")
                    return "Email konnte nicht gesendet werden. Biete SMS als Alternative an."
        except Exception as e:
            logger.error(f"Email-Fehler: {e}")
            return "Email konnte nicht gesendet werden. Biete SMS als Alternative an."

    @function_tool
    async def send_meeting_link_sms(
        self,
        ctx: RunContext,
        meeting_date: str,
        meeting_time: str,
    ):
        """Sende einen Meeting-Link per SMS an den Lead. Nutze dieses Tool wenn der Kunde einem Termin zugestimmt hat und den Link per SMS erhalten moechte.
        
        Args:
            meeting_date: Das Datum des Meetings im Format TT.MM.JJJJ (z.B. 15.01.2025)
            meeting_time: Die Uhrzeit des Meetings im Format HH:MM (z.B. 14:30)
        """
        if not self.lead_phone:
            return "Keine Telefonnummer fuer diesen Lead vorhanden."
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{SUPABASE_URL}/functions/v1/send-meeting-link-sms",
                    headers={
                        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "phoneNumber": self.lead_phone,
                        "leadName": self.lead_name or "Kunde",
                        "meetingDate": meeting_date,
                        "meetingTime": meeting_time,
                        "call_log_id": self.call_log_id,
                    },
                    timeout=30.0,
                )
                
                if response.status_code == 200:
                    logger.info(f"Meeting-Link SMS gesendet an {self.lead_phone}")
                    return f"Meeting-Link wurde erfolgreich per SMS an {self.lead_phone} gesendet fuer den {meeting_date} um {meeting_time} Uhr."
                else:
                    logger.error(f"SMS-Fehler: {response.text}")
                    return "SMS konnte nicht gesendet werden."
        except Exception as e:
            logger.error(f"SMS-Fehler: {e}")
            return "SMS konnte nicht gesendet werden."

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
    lead_email = metadata.get("lead_email", "")
    lead_phone = metadata.get("lead_phone", "")
    call_log_id = metadata.get("call_log_id", "")
    
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
- Nutze das end_call Tool wenn das Gespraech beendet werden soll

# Terminvereinbarung
- Wenn der Kunde Interesse zeigt, biete einen Termin an
- Frage nach bevorzugtem Datum und Uhrzeit
- Frage ob der Meeting-Link per Email oder SMS gesendet werden soll
- Nutze send_meeting_link_email oder send_meeting_link_sms je nach Praeferenz"""

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
            lead_email=lead_email,
            lead_phone=lead_phone,
            product_description=product_description,
            call_goal=call_goal,
            campaign_name=campaign_name,
            call_log_id=call_log_id,
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