import { useState } from 'react';
import { useCampaigns, useDeleteCampaign, useUpdateCampaign } from '@/hooks/useCampaigns';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
  Megaphone,
  MoreHorizontal,
  Sparkles,
  Target,
  FileText,
  Users
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

const Campaigns = () => {
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
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Kampagnen</h1>
            <p className="text-muted-foreground">
              Erstelle und verwalte deine Anruf-Kampagnen
            </p>
          </div>
        </div>
        <Button 
          className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Kampagne erstellen
        </Button>
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
          {campaigns.map((campaign, index) => (
            <motion.div 
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card border border-border/50 rounded-xl p-6 group hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  campaign.is_active ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  <Megaphone className={`w-6 h-6 ${
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
                    <FileText className="w-4 h-4" />
                    <span className="truncate">{campaign.call_goal}</span>
                  </div>
                )}
                {campaign.ai_prompt && (
                  <div className="flex items-center gap-2 text-sm text-accent">
                    <Sparkles className="w-4 h-4" />
                    <span>AI-Prompt konfiguriert</span>
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
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/50 rounded-xl p-16 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Megaphone className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Keine Kampagnen vorhanden</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Erstelle deine erste Kampagne, um deine Leads zu organisieren und KI-gestützte Anrufe zu starten.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Erste Kampagne erstellen
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

export default Campaigns;
