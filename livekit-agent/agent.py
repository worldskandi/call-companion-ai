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
    await ctx.api.room.delete_room(api.DeleteRoomRequest(room=ctx.room.name))


async def call_supabase_action(action: str, data: dict):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{SUPABASE_URL}/functions/v1/agent-actions",
                headers={"Authorization": f"Bearer {SUPABASE_ANON_KEY}", "Content-Type": "application/json"},
                json={"action": action, "data": data},
            ) as resp:
                result = await resp.json()
                logger.info(f"Supabase action {action}: {result}")
                return result
    except Exception as e:
        logger.error(f"Supabase action failed: {e}")
        return {"success": False, "error": str(e)}


class ColdCallAgent(Agent):
    def __init__(self, instructions: str, lead_name: str = None, lead_company: str = None, lead_email: str = None,
                 lead_phone: str = None, lead_id: str = None, call_log_id: str = None, campaign_id: str = None,
                 lead_notes: str = None, product_description: str = None, call_goal: str = None,
                 campaign_name: str = None, is_outbound: bool = False, ai_name: str = None, ai_greeting: str = None) -> None:
        self.lead_name, self.lead_company, self.lead_email, self.lead_phone = lead_name, lead_company, lead_email, lead_phone
        self.lead_id, self.call_log_id, self.campaign_id = lead_id, call_log_id, campaign_id
        self.lead_notes, self.product_description, self.call_goal, self.campaign_name = lead_notes, product_description, call_goal, campaign_name
        self.is_outbound, self.ai_name, self.ai_greeting = is_outbound, ai_name, ai_greeting
        super().__init__(instructions=instructions)

    @function_tool
    async def end_call(self, ctx: RunContext):
        """Beende den Anruf wenn das Gespraech fertig ist oder der Kunde auflegen moechte"""
        await ctx.session.generate_reply(instructions="Verabschiede dich hoeflich und beende das Gespraech.")
        await hangup_call()

    @function_tool
    async def send_email(self, ctx: RunContext, subject: str, body: str):
        """Sende eine E-Mail an den Kunden. Args: subject: Betreff, body: Inhalt"""
        if not self.lead_email:
            return "Keine E-Mail-Adresse vorhanden. Frage den Kunden nach seiner E-Mail."
        result = await call_supabase_action("send_email", {"to": self.lead_email, "subject": subject, "body": body, "lead_id": self.lead_id})
        return f"E-Mail wurde erfolgreich an {self.lead_email} gesendet." if result.get("success") else "E-Mail konnte nicht gesendet werden."

    @function_tool
    async def send_meeting_link_email(self, ctx: RunContext, date: str, time: str, meeting_title: str = "Demo-Termin"):
        """Sende Meeting-Link per E-Mail. Args: date: Datum, time: Uhrzeit, meeting_title: Titel"""
        if not self.lead_email:
            return "Keine E-Mail-Adresse vorhanden."
        result = await call_supabase_action("send_meeting_link", {"to": self.lead_email, "date": date, "time": time, "title": meeting_title, "lead_id": self.lead_id, "lead_name": self.lead_name, "call_log_id": self.call_log_id, "method": "email"})
        return f"Meeting-Link per E-Mail gesendet fuer {date} um {time}." if result.get("success") else "Meeting-Link konnte nicht gesendet werden."

    @function_tool
    async def send_meeting_link_sms(self, ctx: RunContext, date: str, time: str, meeting_title: str = "Demo-Termin"):
        """Sende Meeting-Link per SMS. Args: date: Datum, time: Uhrzeit, meeting_title: Titel"""
        if not self.lead_phone:
            return "Keine Telefonnummer fuer SMS vorhanden."
        result = await call_supabase_action("send_meeting_link", {"to": self.lead_phone, "date": date, "time": time, "title": meeting_title, "lead_id": self.lead_id, "lead_name": self.lead_name, "call_log_id": self.call_log_id, "method": "sms"})
        return f"Meeting-Link per SMS gesendet fuer {date} um {time}." if result.get("success") else "SMS konnte nicht gesendet werden."

    @function_tool
    async def schedule_callback(self, ctx: RunContext, date: str, time: str, notes: str = ""):
        """Plane einen Rueckruf. Args: date: Datum, time: Uhrzeit, notes: Notizen"""
        result = await call_supabase_action("schedule_callback", {"lead_id": self.lead_id, "date": date, "time": time, "notes": notes, "campaign_id": self.campaign_id})
        return f"Rueckruf fuer {date} {time} eingeplant." if result.get("success") else "Rueckruf konnte nicht eingeplant werden."

    @function_tool
    async def update_lead_status(self, ctx: RunContext, status: str, notes: str = ""):
        """Aktualisiere Lead-Status. Args: status: interested/not_interested/callback/qualified, notes: Begruendung"""
        result = await call_supabase_action("update_lead_status", {"lead_id": self.lead_id, "status": status, "notes": notes})
        return f"Lead-Status auf '{status}' aktualisiert." if result.get("success") else "Status konnte nicht aktualisiert werden."

    @function_tool
    async def add_note(self, ctx: RunContext, note: str):
        """Speichere eine Notiz. Args: note: Die Notiz"""
        result = await call_supabase_action("add_note", {"lead_id": self.lead_id, "call_log_id": self.call_log_id, "note": note})
        return "Notiz gespeichert." if result.get("success") else "Notiz konnte nicht gespeichert werden."

    async def on_enter(self):
        if self.is_outbound:
            return
        if self.ai_greeting:
            await self.session.generate_reply(instructions=f"Sage: {self.ai_greeting}", allow_interruptions=True)
        elif self.lead_name:
            greeting = f"Begruesse {self.lead_name}" + (f" von {self.lead_company}" if self.lead_company else "") + " freundlich auf Deutsch."
            if self.ai_name:
                greeting += f" Stelle dich als {self.ai_name} vor."
            await self.session.generate_reply(instructions=greeting, allow_interruptions=True)
        else:
            await self.session.generate_reply(instructions=f"Begruesse den Anrufer freundlich auf Deutsch. Stelle dich als {self.ai_name or 'virtueller Assistent'} vor.", allow_interruptions=True)


server = AgentServer()


@server.rtc_session(agent_name="ColdCallAgent")
async def entrypoint(ctx: JobContext):
    metadata, is_outbound, phone_number = {}, False, None
    if ctx.job.metadata:
        try:
            metadata = json.loads(ctx.job.metadata)
            phone_number = metadata.get("phone_number")
            is_outbound = phone_number is not None
        except json.JSONDecodeError:
            pass
    if ctx.room.metadata and not metadata:
        try:
            metadata = json.loads(ctx.room.metadata)
        except json.JSONDecodeError:
            pass

    lead_id, call_log_id, campaign_id = metadata.get("lead_id", ""), metadata.get("call_log_id", ""), metadata.get("campaign_id", "")
    ai_prompt, product_description, call_goal = metadata.get("ai_prompt", ""), metadata.get("product_description", ""), metadata.get("call_goal", "")
    lead_name, lead_company, lead_email = metadata.get("lead_name", ""), metadata.get("lead_company", ""), metadata.get("lead_email", "")
    lead_phone, lead_notes = metadata.get("lead_phone", phone_number or ""), metadata.get("lead_notes", "")
    ai_name, ai_greeting, ai_personality, company_name, custom_prompt = "", "", "", "", ""

    if ai_prompt:
        try:
            settings = json.loads(ai_prompt)
            if isinstance(settings, dict):
                s = settings.get("aiSettings", settings)
                ai_name, ai_greeting = s.get("aiName", ""), s.get("aiGreeting", "")
                ai_personality, company_name, custom_prompt = s.get("aiPersonality", ""), s.get("companyName", ""), s.get("customPrompt", "")
        except json.JSONDecodeError:
            custom_prompt = ai_prompt

    logger.info(f"Call gestartet - Lead: {lead_name}, AI: {ai_name}, Outbound: {is_outbound}")

    if is_outbound and phone_number:
        try:
            await ctx.api.sip.create_sip_participant(api.CreateSIPParticipantRequest(room_name=ctx.room.name, sip_trunk_id=SIP_TRUNK_ID, sip_call_to=phone_number, participant_identity=phone_number, wait_until_answered=True))
        except api.TwirpError as e:
            logger.error(f"Anruf fehlgeschlagen: {e.message}")
            ctx.shutdown()
            return

    instructions = f"""Du bist {ai_name or 'ein professioneller Vertriebsmitarbeiter'} von {company_name or 'unserem Unternehmen'}.
# Persoenlichkeit: {ai_personality or 'Freundlich, professionell und hilfsbereit.'}
# Regeln: Antworte nur Klartext, kurz (1-3 Saetze), IMMER Deutsch. Draenge nie, akzeptiere Nein sofort.
# Lead: {lead_name or 'Unbekannt'} von {lead_company or 'Unbekannt'}, E-Mail: {lead_email or 'Keine'}, Notizen: {lead_notes or 'Keine'}
# Produkt: {product_description or 'Nicht angegeben'}
# Ziel: {call_goal or 'Freundliches Gespraech fuehren'}
# Tools: end_call, send_email, send_meeting_link_email, send_meeting_link_sms, schedule_callback, update_lead_status, add_note
# Terminvereinbarung: Bei Interesse Termin anbieten, nach Datum/Uhrzeit fragen, Meeting-Link per Email oder SMS senden.
{custom_prompt}"""

    session = AgentSession(llm=openai.realtime.RealtimeModel(voice="nova"))
    await session.start(
        agent=ColdCallAgent(instructions=instructions, lead_name=lead_name, lead_company=lead_company, lead_email=lead_email, lead_phone=lead_phone, lead_id=lead_id, call_log_id=call_log_id, campaign_id=campaign_id, lead_notes=lead_notes, product_description=product_description, call_goal=call_goal, campaign_name=metadata.get("campaign_name", ""), is_outbound=is_outbound, ai_name=ai_name, ai_greeting=ai_greeting),
        room=ctx.room,
        room_options=room_io.RoomOptions(audio_input=room_io.AudioInputOptions(noise_cancellation=lambda params: noise_cancellation.BVCTelephony() if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP else noise_cancellation.BVC())),
    )


if __name__ == "__main__":
    cli.run_app(server)
