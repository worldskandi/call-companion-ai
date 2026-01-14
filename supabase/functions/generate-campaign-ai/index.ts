import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateCampaignRequest {
  model: "grok" | "chatgpt";
  productName: string;
  targetAudience: string;
  priceRange: number; // 0-100
  tonality: number; // 0-100: 0=formal, 100=casual
  salesStyle: number; // 0-100: 0=consultative, 100=persuasive
  aiVoice: string; // Voice ID for the AI agent
}

interface GeneratedCampaign {
  name: string;
  productDescription: string;
  targetGroup: string;
  callGoal: string;
  aiSettings: {
    aiName: string;
    aiGreeting: string;
    aiPersonality: string;
    companyName: string;
    customPrompt: string;
    aiVoice: string;
    llmProvider: 'openai' | 'xai' | 'xai-mini';
  };
  advancedSettings: {
    formality: 'du' | 'sie';
    responseLength: 'short' | 'medium' | 'long';
    temperature: number;
    emotionLevel: 'low' | 'medium' | 'high';
  };
  objectionHandling: {
    objections: { id: string; trigger: string; response: string }[];
    closingStrategy: 'soft' | 'medium' | 'assertive';
    fallbackResponse: string;
  };
}

function getTonalityDescription(value: number): string {
  if (value < 20) return "Sehr formell, Sie-Form, geschäftsmäßig, distanziert";
  if (value < 40) return "Formell aber freundlich, Sie-Form, professionell";
  if (value < 60) return "Ausgewogen, höflich, zugänglich";
  if (value < 80) return "Locker und freundlich, Du-Form möglich, nahbar";
  return "Sehr locker, Du-Form, freundschaftlich, ungezwungen";
}

function getSalesStyleDescription(value: number): string {
  if (value < 20) return "Sehr beratend, fragend, nicht aufdringlich, lässt dem Kunden viel Raum";
  if (value < 40) return "Beratend mit leichtem Fokus auf Nutzen, stellt viele Fragen";
  if (value < 60) return "Ausgewogen zwischen Beratung und Überzeugung";
  if (value < 80) return "Überzeugend, nutzenorientiert, arbeitet auf Abschluss hin";
  return "Sehr direkt, abschlussorientiert, überzeugend, proaktiv";
}

function getPriceRangeDescription(value: number): string {
  if (value < 20) return "Niedrigpreissegment (unter 100€)";
  if (value < 40) return "Mittelpreissegment (100-500€)";
  if (value < 60) return "Gehobenes Segment (500-2.000€)";
  if (value < 80) return "Premium-Segment (2.000-10.000€)";
  return "High-End/Enterprise (über 10.000€)";
}

// Derive settings from tonality and sales style
function deriveAdvancedSettings(tonality: number, salesStyle: number): {
  formality: 'du' | 'sie';
  emotionLevel: 'low' | 'medium' | 'high';
  closingStrategy: 'soft' | 'medium' | 'assertive';
  responseLength: 'short' | 'medium' | 'long';
  llmProvider: 'openai' | 'xai' | 'xai-mini';
} {
  // Tonality mapping
  let formality: 'du' | 'sie' = 'sie';
  let emotionLevel: 'low' | 'medium' | 'high' = 'medium';
  
  if (tonality < 40) {
    formality = 'sie';
    emotionLevel = 'low';
  } else if (tonality < 60) {
    formality = 'sie';
    emotionLevel = 'medium';
  } else if (tonality < 80) {
    formality = 'du';
    emotionLevel = 'medium';
  } else {
    formality = 'du';
    emotionLevel = 'high';
  }
  
  // Sales style mapping
  let closingStrategy: 'soft' | 'medium' | 'assertive' = 'medium';
  let responseLength: 'short' | 'medium' | 'long' = 'medium';
  
  if (salesStyle < 33) {
    closingStrategy = 'soft';
    responseLength = 'long';
  } else if (salesStyle < 66) {
    closingStrategy = 'medium';
    responseLength = 'medium';
  } else {
    closingStrategy = 'assertive';
    responseLength = 'short';
  }
  
  // LLM provider based on complexity (higher price = smarter model)
  const llmProvider: 'openai' | 'xai' | 'xai-mini' = 'openai';
  
  return { formality, emotionLevel, closingStrategy, responseLength, llmProvider };
}

function buildSystemPrompt(aiVoice: string, derivedSettings: ReturnType<typeof deriveAdvancedSettings>): string {
  return `Du bist ein Experte für Vertriebskampagnen und AI-Telefonagenten. Du erstellst professionelle Kampagnen-Konfigurationen basierend auf den Vorgaben des Nutzers.

WICHTIG: Antworte IMMER mit einem validen JSON-Objekt in exakt diesem Format:
{
  "name": "Kampagnenname",
  "productDescription": "Ausführliche Produktbeschreibung",
  "targetGroup": "Detaillierte Zielgruppenbeschreibung",
  "callGoal": "Konkretes Anrufziel",
  "aiSettings": {
    "aiName": "Name für den AI-Agenten",
    "aiGreeting": "Begrüßungstext für den Anruf (${derivedSettings.formality === 'du' ? 'Du-Form' : 'Sie-Form'})",
    "aiPersonality": "Beschreibung der Persönlichkeit und des Kommunikationsstils",
    "companyName": "Firmenname",
    "customPrompt": "Vollständiger Prompt für den AI-Agenten",
    "aiVoice": "${aiVoice}",
    "llmProvider": "${derivedSettings.llmProvider}"
  },
  "advancedSettings": {
    "formality": "${derivedSettings.formality}",
    "responseLength": "${derivedSettings.responseLength}",
    "temperature": 0.7,
    "emotionLevel": "${derivedSettings.emotionLevel}"
  },
  "objectionHandling": {
    "objections": [
      { "id": "obj_1", "trigger": "Beispiel-Einwand 1", "response": "Passende Antwort" },
      { "id": "obj_2", "trigger": "Beispiel-Einwand 2", "response": "Passende Antwort" },
      { "id": "obj_3", "trigger": "Beispiel-Einwand 3", "response": "Passende Antwort" }
    ],
    "closingStrategy": "${derivedSettings.closingStrategy}",
    "fallbackResponse": "Fallback-Antwort für unbekannte Einwände"
  }
}

REGELN:
1. Generiere 3-5 branchenspezifische Einwände basierend auf dem Produkt und der Zielgruppe
2. Die Einwände sollten typische Bedenken der Zielgruppe widerspiegeln
3. Die Antworten sollten ${derivedSettings.closingStrategy === 'soft' ? 'sanft und verständnisvoll' : derivedSettings.closingStrategy === 'assertive' ? 'direkt und überzeugend' : 'ausgewogen'} sein
4. Verwende ${derivedSettings.formality === 'du' ? 'die Du-Form' : 'die Sie-Form'} konsistent
5. Der aiVoice Wert MUSS immer "${aiVoice}" sein

Der customPrompt sollte enthalten:
1. Klare Rollenbeschreibung
2. Aufgaben und Ziele
3. Wichtige Regeln für das Gespräch
4. Einen strukturierten Gesprächsablauf`;
}

function buildUserPrompt(request: GenerateCampaignRequest): string {
  const tonality = getTonalityDescription(request.tonality);
  const salesStyle = getSalesStyleDescription(request.salesStyle);
  const priceRange = getPriceRangeDescription(request.priceRange);

  return `Erstelle eine vollständige Vertriebskampagne für folgende Vorgaben:

PRODUKT/FIRMA: ${request.productName}
ZIELGRUPPE: ${request.targetAudience}
PREISSEGMENT: ${priceRange}
TONALITÄT: ${tonality}
VERKAUFSSTIL: ${salesStyle}

Generiere eine professionelle Kampagne, die perfekt auf diese Parameter abgestimmt ist. Der AI-Agent soll authentisch und überzeugend klingen. Passe den Sprachstil, die Begrüßung und den gesamten Prompt an die gewählte Tonalität und den Verkaufsstil an.`;
}

async function callGrok(systemPrompt: string, userPrompt: string): Promise<GeneratedCampaign> {
  const xaiApiKey = Deno.env.get("XAI_API_KEY");
  if (!xaiApiKey) {
    throw new Error("XAI_API_KEY not configured");
  }

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${xaiApiKey}`,
    },
    body: JSON.stringify({
      model: "grok-3-latest",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Grok API error:", errorText);
    throw new Error(`Grok API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error("No content in Grok response");
  }

  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in Grok response");
  }

  return JSON.parse(jsonMatch[0]) as GeneratedCampaign;
}

async function callChatGPT(systemPrompt: string, userPrompt: string): Promise<GeneratedCampaign> {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiApiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI API error:", errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error("No content in OpenAI response");
  }

  return JSON.parse(content) as GeneratedCampaign;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: GenerateCampaignRequest = await req.json();

    // Validate request
    if (!request.productName || !request.targetAudience) {
      return new Response(
        JSON.stringify({ error: "productName and targetAudience are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["grok", "chatgpt"].includes(request.model)) {
      return new Response(
        JSON.stringify({ error: "model must be 'grok' or 'chatgpt'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const derivedSettings = deriveAdvancedSettings(request.tonality || 50, request.salesStyle || 50);
    const systemPrompt = buildSystemPrompt(request.aiVoice || "shimmer", derivedSettings);
    const userPrompt = buildUserPrompt(request);

    console.log(`Generating campaign with ${request.model}...`);

    let campaign: GeneratedCampaign;
    
    if (request.model === "grok") {
      campaign = await callGrok(systemPrompt, userPrompt);
    } else {
      campaign = await callChatGPT(systemPrompt, userPrompt);
    }

    console.log("Campaign generated successfully");

    return new Response(
      JSON.stringify({ success: true, campaign }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating campaign:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
