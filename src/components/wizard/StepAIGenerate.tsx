import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { AIModelSelector } from '@/components/AIModelSelector';
import { VoicePreviewSelector } from '@/components/VoicePreviewSelector';
import { Sparkles, Euro, MessageCircle, TrendingUp, Loader2, Check, ArrowLeft } from 'lucide-react';
import { useGenerateCampaign, GeneratedCampaign } from '@/hooks/useGenerateCampaign';
import { motion, AnimatePresence } from 'framer-motion';

interface StepAIGenerateProps {
  onApply: (campaign: GeneratedCampaign) => void;
  onBack: () => void;
}

export const StepAIGenerate = ({ onApply, onBack }: StepAIGenerateProps) => {
  const { generate, isGenerating, generatedCampaign, reset } = useGenerateCampaign();

  const [aiModel, setAiModel] = useState<'grok' | 'chatgpt'>('grok');
  const [aiProductName, setAiProductName] = useState('');
  const [aiTargetAudience, setAiTargetAudience] = useState('');
  const [aiPriceRange, setAiPriceRange] = useState([50]);
  const [aiTonality, setAiTonality] = useState([50]);
  const [aiSalesStyle, setAiSalesStyle] = useState([50]);
  const [aiVoice, setAiVoice] = useState('viktoria');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getTonalityLabel = (value: number) => {
    if (value < 25) return 'Sehr formell';
    if (value < 50) return 'Formell';
    if (value < 75) return 'Locker';
    return 'Sehr locker';
  };

  const getSalesStyleLabel = (value: number) => {
    if (value < 25) return 'Beratend';
    if (value < 50) return 'Ausgewogen';
    if (value < 75) return 'Überzeugend';
    return 'Sehr direkt';
  };

  const getPriceLabel = (value: number) => {
    if (value < 20) return 'Unter 100€';
    if (value < 40) return '100-500€';
    if (value < 60) return '500-2.000€';
    if (value < 80) return '2.000-10.000€';
    return 'Über 10.000€';
  };

  const handleGenerate = async () => {
    const newErrors: Record<string, string> = {};
    if (!aiProductName.trim()) newErrors.aiProductName = 'Erforderlich';
    if (!aiTargetAudience.trim()) newErrors.aiTargetAudience = 'Erforderlich';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    await generate({
      model: aiModel,
      productName: aiProductName,
      targetAudience: aiTargetAudience,
      priceRange: aiPriceRange[0],
      tonality: aiTonality[0],
      salesStyle: aiSalesStyle[0],
      aiVoice,
    });
  };

  const handleApply = () => {
    if (generatedCampaign) {
      onApply(generatedCampaign);
      reset();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">KI-Generierung</h2>
          <p className="text-sm text-muted-foreground">Die KI erstellt alle Details automatisch</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-accent mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">Automatische Kampagnen-Erstellung</p>
            <p className="text-muted-foreground">
              Gib nur 4-5 Basis-Infos ein – die KI erstellt alles automatisch.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>KI-Modell</Label>
        <AIModelSelector value={aiModel} onChange={setAiModel} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="aiProductName">Produkt/Firma *</Label>
          <Input
            id="aiProductName"
            value={aiProductName}
            onChange={(e) => setAiProductName(e.target.value)}
            placeholder="z.B. Cloud CRM Software"
          />
          {errors.aiProductName && <p className="text-sm text-destructive">{errors.aiProductName}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="aiTargetAudience">Zielgruppe *</Label>
          <Input
            id="aiTargetAudience"
            value={aiTargetAudience}
            onChange={(e) => setAiTargetAudience(e.target.value)}
            placeholder="z.B. Geschäftsführer KMUs"
          />
          {errors.aiTargetAudience && <p className="text-sm text-destructive">{errors.aiTargetAudience}</p>}
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Euro className="w-4 h-4 text-muted-foreground" />
              Preissegment
            </Label>
            <span className="text-sm font-medium text-primary">{getPriceLabel(aiPriceRange[0])}</span>
          </div>
          <Slider value={aiPriceRange} onValueChange={setAiPriceRange} max={100} step={1} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
              Tonalität
            </Label>
            <span className="text-sm font-medium text-primary">{getTonalityLabel(aiTonality[0])}</span>
          </div>
          <Slider value={aiTonality} onValueChange={setAiTonality} max={100} step={1} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Formell</span>
            <span>Locker</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              Verkaufsstil
            </Label>
            <span className="text-sm font-medium text-primary">{getSalesStyleLabel(aiSalesStyle[0])}</span>
          </div>
          <Slider value={aiSalesStyle} onValueChange={setAiSalesStyle} max={100} step={1} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Beratend</span>
            <span>Überzeugend</span>
          </div>
        </div>
      </div>

      <VoicePreviewSelector value={aiVoice} onChange={setAiVoice} />

      <Button onClick={handleGenerate} disabled={isGenerating} className="w-full gap-2" size="lg">
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generiere mit {aiModel === 'grok' ? 'Grok' : 'ChatGPT'}...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Kampagne generieren
          </>
        )}
      </Button>

      <AnimatePresence>
        {generatedCampaign && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4 p-4 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <h4 className="font-medium">Generierte Kampagne</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="font-medium">{generatedCampaign.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">AI-Name:</span>
                <p>{generatedCampaign.aiSettings.aiName}</p>
              </div>
            </div>
            <Button onClick={handleApply} className="w-full gap-2" variant="secondary">
              <Check className="w-4 h-4" />
              Übernehmen & fortfahren
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
