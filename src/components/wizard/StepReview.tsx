import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Megaphone, User, Volume2, Loader2 } from 'lucide-react';
import { voiceOptions } from '@/components/VoicePreviewSelector';
import type { BasicInfoData } from './StepBasicInfo';
import type { VoiceSettingsData } from './StepVoiceSettings';

interface StepReviewProps {
  basicInfo: BasicInfoData;
  voiceSettings: VoiceSettingsData;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isEditing: boolean;
}

export const StepReview = ({
  basicInfo,
  voiceSettings,
  onBack,
  onSubmit,
  isSubmitting,
  isEditing,
}: StepReviewProps) => {
  const selectedVoice = voiceOptions.find((v) => v.value === voiceSettings.aiVoice);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Zusammenfassung</h2>
          <p className="text-sm text-muted-foreground">Überprüfe deine Kampagne</p>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-primary" />
              Kampagnen-Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{basicInfo.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Zielgruppe</span>
              <span className="font-medium">{basicInfo.targetGroup || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ziel</span>
              <span className="font-medium">{basicInfo.callGoal || '-'}</span>
            </div>
            {basicInfo.productDescription && (
              <div className="pt-2 border-t">
                <span className="text-muted-foreground text-xs">Produkt/Service</span>
                <p className="mt-1 text-xs">{basicInfo.productDescription}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              KI-Persönlichkeit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">KI-Name</span>
              <span className="font-medium">{voiceSettings.aiName || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Firma</span>
              <span className="font-medium">{voiceSettings.companyName || '-'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Stimme</span>
              <Badge variant="outline" className="gap-1">
                <Volume2 className="w-3 h-3" />
                {selectedVoice?.label || voiceSettings.aiVoice}
              </Badge>
            </div>
            {voiceSettings.aiGreeting && (
              <div className="pt-2 border-t">
                <span className="text-muted-foreground text-xs">Begrüßung</span>
                <p className="mt-1 text-xs">{voiceSettings.aiGreeting}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onSubmit} disabled={isSubmitting} size="lg" className="gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Speichern...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              {isEditing ? 'Kampagne speichern' : 'Kampagne erstellen'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
