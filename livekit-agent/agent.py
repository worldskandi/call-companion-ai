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

SIP_TRUNK_ID = "ST_55KNF9cwavz2"
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://dwuelcsawiudvihxeddc.supabase.co")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")


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
        lead_phone: str = None,
        lead_email: str = None,
        product_description: str = None,
        call_goal: str = None,
        campaign_name: str = None,
        call_log_id: str = None,
        is_outbound: bool = False,
        ai_name: str = None,
        ai_greeting: str = None,
    ) -> None:
        
        self.lead_name = lead_name
        self.lead_company = lead_company
        self.lead_notes = lead_notes
        self.lead_phone = lead_phone
        self.lead_email = lead_email
        self.product_description = product_description
        self.call_goal = call_goal
        self.campaign_name = campaign_name
        self.call_log_id = call_log_id
        self.is_outbound = is_outbound
        self.ai_name = ai_name
        self.ai_greeting = ai_greeting
        
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
        email: str,
        meeting_date: str,
        meeting_time: str
    ):
        """Sende einen Google Meet Link per Email an den Kunden. 
        Nutze dieses Tool wenn der Kunde einen Termin per Email erhalten moechte.
        
        Args:
            email: Die Email-Adresse des Kunden
            meeting_date: Das Datum im Format YYYY-MM-DD (z.B. 2025-01-15)
            meeting_time: Die Uhrzeit im Format HH:MM (z.B. 14:00)
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{SUPABASE_URL}/functions/v1/send-meeting-link-email",
                    headers={
                        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "email": email,
                        "lead_name": self.lead_name,
                        "meeting_date": meeting_date,
                        "meeting_time": meeting_time,
                        "call_log_id": self.call_log_id,
                        "company_name": self.lead_company,
                    },
                    timeout=30.0,
                )
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info(f"Meeting link sent via email: {data.get('meeting_link')}")
                    return f"Meeting-Link wurde erfolgreich an {email} gesendet."
                else:
                    logger.error(f"Failed to send email: {response.text}")
                    return "Es gab leider ein Problem beim Senden der Email. Bitte versuchen Sie es spaeter erneut."
        except Exception as e:
            logger.error(f"Error sending meeting link email: {e}")
            return "Es gab leider ein technisches Problem. Bitte versuchen Sie es spaeter erneut."

    @function_tool
    async def send_meeting_link_sms(
        self, 
        ctx: RunContext,
        meeting_date: str,
        meeting_time: str,
        phone_number: str = None
    ):
        """Sende einen Google Meet Link per SMS an den Kunden.
        Nutze dieses Tool wenn der Kunde einen Termin per SMS erhalten moechte.
        
        Args:
            meeting_date: Das Datum im Format YYYY-MM-DD (z.B. 2025-01-15)
            meeting_time: Die Uhrzeit im Format HH:MM (z.B. 14:00)
            phone_number: Optional - die Telefonnummer. Wenn nicht angegeben wird die gespeicherte Nummer verwendet.
        """
        target_phone = phone_number or self.lead_phone
        
        if not target_phone:
            return "Leider habe ich keine Telefonnummer um die SMS zu senden. Koennen Sie mir Ihre Nummer nennen?"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{SUPABASE_URL}/functions/v1/send-meeting-link-sms",
                    headers={
                        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "phone_number": target_phone,
                        "lead_name": self.lead_name,
                        "meeting_date": meeting_date,
                        "meeting_time": meeting_time,
                        "call_log_id": self.call_log_id,
                        "company_name": self.lead_company,
                    },
                    timeout=30.0,
                )
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info(f"Meeting link sent via SMS: {data.get('meeting_link')}")
                    return f"Meeting-Link wurde erfolgreich per SMS gesendet."
                else:
                    logger.error(f"Failed to send SMS: {response.text}")
                    return "Es gab leider ein Problem beim Senden der SMS. Bitte versuchen Sie es spaeter erneut."
        except Exception as e:
            logger.error(f"Error sending meeting link SMS: {e}")
            return "Es gab leider ein technisches Problem. Bitte versuchen Sie es spaeter erneut."

    async def on_enter(self):
        if self.is_outbound:
            return
        
        # Use custom greeting if available
        if self.ai_greeting:
            await self.session.generate_reply(
                instructions=f"Sage genau Folgendes zur Begruuessung: {self.ai_greeting}",
                allow_interruptions=True,
            )
        elif self.lead_name and self.lead_company:
            greeting = f"Begruesse {self.lead_name} von {self.lead_company} freundlich auf Deutsch."
            if self.ai_name:
                greeting += f" Stelle dich als {self.ai_name} vor."
            await self.session.generate_reply(
                instructions=greeting,
                allow_interruptions=True,
            )
        elif self.lead_name:
            greeting = f"Begruesse {self.lead_name} freundlich auf Deutsch."
            if self.ai_name:
                greeting += f" Stelle dich als {self.ai_name} vor."
            await self.session.generate_reply(
                instructions=greeting,
                allow_interruptions=True,
            )
        else:
            greeting = "Begruesse den Anrufer freundlich auf Deutsch"
            if self.ai_name:
                greeting += f" und stelle dich als {self.ai_name} vor."
            else:
                greeting += " und stelle dich als virtueller Assistent vor."
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
    lead_phone = metadata.get("lead_phone", phone_number or "")
    lead_email = metadata.get("lead_email", "")
    call_log_id = metadata.get("call_log_id", "")
    
    # Parse extended AI settings if ai_prompt is JSON
    ai_name = ""
    ai_greeting = ""
    ai_personality = ""
    company_name = ""
    custom_prompt = ""
    
    if ai_prompt:
        try:
            settings = json.loads(ai_prompt)
            if isinstance(settings, dict) and settings.get("aiName"):
                ai_name = settings.get("aiName", "")
                ai_greeting = settings.get("aiGreeting", "")
                ai_personality = settings.get("aiPersonality", "")
                company_name = settings.get("companyName", "")
                custom_prompt = settings.get("customPrompt", "")
            else:
                custom_prompt = ai_prompt
        except json.JSONDecodeError:
            custom_prompt = ai_prompt
    
    logger.info(f"Call gestartet - Kampagne: {campaign_name}, Lead: {lead_name}, AI: {ai_name}, Outbound: {is_outbound}")
    
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
    
    # Build base instructions
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
Wenn ein Termin vereinbart werden soll:
1. Frage nach dem gewuenschten Datum und Uhrzeit
2. Frage ob der Meeting-Link per Email oder per SMS gesendet werden soll
3. Bei Email: Frage nach der Email-Adresse und nutze send_meeting_link_email
4. Bei SMS: Nutze send_meeting_link_sms (die Telefonnummer ist bereits bekannt)
5. Bestaetige dass der Link gesendet wurde"""

    # Build dynamic instructions based on settings
    if ai_name or ai_personality or company_name:
        instructions = f"Du bist {ai_name if ai_name else 'ein virtueller Assistent'}"
        if company_name:
            instructions += f" von {company_name}"
        instructions += ".\n\n"
        
        if ai_personality:
            instructions += f"# Persoenlichkeit und Stil\n{ai_personality}\n\n"
        
        instructions += base_instructions
    elif custom_prompt:
        instructions = custom_prompt
    else:
        instructions = base_instructions
    
    # Add lead context
    if lead_name:
        instructions += f"\n\nDu sprichst mit {lead_name}"
        if lead_company:
            instructions += f" von {lead_company}"
        instructions += "."
    
    if lead_notes:
        instructions += f"\nNotizen zum Lead: {lead_notes}"
    
    if product_description:
        instructions += f"\n\nProdukt/Dienstleistung: {product_description}"
    
    if call_goal:
        instructions += f"\n\nZiel des Anrufs: {call_goal}"
    
    # Add custom prompt if we have structured settings
    if custom_prompt and (ai_name or ai_personality or company_name):
        instructions += f"\n\n# Zusaetzliche Anweisungen\n{custom_prompt}"
    
    session = AgentSession(
        llm=xai.realtime.RealtimeModel(voice="ara"),
    )
    
    # Determine greeting
    greeting_text = ai_greeting if ai_greeting else None
    
    await session.start(
        agent=ColdCallAgent(
            instructions=instructions,
            lead_name=lead_name,
            lead_company=lead_company,
            lead_notes=lead_notes,
            lead_phone=lead_phone,
            lead_email=lead_email,
            product_description=product_description,
            call_goal=call_goal,
            campaign_name=campaign_name,
            call_log_id=call_log_id,
            is_outbound=is_outbound,
            ai_name=ai_name,
            ai_greeting=greeting_text,
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
