import json
import logging
import aiohttp
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
    openai,
)

logger = logging.getLogger("ColdCallAgent")
load_dotenv(".env.local")

SIP_TRUNK_ID = "ST_55KNF9cwavz2"
SUPABASE_URL = "https://dwuelcsawiudvihxeddc.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3dWVsY3Nhd2l1ZHZpaHhlZGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTA2OTMsImV4cCI6MjA4MTgyNjY5M30.SQbOd4tPwdC9oTOgccdHXeoMm7EAFqw5dKkNfXTQyUE"


async def hangup_call():
    ctx = get_job_context()
    if ctx is None:
        return
    await ctx.api.room.delete_room(
        api.DeleteRoomRequest(room=ctx.room.name)
    )


async def call_supabase_action(action: str, data: dict):
    """Helper to call Supabase Edge Function"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{SUPABASE_URL}/functions/v1/agent-actions",
                headers={
                    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                    "Content-Type": "application/json",
                },
                json={"action": action, "data": data},
            ) as resp:
                result = await resp.json()
                logger.info(f"Supabase action {action}: {result}")
                return result
    except Exception as e:
        logger.error(f"Supabase action failed: {e}")
        return {"success": False, "error": str(e)}


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
        is_outbound: bool = False,
        ai_name: str = None,
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

    @function_tool
    async def end_call(self, ctx: RunContext):
        """Beende den Anruf wenn das Gespraech fertig ist oder der Kunde auflegen moechte"""
        await ctx.session.generate_reply(
            instructions="Verabschiede dich hoeflich und beende das Gespraech."
        )
        await hangup_call()

    @function_tool
    async def send_email(self, ctx: RunContext, subject: str, body: str):
        """Sende eine E-Mail an den Kunden mit Informationen, Angeboten oder Terminbestaetigungen.
        
        Args:
            subject: Betreff der E-Mail
            body: Inhalt der E-Mail
        """
        if not self.lead_email:
            return "Keine E-Mail-Adresse vorhanden. Frage den Kunden nach seiner E-Mail."
        
        result = await call_supabase_action("send_email", {
            "to": self.lead_email,
            "subject": subject,
            "body": body,
            "lead_id": self.lead_id,
        })
        
        if result.get("success"):
            return f"E-Mail wurde erfolgreich an {self.lead_email} gesendet."
        return "E-Mail konnte leider nicht gesendet werden."

    @function_tool
    async def send_meeting_link_email(self, ctx: RunContext, date: str, time: str, meeting_title: str = "Demo-Termin"):
        """Sende einen Meeting-Link per E-Mail an den Kunden.
        
        Args:
            date: Datum des Termins (z.B. "15. Januar" oder "morgen")
            time: Uhrzeit des Termins (z.B. "14:00 Uhr")
            meeting_title: Titel des Meetings (Standard: Demo-Termin)
        """
        if not self.lead_email:
            return "Keine E-Mail-Adresse vorhanden. Frage den Kunden nach seiner E-Mail."
        
        result = await call_supabase_action("send_meeting_link", {
            "to": self.lead_email,
            "date": date,
            "time": time,
            "title": meeting_title,
            "lead_id": self.lead_id,
            "lead_name": self.lead_name,
            "method": "email",
        })
        
        if result.get("success"):
            return f"Meeting-Link wurde per E-Mail an {self.lead_email} gesendet fuer {date} um {time}."
        return "Meeting-Link konnte nicht gesendet werden."

    @function_tool
    async def send_meeting_link_sms(self, ctx: RunContext, date: str, time: str, meeting_title: str = "Demo-Termin"):
        """Sende einen Meeting-Link per SMS an den Kunden.
        
        Args:
            date: Datum des Termins (z.B. "15. Januar" oder "morgen")
            time: Uhrzeit des Termins (z.B. "14:00 Uhr")
            meeting_title: Titel des Meetings (Standard: Demo-Termin)
        """
        if not self.lead_phone:
            return "Keine Telefonnummer fuer SMS vorhanden."
        
        result = await call_supabase_action("send_meeting_link", {
            "to": self.lead_phone,
            "date": date,
            "time": time,
            "title": meeting_title,
            "lead_id": self.lead_id,
            "lead_name": self.lead_name,
            "method": "sms",
        })
        
        if result.get("success"):
            return f"Meeting-Link wurde per SMS gesendet fuer {date} um {time}."
        return "SMS konnte nicht gesendet werden."

    @function_tool
    async def schedule_callback(self, ctx: RunContext, date: str, time: str, notes: str = ""):
        """Plane einen Rueckruf wenn der Kunde gerade keine Zeit hat.
        
        Args:
            date: Datum fuer den Rueckruf (z.B. "morgen", "Montag", "15. Januar")
            time: Uhrzeit (z.B. "vormittags", "14:00", "nachmittags")
            notes: Optionale Notizen zum Rueckruf
        """
        result = await call_supabase_action("schedule_callback", {
            "lead_id": self.lead_id,
            "date": date,
            "time": time,
            "notes": notes,
            "campaign_id": self.campaign_id,
        })
        
        if result.get("success"):
            return f"Rueckruf wurde fuer {date} {time} eingeplant."
        return "Rueckruf konnte nicht eingeplant werden."

    @function_tool
    async def update_lead_status(self, ctx: RunContext, status: str, notes: str = ""):
        """Aktualisiere den Status des Leads basierend auf dem Gespraech.
        
        Args:
            status: Neuer Status - einer von: interested, not_interested, callback, appointment_scheduled, no_answer
            notes: Optionale Begruendung
        """
        result = await call_supabase_action("update_lead_status", {
            "lead_id": self.lead_id,
            "status": status,
            "notes": notes,
        })
        
        if result.get("success"):
            return f"Lead-Status wurde auf '{status}' aktualisiert."
        return "Status konnte nicht aktualisiert werden."

    @function_tool
    async def add_note(self, ctx: RunContext, note: str):
        """Speichere eine wichtige Notiz aus dem Gespraech.
        
        Args:
            note: Die Notiz - wichtige Infos die der Kunde erwaehnt hat
        """
        result = await call_supabase_action("add_note", {
            "lead_id": self.lead_id,
            "call_log_id": self.call_log_id,
            "note": note,
        })
        
        if result.get("success"):
            return "Notiz wurde gespeichert."
        return "Notiz konnte nicht gespeichert werden."

    async def on_enter(self):
        if self.is_outbound:
            return
        
        if self.ai_greeting:
            await self.session.generate_reply(
                instructions=f"Sage genau Folgendes zur Begruessung: {self.ai_greeting}",
                allow_interruptions=True,
            )
        elif self.lead_name and self.lead_company:
            greeting = f"Begruesse {self.lead_name} von {self.lead_company} freundlich auf Deutsch."
            if self.ai_name:
                greeting += f" Stelle dich als {self.ai_name} vor."
            await self.session.generate_reply(instructions=greeting, allow_interruptions=True)
        elif self.lead_name:
            greeting = f"Begruesse {self.lead_name} freundlich auf Deutsch."
            if self.ai_name:
                greeting += f" Stelle dich als {self.ai_name} vor."
            await self.session.generate_reply(instructions=greeting, allow_interruptions=True)
        else:
            greeting = "Begruesse den Anrufer freundlich auf Deutsch"
            if self.ai_name:
                greeting += f" und stelle dich als {self.ai_name} vor."
            else:
                greeting += " und stelle dich als virtueller Assistent vor."
            await self.session.generate_reply(instructions=greeting, allow_interruptions=True)


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
            logger.info(f"Metadata: {metadata}")
        except json.JSONDecodeError:
            pass
    
    if ctx.room.metadata and not metadata:
        try:
            metadata = json.loads(ctx.room.metadata)
        except json.JSONDecodeError:
            pass
    
    # IDs
    lead_id = metadata.get("lead_id", "")
    call_log_id = metadata.get("call_log_id", "")
    campaign_id = metadata.get("campaign_id", "")
    
    # Lead Info
    ai_prompt = metadata.get("ai_prompt", "")
    product_description = metadata.get("product_description", "")
    call_goal = metadata.get("call_goal", "")
    campaign_name = metadata.get("campaign_name", "")
    lead_name = metadata.get("lead_name", "")
    lead_company = metadata.get("lead_company", "")
    lead_email = metadata.get("lead_email", "")
    lead_phone = metadata.get("lead_phone", phone_number or "")
    lead_notes = metadata.get("lead_notes", "")
    
    # Parse AI settings
    ai_name = ""
    ai_greeting = ""
    ai_personality = ""
    company_name = ""
    custom_prompt = ""
    
    if ai_prompt:
        try:
            settings = json.loads(ai_prompt)
            if isinstance(settings, dict):
                if "aiSettings" in settings:
                    s = settings["aiSettings"]
                    ai_name = s.get("aiName", "")
                    ai_greeting = s.get("aiGreeting", "")
                    ai_personality = s.get("aiPersonality", "")
                    company_name = s.get("companyName", "")
                    custom_prompt = s.get("customPrompt", "")
                elif settings.get("aiName"):
                    ai_name = settings.get("aiName", "")
                    ai_greeting = settings.get("aiGreeting", "")
                    ai_personality = settings.get("aiPersonality", "")
                    company_name = settings.get("companyName", "")
                    custom_prompt = settings.get("customPrompt", "")
                else:
                    custom_prompt = ai_prompt
        except json.JSONDecodeError:
            custom_prompt = ai_prompt
    
    logger.info(f"Call gestartet - Lead: {lead_name}, AI: {ai_name}, Outbound: {is_outbound}")
    
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
            logger.info(f"Anruf zu {phone_number} angenommen")
        except api.TwirpError as e:
            logger.error(f"Anruf fehlgeschlagen: {e.message}")
            ctx.shutdown()
            return
    
    # Build instructions
    instructions = f"""Du bist {ai_name if ai_name else 'ein professioneller Vertriebsmitarbeiter'} von {company_name if company_name else 'unserem Unternehmen'}.

# Persoenlichkeit
{ai_personality if ai_personality else 'Du bist freundlich, professionell und hilfsbereit.'}

# Ausgaberegeln
- Antworte nur in Klartext. Niemals JSON, Markdown, Listen oder Emojis.
- Halte Antworten kurz: ein bis drei Saetze. Stelle immer nur EINE Frage.
- Sprich IMMER auf Deutsch.

# Wichtige Regeln
- Draenge niemals - akzeptiere ein Nein sofort
- Halte das Gespraech unter 2 Minuten
- Sei hoeflich, professionell aber nicht aufdringlich

# Gespraechspartner
- Name: {lead_name if lead_name else 'Unbekannt'}
- Firma: {lead_company if lead_company else 'Unbekannt'}
- E-Mail: {lead_email if lead_email else 'Nicht vorhanden'}
- Notizen: {lead_notes if lead_notes else 'Keine'}

# Produkt/Dienstleistung
{product_description if product_description else 'Nicht angegeben'}

# Ziel des Anrufs
{call_goal if call_goal else 'Freundliches Gespraech fuehren'}

# Deine Tools - NUTZE SIE AKTIV!
- end_call: Gespraech hoeflich beenden
- send_email: E-Mail mit Infos senden
- send_meeting_link_email: Meeting-Link per E-Mail senden
- send_meeting_link_sms: Meeting-Link per SMS senden  
- schedule_callback: Rueckruf einplanen wenn keine Zeit
- update_lead_status: Status aktualisieren (interested/not_interested/callback/appointment_scheduled)
- add_note: Wichtige Infos aus dem Gespraech speichern

# Terminvereinbarung
- Wenn der Kunde Interesse zeigt, biete einen Termin an
- Frage nach bevorzugtem Datum und Uhrzeit
- Frage ob der Meeting-Link per Email oder SMS gesendet werden soll
- Nutze send_meeting_link_email oder send_meeting_link_sms je nach Praeferenz

# Zusaetzliche Anweisungen
{custom_prompt if custom_prompt else 'Keine'}
"""
    
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
                noise_cancellation=lambda params: noise_cancellation.BVCTelephony() if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP else noise_cancellation.BVC(),
            ),
        ),
    )


if __name__ == "__main__":
    cli.run_app(server)
