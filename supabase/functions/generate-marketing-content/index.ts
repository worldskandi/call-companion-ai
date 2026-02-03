import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateContentRequest {
  generationId: string;
  contentType: 'social_post' | 'ad_copy' | 'blog_intro' | 'email' | 'image_prompt';
  platform?: string;
  prompt: string;
  tone?: 'professional' | 'casual' | 'funny' | 'inspirational';
  includeHashtags?: boolean;
  variations?: number;
}

const PLATFORM_SPECS: Record<string, { maxLength: number; style: string }> = {
  instagram: { maxLength: 2200, style: 'visual, emoji-rich, hashtag-focused' },
  linkedin: { maxLength: 3000, style: 'professional, thought-leadership, industry-focused' },
  twitter: { maxLength: 280, style: 'concise, punchy, hashtag-friendly' },
  facebook: { maxLength: 63206, style: 'conversational, community-focused' },
  blog: { maxLength: 10000, style: 'informative, SEO-optimized, detailed' },
};

const TONE_DESCRIPTIONS: Record<string, string> = {
  professional: 'formal, business-appropriate, credible',
  casual: 'friendly, approachable, conversational',
  funny: 'humorous, witty, entertaining',
  inspirational: 'motivating, uplifting, empowering',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    const body: GenerateContentRequest = await req.json();
    const { generationId, contentType, platform, prompt, tone, includeHashtags, variations } = body;

    // Update status to generating
    await supabase
      .from('content_generations')
      .update({ status: 'generating' })
      .eq('id', generationId);

    // Fetch company profile for brand context
    const { data: companyProfile } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Build the prompt
    const platformSpec = platform ? PLATFORM_SPECS[platform] : null;
    const toneDesc = tone ? TONE_DESCRIPTIONS[tone] : TONE_DESCRIPTIONS.professional;

    let systemPrompt = `Du bist ein erfahrener Marketing-Texter und Content-Creator. 
Erstelle hochwertigen Marketing-Content auf Deutsch.

Wichtige Regeln:
- Schreibe authentisch und nicht wie ein KI-generierter Text
- Verwende keine übertriebenen Superlative
- Halte dich an die Markenrichtlinien
- Sei kreativ aber professionell`;

    if (companyProfile) {
      systemPrompt += `

MARKEN-KONTEXT:
- Unternehmen: ${companyProfile.company_name}
- Branche: ${companyProfile.industry || 'Nicht angegeben'}
- Kurzbeschreibung: ${companyProfile.short_description || 'Nicht angegeben'}
- USPs: ${companyProfile.usp?.join(', ') || 'Nicht angegeben'}`;

      if (companyProfile.brand_colors) {
        systemPrompt += `
- Markenfarben: ${JSON.stringify(companyProfile.brand_colors)}`;
      }
    }

    if (platformSpec) {
      systemPrompt += `

PLATFORM-SPEZIFIKATIONEN (${platform}):
- Maximale Länge: ${platformSpec.maxLength} Zeichen
- Stil: ${platformSpec.style}`;
    }

    systemPrompt += `

TON: ${toneDesc}`;

    if (includeHashtags) {
      systemPrompt += `
- Füge relevante Hashtags hinzu (3-5 für Social Media)`;
    }

    let userPrompt = `Erstelle ${variations || 1} ${contentType === 'social_post' ? 'Social Media Post(s)' : contentType === 'ad_copy' ? 'Werbetexte' : contentType === 'blog_intro' ? 'Blog-Einleitungen' : contentType === 'email' ? 'E-Mail-Texte' : 'Bild-Beschreibungen'} zum Thema:

${prompt}`;

    if ((variations || 1) > 1) {
      userPrompt += `

Gib ${variations} verschiedene Varianten zurück, nummeriert mit 1., 2., etc.
Jede Variante sollte einen anderen Ansatz oder Blickwinkel haben.`;
    }

    // Call AI API (using Grok/OpenAI)
    const aiApiKey = Deno.env.get('GROK_API_KEY') || Deno.env.get('OPENAI_API_KEY');
    const aiApiUrl = Deno.env.get('GROK_API_KEY') 
      ? 'https://api.x.ai/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';
    const aiModel = Deno.env.get('GROK_API_KEY') ? 'grok-2-latest' : 'gpt-4o-mini';

    if (!aiApiKey) {
      throw new Error('No AI API key configured');
    }

    const aiResponse = await fetch(aiApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error('AI generation failed');
    }

    const aiResult = await aiResponse.json();
    const generatedContent = aiResult.choices?.[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('No content generated');
    }

    // Update the content generation record
    const { error: updateError } = await supabase
      .from('content_generations')
      .update({
        generated_content: generatedContent,
        status: 'completed',
        brand_context: companyProfile ? {
          company_name: companyProfile.company_name,
          industry: companyProfile.industry,
          brand_colors: companyProfile.brand_colors,
        } : null,
        metadata: {
          tone,
          platform,
          include_hashtags: includeHashtags,
          variations,
          model_used: aiModel,
          generated_at: new Date().toISOString(),
        },
      })
      .eq('id', generationId);

    if (updateError) {
      console.error('Error updating generation:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: generatedContent,
        generationId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-marketing-content:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
