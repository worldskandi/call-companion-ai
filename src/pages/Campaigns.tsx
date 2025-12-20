import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
  Phone, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Megaphone,
  PhoneCall,
  MoreHorizontal,
  Sparkles,
  Target,
  FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CampaignModal from '@/components/CampaignModal';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const Campaigns = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null);

  const { data: campaigns, isLoading } = useCampaigns();
  const deleteCampaign = useDeleteCampaign();
  const updateCampaign = useUpdateCampaign();

  if (authLoading) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="animate-pulse text-primary">Laden...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

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
    <div className="min-h-screen gradient-mesh">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-lg">AI Cold Caller</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" className="gap-2" onClick={() => navigate('/')}>
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="gap-2" onClick={() => navigate('/leads')}>
              <Users className="w-4 h-4" />
              Leads
            </Button>
            <Button variant="secondary" className="gap-2">
              <Megaphone className="w-4 h-4" />
              Kampagnen
            </Button>
            <Button variant="ghost" className="gap-2" onClick={() => navigate('/calls')}>
              <PhoneCall className="w-4 h-4" />
              Anrufe
            </Button>
            <Button variant="ghost" className="gap-2">
              <Settings className="w-4 h-4" />
              Einstellungen
            </Button>
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.email}
            </span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-2">Kampagnen</h1>
            <p className="text-muted-foreground">
              Erstelle und verwalte deine Anruf-Kampagnen
            </p>
          </div>
          <Button 
            className="gap-2 bg-primary hover:bg-primary/90 shadow-glow"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Kampagne erstellen
          </Button>
        </div>

        {/* Campaigns Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-muted mb-4" />
                <div className="w-3/4 h-6 bg-muted rounded mb-2" />
                <div className="w-full h-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign, index) => (
              <div 
                key={campaign.id}
                className="glass-card p-6 animate-fade-in group"
                style={{ animationDelay: `${index * 100}ms` }}
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
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-16 text-center animate-fade-in">
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
          </div>
        )}
      </main>

      {/* Campaign Modal */}
      <CampaignModal
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
