import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useElevenLabsAgents, ElevenLabsAgent } from '@/hooks/useElevenLabsAgents';
import { 
  Bot, ArrowLeft, ArrowRight, Loader2, Save, Sparkles, Volume2,
  MessageCircle, Brain, Check, Wand2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentBuilderWizardProps {
  open: boolean;
  onClose: () => void;
  editingAgent?: ElevenLabsAgent | null;
}

const ELEVENLABS_VOICES = [
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Tief, professionell' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Weiblich, warm' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', description: 'Weiblich, stark' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Weiblich, sanft' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Männlich, eloquent' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', description: 'Weiblich, jung' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', description: 'Männlich, dynamisch' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', description: 'Männlich, kräftig' },
  { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill', description: 'Männlich, freundlich' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', description: 'Männlich, neutral' },
];

const TTS_MODELS = [
  { id: 'eleven_flash_v2', name: 'Flash v2', description: 'Schnell, niedrige Latenz' },
  { id: 'eleven_turbo_v2_5', name: 'Turbo v2.5', description: 'Beste Qualität' },
  { id: 'eleven_turbo_v2', name: 'Turbo v2', description: 'Gute Qualität' },
];

const LANGUAGES = [
  { id: 'de', name: 'Deutsch' },
  { id: 'en', name: 'Englisch' },
  { id: 'fr', name: 'Französisch' },
  { id: 'es', name: 'Spanisch' },
  { id: 'it', name: 'Italienisch' },
  { id: 'nl', name: 'Niederländisch' },
  { id: 'pt', name: 'Portugiesisch' },
  { id: 'pl', name: 'Polnisch' },
];

const WIZARD_STEPS = [
  { label: 'Basics', icon: <Bot className="w-5 h-5" /> },
  { label: 'Prompt', icon: <Brain className="w-5 h-5" /> },
  { label: 'Stimme', icon: <Volume2 className="w-5 h-5" /> },
  { label: 'Fertig', icon: <Check className="w-5 h-5" /> },
];

const AgentBuilderWizard = ({ open, onClose, editingAgent }: AgentBuilderWizardProps) => {
  const { toast } = useToast();
  const { createAgent, updateAgent, isSaving } = useElevenLabsAgents();
  const [step, setStep] = useState(0);

  // Form state
  const [name, setName] = useState(editingAgent?.name || '');
  const [firstMessage, setFirstMessage] = useState(editingAgent?.first_message || '');
  const [systemPrompt, setSystemPrompt] = useState(editingAgent?.system_prompt || '');
  const [language, setLanguage] = useState(editingAgent?.language || 'de');
  const [voiceId, setVoiceId] = useState(editingAgent?.voice_id || ELEVENLABS_VOICES[0].id);
  const [voiceName, setVoiceName] = useState(editingAgent?.voice_name || ELEVENLABS_VOICES[0].name);
  const [ttsModel, setTtsModel] = useState(editingAgent?.tts_model || 'eleven_flash_v2');
  const [temperature, setTemperature] = useState(editingAgent?.temperature ?? 0.7);

  const isEditing = !!editingAgent;

  const resetForm = () => {
    setStep(0);
    setName('');
    setFirstMessage('');
    setSystemPrompt('');
    setLanguage('de');
    setVoiceId(ELEVENLABS_VOICES[0].id);
    setVoiceName(ELEVENLABS_VOICES[0].name);
    setTtsModel('eleven_flash_v2');
    setTemperature(0.7);
  };

  const handleClose = () => {
    onClose();
    if (!isEditing) resetForm();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({ title: 'Fehler', description: 'Bitte gib einen Namen ein.', variant: 'destructive' });
      setStep(0);
      return;
    }

    try {
      const agentData = {
        name,
        first_message: firstMessage,
        system_prompt: systemPrompt,
        language,
        voice_id: voiceId,
        voice_name: voiceName,
        tts_model: ttsModel,
        temperature,
      };

      if (isEditing && editingAgent) {
        await updateAgent(editingAgent.id, agentData);
        toast({ title: 'Agent aktualisiert', description: `"${name}" wurde bei ElevenLabs aktualisiert.` });
      } else {
        await createAgent(agentData);
        toast({ title: 'Agent erstellt! 🎉', description: `"${name}" wurde erfolgreich bei ElevenLabs erstellt.` });
      }
      handleClose();
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message || 'Agent konnte nicht erstellt werden.',
        variant: 'destructive',
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Basics
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Agent-Name *</Label>
              <Input
                placeholder="z.B. Sales Assistant, Support Bot..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Der interne Name deines Agents
              </p>
            </div>

            <div className="space-y-2">
              <Label>Sprache</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Begrüßung</Label>
              <Textarea
                placeholder="Hallo! Ich bin dein KI-Assistent. Wie kann ich dir helfen?"
                value={firstMessage}
                onChange={(e) => setFirstMessage(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Die erste Nachricht, die der Agent sagt
              </p>
            </div>
          </div>
        );

      case 1: // Prompt
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>System-Prompt</Label>
              <Textarea
                placeholder={`Du bist ein freundlicher und professioneller Sales-Agent für [Firmenname]. 

Dein Ziel ist es, potenzielle Kunden über unser Produkt zu informieren und einen Termin zu vereinbaren.

Verhaltensregeln:
- Sei immer höflich und respektvoll
- Frage aktiv nach den Bedürfnissen des Kunden
- Stelle maximal 2-3 Fragen bevor du ein Angebot machst
- Bei Einwänden, zeige Verständnis und biete Alternativen`}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Definiere die Persönlichkeit, das Verhalten und die Anweisungen für deinen Agent
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Kreativität (Temperature)</Label>
                <span className="text-sm text-muted-foreground">
                  {temperature < 0.4 ? 'Sachlich' : temperature < 0.7 ? 'Ausgewogen' : 'Kreativ'}
                </span>
              </div>
              <Slider
                value={[temperature]}
                onValueChange={([v]) => setTemperature(v)}
                min={0.1}
                max={1.0}
                step={0.1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Sachlich & präzise</span>
                <span>Kreativ & variabel</span>
              </div>
            </div>
          </div>
        );

      case 2: // Voice
        return (
          <div className="space-y-5">
            <div className="space-y-3">
              <Label>Stimme auswählen</Label>
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                {ELEVENLABS_VOICES.map((voice) => (
                  <div
                    key={voice.id}
                    className={cn(
                      "p-3 rounded-lg border-2 cursor-pointer transition-all",
                      voiceId === voice.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => {
                      setVoiceId(voice.id);
                      setVoiceName(voice.name);
                    }}
                  >
                    <p className="font-medium text-sm">{voice.name}</p>
                    <p className="text-xs text-muted-foreground">{voice.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>TTS-Modell</Label>
              <div className="grid grid-cols-3 gap-2">
                {TTS_MODELS.map((model) => (
                  <div
                    key={model.id}
                    className={cn(
                      "p-3 rounded-lg border-2 cursor-pointer transition-all text-center",
                      ttsModel === model.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setTtsModel(model.id)}
                  >
                    <p className="font-medium text-sm">{model.name}</p>
                    <p className="text-xs text-muted-foreground">{model.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3: // Review
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                {name || 'Unbenannter Agent'}
              </h3>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Sprache:</span>
                  <p className="font-medium">{LANGUAGES.find(l => l.id === language)?.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Stimme:</span>
                  <p className="font-medium">{voiceName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">TTS-Modell:</span>
                  <p className="font-medium">{TTS_MODELS.find(m => m.id === ttsModel)?.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Kreativität:</span>
                  <p className="font-medium">{Math.round(temperature * 100)}%</p>
                </div>
              </div>

              {firstMessage && (
                <div>
                  <span className="text-sm text-muted-foreground">Begrüßung:</span>
                  <p className="text-sm italic mt-1">"{firstMessage}"</p>
                </div>
              )}

              {systemPrompt && (
                <div>
                  <span className="text-sm text-muted-foreground">System-Prompt:</span>
                  <p className="text-sm mt-1 line-clamp-4 text-muted-foreground">{systemPrompt}</p>
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium">Was passiert beim Erstellen?</span>
              </div>
              <p className="text-muted-foreground">
                Der Agent wird über die ElevenLabs API erstellt und ist sofort für Anrufe verfügbar. 
                Du kannst ihn jederzeit bearbeiten oder löschen.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            {isEditing ? 'Agent bearbeiten' : 'Neuen Agent erstellen'}
          </DialogTitle>
        </DialogHeader>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-2">
          {WIZARD_STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <button
                onClick={() => setStep(i)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors w-full justify-center",
                  i === step
                    ? "bg-primary text-primary-foreground"
                    : i < step
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {s.icon}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between pt-2">
          <Button
            variant="ghost"
            onClick={() => step > 0 ? setStep(step - 1) : handleClose()}
            className="gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? 'Abbrechen' : 'Zurück'}
          </Button>

          {step < WIZARD_STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} className="gap-1">
              Weiter
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEditing ? 'Aktualisieren' : 'Agent erstellen'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentBuilderWizard;
