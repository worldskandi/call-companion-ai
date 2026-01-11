import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAISettings } from '@/hooks/useAISettings';
import { 
  Bot, 
  Loader2, 
  Save,
  Volume2,
  Sparkles,
  Building2,
  MessageCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const voices = [
  { id: 'nova', name: 'Nova', description: 'Freundlich, weiblich' },
  { id: 'alloy', name: 'Alloy', description: 'Neutral, vielseitig' },
  { id: 'echo', name: 'Echo', description: 'Männlich, warm' },
  { id: 'fable', name: 'Fable', description: 'Britisch, elegant' },
  { id: 'onyx', name: 'Onyx', description: 'Tief, autoritär' },
  { id: 'shimmer', name: 'Shimmer', description: 'Sanft, beruhigend' },
];

const languages = [
  { id: 'de', name: 'Deutsch' },
  { id: 'en', name: 'Englisch' },
  { id: 'fr', name: 'Französisch' },
  { id: 'es', name: 'Spanisch' },
  { id: 'it', name: 'Italienisch' },
];

export const AIAgentSettings = () => {
  const { toast } = useToast();
  const { settings, loading, updateSettings, isSaving } = useAISettings();
  
  const [aiName, setAiName] = useState('Alex');
  const [aiVoice, setAiVoice] = useState('nova');
  const [aiPersonality, setAiPersonality] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [defaultGreeting, setDefaultGreeting] = useState('');
  const [language, setLanguage] = useState('de');

  useEffect(() => {
    if (settings) {
      setAiName(settings.ai_name || 'Alex');
      setAiVoice(settings.ai_voice || 'nova');
      setAiPersonality(settings.ai_personality || '');
      setCompanyName(settings.company_name || '');
      setDefaultGreeting(settings.default_greeting || '');
      setLanguage(settings.language || 'de');
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings({
        ai_name: aiName,
        ai_voice: aiVoice,
        ai_personality: aiPersonality,
        company_name: companyName,
        default_greeting: defaultGreeting,
        language,
      });
      toast({
        title: "Einstellungen gespeichert",
        description: "Deine KI-Agent Einstellungen wurden aktualisiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 animate-fade-in">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          KI-Agent Konfiguration
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Personalisiere deinen KI-Assistenten für Verkaufsgespräche.
        </p>

        <div className="space-y-6">
          {/* Agent Name & Voice */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Agent-Name
              </label>
              <Input
                placeholder="z.B. Alex, Sarah, Max"
                value={aiName}
                onChange={(e) => setAiName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Der Name, mit dem sich der Agent vorstellt
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-primary" />
                Stimme
              </label>
              <Select value={aiVoice} onValueChange={setAiVoice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      <div className="flex flex-col">
                        <span>{voice.name}</span>
                        <span className="text-xs text-muted-foreground">{voice.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Company & Language */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Firmenname
              </label>
              <Input
                placeholder="Dein Unternehmen"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Sprache
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Default Greeting */}
          <div>
            <label className="text-sm font-medium mb-1 block flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              Standard-Begrüßung
            </label>
            <Textarea
              placeholder="Hallo! Hier ist [Agent-Name] von [Firma]. Haben Sie kurz Zeit für ein Gespräch?"
              value={defaultGreeting}
              onChange={(e) => setDefaultGreeting(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Variablen: [Agent-Name], [Firma], [Kundenname]
            </p>
          </div>

          {/* Personality */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Persönlichkeit & Verhalten
            </label>
            <Textarea
              placeholder="Beschreibe die Persönlichkeit des Agenten: freundlich, professionell, lösungsorientiert..."
              value={aiPersonality}
              onChange={(e) => setAiPersonality(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Definiere Tonfall, Verhalten bei Einwänden, etc.
            </p>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto gap-2">
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Einstellungen speichern
          </Button>
        </div>
      </div>

      {/* Preview Card */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <h3 className="font-medium mb-4">Vorschau</h3>
        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{aiName || 'Agent'}</p>
              <p className="text-xs text-muted-foreground">
                {companyName || 'Dein Unternehmen'} • {voices.find(v => v.id === aiVoice)?.name || 'Nova'}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground italic">
            "{defaultGreeting || `Hallo! Hier ist ${aiName || 'Alex'}${companyName ? ` von ${companyName}` : ''}. Haben Sie kurz Zeit für ein Gespräch?`}"
          </p>
        </div>
      </div>
    </div>
  );
};
