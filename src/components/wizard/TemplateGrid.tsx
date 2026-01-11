import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { campaignTemplates, type CampaignTemplate } from '@/lib/campaignTemplates';
import { motion } from 'framer-motion';

interface TemplateGridProps {
  onSelect: (template: CampaignTemplate) => void;
  onBack: () => void;
}

export const TemplateGrid = ({ onSelect, onBack }: TemplateGridProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Branchen-Vorlage wählen</h2>
          <p className="text-sm text-muted-foreground">Alle Einstellungen werden vorausgefüllt</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {campaignTemplates.map((template, index) => {
          const Icon = template.icon;
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group h-full"
                onClick={() => onSelect(template)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {template.recommendedVoice}
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-3">{template.name}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    Vorlage verwenden
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
