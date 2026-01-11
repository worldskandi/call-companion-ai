import { useEffect, useState } from 'react';
import { useCampaign, useCreateCampaign, useUpdateCampaign } from '@/hooks/useCampaigns';
import { useGenerateCampaign, GeneratedCampaign } from '@/hooks/useGenerateCampaign';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { AIModelSelector } from '@/components/AIModelSelector';
import { VoicePreviewSelector, voiceOptions } from '@/components/VoicePreviewSelector';
import { 
  Megaphone, Target, FileText, Sparkles, Wand2, User, 
  MessageSquare, Building2, Smile, Bot, Loader2, Check,
  Euro, MessageCircle, TrendingUp, PenLine, Settings2, Zap, Volume2
} from 'lucide-react';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const campaignSchema = z.object({
  name: z.string().trim().min(1, 'Name ist erforderlich').max(200),
  productDescription: z.string().trim().max(2000).optional(),
  targetGroup: z.string().trim().max(500).optional(),
  callGoal: z.string().trim().max(500).optional(),
  aiPrompt: z.string().trim().max(5000).optional(),
  aiName: z.string().trim().max(100).optional(),
  aiGreeting: z.string().trim().max(500).optional(),
  aiPersonality: z.string().trim().max(1000).optional(),
  companyName: z.string().trim().max(200).optional(),
});

interface CampaignModalProps {
  open: boolean;
  onClose: () => void;
  campaignId: string | null;
}

const defaultPrompt = `Du bist ein freundlicher Vertriebsmitarbeiter der Firma [FIRMENNAME].

DEINE AUFGABE:
- Stelle dich als virtueller Assistent im Auftrag der Firma vor
- Erkläre kurz das Produkt/die Dienstleistung
- Finde heraus, ob Interesse besteht
- Bei Interesse: Vereinbare einen Termin für ein ausführliches Gespräch
- Bei Ablehnung: Bedanke dich höflich und beende das Gespräch

WICHTIGE REGELN:
- Stelle immer nur EINE Frage auf einmal
- Höre aktiv zu und gehe auf Einwände ein
- Bleibe immer höflich und professionell
- Respektiere ein "Nein"
- Halte das Gespräch kurz (max. 2-3 Minuten)

GESPRÄCHSABLAUF:
1. Begrüßung und Vorstellung
2. Kurzer Pitch (max. 2 Sätze)
3. Qualifizierungsfragen
4. Terminvereinbarung oder höfliche Verabschiedung`;

const CampaignModal = ({ open, onClose, campaignId }: CampaignModalProps) => {
  const { data: campaign, isLoading } = useCampaign(campaignId);
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const { generate, isGenerating, generatedCampaign, reset: resetGenerated } = useGenerateCampaign();

  // Form state
  const [name, setName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [targetGroup, setTargetGroup] = useState('');
  const [callGoal, setCallGoal] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiName, setAiName] = useState('');
  const [aiGreeting, setAiGreeting] = useState('');
  const [aiPersonality, setAiPersonality] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [aiVoice, setAiVoice] = useState('shimmer');
  const [activeTab, setActiveTab] = useState('details');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // AI Generation state
  const [aiModel, setAiModel] = useState<'grok' | 'chatgpt'>('grok');
  const [aiProductName, setAiProductName] = useState('');
  const [aiTargetAudience, setAiTargetAudience] = useState('');
  const [aiPriceRange, setAiPriceRange] = useState([50]);
  const [aiTonality, setAiTonality] = useState([50]);
  const [aiSalesStyle, setAiSalesStyle] = useState([50]);

  useEffect(() => {
    if (campaign && campaignId) {
      setName(campaign.name || '');
      setProductDescription(campaign.product_description || '');
      setTargetGroup(campaign.target_group || '');
      setCallGoal(campaign.call_goal || '');
      setAiPrompt(campaign.ai_prompt || '');
      try {
        const settings = campaign.ai_prompt ? JSON.parse(campaign.ai_prompt) : null;
        if (settings && typeof settings === 'object' && settings.aiName) {
          setAiName(settings.aiName || '');
          setAiGreeting(settings.aiGreeting || '');
          setAiPersonality(settings.aiPersonality || '');
          setCompanyName(settings.companyName || '');
          setAiPrompt(settings.customPrompt || '');
          if (settings.aiVoice) setAiVoice(settings.aiVoice);
        }
      } catch {
        // Not JSON, use as plain prompt
      }
    } else if (!campaignId) {
      resetForm();
    }
  }, [campaign, campaignId]);

  const resetForm = () => {
    setName('');
    setProductDescription('');
    setTargetGroup('');
    setCallGoal('');
    setAiPrompt('');
    setAiName('');
    setAiGreeting('');
    setAiPersonality('');
    setCompanyName('');
    setAiVoice('shimmer');
    setActiveTab('details');
    setErrors({});
    // Reset AI generation state
    setAiProductName('');
    setAiTargetAudience('');
    setAiPriceRange([50]);
    setAiTonality([50]);
    setAiSalesStyle([50]);
    resetGenerated();
  };

  const validate = () => {
    try {
      campaignSchema.parse({
        name,
        productDescription: productDescription || undefined,
        targetGroup: targetGroup || undefined,
        callGoal: callGoal || undefined,
        aiPrompt: aiPrompt || undefined,
        aiName: aiName || undefined,
        aiGreeting: aiGreeting || undefined,
        aiPersonality: aiPersonality || undefined,
        companyName: companyName || undefined,
      });
      setErrors({});
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        e.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const buildAiPromptPayload = () => {
    if (aiName || aiGreeting || aiPersonality || companyName || aiVoice !== 'shimmer') {
      return JSON.stringify({
        aiName,
        aiGreeting,
        aiPersonality,
        companyName,
        customPrompt: aiPrompt,
        aiVoice,
      });
    }
    return aiPrompt || undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const aiPromptPayload = buildAiPromptPayload();

    try {
      if (campaignId) {
        await updateCampaign.mutateAsync({
          campaignId,
          name,
          productDescription: productDescription || undefined,
          targetGroup: targetGroup || undefined,
          callGoal: callGoal || undefined,
          aiPrompt: aiPromptPayload,
        });
      } else {
        await createCampaign.mutateAsync({
          name,
          productDescription: productDescription || undefined,
          targetGroup: targetGroup || undefined,
          callGoal: callGoal || undefined,
          aiPrompt: aiPromptPayload,
        });
      }
      onClose();
      resetForm();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleUseTemplate = () => {
    setAiPrompt(defaultPrompt);
  };

  const handleGenerateCampaign = async () => {
    if (!aiProductName.trim() || !aiTargetAudience.trim()) {
      setErrors({
        aiProductName: !aiProductName.trim() ? 'Produkt/Firma ist erforderlich' : '',
        aiTargetAudience: !aiTargetAudience.trim() ? 'Zielgruppe ist erforderlich' : '',
      });
      return;
    }

    await generate({
      model: aiModel,
      productName: aiProductName,
      targetAudience: aiTargetAudience,
      priceRange: aiPriceRange[0],
      tonality: aiTonality[0],
      salesStyle: aiSalesStyle[0],
      aiVoice: aiVoice,
    });
  };

  const handleApplyGenerated = (generated: GeneratedCampaign) => {
    setName(generated.name);
    setProductDescription(generated.productDescription);
    setTargetGroup(generated.targetGroup);
    setCallGoal(generated.callGoal);
    setAiName(generated.aiSettings.aiName);
    setAiGreeting(generated.aiSettings.aiGreeting);
    setAiPersonality(generated.aiSettings.aiPersonality);
    setCompanyName(generated.aiSettings.companyName);
    setAiPrompt(generated.aiSettings.customPrompt);
    if (generated.aiSettings.aiVoice) {
      setAiVoice(generated.aiSettings.aiVoice);
    }
    setActiveTab('details');
    resetGenerated();
  };

  const isSubmitting = createCampaign.isPending || updateCampaign.isPending;

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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px] glass-panel border-white/40 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            {campaignId ? 'Kampagne bearbeiten' : 'Neue Kampagne erstellen'}
          </DialogTitle>
        </DialogHeader>

        {isLoading && campaignId ? (
          <div className="py-8 text-center text-muted-foreground">Laden...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 h-auto p-1">
                <TabsTrigger value="details" className="flex-col gap-1 py-3 data-[state=active]:bg-primary/10">
                  <div className="flex items-center gap-2">
                    <PenLine className="w-4 h-4" />
                    <span className="font-medium">Manuell</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground hidden sm:block">Kampagne selbst erstellen</span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex-col gap-1 py-3 data-[state=active]:bg-primary/10">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4" />
                    <span className="font-medium">KI-Einstellungen</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground hidden sm:block">Stimme & Persönlichkeit</span>
                </TabsTrigger>
                <TabsTrigger value="generate" className="flex-col gap-1 py-3 data-[state=active]:bg-accent/10">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span className="font-medium">Auto-Generieren</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground hidden sm:block">KI erstellt alles</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50 mb-4">
                  <p className="text-sm text-muted-foreground">
                    <PenLine className="w-4 h-4 inline mr-2" />
                    Erstelle die Kampagnen-Details manuell. Für KI-Stimme und Persönlichkeit wechsle zu "KI-Einstellungen".
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Kampagnenname *</Label>
                  <div className="relative">
                    <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="z.B. Neukunden Akquise Q1"
                      className="pl-10"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productDescription">Produkt/Dienstleistung</Label>
                  <Textarea
                    id="productDescription"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Beschreibe kurz, was du anbietest..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetGroup">Zielgruppe</Label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="targetGroup"
                      value={targetGroup}
                      onChange={(e) => setTargetGroup(e.target.value)}
                      placeholder="z.B. IT-Entscheider in mittelständischen Unternehmen"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="callGoal">Ziel des Anrufs</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="callGoal"
                      value={callGoal}
                      onChange={(e) => setCallGoal(e.target.value)}
                      placeholder="z.B. Terminvereinbarung für Demo"
                      className="pl-10"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="space-y-4">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mb-4">
                  <p className="text-sm text-muted-foreground">
                    <Settings2 className="w-4 h-4 inline mr-2 text-primary" />
                    Konfiguriere hier die KI-Stimme und Persönlichkeit für die Anrufe. Die Kampagnen-Details werden im "Manuell"-Tab eingestellt.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aiName">Name der KI</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="aiName"
                        value={aiName}
                        onChange={(e) => setAiName(e.target.value)}
                        placeholder="z.B. Max, Anna, Alex"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Firmenname</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="z.B. TechSolutions GmbH"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiGreeting">Begrüßung</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea
                      id="aiGreeting"
                      value={aiGreeting}
                      onChange={(e) => setAiGreeting(e.target.value)}
                      placeholder="z.B. Guten Tag, mein Name ist Max von TechSolutions. Ich rufe an, weil..."
                      className="pl-10 min-h-[70px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiPersonality">Persönlichkeit & Stil</Label>
                  <div className="relative">
                    <Smile className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea
                      id="aiPersonality"
                      value={aiPersonality}
                      onChange={(e) => setAiPersonality(e.target.value)}
                      placeholder="z.B. Freundlich, professionell, geduldig. Spricht per Sie. Verwendet kurze, klare Sätze."
                      className="pl-10 min-h-[70px]"
                    />
                  </div>
                </div>

                <VoicePreviewSelector value={aiVoice} onChange={setAiVoice} />

                <div className="border-t border-border/50 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Label>Erweiterter AI-Prompt (optional)</Label>
                      <p className="text-sm text-muted-foreground">
                        Zusätzliche Anweisungen für komplexere Szenarien
                      </p>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleUseTemplate}
                      className="gap-2"
                    >
                      <Wand2 className="w-4 h-4" />
                      Vorlage nutzen
                    </Button>
                  </div>

                  <Textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Optionale erweiterte Anweisungen..."
                    className="min-h-[150px] font-mono text-sm"
                  />
                </div>

                <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-accent mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-accent mb-1">Tipps für gute Prompts:</p>
                      <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Definiere die Rolle der KI klar</li>
                        <li>Gib konkrete Gesprächsregeln vor</li>
                        <li>Beschreibe den gewünschten Gesprächsablauf</li>
                        <li>Lege fest, wie mit Einwänden umgegangen werden soll</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* AI Generation Tab */}
              <TabsContent value="generate" className="space-y-5">
                <div className="p-4 rounded-xl bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-accent mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">Automatische Kampagnen-Erstellung</p>
                      <p className="text-muted-foreground">
                        Gib nur 4-5 Basis-Infos ein – die KI erstellt <strong>alle</strong> Kampagnen-Details, Begrüßung und AI-Prompt automatisch.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Model Selection */}
                <div className="space-y-2">
                  <Label>KI-Modell wählen</Label>
                  <AIModelSelector value={aiModel} onChange={setAiModel} />
                </div>

                {/* Basic Inputs */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="aiProductName">Produkt/Firma *</Label>
                    <Input
                      id="aiProductName"
                      value={aiProductName}
                      onChange={(e) => setAiProductName(e.target.value)}
                      placeholder="z.B. Cloud-basierte CRM-Software, TechSolutions GmbH"
                    />
                    {errors.aiProductName && (
                      <p className="text-sm text-destructive">{errors.aiProductName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aiTargetAudience">Zielgruppe *</Label>
                    <Input
                      id="aiTargetAudience"
                      value={aiTargetAudience}
                      onChange={(e) => setAiTargetAudience(e.target.value)}
                      placeholder="z.B. Geschäftsführer von KMUs, IT-Leiter"
                    />
                    {errors.aiTargetAudience && (
                      <p className="text-sm text-destructive">{errors.aiTargetAudience}</p>
                    )}
                  </div>
                </div>

                {/* Sliders */}
                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Euro className="w-4 h-4 text-muted-foreground" />
                        Preissegment
                      </Label>
                      <span className="text-sm font-medium text-primary">
                        {getPriceLabel(aiPriceRange[0])}
                      </span>
                    </div>
                    <Slider
                      value={aiPriceRange}
                      onValueChange={setAiPriceRange}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                        Tonalität
                      </Label>
                      <span className="text-sm font-medium text-primary">
                        {getTonalityLabel(aiTonality[0])}
                      </span>
                    </div>
                    <Slider
                      value={aiTonality}
                      onValueChange={setAiTonality}
                      max={100}
                      step={1}
                      className="w-full"
                    />
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
                      <span className="text-sm font-medium text-primary">
                        {getSalesStyleLabel(aiSalesStyle[0])}
                      </span>
                    </div>
                    <Slider
                      value={aiSalesStyle}
                      onValueChange={setAiSalesStyle}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Beratend</span>
                      <span>Überzeugend</span>
                    </div>
                  </div>
                </div>

                {/* Voice Selection */}
                <VoicePreviewSelector value={aiVoice} onChange={setAiVoice} />
                <Button
                  type="button"
                  onClick={handleGenerateCampaign}
                  disabled={isGenerating}
                  className="w-full gap-2"
                  size="lg"
                >
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

                {/* Generated Preview */}
                <AnimatePresence>
                  {generatedCampaign && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4 p-4 rounded-xl bg-card border border-border"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          Generierte Kampagne
                        </h4>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span>
                          <p className="font-medium">{generatedCampaign.name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Ziel:</span>
                          <p>{generatedCampaign.callGoal}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">AI-Name:</span>
                          <p>{generatedCampaign.aiSettings.aiName}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Begrüßung:</span>
                          <p className="text-xs">{generatedCampaign.aiSettings.aiGreeting}</p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={() => handleApplyGenerated(generatedCampaign)}
                        className="w-full gap-2"
                        variant="secondary"
                      >
                        <Check className="w-4 h-4" />
                        Übernehmen & Anpassen
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-border/50">
              <Button type="button" variant="outline" onClick={handleClose}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? 'Speichern...' : campaignId ? 'Speichern' : 'Erstellen'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CampaignModal;
