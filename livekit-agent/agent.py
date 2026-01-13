import json
import logging
import asyncio
import os
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

CARTESIA_VOICES = {
    "sebastian": "b7187e84-fe22-4344-ba4a-bc013fcb533e",
    "thomas": "384b625b-da5d-49e8-a76d-a2855d4f31eb",
    "alina": "38aabb6a-f52b-4fb0-a3d1-988518f4dc06",
    "viktoria": "b9de4a89-2257-424b-94c2-db18ba68c81a",
}
DEFAULT_VOICE_ID = CARTESIA_VOICES["viktoria"]

LLM_PROVIDERS = {
    "openai": {"model": "gpt-4o", "base_url": None},
    "xai": {"model": "grok-3-fast", "base_url": "https://api.x.ai/v1"},
    "xai-mini": {"model": "grok-3-mini-fast", "base_url": "https://api.x.ai/v1"},
}
DEFAULT_LLM = "openai"

# Keywords for better STT recognition
STT_KEYWORDS = [
    # E-Mail Begriffe boosten
    "at", "punkt", "dot", "com", "de", "net", "org",
    "gmail", "outlook", "yahoo", "hotmail", "web.de", "gmx", "icloud",
    "Unterstrich", "underscore", "Bindestrich", "minus", "dash",
    # Deutsches Buchstabieralphabet
    "Anton", "Berta", "Caesar", "Dora", "Emil", "Friedrich", "Gustav",
    "Heinrich", "Ida", "Julius", "Kaufmann", "Ludwig", "Martha", "Nordpol",
    "Otto", "Paula", "Quelle", "Richard", "Samuel", "Theodor", "Ulrich",
    "Viktor", "Wilhelm", "Xanthippe", "Ypsilon", "Zacharias",
    # Einzelne Buchstaben
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
]


async def hangup_call():
    ctx = get_job_context()
    if ctx is None:
        return
    await ctx.api.room.delete_room(api.DeleteRoomRequest(room=ctx.room.name))


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


async def save_transcript_and_summary(call_log_id: str, transcript: str, usage_stats: dict = None):
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
                    "usage_stats": usage_stats,
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
        self.usage_stats = {
            "stt_seconds": 0,
            "llm_input_tokens": 0,
            "llm_output_tokens": 0,
            "tts_characters": 0,
            "llm_provider": "",
            "voice_id": "",
        }
        
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
            self.usage_stats["tts_characters"] += len(text)
            logger.info(f"[Transcript] {speaker}: {text.strip()}")
    
    def get_transcript(self) -> str:
        return "\n".join(self.transcript_lines)

    @function_tool
    async def end_call(self, ctx: RunContext):
        """Beende den Anruf"""
        await ctx.session.generate_reply(
            instructions="Verabschiede dich natuerlich und warmherzig."
        )
        transcript = self.get_transcript()
        if transcript and self.call_log_id:
            await save_transcript_and_summary(self.call_log_id, transcript, self.usage_stats)
        await hangup_call()

    @function_tool
    async def send_email(self, ctx: RunContext, subject: str, body: str):
        """Sende eine E-Mail an den Kunden."""
        if not self.lead_email:
            return "Keine E-Mail-Adresse vorhanden."
        result = await call_supabase_action("send_email", {
            "to": self.lead_email, "subject": subject, "body": body, "lead_id": self.lead_id,
        })
        return "E-Mail gesendet." if result.get("success") else "E-Mail fehlgeschlagen."

    @function_tool
    async def send_meeting_link_email(self, ctx: RunContext, date: str, time: str, meeting_title: str = "Demo-Termin"):
        """Sende Meeting-Link per E-Mail."""
        if not self.lead_email:
            return "Keine E-Mail-Adresse."
        result = await call_supabase_action("send_meeting_link", {
            "to": self.lead_email, "date": date, "time": time, "title": meeting_title,
            "lead_id": self.lead_id, "lead_name": self.lead_name, "method": "email",
        })
        return "Meeting-Link gesendet." if result.get("success") else "Fehler."

    @function_tool
    async def send_meeting_link_sms(self, ctx: RunContext, date: str, time: str, meeting_title: str = "Demo-Termin"):
        """Sende Meeting-Link per SMS."""
        if not self.lead_phone:
            return "Keine Telefonnummer."
        result = await call_supabase_action("send_meeting_link", {
            "to": self.lead_phone, "date": date, "time": time, "title": meeting_title,
            "lead_id": self.lead_id, "lead_name": self.lead_name, "method": "sms",
        })
        return "SMS gesendet." if result.get("success") else "Fehler."

    @function_tool
    async def schedule_callback(self, ctx: RunContext, date: str, time: str, notes: str = ""):
        """Plane Rueckruf."""
        result = await call_supabase_action("schedule_callback", {
            "lead_id": self.lead_id, "date": date, "time": time, "notes": notes, "campaign_id": self.campaign_id,
        })
        return "Rueckruf geplant." if result.get("success") else "Fehler."

    @function_tool
    async def update_lead_status(self, ctx: RunContext, status: str, notes: str = ""):
        """Aktualisiere Lead-Status."""
        result = await call_supabase_action("update_lead_status", {
            "lead_id": self.lead_id, "status": status, "notes": notes,
        })
        return "Status aktualisiert." if result.get("success") else "Fehler."

    @function_tool
    async def add_note(self, ctx: RunContext, note: str):
        """Speichere Notiz."""
        result = await call_supabase_action("add_note", {
            "lead_id": self.lead_id, "call_log_id": self.call_log_id, "note": note,
        })
        return "Notiz gespeichert." if result.get("success") else "Fehler."
    
    @function_tool
    async def save_email_address(self, ctx: RunContext, email: str):
        """Speichere die E-Mail-Adresse des Kunden wenn er sie nennt.
        
        Args:
            email: Die E-Mail-Adresse (z.B. max.mustermann@gmail.com)
        """
        # Update local state
        self.lead_email = email
        
        # Save to database
        result = await call_supabase_action("update_lead_email", {
            "lead_id": self.lead_id,
            "email": email,
        })
        
        if result.get("success"):
            return f"E-Mail {email} wurde gespeichert."
        return "E-Mail konnte nicht gespeichert werden."

    async def on_enter(self):
        logger.info(f"on_enter - greeting: {self.ai_greeting}")
        
        if self.ai_greeting:
            await self.session.generate_reply(
                instructions=f"Sage genau: {self.ai_greeting}",
                allow_interruptions=True,
            )
        elif self.lead_name:
            greeting = f"Begruesse {self.lead_name} locker und natuerlich auf Deutsch."
            if self.ai_name:
                greeting += f" Stelle dich als {self.ai_name} vor."
            await self.session.generate_reply(instructions=greeting, allow_interruptions=True)
        else:
            await self.session.generate_reply(
                instructions="Begruesse locker mit Hey oder Na alles klar",
                allow_interruptions=True
            )


server = AgentServer()


def build_instructions(ai_name, company_name, ai_personality, ai_greeting, lead_name, lead_company, lead_notes, product_description, call_goal, custom_prompt):
    human_speech = """
SPRACHSTIL - EXTREM WICHTIG:
Du sprichst wie ein ECHTER Mensch am Telefon, NICHT wie eine KI.

Fuellwoerter und Denkpausen IMMER einbauen:
- Satzanfaenge: Also, Na ja, Hmm, Weisst du, Ach
- Beim Ueberlegen: Lass mich kurz ueberlegen, Moment
- Bestaetigung: Mhm, Ja genau, Oh, Ach so
- Unsicherheit: Ich glaub, Vielleicht, Koennte sein

Emotionale Reaktionen mit Tags:
- Freude: [laugh] oder [chuckle]
- Ueberraschung: [gasp] oder Oh!
- Nachdenklich: [sigh] mit Hmm
- Pausen: [pause: 0.3s] oder [pause: 0.5s]

Satzstruktur variieren:
- Kurz: Ja klar! Oh nice! Verstehe!
- Mittel: Ach so, das ist ja cool!
- Lang: Also weisst du, das find ich echt interessant

REGELN:
1. JEDE Antwort mindestens 1 Fuellwort
2. Bei laengeren Antworten [pause] Tags einbauen
3. Emotionen zeigen wo passend
4. Abkuerzungen: nen statt einen, grad statt gerade
"""

    email_instructions = """
E-MAIL ADRESSEN VERSTEHEN - SEHR WICHTIG:
Wenn jemand eine E-Mail sagt oder buchstabiert:

Erkenne diese Woerter:
- "at", "aet", "Klammeraffe", "Affenschwanz" = @
- "dot", "punkt", "point" = .
- "minus", "Bindestrich", "dash" = -
- "underscore", "Unterstrich" = _

Deutsches Buchstabieralphabet erkennen:
- "A wie Anton" = A
- "B wie Berta" = B
- "C wie Caesar" = C
- "D wie Dora" = D
- "E wie Emil" = E
- "F wie Friedrich" = F
- "G wie Gustav" = G
- "H wie Heinrich" = H
- "I wie Ida" = I
- "J wie Julius" = J
- "K wie Kaufmann" = K
- "L wie Ludwig" = L
- "M wie Martha" = M
- "N wie Nordpol" = N
- "O wie Otto" = O
- "P wie Paula" = P
- "Q wie Quelle" = Q
- "R wie Richard" = R
- "S wie Samuel" = S
- "T wie Theodor" = T
- "U wie Ulrich" = U
- "V wie Viktor" = V
- "W wie Wilhelm" = W
- "X wie Xanthippe" = X
- "Y wie Ypsilon" = Y
- "Z wie Zacharias" = Z

Wenn du eine E-Mail hoerst:
1. Wiederhole sie IMMER zur Bestaetigung
2. Buchstabiere schwierige Teile zurueck
3. Nutze save_email_address Tool um sie zu speichern

Beispiel:
Kunde: "Meine E-Mail ist max punkt mustermann at gmail punkt com"
Du: "Also max punkt mustermann at gmail punkt com, richtig? [pause: 0.3s] Ich schreib mir das grad auf."
-> Dann save_email_address aufrufen mit "max.mustermann@gmail.com"

Wenn du unsicher bist:
"Kannst du mir das nochmal buchstabieren? Also zum Beispiel M wie Martha..."
"""

    name_str = ai_name if ai_name else "ein freundlicher Mitarbeiter"
    company_str = company_name if company_name else "unserem Team"
    personality_str = ai_personality if ai_personality else "Locker, freundlich, wie ein guter Freund."
    greeting_str = f'Sage so aehnlich wie: {ai_greeting}' if ai_greeting else "Begruesse locker und natuerlich."
    lead_name_str = lead_name if lead_name else "Unbekannt"
    lead_company_str = lead_company if lead_company else "Unbekannt"
    lead_notes_str = lead_notes if lead_notes else "Keine"
    product_str = product_description if product_description else "Allgemeines Gespraech"
    goal_str = call_goal if call_goal else "Nettes Gespraech fuehren"
    custom_str = custom_prompt if custom_prompt else ""

    return f"""Du bist {name_str} von {company_str}.

{human_speech}

{email_instructions}

Deine Persoenlichkeit:
{personality_str}

Begruessung:
{greeting_str}

Gespraechspartner:
Name: {lead_name_str}
Firma: {lead_company_str}
Notizen: {lead_notes_str}

Produkt/Thema: {product_str}
Ziel: {goal_str}

Zusaetzliche Anweisungen:
{custom_str}

Output Format:
- NUR Text der gesprochen wird
- Kein JSON, kein Markdown
- Kurze Saetze, 1-3 pro Antwort
- IMMER auf Deutsch
"""


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
    llm_provider = DEFAULT_LLM
    
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
                llm_setting = settings.get("llmProvider", "").lower()
                
                if voice_setting in CARTESIA_VOICES:
                    voice_id = CARTESIA_VOICES[voice_setting]
                if llm_setting in LLM_PROVIDERS:
                    llm_provider = llm_setting
        except json.JSONDecodeError:
            custom_prompt = ai_prompt
    
    logger.info(f"Call gestartet - Lead: {lead_name}, AI: {ai_name}, Voice: {voice_id}, LLM: {llm_provider}")
    
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
    
    instructions = build_instructions(
        ai_name, company_name, ai_personality, ai_greeting,
        lead_name, lead_company, lead_notes,
        product_description, call_goal, custom_prompt
    )
    
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
    
    agent.usage_stats["llm_provider"] = llm_provider
    agent.usage_stats["voice_id"] = voice_id
    
    tts = cartesia.TTS(
        model="sonic-3",
        voice=voice_id,
        language="de",
    )
    
    # STT with keyword boosting for better email recognition
    stt = deepgram.STT(
        language="de",
        model="nova-2",
        keywords=STT_KEYWORDS,
    )
    
    llm_config = LLM_PROVIDERS[llm_provider]
    if llm_config["base_url"]:
        llm = openai.LLM(
            model=llm_config["model"],
            base_url=llm_config["base_url"],
            api_key=os.environ.get("XAI_API_KEY"),
        )
    else:
        llm = openai.LLM(model=llm_config["model"])
    
    session = AgentSession(
        stt=stt,
        llm=llm,
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
            asyncio.create_task(save_transcript_and_summary(call_log_id, transcript, agent.usage_stats))
    
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
