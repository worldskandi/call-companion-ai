import { useState } from 'react';
import { useCampaigns, useDeleteCampaign, useUpdateCampaign } from '@/hooks/useCampaigns';
import ElevenLabsAgent from '@/components/ElevenLabsAgent';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus,
  Edit2,
  Trash2,
  Phone,
  MoreHorizontal,
  Sparkles,
  Target,
  FileText,
  Users,
  Mic,
  Clock,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  TrendingUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CampaignWizard from '@/components/CampaignWizard';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion } from 'framer-motion';

const VoiceCampaigns = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null);

  const { data: campaigns, isLoading } = useCampaigns();
  const deleteCampaign = useDeleteCampaign();
  const updateCampaign = useUpdateCampaign();

  const handleEdit = (campaignId: string) => {
    setEditingCampaignId(campaignId);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteCampaignId) {
      await deleteCampaign.mutateAsync(deleteCampaignId);
      setDeleteCampaignId(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCampaignId(null);
  };

  const handleToggleActive = async (campaignId: string, isActive: boolean) => {
    await updateCampaign.mutateAsync({
      campaignId,
      isActive,
    });
  };

  // Parse AI config from campaign
  const getAIConfig = (aiPrompt: string | null) => {
    if (!aiPrompt) return null;
    try {
      return JSON.parse(aiPrompt);
    } catch {
      return null;
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Voice-Kampagnen</h1>
            <p className="text-muted-foreground">
              KI-gestützte Anruf-Kampagnen für Sales & Support
            </p>
          </div>
        </div>
        <Button 
          className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Neue Voice-Kampagne
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktive Kampagnen</p>
                <p className="text-2xl font-bold">
                  {campaigns?.filter(c => c.is_active).length || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <PhoneCall className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt Leads</p>
                <p className="text-2xl font-bold">
                  {campaigns?.reduce((sum, c) => sum + (c.lead_count || 0), 0) || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mit KI-Prompt</p>
                <p className="text-2xl font-bold">
                  {campaigns?.filter(c => c.ai_prompt).length || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entwürfe</p>
                <p className="text-2xl font-bold">
                  {campaigns?.filter(c => !c.is_active).length || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ElevenLabs Sales Agent */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">KI Sales Agent</h2>
                  <Badge variant="outline" className="text-xs">ElevenLabs Voice</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Starte ein Live-Gespräch mit dem KI Sales Agent – er führt Verkaufsgespräche per Sprache in Echtzeit.
                </p>
              </div>
              <ElevenLabsAgent />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Campaigns Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border/50 rounded-xl p-6 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-muted mb-4" />
              <div className="w-3/4 h-6 bg-muted rounded mb-2" />
              <div className="w-full h-4 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : campaigns && campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign, index) => {
            const aiConfig = getAIConfig(campaign.ai_prompt);
            
            return (
              <motion.div 
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group hover:shadow-lg transition-all h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        campaign.is_active ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <Phone className={`w-6 h-6 ${
                          campaign.is_active ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={campaign.is_active}
                          onCheckedChange={(checked) => handleToggleActive(campaign.id, checked)}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(campaign.id)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Bearbeiten
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteCampaignId(campaign.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={campaign.is_active ? 'default' : 'secondary'}>
                        {campaign.is_active ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                      {aiConfig?.voiceSettings?.voice && (
                        <Badge variant="outline" className="gap-1">
                          <Mic className="w-3 h-3" />
                          {aiConfig.voiceSettings.voice}
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold mb-2">{campaign.name}</h3>
                    
                    {campaign.product_description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {campaign.product_description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      {campaign.target_group && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Target className="w-4 h-4" />
                          <span className="truncate">{campaign.target_group}</span>
                        </div>
                      )}
                      {campaign.call_goal && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <TrendingUp className="w-4 h-4" />
                          <span className="truncate">{campaign.call_goal}</span>
                        </div>
                      )}
                      {aiConfig?.llmProvider && (
                        <div className="flex items-center gap-2 text-sm text-accent">
                          <Sparkles className="w-4 h-4" />
                          <span>
                            {aiConfig.llmProvider === 'openai' ? 'GPT-4o' : 
                             aiConfig.llmProvider === 'xai' ? 'Grok-3' : 'Grok-3 Mini'}
                          </span>
                        </div>
                      )}
                      {aiConfig?.objectionHandling?.objections?.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>{aiConfig.objectionHandling.objections.length} Einwände konfiguriert</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{campaign.lead_count || 0} Leads</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true, locale: de })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/50 rounded-xl p-16 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Phone className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Keine Voice-Kampagnen</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Erstelle deine erste Voice-Kampagne mit KI-gestütztem Agenten für automatisierte Sales- und Support-Anrufe.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Erste Voice-Kampagne erstellen
          </Button>
        </motion.div>
      )}

      {/* Campaign Wizard */}
      <CampaignWizard
        open={isModalOpen}
        onClose={handleCloseModal}
        campaignId={editingCampaignId}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteCampaignId} onOpenChange={() => setDeleteCampaignId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kampagne löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Kampagne wird permanent gelöscht. Leads bleiben erhalten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VoiceCampaigns;
