import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Nicht autorisiert' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Nicht autorisiert' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { url, category_id } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL ist erforderlich' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlKey) {
      return new Response(JSON.stringify({ error: 'Firecrawl nicht konfiguriert' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http')) formattedUrl = `https://${formattedUrl}`;

    console.log('Crawling URL for knowledge base:', formattedUrl);

    const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    const scrapeData = await scrapeRes.json();
    if (!scrapeRes.ok) {
      console.error('Firecrawl error:', scrapeData);
      return new Response(JSON.stringify({ error: scrapeData.error || 'Scraping fehlgeschlagen' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';
    const title = scrapeData.data?.metadata?.title || scrapeData.metadata?.title || formattedUrl;

    if (!markdown.trim()) {
      return new Response(JSON.stringify({ error: 'Keine Inhalte auf der Seite gefunden' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Truncate if very long (max ~50k chars)
    const content = markdown.length > 50000 ? markdown.substring(0, 50000) + '\n\n[... gekürzt]' : markdown;

    const { data: item, error: insertError } = await supabase
      .from('knowledge_items')
      .insert({
        user_id: user.id,
        title,
        content,
        source_type: 'url',
        source_url: formattedUrl,
        category_id: category_id || null,
        metadata: {
          scraped_at: new Date().toISOString(),
          original_length: markdown.length,
        },
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log('Knowledge item created:', item.id);

    return new Response(JSON.stringify({ success: true, item }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unbekannter Fehler' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
