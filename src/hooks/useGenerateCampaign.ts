import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GenerateCampaignParams {
  model: 'grok' | 'chatgpt';
  productName: string;
  targetAudience: string;
  priceRange: number;
  tonality: number;
  salesStyle: number;
  aiVoice: string;
}

export interface GeneratedCampaign {
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
    llmProvider?: 'openai' | 'xai' | 'xai-mini';
  };
  advancedSettings?: {
    formality: 'du' | 'sie';
    responseLength: 'short' | 'medium' | 'long';
    temperature: number;
    emotionLevel: 'low' | 'medium' | 'high';
  };
  objectionHandling?: {
    objections: { id: string; trigger: string; response: string }[];
    closingStrategy: 'soft' | 'medium' | 'assertive';
    fallbackResponse: string;
  };
}

export function useGenerateCampaign() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCampaign, setGeneratedCampaign] = useState<GeneratedCampaign | null>(null);

  const generate = async (params: GenerateCampaignParams): Promise<GeneratedCampaign | null> => {
    setIsGenerating(true);
    setGeneratedCampaign(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-campaign-ai', {
        body: params,
      });

      if (error) {
        console.error('Error generating campaign:', error);
        toast.error('Fehler bei der KI-Generierung', {
          description: error.message || 'Bitte versuche es erneut',
        });
        return null;
      }

      if (!data?.success || !data?.campaign) {
        toast.error('Fehler bei der KI-Generierung', {
          description: data?.error || 'Keine Kampagne generiert',
        });
        return null;
      }

      setGeneratedCampaign(data.campaign);
      toast.success('Kampagne erfolgreich generiert!');
      return data.campaign;
    } catch (err) {
      console.error('Error generating campaign:', err);
      toast.error('Fehler bei der KI-Generierung');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setGeneratedCampaign(null);
  };

  return {
    generate,
    reset,
    isGenerating,
    generatedCampaign,
  };
}
