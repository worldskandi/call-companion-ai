import json
import logging
import asyncio
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
    cartesia,
    deepgram,
)

logger = logging.getLogger("ColdCallAgent")
load_dotenv(".env.local")

SIP_TRUNK_ID = "ST_55KNF9cwavz2"
SUPABASE_URL = "https://dwuelcsawiudvihxeddc.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3dWVsY3Nhd2l1ZHZpaHhlZGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTA2OTMsImV4cCI6MjA4MTgyNjY5M30.SQbOd4tPwdC9oTOgccdHXeoMm7EAFqw5dKkNfXTQyUE"

# Cartesia German Voice IDs
CARTESIA_VOICES = {
    "sebastian": "b7187e84-fe22-4344-ba4a-bc013fcb533e",  # Male
    "thomas": "384b625b-da5d-49e8-a76d-a2855d4f31eb",     # Male
    "alina": "38aabb6a-f52b-4fb0-a3d1-988518f4dc06",      # Female
    "viktoria": "b9de4a89-2257-424b-94c2-db18ba68c81a",   # Female
}
DEFAULT_VOICE_ID = CARTESIA_VOICES["viktoria"]


async def hangup_call():
    ctx = get_job_context()
    if ctx is None:
        return
    await ctx.api.room.delete_room(
        api.DeleteRoomRequest(room=ctx.room.name)
    )


async def call_supabase_action(action: str, data: dict):
    try:
        async with aiohttp.ClientSession() as http_session:
            async with http_session.post(
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


async def save_transcript_and_summary(call_log_id: str, transcript: str):
    if not call_log_id or not transcript:
        return
    
    try:
        async with aiohttp.ClientSession() as http_session:
            async with http_session.post(
                f"{SUPABASE_URL}/functions/v1/end-call",
                headers={
                    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "call_log_id": call_log_id,
                    "transcript": transcript,
                    "generate_summary": True,
                },
            ) as resp:
                result = await resp.json()
                logger.info(f"Transcript saved: {result}")
    except Exception as e:
        logger.error(f"Failed to save transcript: {e}")


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
        self.transcript_lines = []
        
        super().__init__(instructions=instructions)
    
    def add_user_transcript(self, text: str):
        if text and text.strip():
            speaker = self.lead_name if self.lead_name else "Kunde"
            self.transcript_lines.append(f"{speaker}: {text.strip()}")
            logger.info(f"[Transcript] {speaker}: {text.strip()}")
    
    def add_agent_transcript(self, text: str):
        if text and text.strip():
            speaker = self.ai_name if self.ai_name else "Agent"
            self.transcript_lines.append(f"{speaker}: {text.strip()}")
            logger.info(f"[Transcript] {speaker}: {text.strip()}")
    
    def get_transcript(self) -> str:
        return "\n".join(self.transcript_lines)

    @function_tool
    async def end_call(self, ctx: RunContext):
        """Beende den Anruf"""
        await ctx.session.generate_reply(
            instructions="Verabschiede dich hoeflich und beende das Gespraech."
        )
        transcript = self.get_transcript()
        if transcript and self.call_log_id:
            await save_transcript_and_summary(self.call_log_id, transcript)
        await hangup_call()

    @function_tool
    async def send_email(self, ctx: RunContext, subject: str, body: str):
        """Sende eine E-Mail an den Kunden."""
        if not self.lead_email:
            return "Keine E-Mail-Adresse vorhanden."
        result = await call_supabase_action("send_email", {
            "to": self.lead_email, "subject": subject, "body": body, "lead_id": self.lead_id,
        })
        return f"E-Mail gesendet." if result.get("success") else "E-Mail fehlgeschlagen."

    @function_tool
    async def send_meeting_link_email(self, ctx: RunContext, date: str, time: str, meeting_title: str = "Demo-Termin"):
        """Sende Meeting-Link per E-Mail."""
        if not self.lead_email:
            return "Keine E-Mail-Adresse."
        result = await call_supabase_action("send_meeting_link", {
            "to": self.lead_email, "date": date, "time": time, "title": meeting_title,
            "lead_id": self.lead_id, "lead_name": self.lead_name, "method": "email",
        })
        return f"Meeting-Link gesendet." if result.get("success") else "Fehler."

    @function_tool
    async def send_meeting_link_sms(self, ctx: RunContext, date: str, time: str, meeting_title: str = "Demo-Termin"):
        """Sende Meeting-Link per SMS."""
        if not self.lead_phone:
            return "Keine Telefonnummer."
        result = await call_supabase_action("send_meeting_link", {
            "to": self.lead_phone, "date": date, "time": time, "title": meeting_title,
            "lead_id": self.lead_id, "lead_name": self.lead_name, "method": "sms",
        })
        return f"SMS gesendet." if result.get("success") else "Fehler."

    @function_tool
    async def schedule_callback(self, ctx: RunContext, date: str, time: str, notes: str = ""):
        """Plane Rueckruf."""
        result = await call_supabase_action("schedule_callback", {
            "lead_id": self.lead_id, "date": date, "time": time, "notes": notes, "campaign_id": self.campaign_id,
        })
        return f"Rueckruf geplant." if result.get("success") else "Fehler."

    @function_tool
    async def update_lead_status(self, ctx: RunContext, status: str, notes: str = ""):
        """Aktualisiere Lead-Status."""
        result = await call_supabase_action("update_lead_status", {
            "lead_id": self.lead_id, "status": status, "notes": notes,
        })
        return f"Status aktualisiert." if result.get("success") else "Fehler."

    @function_tool
    async def add_note(self, ctx: RunContext, note: str):
        """Speichere Notiz."""
        result = await call_supabase_action("add_note", {
            "lead_id": self.lead_id, "call_log_id": self.call_log_id, "note": note,
        })
        return "Notiz gespeichert." if result.get("success") else "Fehler."

    async def on_enter(self):
        logger.info(f"on_enter - greeting: {self.ai_greeting}")
        
        if self.ai_greeting:
            await self.session.generate_reply(
                instructions=f"Sage genau: {self.ai_greeting}",
                allow_interruptions=True,
            )
        elif self.lead_name:
            greeting = f"Begruesse {self.lead_name} freundlich auf Deutsch."
            if self.ai_name:
                greeting += f" Stelle dich als {self.ai_name} vor."
            await self.session.generate_reply(instructions=greeting, allow_interruptions=True)
        else:
            await self.session.generate_reply(
                instructions="Begruesse den Anrufer freundlich auf Deutsch.",
                allow_interruptions=True
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
            logger.info(f"Metadata: {metadata}")
        except json.JSONDecodeError:
            pass
    
    if ctx.room.metadata and not metadata:
        try:
            metadata = json.loads(ctx.room.metadata)
        except json.JSONDecodeError:
            pass
    
    lead_id = metadata.get("lead_id", "")
    call_log_id = metadata.get("call_log_id", "")
    campaign_id = metadata.get("campaign_id", "")
    ai_prompt = metadata.get("ai_prompt", "")
    product_description = metadata.get("product_description", "")
    call_goal = metadata.get("call_goal", "")
    campaign_name = metadata.get("campaign_name", "")
    lead_name = metadata.get("lead_name", "")
    lead_company = metadata.get("lead_company", "")
    lead_email = metadata.get("lead_email", "")
    lead_phone = metadata.get("lead_phone", phone_number or "")
    lead_notes = metadata.get("lead_notes", "")
    
    ai_name = ""
    ai_greeting = ""
    ai_personality = ""
    company_name = ""
    custom_prompt = ""
    voice_id = DEFAULT_VOICE_ID
    
    if ai_prompt:
        try:
            settings = json.loads(ai_prompt)
            if isinstance(settings, dict):
                ai_name = settings.get("aiName", "")
                ai_greeting = settings.get("aiGreeting", "")
                ai_personality = settings.get("aiPersonality", "")
                company_name = settings.get("companyName", "")
                custom_prompt = settings.get("customPrompt", "")
                voice_setting = settings.get("aiVoice", "").lower()
                # Map voice setting to voice ID
                if voice_setting in CARTESIA_VOICES:
                    voice_id = CARTESIA_VOICES[voice_setting]
                elif voice_setting == "german_female":
                    voice_id = CARTESIA_VOICES["viktoria"]
                elif voice_setting == "german_male":
                    voice_id = CARTESIA_VOICES["sebastian"]
        except json.JSONDecodeError:
            custom_prompt = ai_prompt
    
    logger.info(f"Call gestartet - Lead: {lead_name}, AI: {ai_name}, Voice ID: {voice_id}, Outbound: {is_outbound}")
    
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
    
    instructions = f"""Du bist {ai_name if ai_name else 'ein Vertriebsmitarbeiter'} von {company_name if company_name else 'unserem Unternehmen'}.

# Begruessung
{f'Sage GENAU: "{ai_greeting}"' if ai_greeting else 'Begruesse freundlich.'}

# Persoenlichkeit
{ai_personality if ai_personality else 'Freundlich und professionell.'}

# Regeln
- Nur Klartext, kein JSON/Markdown/Emojis
- Kurze Antworten, 1-3 Saetze
- IMMER Deutsch sprechen
- Nicht draengen, Nein akzeptieren

# Gespraechspartner
Name: {lead_name if lead_name else 'Unbekannt'}
Firma: {lead_company if lead_company else 'Unbekannt'}
Notizen: {lead_notes if lead_notes else 'Keine'}

# Produkt: {product_description if product_description else 'Nicht angegeben'}
# Ziel: {call_goal if call_goal else 'Freundliches Gespraech'}

# Zusaetzlich
{custom_prompt if custom_prompt else ''}
"""
    
    agent = ColdCallAgent(
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
    )
    
    # Cartesia TTS with Voice ID and sonic-3 model
    tts = cartesia.TTS(
        model="sonic-3",
        voice=voice_id,
        language="de",
    )
    
    session = AgentSession(
        stt=deepgram.STT(language="de"),
        llm=openai.LLM(model="gpt-4o"),
        tts=tts,
    )
    
    @session.on("user_input_transcribed")
    def on_user_transcript(transcript):
        if transcript.is_final:
            agent.add_user_transcript(transcript.transcript)
    
    @session.on("agent_speech_committed")
    def on_agent_speech(msg):
        if hasattr(msg, 'content') and msg.content:
            agent.add_agent_transcript(msg.content)
    
    @ctx.room.on("participant_disconnected")
    def on_participant_left(participant):
        logger.info(f"Participant left: {participant.identity}")
        transcript = agent.get_transcript()
        if transcript and call_log_id:
            asyncio.create_task(save_transcript_and_summary(call_log_id, transcript))
    
    await session.start(
        agent=agent,
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: noise_cancellation.BVCTelephony() if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP else noise_cancellation.BVC(),
            ),
        ),
    )


if __name__ == "__main__":
    cli.run_app(server)
