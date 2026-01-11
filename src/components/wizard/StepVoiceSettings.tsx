import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { VoicePreviewSelector } from '@/components/VoicePreviewSelector';
import { User, Building2, MessageSquare, Smile, ChevronDown, ArrowLeft, ArrowRight, Wand2 } from 'lucide-react';

export interface VoiceSettingsData {
  aiName: string;
  companyName: string;
  aiGreeting: string;
  aiPersonality: string;
  aiVoice: string;
  aiPrompt: string;
}

interface StepVoiceSettingsProps {
  data: VoiceSettingsData;
  onChange: (data: VoiceSettingsData) => void;
  onNext: () => void;
  onBack: () => void;
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

export const StepVoiceSettings = ({ data, onChange, onNext, onBack }: StepVoiceSettingsProps) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleChange = (field: keyof VoiceSettingsData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">KI-Stimme & Persönlichkeit</h2>
          <p className="text-sm text-muted-foreground">Wie soll sich die KI verhalten?</p>
        </div>
      </div>

      <VoicePreviewSelector value={data.aiVoice} onChange={(v) => handleChange('aiVoice', v)} />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="aiName">Name der KI</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="aiName"
              value={data.aiName}
              onChange={(e) => handleChange('aiName', e.target.value)}
              placeholder="z.B. Max, Anna"
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
              value={data.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
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
            value={data.aiGreeting}
            onChange={(e) => handleChange('aiGreeting', e.target.value)}
            placeholder="z.B. Guten Tag, mein Name ist Max von TechSolutions..."
            className="pl-10 min-h-[80px]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="aiPersonality">Persönlichkeit & Stil</Label>
        <div className="relative">
          <Smile className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Textarea
            id="aiPersonality"
            value={data.aiPersonality}
            onChange={(e) => handleChange('aiPersonality', e.target.value)}
            placeholder="z.B. Freundlich, professionell, geduldig..."
            className="pl-10 min-h-[80px]"
          />
        </div>
      </div>

      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between">
            Erweiterter AI-Prompt
            <ChevronDown className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-3">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleChange('aiPrompt', defaultPrompt)}
              className="gap-2"
            >
              <Wand2 className="w-4 h-4" />
              Vorlage nutzen
            </Button>
          </div>
          <Textarea
            value={data.aiPrompt}
            onChange={(e) => handleChange('aiPrompt', e.target.value)}
            placeholder="Optionale erweiterte Anweisungen..."
            className="min-h-[150px] font-mono text-sm"
          />
        </CollapsibleContent>
      </Collapsible>

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} className="gap-2">
          Weiter
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
