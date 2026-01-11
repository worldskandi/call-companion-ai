import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Megaphone, Target, FileText, ArrowLeft, ArrowRight } from 'lucide-react';

export interface BasicInfoData {
  name: string;
  productDescription: string;
  targetGroup: string;
  callGoal: string;
}

interface StepBasicInfoProps {
  data: BasicInfoData;
  onChange: (data: BasicInfoData) => void;
  onNext: () => void;
  onBack: () => void;
  errors?: Record<string, string>;
}

export const StepBasicInfo = ({ data, onChange, onNext, onBack, errors }: StepBasicInfoProps) => {
  const handleChange = (field: keyof BasicInfoData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Kampagnen-Details</h2>
          <p className="text-sm text-muted-foreground">Die Basis deiner Kampagne</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Kampagnenname *</Label>
          <div className="relative">
            <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="name"
              value={data.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="z.B. Neukunden Akquise Q1"
              className="pl-10"
            />
          </div>
          {errors?.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="productDescription">Produkt/Dienstleistung</Label>
          <Textarea
            id="productDescription"
            value={data.productDescription}
            onChange={(e) => handleChange('productDescription', e.target.value)}
            placeholder="Beschreibe kurz, was du anbietest..."
            className="min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="targetGroup">Zielgruppe</Label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="targetGroup"
                value={data.targetGroup}
                onChange={(e) => handleChange('targetGroup', e.target.value)}
                placeholder="z.B. IT-Entscheider"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="callGoal">Ziel des Anrufs</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="callGoal"
                value={data.callGoal}
                onChange={(e) => handleChange('callGoal', e.target.value)}
                placeholder="z.B. Terminvereinbarung"
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} className="gap-2">
          Weiter
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
