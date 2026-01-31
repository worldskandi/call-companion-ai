import { Button } from '@/components/ui/button';
import { Users, Megaphone, BarChart3, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickActionsProps {
  onAction: (message: string) => void;
  disabled?: boolean;
}

const quickActions = [
  {
    label: 'Leads analysieren',
    message: 'Analysiere meine aktuellen Leads und gib mir einen Überblick',
    icon: Users,
  },
  {
    label: 'Kampagne erstellen',
    message: 'Hilf mir eine neue Kampagne zu erstellen',
    icon: Megaphone,
  },
  {
    label: 'Report generieren',
    message: 'Erstelle einen Performance-Report für diese Woche',
    icon: BarChart3,
  },
];

export function QuickActions({ onAction, disabled }: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-wrap gap-2 justify-center"
    >
      {quickActions.map((action, index) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + index * 0.1 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction(action.message)}
            disabled={disabled}
            className="gap-2 text-xs border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all"
          >
            <action.icon className="w-3.5 h-3.5" />
            {action.label}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}
