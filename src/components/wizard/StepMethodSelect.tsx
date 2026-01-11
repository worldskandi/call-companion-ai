import { LayoutTemplate, PenLine, Sparkles } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export type WizardMethod = 'template' | 'manual' | 'ai';

interface StepMethodSelectProps {
  onSelect: (method: WizardMethod) => void;
}

const methods = [
  {
    id: 'template' as WizardMethod,
    icon: LayoutTemplate,
    title: 'Vorlage wählen',
    description: 'Starte mit einem Branchen-Template und passe es an',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-500',
  },
  {
    id: 'manual' as WizardMethod,
    icon: PenLine,
    title: 'Manuell erstellen',
    description: 'Fülle alle Felder selbst aus',
    gradient: 'from-primary/20 to-accent/20',
    iconColor: 'text-primary',
  },
  {
    id: 'ai' as WizardMethod,
    icon: Sparkles,
    title: 'KI generieren',
    description: 'Nur 4-5 Infos eingeben, KI macht den Rest',
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-500',
  },
];

export const StepMethodSelect = ({ onSelect }: StepMethodSelectProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Wie möchtest du starten?</h2>
        <p className="text-muted-foreground">Wähle eine Methode für deine neue Kampagne</p>
      </div>

      <div className="grid gap-4">
        {methods.map((method, index) => (
          <motion.div
            key={method.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="cursor-pointer hover:border-primary/50 transition-all group"
              onClick={() => onSelect(method.id)}
            >
              <CardHeader className="flex-row items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${method.gradient} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <method.icon className={`w-7 h-7 ${method.iconColor}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{method.title}</CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
