import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Volume2, Play, Pause, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const voiceOptions = [
  { 
    value: "shimmer", 
    label: "Shimmer", 
    description: "Weiblich, klar & modern",
    gender: "female",
  },
  { 
    value: "coral", 
    label: "Coral", 
    description: "Weiblich, warm & einladend",
    gender: "female",
  },
  { 
    value: "sage", 
    label: "Sage", 
    description: "Neutral, ruhig & besonnen",
    gender: "neutral",
  },
  { 
    value: "alloy", 
    label: "Alloy", 
    description: "Neutral & vielseitig",
    gender: "neutral",
  },
  { 
    value: "ash", 
    label: "Ash", 
    description: "Männlich, ruhig & vertrauenswürdig",
    gender: "male",
  },
  { 
    value: "echo", 
    label: "Echo", 
    description: "Männlich & professionell",
    gender: "male",
  },
  { 
    value: "ballad", 
    label: "Ballad", 
    description: "Dramatisch & ausdrucksstark",
    gender: "neutral",
  },
  { 
    value: "verse", 
    label: "Verse", 
    description: "Ausdrucksvoll & dynamisch",
    gender: "neutral",
  },
];

interface VoicePreviewSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function VoicePreviewSelector({ value, onChange }: VoicePreviewSelectorProps) {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [loadingVoice, setLoadingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCache = useRef<Map<string, string>>(new Map());

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlayingVoice(null);
  }, []);

  const handlePlayPreview = useCallback(async (voiceId: string) => {
    // If same voice is playing, stop it
    if (playingVoice === voiceId) {
      stopPlayback();
      return;
    }

    // Stop any currently playing audio
    stopPlayback();

    // Check cache first
    const cachedUrl = audioCache.current.get(voiceId);
    if (cachedUrl) {
      playAudio(cachedUrl, voiceId);
      return;
    }

    setLoadingVoice(voiceId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-tts-preview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ voice: voiceId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Cache the audio URL
      audioCache.current.set(voiceId, audioUrl);
      
      playAudio(audioUrl, voiceId);
    } catch (error) {
      console.error('Error playing voice preview:', error);
      toast.error('Stimmenvorschau fehlgeschlagen', {
        description: error instanceof Error ? error.message : 'Bitte versuche es erneut',
      });
    } finally {
      setLoadingVoice(null);
    }
  }, [playingVoice, stopPlayback]);

  const playAudio = (url: string, voiceId: string) => {
    const audio = new Audio(url);
    audioRef.current = audio;
    
    audio.onended = () => {
      setPlayingVoice(null);
    };
    
    audio.onerror = () => {
      setPlayingVoice(null);
      toast.error('Audio konnte nicht abgespielt werden');
    };
    
    audio.play().then(() => {
      setPlayingVoice(voiceId);
    }).catch((err) => {
      console.error('Audio play error:', err);
      toast.error('Audio konnte nicht abgespielt werden');
    });
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
                isLoading={loadingVoice === voice.value}
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
                isLoading={loadingVoice === voice.value}
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
                isLoading={loadingVoice === voice.value}
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
