import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Plus, Trash2, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Objection {
  id: string;
  trigger: string;
  response: string;
}

export interface ObjectionHandlingData {
  objections: Objection[];
  closingStrategy: 'soft' | 'medium' | 'assertive';
  fallbackResponse: string;
}

interface StepObjectionHandlingProps {
  data: ObjectionHandlingData;
  onChange: (data: ObjectionHandlingData) => void;
  onNext: () => void;
  onBack: () => void;
}

const COMMON_OBJECTIONS = [
  {
    trigger: 'Kein Interesse',
    response: 'Das verstehe ich total. Darf ich fragen, was der Hauptgrund ist? Vielleicht kann ich kurz erklären, warum andere Kunden anfangs auch skeptisch waren.',
  },
  {
    trigger: 'Keine Zeit',
    response: 'Kein Problem, ich halte mich kurz. Wann passt es besser? Ich kann auch gerne in 2 Minuten das Wichtigste zusammenfassen.',
  },
  {
    trigger: 'Zu teuer',
    response: 'Verstehe ich. Darf ich fragen, welches Budget Sie sich vorgestellt haben? Wir haben verschiedene Optionen, vielleicht ist ja was Passendes dabei.',
  },
  {
    trigger: 'Haben schon einen Anbieter',
    response: 'Das ist super, dass Sie da schon versorgt sind. Viele unserer Kunden hatten auch vorher einen anderen Anbieter. Darf ich fragen, was Ihnen dort besonders wichtig ist?',
  },
  {
    trigger: 'Muss mit Chef/Partner sprechen',
    response: 'Das macht total Sinn. Wann könnten wir zu dritt kurz telefonieren? Ich erkläre gerne nochmal alles, dann können Sie gemeinsam entscheiden.',
  },
  {
    trigger: 'Schicken Sie Unterlagen',
    response: 'Mache ich gerne! Damit die Infos auch relevant sind - was ist Ihnen am wichtigsten? Dann schicke ich genau das passende Material.',
  },
];

const CLOSING_STRATEGIES = [
  {
    id: 'soft',
    name: 'Soft',
    description: 'Kein Druck, nur Angebot',
    example: 'Ich schicke Ihnen gerne mehr Infos, wenn Sie möchten.',
  },
  {
    id: 'medium',
    name: 'Medium',
    description: 'Sanft zum nächsten Schritt führen',
    example: 'Sollen wir einen kurzen Termin machen, um das zu besprechen?',
  },
  {
    id: 'assertive',
    name: 'Assertiv',
    description: 'Klar zum Abschluss führen',
    example: 'Ich trage uns für Donnerstag 14 Uhr ein, passt das?',
  },
];

export function StepObjectionHandling({ data, onChange, onNext, onBack }: StepObjectionHandlingProps) {
  const [expandedObjection, setExpandedObjection] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleChange = <K extends keyof ObjectionHandlingData>(key: K, value: ObjectionHandlingData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const addObjection = (objection?: { trigger: string; response: string }) => {
    const newObjection: Objection = {
      id: crypto.randomUUID(),
      trigger: objection?.trigger || '',
      response: objection?.response || '',
    };
    handleChange('objections', [...data.objections, newObjection]);
    setExpandedObjection(newObjection.id);
  };

  const updateObjection = (id: string, field: 'trigger' | 'response', value: string) => {
    handleChange(
      'objections',
      data.objections.map((obj) => (obj.id === id ? { ...obj, [field]: value } : obj))
    );
  };

  const removeObjection = (id: string) => {
    handleChange(
      'objections',
      data.objections.filter((obj) => obj.id !== id)
    );
  };

  const unusedSuggestions = COMMON_OBJECTIONS.filter(
    (suggestion) => !data.objections.some((obj) => obj.trigger === suggestion.trigger)
  );

  return (
    <div className="space-y-6 py-4">
      {/* Objections List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Einwandbehandlung</Label>
          <span className="text-xs text-muted-foreground">
            {data.objections.length} Einwände konfiguriert
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          Definiere wie die KI auf typische Einwände reagieren soll.
        </p>

        {/* Objection Cards */}
        <div className="space-y-2">
          {data.objections.map((objection, index) => (
            <div
              key={objection.id}
              className="rounded-lg border bg-card overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                onClick={() =>
                  setExpandedObjection(expandedObjection === objection.id ? null : objection.id)
                }
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground w-6">
                    #{index + 1}
                  </span>
                  <span className="font-medium">
                    {objection.trigger || 'Neuer Einwand'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeObjection(objection.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  {expandedObjection === objection.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </div>

              {expandedObjection === objection.id && (
                <div className="p-3 pt-0 space-y-3 border-t">
                  <div className="space-y-2">
                    <Label className="text-xs">Wenn der Kunde sagt...</Label>
                    <Input
                      placeholder='z.B. "Kein Interesse", "Zu teuer"...'
                      value={objection.trigger}
                      onChange={(e) => updateObjection(objection.id, 'trigger', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Dann antworte so...</Label>
                    <Textarea
                      placeholder="Die Antwort der KI..."
                      value={objection.response}
                      onChange={(e) => updateObjection(objection.id, 'response', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => addObjection()}
        >
          <Plus className="h-4 w-4 mr-2" /> Einwand hinzufügen
        </Button>

        {/* Suggestions */}
        {unusedSuggestions.length > 0 && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setShowSuggestions(!showSuggestions)}
            >
              <Lightbulb className="h-3 w-3 mr-1" />
              {showSuggestions ? 'Vorschläge ausblenden' : `${unusedSuggestions.length} Vorschläge verfügbar`}
            </Button>

            {showSuggestions && (
              <div className="grid gap-2">
                {unusedSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border border-dashed cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                    onClick={() => addObjection(suggestion)}
                  >
                    <p className="font-medium text-sm">{suggestion.trigger}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {suggestion.response}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Closing Strategy */}
      <div className="space-y-3">
        <Label>Abschluss-Strategie</Label>
        <p className="text-sm text-muted-foreground">
          Wie hartnäckig soll die KI zum Ziel führen?
        </p>
        <div className="grid gap-3">
          {CLOSING_STRATEGIES.map((strategy) => (
            <div
              key={strategy.id}
              className={cn(
                "p-4 rounded-lg border-2 cursor-pointer transition-all",
                data.closingStrategy === strategy.id
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50"
              )}
              onClick={() => handleChange('closingStrategy', strategy.id as ObjectionHandlingData['closingStrategy'])}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{strategy.name}</p>
                  <p className="text-xs text-muted-foreground">{strategy.description}</p>
                </div>
                {data.closingStrategy === strategy.id && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              <p className="text-xs italic mt-2 text-muted-foreground">
                "{strategy.example}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Fallback Response */}
      <div className="space-y-2">
        <Label htmlFor="fallback">Fallback-Antwort</Label>
        <p className="text-xs text-muted-foreground">
          Was soll die KI sagen, wenn sie einen Einwand nicht kennt?
        </p>
        <Textarea
          id="fallback"
          placeholder="Das verstehe ich. Können Sie mir mehr dazu erzählen?"
          value={data.fallbackResponse}
          onChange={(e) => handleChange('fallbackResponse', e.target.value)}
          rows={2}
        />
      </div>

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
