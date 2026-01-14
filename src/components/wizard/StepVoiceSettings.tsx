import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, ArrowRight, Volume2, Loader2, Zap, Brain, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VoiceSettingsData {
  // Basic
  aiName: string;
  companyName: string;
  aiGreeting: string;
  aiPersonality: string;
  aiPrompt: string;
  
  // Voice
  aiVoice: 'sebastian' | 'thomas' | 'alina' | 'viktoria';
  
  // LLM
  llmProvider: 'openai' | 'openai-mini' | 'gemini' | 'grok';
  
  // Advanced Settings
  formality: 'du' | 'sie';
  responseLength: 'short' | 'medium' | 'long';
  temperature: number;
  emotionLevel: 'low' | 'medium' | 'high';
}

interface StepVoiceSettingsProps {
  data: VoiceSettingsData;
  onChange: (data: VoiceSettingsData) => void;
  onNext: () => void;
  onBack: () => void;
}

const VOICES = [
  { id: 'viktoria', name: 'Viktoria', gender: 'Weiblich', description: 'Warm & professionell', cartesiaId: 'b9de4a89-2257-424b-94c2-db18ba68c81a' },
  { id: 'alina', name: 'Alina', gender: 'Weiblich', description: 'Jung & freundlich', cartesiaId: '38aabb6a-f52b-4fb0-a3d1-988518f4dc06' },
  { id: 'sebastian', name: 'Sebastian', gender: 'Männlich', description: 'Seriös & vertrauensvoll', cartesiaId: 'b7187e84-fe22-4344-ba4a-bc013fcb533e' },
  { id: 'thomas', name: 'Thomas', gender: 'Männlich', description: 'Locker & sympathisch', cartesiaId: '384b625b-da5d-49e8-a76d-a2855d4f31eb' },
] as const;

const LLM_PROVIDERS = [
  { 
    id: 'openai', 
    name: 'GPT-4o', 
    description: 'Beste Qualität',
    speed: 3,
    quality: 5,
    cost: 5,
  },
  { 
    id: 'openai-mini', 
    name: 'GPT-4o Mini', 
    description: 'Schneller & günstiger',
    speed: 4,
    quality: 4,
    cost: 2,
  },
  { 
    id: 'gemini', 
    name: 'Gemini Flash', 
    description: 'Sehr schnell & günstig',
    speed: 5,
    quality: 4,
    cost: 1,
  },
  { 
    id: 'grok', 
    name: 'Grok-3', 
    description: 'Natürlich & witzig',
    speed: 4,
    quality: 4,
    cost: 3,
  },
] as const;

export function StepVoiceSettings({ data, onChange, onNext, onBack }: StepVoiceSettingsProps) {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = <K extends keyof VoiceSettingsData>(key: K, value: VoiceSettingsData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const playVoicePreview = async (voiceId: string) => {
    const voice = VOICES.find(v => v.id === voiceId);
    if (!voice) return;

    setIsPlaying(voiceId);
    
    try {
      // Call Cartesia TTS Edge Function for preview
      const response = await fetch(
        `https://dwuelcsawiudvihxeddc.supabase.co/functions/v1/cartesia-tts-preview`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voice: voiceId }),
        }
      );

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsPlaying(null);
        await audio.play();
      } else {
        console.error('Voice preview failed:', response.status);
        setIsPlaying(null);
      }
    } catch (error) {
      console.error('Voice preview failed:', error);
      setIsPlaying(null);
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* AI Identity */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="aiName">Name der KI</Label>
          <Input
            id="aiName"
            placeholder="z.B. Lisa, Max, Sarah..."
            value={data.aiName}
            onChange={(e) => handleChange('aiName', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyName">Firmenname</Label>
          <Input
            id="companyName"
            placeholder="z.B. TechCorp GmbH"
            value={data.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
          />
        </div>
      </div>

      {/* Formality Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
        <div className="space-y-1">
          <Label>Anrede</Label>
          <p className="text-sm text-muted-foreground">
            Wie soll die KI den Kunden ansprechen?
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("text-sm font-medium", data.formality === 'du' && "text-primary")}>Du</span>
          <Switch
            checked={data.formality === 'sie'}
            onCheckedChange={(checked) => handleChange('formality', checked ? 'sie' : 'du')}
          />
          <span className={cn("text-sm font-medium", data.formality === 'sie' && "text-primary")}>Sie</span>
        </div>
      </div>

      {/* Voice Selection */}
      <div className="space-y-3">
        <Label>Stimme auswählen</Label>
        <div className="grid grid-cols-2 gap-3">
          {VOICES.map((voice) => (
            <div
              key={voice.id}
              className={cn(
                "relative p-4 rounded-lg border-2 cursor-pointer transition-all",
                data.aiVoice === voice.id
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50"
              )}
              onClick={() => handleChange('aiVoice', voice.id as VoiceSettingsData['aiVoice'])}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{voice.name}</p>
                  <p className="text-xs text-muted-foreground">{voice.gender}</p>
                  <p className="text-xs text-muted-foreground mt-1">{voice.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    playVoicePreview(voice.id);
                  }}
                  disabled={isPlaying !== null}
                >
                  {isPlaying === voice.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {data.aiVoice === voice.id && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* LLM Selection */}
      <div className="space-y-3">
        <Label>KI-Modell</Label>
        <div className="grid grid-cols-2 gap-3">
          {LLM_PROVIDERS.map((llm) => (
            <div
              key={llm.id}
              className={cn(
                "relative p-4 rounded-lg border-2 cursor-pointer transition-all",
                data.llmProvider === llm.id
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50"
              )}
              onClick={() => handleChange('llmProvider', llm.id as VoiceSettingsData['llmProvider'])}
            >
              <p className="font-medium">{llm.name}</p>
              <p className="text-xs text-muted-foreground">{llm.description}</p>
              <div className="flex gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-yellow-500" />
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full mx-0.5",
                          i < llm.speed ? "bg-yellow-500" : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Brain className="h-3 w-3 text-blue-500" />
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full mx-0.5",
                          i < llm.quality ? "bg-blue-500" : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-green-500" />
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full mx-0.5",
                          i < llm.cost ? "bg-green-500" : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Greeting */}
      <div className="space-y-2">
        <Label htmlFor="aiGreeting">Begrüßung</Label>
        <Textarea
          id="aiGreeting"
          placeholder={data.formality === 'sie' 
            ? "Guten Tag, mein Name ist [Name] von [Firma]. Haben Sie kurz Zeit?"
            : "Hey! Hier ist [Name] von [Firma]. Hast du kurz Zeit?"
          }
          value={data.aiGreeting}
          onChange={(e) => handleChange('aiGreeting', e.target.value)}
          rows={2}
        />
      </div>

      {/* Personality */}
      <div className="space-y-2">
        <Label htmlFor="aiPersonality">Persönlichkeit & Verhalten</Label>
        <Textarea
          id="aiPersonality"
          placeholder="Beschreibe wie die KI sich verhalten soll..."
          value={data.aiPersonality}
          onChange={(e) => handleChange('aiPersonality', e.target.value)}
          rows={3}
        />
      </div>

      {/* Advanced Settings Toggle */}
      <Button
        variant="ghost"
        className="w-full"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? 'Erweiterte Einstellungen ausblenden' : 'Erweiterte Einstellungen'}
      </Button>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="space-y-6 p-4 rounded-lg bg-muted/30 border">
          {/* Response Length */}
          <div className="space-y-3">
            <Label>Antwortlänge</Label>
            <div className="flex gap-2">
              {(['short', 'medium', 'long'] as const).map((length) => (
                <Button
                  key={length}
                  variant={data.responseLength === length ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleChange('responseLength', length)}
                >
                  {length === 'short' && '1-2 Sätze'}
                  {length === 'medium' && '2-3 Sätze'}
                  {length === 'long' && '3-5 Sätze'}
                </Button>
              ))}
            </div>
          </div>

          {/* Temperature */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Kreativität</Label>
              <span className="text-sm text-muted-foreground">
                {data.temperature < 0.4 ? 'Sachlich' : data.temperature < 0.7 ? 'Ausgewogen' : 'Kreativ'}
              </span>
            </div>
            <Slider
              value={[data.temperature]}
              onValueChange={([value]) => handleChange('temperature', value)}
              min={0.1}
              max={1.0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Sachlich & präzise</span>
              <span>Kreativ & variabel</span>
            </div>
          </div>

          {/* Emotion Level */}
          <div className="space-y-3">
            <Label>Emotionalität</Label>
            <p className="text-xs text-muted-foreground">
              Wie viel Emotionen (Lachen, Seufzen, etc.) soll die KI zeigen?
            </p>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <Button
                  key={level}
                  variant={data.emotionLevel === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleChange('emotionLevel', level)}
                >
                  {level === 'low' && 'Wenig'}
                  {level === 'medium' && 'Normal'}
                  {level === 'high' && 'Viel'}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <Label htmlFor="aiPrompt">Zusätzliche Anweisungen</Label>
            <Textarea
              id="aiPrompt"
              placeholder="Spezielle Anweisungen für die KI..."
              value={data.aiPrompt}
              onChange={(e) => handleChange('aiPrompt', e.target.value)}
              rows={4}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Zurück
        </Button>
        <Button onClick={onNext}>
          Weiter <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// Keep named export for backward compatibility
export { StepVoiceSettings as default };
