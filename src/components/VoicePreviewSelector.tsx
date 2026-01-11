import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Volume2, Play, Pause, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const voiceOptions = [
  { 
    value: "shimmer", 
    label: "Shimmer", 
    description: "Weiblich, klar & modern",
    gender: "female",
    sampleText: "Guten Tag, mein Name ist Shimmer. Ich freue mich, Sie kennenzulernen."
  },
  { 
    value: "coral", 
    label: "Coral", 
    description: "Weiblich, warm & einladend",
    gender: "female",
    sampleText: "Hallo, hier ist Coral. Wie kann ich Ihnen heute helfen?"
  },
  { 
    value: "sage", 
    label: "Sage", 
    description: "Neutral, ruhig & besonnen",
    gender: "neutral",
    sampleText: "Willkommen, ich bin Sage. Lassen Sie uns gemeinsam eine Lösung finden."
  },
  { 
    value: "alloy", 
    label: "Alloy", 
    description: "Neutral & vielseitig",
    gender: "neutral",
    sampleText: "Guten Tag, Alloy am Apparat. Was kann ich für Sie tun?"
  },
  { 
    value: "ash", 
    label: "Ash", 
    description: "Männlich, ruhig & vertrauenswürdig",
    gender: "male",
    sampleText: "Hallo, mein Name ist Ash. Ich bin hier, um Ihnen zu helfen."
  },
  { 
    value: "echo", 
    label: "Echo", 
    description: "Männlich & professionell",
    gender: "male",
    sampleText: "Guten Tag, Echo hier. Wie darf ich Ihnen behilflich sein?"
  },
  { 
    value: "ballad", 
    label: "Ballad", 
    description: "Dramatisch & ausdrucksstark",
    gender: "neutral",
    sampleText: "Willkommen! Ich bin Ballad und freue mich auf unser Gespräch."
  },
  { 
    value: "verse", 
    label: "Verse", 
    description: "Ausdrucksvoll & dynamisch",
    gender: "neutral",
    sampleText: "Hallo! Verse hier. Lassen Sie uns großartige Dinge besprechen!"
  },
];

interface VoicePreviewSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function VoicePreviewSelector({ value, onChange }: VoicePreviewSelectorProps) {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPreview = async (voiceId: string) => {
    // If same voice is playing, stop it
    if (playingVoice === voiceId) {
      audioRef.current?.pause();
      setPlayingVoice(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setIsLoading(voiceId);

    // Use browser's speech synthesis as fallback since we don't have OpenAI TTS
    // In production, this would call an edge function with OpenAI TTS
    try {
      const voice = voiceOptions.find(v => v.value === voiceId);
      if (!voice) return;

      // Use Web Speech API for demo (German voice)
      const utterance = new SpeechSynthesisUtterance(voice.sampleText);
      utterance.lang = 'de-DE';
      
      // Try to find a German voice
      const voices = speechSynthesis.getVoices();
      const germanVoice = voices.find(v => v.lang.startsWith('de'));
      if (germanVoice) {
        utterance.voice = germanVoice;
      }

      // Adjust voice characteristics based on type
      if (voice.gender === 'female') {
        utterance.pitch = 1.1;
      } else if (voice.gender === 'male') {
        utterance.pitch = 0.9;
      }

      utterance.onend = () => {
        setPlayingVoice(null);
      };

      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
      setPlayingVoice(voiceId);
    } catch (error) {
      console.error('Error playing voice preview:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const stopPlayback = () => {
    speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingVoice(null);
  };

  // Group voices by gender
  const groupedVoices = {
    female: voiceOptions.filter(v => v.gender === 'female'),
    male: voiceOptions.filter(v => v.gender === 'male'),
    neutral: voiceOptions.filter(v => v.gender === 'neutral'),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-muted-foreground" />
        <Label>KI Stimme auswählen</Label>
      </div>

      <div className="space-y-4">
        {/* Female voices */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Weiblich</p>
          <div className="grid grid-cols-2 gap-2">
            {groupedVoices.female.map((voice) => (
              <VoiceCard
                key={voice.value}
                voice={voice}
                isSelected={value === voice.value}
                isPlaying={playingVoice === voice.value}
                isLoading={isLoading === voice.value}
                onSelect={() => onChange(voice.value)}
                onPlay={() => handlePlayPreview(voice.value)}
                onStop={stopPlayback}
              />
            ))}
          </div>
        </div>

        {/* Male voices */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Männlich</p>
          <div className="grid grid-cols-2 gap-2">
            {groupedVoices.male.map((voice) => (
              <VoiceCard
                key={voice.value}
                voice={voice}
                isSelected={value === voice.value}
                isPlaying={playingVoice === voice.value}
                isLoading={isLoading === voice.value}
                onSelect={() => onChange(voice.value)}
                onPlay={() => handlePlayPreview(voice.value)}
                onStop={stopPlayback}
              />
            ))}
          </div>
        </div>

        {/* Neutral voices */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Neutral</p>
          <div className="grid grid-cols-2 gap-2">
            {groupedVoices.neutral.map((voice) => (
              <VoiceCard
                key={voice.value}
                voice={voice}
                isSelected={value === voice.value}
                isPlaying={playingVoice === voice.value}
                isLoading={isLoading === voice.value}
                onSelect={() => onChange(voice.value)}
                onPlay={() => handlePlayPreview(voice.value)}
                onStop={stopPlayback}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface VoiceCardProps {
  voice: typeof voiceOptions[0];
  isSelected: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  onSelect: () => void;
  onPlay: () => void;
  onStop: () => void;
}

function VoiceCard({ voice, isSelected, isPlaying, isLoading, onSelect, onPlay, onStop }: VoiceCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-200",
        "hover:border-primary/50 hover:bg-accent/5",
        isSelected 
          ? "border-primary bg-primary/5 shadow-sm" 
          : "border-border/50 bg-background"
      )}
    >
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-full shrink-0",
            isPlaying ? "bg-primary text-primary-foreground" : "bg-accent/20"
          )}
          onClick={(e) => {
            e.stopPropagation();
            isPlaying ? onStop() : onPlay();
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-3 h-3" />
          ) : (
            <Play className="w-3 h-3 ml-0.5" />
          )}
        </Button>
        
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">{voice.label}</p>
          <p className="text-xs text-muted-foreground truncate">{voice.description}</p>
        </div>
      </div>
    </div>
  );
}

export { voiceOptions };
