import { supabase } from '@/integrations/supabase/client';
import type { QualityLevel } from '@/lib/leadQuality';

export interface GeneratedLead {
  first_name: string;
  last_name: string | null;
  company: string | null;
  phone_number: string;
  email: string | null;
  website: string | null;
  quality_score: number;
  quality_level: QualityLevel;
}

export interface GenerateLeadsStats {
  found: number;
  imported: number;
  duplicates: number;
  failed: number;
  byQuality: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface GenerateLeadsResponse {
  success: boolean;
  error?: string;
  stats?: GenerateLeadsStats;
  leads?: GeneratedLead[];
}

export interface GenerateLeadsOptions {
  limit?: number;
  campaignId?: string;
  minQuality?: QualityLevel;
}

export const firecrawlApi = {
  async generateLeads(
    query: string, 
    options?: GenerateLeadsOptions
  ): Promise<GenerateLeadsResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-generate-leads', {
      body: { 
        query, 
        limit: options?.limit || 10,
        campaignId: options?.campaignId || null,
        minQuality: options?.minQuality || null,
      },
    });

    if (error) {
      console.error('Error generating leads:', error);
      return { success: false, error: error.message };
    }

    return data;
  },
};
