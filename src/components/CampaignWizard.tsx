import { useEffect, useState } from 'react';
import { useCampaign, useCreateCampaign, useUpdateCampaign } from '@/hooks/useCampaigns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Megaphone, LayoutGrid, FileText, Volume2, Check } from 'lucide-react';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { WizardProgress } from './wizard/WizardProgress';
import { StepMethodSelect, WizardMethod } from './wizard/StepMethodSelect';
import { TemplateGrid } from './wizard/TemplateGrid';
import { StepBasicInfo, BasicInfoData } from './wizard/StepBasicInfo';
import { StepVoiceSettings, VoiceSettingsData } from './wizard/StepVoiceSettings';
import { StepReview } from './wizard/StepReview';
import { StepAIGenerate } from './wizard/StepAIGenerate';
import type { CampaignTemplate } from '@/lib/campaignTemplates';
import type { GeneratedCampaign } from '@/hooks/useGenerateCampaign';

const campaignSchema = z.object({
  name: z.string().trim().min(1, 'Name ist erforderlich').max(200),
});

interface CampaignWizardProps {
  open: boolean;
  onClose: () => void;
  campaignId: string | null;
}

const steps = [
  { label: 'Start', icon: <LayoutGrid className="w-5 h-5" /> },
  { label: 'Details', icon: <FileText className="w-5 h-5" /> },
  { label: 'Stimme', icon: <Volume2 className="w-5 h-5" /> },
  { label: 'Fertig', icon: <Check className="w-5 h-5" /> },
];

const CampaignWizard = ({ open, onClose, campaignId }: CampaignWizardProps) => {
  const { data: campaign, isLoading } = useCampaign(campaignId);
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();

  const [currentStep, setCurrentStep] = useState(0);
  const [method, setMethod] = useState<WizardMethod | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAIGenerate, setShowAIGenerate] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [basicInfo, setBasicInfo] = useState<BasicInfoData>({
    name: '',
    productDescription: '',
    targetGroup: '',
    callGoal: '',
  });

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettingsData>({
    aiName: '',
    companyName: '',
    aiGreeting: '',
    aiPersonality: '',
    aiVoice: 'viktoria',
    aiPrompt: '',
    llmProvider: 'openai',
  });

  // Load existing campaign data
  useEffect(() => {
    if (campaign && campaignId) {
      setBasicInfo({
        name: campaign.name || '',
        productDescription: campaign.product_description || '',
        targetGroup: campaign.target_group || '',
        callGoal: campaign.call_goal || '',
      });

      let voiceData: VoiceSettingsData = {
        aiName: '',
        companyName: '',
        aiGreeting: '',
        aiPersonality: '',
        aiVoice: 'viktoria',
        aiPrompt: '',
        llmProvider: 'openai',
      };

      try {
        const settings = campaign.ai_prompt ? JSON.parse(campaign.ai_prompt) : null;
        if (settings && typeof settings === 'object' && settings.aiName) {
          voiceData = {
            aiName: settings.aiName || '',
            companyName: settings.companyName || '',
            aiGreeting: settings.aiGreeting || '',
            aiPersonality: settings.aiPersonality || '',
            aiVoice: settings.aiVoice || 'viktoria',
            aiPrompt: settings.customPrompt || '',
            llmProvider: settings.llmProvider || 'openai',
          };
        }
      } catch {
        // Not JSON, use as plain prompt
        voiceData.aiPrompt = campaign.ai_prompt || '';
      }

      setVoiceSettings(voiceData);
      // Skip method select for editing
      setCurrentStep(1);
      setMethod('manual');
    } else if (!campaignId) {
      resetForm();
    }
  }, [campaign, campaignId]);

  const resetForm = () => {
    setCurrentStep(0);
    setMethod(null);
    setShowTemplates(false);
    setShowAIGenerate(false);
    setErrors({});
    setBasicInfo({ name: '', productDescription: '', targetGroup: '', callGoal: '' });
    setVoiceSettings({
      aiName: '',
      companyName: '',
      aiGreeting: '',
      aiPersonality: '',
      aiVoice: 'viktoria',
      aiPrompt: '',
      llmProvider: 'openai',
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleMethodSelect = (selectedMethod: WizardMethod) => {
    setMethod(selectedMethod);
    if (selectedMethod === 'template') {
      setShowTemplates(true);
    } else if (selectedMethod === 'ai') {
      setShowAIGenerate(true);
    } else {
      setCurrentStep(1);
    }
  };

  const handleTemplateSelect = (template: CampaignTemplate) => {
    setBasicInfo({
      name: template.name,
      productDescription: template.productDescription,
      targetGroup: template.targetGroup,
      callGoal: template.callGoal,
    });
    setVoiceSettings({
      aiName: template.aiName,
      companyName: '[Ihr Firmenname]',
      aiGreeting: template.aiGreeting,
      aiPersonality: template.aiPersonality,
      aiVoice: template.recommendedVoice,
      aiPrompt: template.customPrompt,
      llmProvider: template.recommendedLLM,
    });
    setShowTemplates(false);
    setCurrentStep(1);
  };

  const handleAIGenerated = (generated: GeneratedCampaign) => {
    setBasicInfo({
      name: generated.name,
      productDescription: generated.productDescription,
      targetGroup: generated.targetGroup,
      callGoal: generated.callGoal,
    });
    setVoiceSettings({
      aiName: generated.aiSettings.aiName,
      companyName: generated.aiSettings.companyName,
      aiGreeting: generated.aiSettings.aiGreeting,
      aiPersonality: generated.aiSettings.aiPersonality,
      aiVoice: generated.aiSettings.aiVoice || 'viktoria',
      aiPrompt: generated.aiSettings.customPrompt,
      llmProvider: 'openai',
    });
    setShowAIGenerate(false);
    setCurrentStep(1);
  };

  const validateBasicInfo = (): boolean => {
    try {
      campaignSchema.parse({ name: basicInfo.name });
      setErrors({});
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        e.errors.forEach((err) => {
          if (err.path[0]) newErrors[err.path[0] as string] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const buildAiPromptPayload = () => {
    if (
      voiceSettings.aiName ||
      voiceSettings.aiGreeting ||
      voiceSettings.aiPersonality ||
      voiceSettings.companyName ||
      voiceSettings.aiVoice !== 'viktoria' ||
      voiceSettings.llmProvider !== 'openai'
    ) {
      return JSON.stringify({
        aiName: voiceSettings.aiName,
        aiGreeting: voiceSettings.aiGreeting,
        aiPersonality: voiceSettings.aiPersonality,
        companyName: voiceSettings.companyName,
        customPrompt: voiceSettings.aiPrompt,
        aiVoice: voiceSettings.aiVoice,
        llmProvider: voiceSettings.llmProvider,
      });
    }
    return voiceSettings.aiPrompt || undefined;
  };

  const handleSubmit = async () => {
    if (!validateBasicInfo()) {
      setCurrentStep(1);
      return;
    }

    const aiPromptPayload = buildAiPromptPayload();

    try {
      if (campaignId) {
        await updateCampaign.mutateAsync({
          campaignId,
          name: basicInfo.name,
          productDescription: basicInfo.productDescription || undefined,
          targetGroup: basicInfo.targetGroup || undefined,
          callGoal: basicInfo.callGoal || undefined,
          aiPrompt: aiPromptPayload,
        });
      } else {
        await createCampaign.mutateAsync({
          name: basicInfo.name,
          productDescription: basicInfo.productDescription || undefined,
          targetGroup: basicInfo.targetGroup || undefined,
          callGoal: basicInfo.callGoal || undefined,
          aiPrompt: aiPromptPayload,
        });
      }
      handleClose();
    } catch {
      // Error handled by mutation
    }
  };

  const isSubmitting = createCampaign.isPending || updateCampaign.isPending;

  const renderContent = () => {
    if (isLoading && campaignId) {
      return <div className="py-16 text-center text-muted-foreground">Laden...</div>;
    }

    // Show templates overlay
    if (showTemplates) {
      return (
        <TemplateGrid
          onSelect={handleTemplateSelect}
          onBack={() => setShowTemplates(false)}
        />
      );
    }

    // Show AI generate overlay
    if (showAIGenerate) {
      return (
        <StepAIGenerate
          onApply={handleAIGenerated}
          onBack={() => setShowAIGenerate(false)}
        />
      );
    }

    // Normal wizard steps
    switch (currentStep) {
      case 0:
        return <StepMethodSelect onSelect={handleMethodSelect} />;
      case 1:
        return (
          <StepBasicInfo
            data={basicInfo}
            onChange={setBasicInfo}
            onNext={() => {
              if (validateBasicInfo()) setCurrentStep(2);
            }}
            onBack={() => (campaignId ? handleClose() : setCurrentStep(0))}
            errors={errors}
          />
        );
      case 2:
        return (
          <StepVoiceSettings
            data={voiceSettings}
            onChange={setVoiceSettings}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <StepReview
            basicInfo={basicInfo}
            voiceSettings={voiceSettings}
            onBack={() => setCurrentStep(2)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isEditing={!!campaignId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] glass-panel border-white/40 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            {campaignId ? 'Kampagne bearbeiten' : 'Neue Kampagne'}
          </DialogTitle>
        </DialogHeader>

        {/* Progress bar - only show in normal steps, not overlays */}
        {!showTemplates && !showAIGenerate && currentStep > 0 && (
          <WizardProgress currentStep={currentStep} steps={steps} />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={showTemplates ? 'templates' : showAIGenerate ? 'ai' : currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignWizard;
