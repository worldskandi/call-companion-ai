import { useEffect, useState } from 'react';
import { useCampaign, useCreateCampaign, useUpdateCampaign } from '@/hooks/useCampaigns';
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
import { Megaphone, Target, FileText, Sparkles, Wand2, User, MessageSquare, Building2, Smile } from 'lucide-react';
import { z } from 'zod';

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

  const [name, setName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [targetGroup, setTargetGroup] = useState('');
  const [callGoal, setCallGoal] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiName, setAiName] = useState('');
  const [aiGreeting, setAiGreeting] = useState('');
  const [aiPersonality, setAiPersonality] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (campaign && campaignId) {
      setName(campaign.name || '');
      setProductDescription(campaign.product_description || '');
      setTargetGroup(campaign.target_group || '');
      setCallGoal(campaign.call_goal || '');
      setAiPrompt(campaign.ai_prompt || '');
      // Parse extended AI settings from ai_prompt JSON if available
      try {
        const settings = campaign.ai_prompt ? JSON.parse(campaign.ai_prompt) : null;
        if (settings && typeof settings === 'object' && settings.aiName) {
          setAiName(settings.aiName || '');
          setAiGreeting(settings.aiGreeting || '');
          setAiPersonality(settings.aiPersonality || '');
          setCompanyName(settings.companyName || '');
          setAiPrompt(settings.customPrompt || '');
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
    setActiveTab('details');
    setErrors({});
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
    // If any AI settings are used, store as structured JSON
    if (aiName || aiGreeting || aiPersonality || companyName) {
      return JSON.stringify({
        aiName,
        aiGreeting,
        aiPersonality,
        companyName,
        customPrompt: aiPrompt,
      });
    }
    // Otherwise just use plain prompt
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

  const isSubmitting = createCampaign.isPending || updateCampaign.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] glass-panel border-white/40 max-h-[90vh] overflow-y-auto">
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
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="details" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="ai" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI-Prompt
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
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
                {/* AI Identity Section */}
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
