import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { checkRateLimit, getRateLimitHeaders, createRateLimitResponse } from "../_shared/rate-limit.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit: 10 lead generation requests per minute
const RATE_LIMIT_PER_MINUTE = 10;

interface LeadData {
  first_name: string;
  last_name: string | null;
  company: string | null;
  phone_number: string;
  email: string | null;
  website: string | null;
}

interface QualityResult {
  score: number;
  level: 'high' | 'medium' | 'low';
}

function calculateQuality(lead: LeadData): QualityResult {
  let score = 0;
  
  // Phone number (30 points)
  if (lead.phone_number && lead.phone_number.trim().length > 0) {
    score += 30;
  }
  
  // Email (25 points)
  if (lead.email && lead.email.trim().length > 0) {
    score += 25;
  }
  
  // Full name (25 points)
  if (lead.first_name && lead.first_name.trim().length > 0) {
    if (lead.last_name && lead.last_name.trim().length > 0) {
      score += 25;
    } else {
      score += 12.5;
    }
  }
  
  // Company (20 points)
  if (lead.company && lead.company.trim().length > 0) {
    score += 20;
  }
  
  const level = score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low';
  
  return { score: Math.round(score), level };
}

function extractPhoneNumber(text: string): string | null {
  // Match various phone number formats
  const phoneRegex = /(\+?\d{1,4}[\s.-]?)?\(?\d{2,5}\)?[\s.-]?\d{2,5}[\s.-]?\d{2,10}/g;
  const matches = text.match(phoneRegex);
  
  if (matches && matches.length > 0) {
    // Clean up the phone number
    let phone = matches[0].replace(/[\s.-]/g, '').replace(/\(|\)/g, '');
    
    // Ensure it has a country code for German numbers
    if (phone.startsWith('0') && !phone.startsWith('00')) {
      phone = '+49' + phone.substring(1);
    }
    
    return phone;
  }
  
  return null;
}

function extractEmail(text: string): string | null {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex);
  
  if (matches && matches.length > 0) {
    return matches[0].toLowerCase();
  }
  
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, limit = 10, campaignId, minQuality } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl ist nicht konfiguriert. Bitte verbinden Sie Firecrawl in den Einstellungen.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nicht autorisiert' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nicht autorisiert' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(user.id, {
      endpoint: "firecrawl-generate-leads",
      limitPerMinute: RATE_LIMIT_PER_MINUTE,
    });

    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult, corsHeaders);
    }

    console.log(`Generating leads for user ${user.id} with query: ${query}`);

    // Step 1: Search for companies using Firecrawl
    const searchQuery = `${query} Kontakt Telefon Email`;
    console.log('Searching with query:', searchQuery);

    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: Math.min(limit * 2, 50), // Get extra results to filter
        lang: 'de',
        country: 'DE',
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true,
        },
      }),
    });

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      console.error('Firecrawl search error:', errorData);
      return new Response(
        JSON.stringify({ success: false, error: 'Suche fehlgeschlagen: ' + (errorData.error || searchResponse.statusText) }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchData = await searchResponse.json();
    console.log(`Found ${searchData.data?.length || 0} search results`);

    const leads: LeadData[] = [];
    const stats = {
      found: 0,
      imported: 0,
      duplicates: 0,
      failed: 0,
      byQuality: { high: 0, medium: 0, low: 0 },
    };

    // Step 2: Process each search result
    for (const result of (searchData.data || [])) {
      if (leads.length >= limit) break;

      try {
        const content = result.markdown || result.description || '';
        const url = result.url || '';
        
        // Extract contact information
        const phone = extractPhoneNumber(content);
        const email = extractEmail(content);
        
        // Skip if no phone number (essential for cold calling)
        if (!phone) {
          console.log(`Skipping ${url}: No phone number found`);
          continue;
        }

        // Extract company name from title or URL
        let company = result.title || '';
        company = company.replace(/\s*[-|–]\s*.*$/, '').trim(); // Remove taglines
        company = company.replace(/Kontakt|Impressum|Über uns/gi, '').trim();

        // Try to extract a contact name (often in format "Name - Company" or within content)
        let firstName = '';
        let lastName = '';
        
        // Simple name extraction from common patterns
        const namePatterns = [
          /Geschäftsführer[in]?:?\s*([A-ZÄÖÜ][a-zäöüß]+)\s+([A-ZÄÖÜ][a-zäöüß]+)/i,
          /Ansprechpartner[in]?:?\s*([A-ZÄÖÜ][a-zäöüß]+)\s+([A-ZÄÖÜ][a-zäöüß]+)/i,
          /Inhaber[in]?:?\s*([A-ZÄÖÜ][a-zäöüß]+)\s+([A-ZÄÖÜ][a-zäöüß]+)/i,
        ];
        
        for (const pattern of namePatterns) {
          const match = content.match(pattern);
          if (match) {
            firstName = match[1];
            lastName = match[2];
            break;
          }
        }
        
        // If no name found, use company as first name
        if (!firstName && company) {
          firstName = company.split(/\s+/)[0] || 'Firma';
        }

        const lead: LeadData = {
          first_name: firstName || 'Kontakt',
          last_name: lastName || null,
          company: company || null,
          phone_number: phone,
          email: email,
          website: url,
        };

        // Calculate quality
        const quality = calculateQuality(lead);
        
        // Check minimum quality filter
        if (minQuality) {
          const qualityOrder: Record<string, number> = { low: 1, medium: 2, high: 3 };
          if (qualityOrder[quality.level] < qualityOrder[minQuality as string]) {
            console.log(`Skipping lead: Quality ${quality.level} below minimum ${minQuality}`);
            continue;
          }
        }

        leads.push(lead);
        stats.found++;
        stats.byQuality[quality.level]++;
        
        console.log(`Extracted lead: ${lead.first_name} ${lead.last_name || ''} - ${lead.company || 'N/A'} - ${lead.phone_number}`);
        
      } catch (error) {
        console.error('Error processing result:', error);
        stats.failed++;
      }
    }

    // Step 3: Check for duplicates and insert leads
    const existingPhones: Set<string> = new Set();
    
    // Get existing phone numbers for this user
    const { data: existingLeads } = await supabase
      .from('leads')
      .select('phone_number')
      .eq('user_id', user.id);
    
    if (existingLeads) {
      existingLeads.forEach(l => existingPhones.add(l.phone_number));
    }

    // Insert new leads
    for (const lead of leads) {
      // Check for duplicates
      if (existingPhones.has(lead.phone_number)) {
        stats.duplicates++;
        continue;
      }

      const quality = calculateQuality(lead);
      
      const { error: insertError } = await supabase
        .from('leads')
        .insert({
          user_id: user.id,
          first_name: lead.first_name,
          last_name: lead.last_name,
          company: lead.company,
          phone_number: lead.phone_number,
          email: lead.email,
          campaign_id: campaignId || null,
          status: 'new',
          notes: `Automatisch generiert via Firecrawl.\nQualität: ${quality.level} (${quality.score}%)\nWebsite: ${lead.website || 'N/A'}`,
        });

      if (insertError) {
        console.error('Error inserting lead:', insertError);
        stats.failed++;
      } else {
        stats.imported++;
        existingPhones.add(lead.phone_number);
      }
    }

    console.log('Generation complete:', stats);

    return new Response(
      JSON.stringify({
        success: true,
        stats,
        leads: leads.map(l => ({
          ...l,
          ...calculateQuality(l),
        })),
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          ...getRateLimitHeaders(rateLimitResult, RATE_LIMIT_PER_MINUTE),
        } 
      }
    );

  } catch (error: unknown) {
    console.error('Error in firecrawl-generate-leads:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
