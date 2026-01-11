const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductService {
  id: string;
  name: string;
  description: string;
  price?: string;
  targetGroup?: string;
}

interface ExtractedData {
  company_name?: string;
  industry?: string;
  short_description?: string;
  long_description?: string;
  usp?: string[];
  products_services?: ProductService[];
  phone?: string;
  email?: string;
  address?: string;
  brand_colors?: Record<string, string>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured. Please enable it in Settings.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping company profile from:', formattedUrl);

    // Step 1: Scrape the website with markdown and branding
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown', 'branding'],
        onlyMainContent: true,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok || !scrapeData.success) {
      console.error('Firecrawl scrape error:', scrapeData);
      return new Response(
        JSON.stringify({ success: false, error: scrapeData.error || 'Failed to scrape website' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const markdown = scrapeData.data?.markdown || '';
    const branding = scrapeData.data?.branding || {};
    const metadata = scrapeData.data?.metadata || {};

    console.log('Scraped content length:', markdown.length);
    console.log('Branding data:', JSON.stringify(branding).substring(0, 200));

    // Step 2: Use AI to extract structured data from the content
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const xaiApiKey = Deno.env.get('XAI_API_KEY');

    let extractedData: ExtractedData = {};

    if (openaiApiKey || xaiApiKey) {
      const systemPrompt = `Du bist ein Experte für die Analyse von Unternehmenswebsites. Extrahiere strukturierte Daten aus dem gegebenen Website-Inhalt.

Antworte NUR mit einem validen JSON-Objekt im folgenden Format:
{
  "company_name": "Name des Unternehmens",
  "industry": "Branche/Industrie",
  "short_description": "Ein-Satz-Beschreibung des Unternehmens",
  "long_description": "Ausführlichere Beschreibung (2-3 Sätze)",
  "usp": ["USP 1", "USP 2", "USP 3"],
  "products_services": [
    {
      "id": "uuid",
      "name": "Produktname",
      "description": "Kurze Beschreibung",
      "price": "Preis falls vorhanden",
      "targetGroup": "Zielgruppe falls erkennbar"
    }
  ],
  "phone": "Telefonnummer falls gefunden",
  "email": "E-Mail falls gefunden"
}

Fülle nur Felder aus, die du tatsächlich im Content findest. Lasse optionale Felder weg, wenn keine Informationen vorhanden sind.`;

      const userPrompt = `Analysiere diesen Website-Inhalt und extrahiere Unternehmensinformationen:\n\n${markdown.substring(0, 8000)}`;

      try {
        let aiResponse;
        
        if (xaiApiKey) {
          // Use Grok
          const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${xaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'grok-3-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              temperature: 0.3,
            }),
          });

          const data = await response.json();
          aiResponse = data.choices?.[0]?.message?.content;
        } else if (openaiApiKey) {
          // Use OpenAI
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              temperature: 0.3,
            }),
          });

          const data = await response.json();
          aiResponse = data.choices?.[0]?.message?.content;
        }

        if (aiResponse) {
          // Clean up the response
          let cleanedResponse = aiResponse.trim();
          if (cleanedResponse.startsWith('```json')) {
            cleanedResponse = cleanedResponse.slice(7);
          }
          if (cleanedResponse.startsWith('```')) {
            cleanedResponse = cleanedResponse.slice(3);
          }
          if (cleanedResponse.endsWith('```')) {
            cleanedResponse = cleanedResponse.slice(0, -3);
          }

          extractedData = JSON.parse(cleanedResponse.trim());
          console.log('AI extracted data:', JSON.stringify(extractedData).substring(0, 500));
        }
      } catch (aiError) {
        console.error('AI extraction error:', aiError);
        // Continue without AI extraction
      }
    }

    // Extract brand colors from branding data
    if (branding.colors) {
      extractedData.brand_colors = {
        primary: branding.colors.primary || '',
        secondary: branding.colors.secondary || '',
        accent: branding.colors.accent || '',
        background: branding.colors.background || '',
      };
    }

    // Use metadata as fallback for company name
    if (!extractedData.company_name && metadata.title) {
      extractedData.company_name = metadata.title.split('|')[0].split('-')[0].trim();
    }

    // Add UUIDs to products if missing
    if (extractedData.products_services) {
      extractedData.products_services = extractedData.products_services.map(p => ({
        ...p,
        id: p.id || crypto.randomUUID(),
      }));
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: extractedData,
        raw: {
          markdown: markdown.substring(0, 2000),
          branding,
          metadata,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in firecrawl-company-profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
