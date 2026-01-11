import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Sparkles, Zap } from 'lucide-react';

interface AIModelSelectorProps {
  value: 'grok' | 'chatgpt';
  onChange: (value: 'grok' | 'chatgpt') => void;
}

export function AIModelSelector({ value, onChange }: AIModelSelectorProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onChange(v as 'grok' | 'chatgpt')}
      className="grid grid-cols-2 gap-3"
    >
      <Label
        htmlFor="grok"
        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
          value === 'grok'
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/50'
        }`}
      >
        <RadioGroupItem value="grok" id="grok" className="sr-only" />
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-medium">Grok</p>
          <p className="text-xs text-muted-foreground">xAI</p>
        </div>
      </Label>

      <Label
        htmlFor="chatgpt"
        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
          value === 'chatgpt'
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/50'
        }`}
      >
        <RadioGroupItem value="chatgpt" id="chatgpt" className="sr-only" />
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-medium">ChatGPT</p>
          <p className="text-xs text-muted-foreground">OpenAI</p>
        </div>
      </Label>
    </RadioGroup>
  );
}
