import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus,
  Edit2,
  Trash2,
  Megaphone,
  MoreHorizontal,
  Mail,
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  Globe,
  Calendar,
  BarChart3,
  Eye,
  Send,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

// Marketing campaign types
type CampaignType = 'email' | 'social' | 'content' | 'ads';
type Platform = 'email' | 'instagram' | 'linkedin' | 'facebook' | 'twitter' | 'blog' | 'google_ads' | 'meta_ads';

interface MarketingCampaign {
  id: string;
  name: string;
  description: string;
  type: CampaignType;
  platforms: Platform[];
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  startDate?: string;
  endDate?: string;
  budget?: number;
  targetAudience?: string;
  goal?: string;
  metrics: {
    reach?: number;
    impressions?: number;
    clicks?: number;
    conversions?: number;
    openRate?: number;
    clickRate?: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Mock data - will be replaced with database
const mockCampaigns: MarketingCampaign[] = [
  {
    id: '1',
    name: 'Q1 Newsletter Serie',
    description: 'Monatliche Newsletter mit Produkt-Updates und Tipps',
    type: 'email',
    platforms: ['email'],
    status: 'active',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    targetAudience: 'Bestandskunden',
    goal: 'Kundenbindung & Upselling',
    metrics: { openRate: 42.5, clickRate: 8.3, conversions: 156 },
    createdAt: '2025-12-15T10:00:00Z',
    updatedAt: '2026-02-01T14:30:00Z',
  },
  {
    id: '2',
    name: 'Social Media Awareness',
    description: 'Brand Awareness Kampagne über alle Social-Media-Kanäle',
    type: 'social',
    platforms: ['instagram', 'linkedin', 'facebook'],
    status: 'active',
    startDate: '2026-01-15',
    targetAudience: 'KMU Entscheider',
    goal: 'Brand Awareness steigern',
    metrics: { reach: 125000, impressions: 450000, clicks: 3200 },
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-02-02T11:00:00Z',
  },
  {
    id: '3',
    name: 'Content Marketing Blog',
    description: 'SEO-optimierte Blogartikel zu Branchen-Themen',
    type: 'content',
    platforms: ['blog', 'linkedin'],
    status: 'draft',
    targetAudience: 'B2B Leads',
    goal: 'Organischen Traffic steigern',
    metrics: {},
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-02-01T08:00:00Z',
  },
];

const campaignTypeLabels: Record<CampaignType, string> = {
  email: 'E-Mail',
  social: 'Social Media',
  content: 'Content',
  ads: 'Paid Ads',
};

const platformIcons: Record<Platform, typeof Mail> = {
  email: Mail,
  instagram: Instagram,
  linkedin: Linkedin,
  facebook: Facebook,
  twitter: Twitter,
  blog: Globe,
  google_ads: BarChart3,
  meta_ads: Facebook,
};

const statusColors: Record<MarketingCampaign['status'], string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-blue-500/10 text-blue-500',
  active: 'bg-green-500/10 text-green-500',
  paused: 'bg-yellow-500/10 text-yellow-500',
  completed: 'bg-primary/10 text-primary',
};

const statusLabels: Record<MarketingCampaign['status'], string> = {
  draft: 'Entwurf',
  scheduled: 'Geplant',
  active: 'Aktiv',
  paused: 'Pausiert',
  completed: 'Abgeschlossen',
};

const MarketingCampaigns = () => {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(mockCampaigns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null);
  const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'email' as CampaignType,
    platforms: [] as Platform[],
    targetAudience: '',
    goal: '',
    startDate: '',
    endDate: '',
    budget: '',
  });

  const handleEdit = (campaign: MarketingCampaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      platforms: campaign.platforms,
      targetAudience: campaign.targetAudience || '',
      goal: campaign.goal || '',
      startDate: campaign.startDate || '',
      endDate: campaign.endDate || '',
      budget: campaign.budget?.toString() || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (deleteCampaignId) {
      setCampaigns(prev => prev.filter(c => c.id !== deleteCampaignId));
      setDeleteCampaignId(null);
    }
  };

  const handleSave = () => {
    if (editingCampaign) {
      setCampaigns(prev => prev.map(c => 
        c.id === editingCampaign.id 
          ? { ...c, ...formData, budget: formData.budget ? parseFloat(formData.budget) : undefined, updatedAt: new Date().toISOString() }
          : c
      ));
    } else {
      const newCampaign: MarketingCampaign = {
        id: Date.now().toString(),
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        status: 'draft',
        metrics: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCampaigns(prev => [newCampaign, ...prev]);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCampaign(null);
    setFormData({
      name: '',
      description: '',
      type: 'email',
      platforms: [],
      targetAudience: '',
      goal: '',
      startDate: '',
      endDate: '',
      budget: '',
    });
  };

  const togglePlatform = (platform: Platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const toggleCampaignStatus = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, status: c.status === 'active' ? 'paused' : 'active' }
        : c
    ));
  };

  const getPlatformsForType = (type: CampaignType): Platform[] => {
    switch (type) {
      case 'email': return ['email'];
      case 'social': return ['instagram', 'linkedin', 'facebook', 'twitter'];
      case 'content': return ['blog', 'linkedin'];
      case 'ads': return ['google_ads', 'meta_ads'];
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Marketing Kampagnen</h1>
            <p className="text-muted-foreground">
              E-Mail, Social Media & Content Marketing
            </p>
          </div>
        </div>
        <Button 
          className="gap-2 bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Neue Kampagne
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktive Kampagnen</p>
                <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'active').length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reichweite (Gesamt)</p>
                <p className="text-2xl font-bold">
                  {(campaigns.reduce((sum, c) => sum + (c.metrics.reach || 0), 0) / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ø Öffnungsrate</p>
                <p className="text-2xl font-bold">
                  {(campaigns.filter(c => c.metrics.openRate).reduce((sum, c) => sum + (c.metrics.openRate || 0), 0) / campaigns.filter(c => c.metrics.openRate).length || 0).toFixed(1)}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold">
                  {campaigns.reduce((sum, c) => sum + (c.metrics.conversions || 0), 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Grid */}
      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign, index) => (
            <motion.div 
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="group hover:shadow-lg transition-all h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Badge className={statusColors[campaign.status]}>
                      {statusLabels[campaign.status]}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={campaign.status === 'active'}
                        onCheckedChange={() => toggleCampaignStatus(campaign.id)}
                        disabled={campaign.status === 'draft' || campaign.status === 'completed'}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(campaign)}>
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
                    <Badge variant="outline">{campaignTypeLabels[campaign.type]}</Badge>
                    <div className="flex gap-1">
                      {campaign.platforms.map(platform => {
                        const Icon = platformIcons[platform];
                        return <Icon key={platform} className="w-4 h-4 text-muted-foreground" />;
                      })}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{campaign.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {campaign.description}
                  </p>

                  {campaign.goal && (
                    <p className="text-sm text-muted-foreground mb-4">
                      <span className="font-medium">Ziel:</span> {campaign.goal}
                    </p>
                  )}

                  {/* Metrics */}
                  {Object.keys(campaign.metrics).length > 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border/50">
                      {campaign.metrics.openRate && (
                        <div>
                          <p className="text-xs text-muted-foreground">Öffnungsrate</p>
                          <p className="font-semibold">{campaign.metrics.openRate}%</p>
                        </div>
                      )}
                      {campaign.metrics.clickRate && (
                        <div>
                          <p className="text-xs text-muted-foreground">Klickrate</p>
                          <p className="font-semibold">{campaign.metrics.clickRate}%</p>
                        </div>
                      )}
                      {campaign.metrics.reach && (
                        <div>
                          <p className="text-xs text-muted-foreground">Reichweite</p>
                          <p className="font-semibold">{(campaign.metrics.reach / 1000).toFixed(0)}K</p>
                        </div>
                      )}
                      {campaign.metrics.conversions && (
                        <div>
                          <p className="text-xs text-muted-foreground">Conversions</p>
                          <p className="font-semibold">{campaign.metrics.conversions}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/50 text-xs text-muted-foreground">
                    {campaign.startDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(campaign.startDate).toLocaleDateString('de-DE')}
                      </span>
                    )}
                    <span>
                      {formatDistanceToNow(new Date(campaign.updatedAt), { addSuffix: true, locale: de })}
                    </span>
                  </div>
                </CardContent>
              </Card>
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
          <h3 className="text-xl font-semibold mb-2">Keine Marketing-Kampagnen</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Erstelle deine erste Marketing-Kampagne für E-Mail, Social Media oder Content Marketing.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Erste Kampagne erstellen
          </Button>
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? 'Kampagne bearbeiten' : 'Neue Marketing-Kampagne'}
            </DialogTitle>
            <DialogDescription>
              Erstelle eine E-Mail, Social Media oder Content-Kampagne
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Kampagnen-Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="z.B. Q1 Newsletter Serie"
                />
              </div>

              <div className="col-span-2">
                <Label>Beschreibung</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Was ist das Ziel dieser Kampagne?"
                  rows={3}
                />
              </div>

              <div>
                <Label>Kampagnen-Typ</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: CampaignType) => setFormData(prev => ({ ...prev, type: value, platforms: [] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">E-Mail Marketing</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="content">Content Marketing</SelectItem>
                    <SelectItem value="ads">Paid Advertising</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Zielgruppe</Label>
                <Input
                  value={formData.targetAudience}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  placeholder="z.B. KMU Entscheider"
                />
              </div>

              <div className="col-span-2">
                <Label>Plattformen</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {getPlatformsForType(formData.type).map(platform => {
                    const Icon = platformIcons[platform];
                    const isSelected = formData.platforms.includes(platform);
                    return (
                      <Button
                        key={platform}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => togglePlatform(platform)}
                        className="gap-2"
                      >
                        <Icon className="w-4 h-4" />
                        {platform.charAt(0).toUpperCase() + platform.slice(1).replace('_', ' ')}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="col-span-2">
                <Label>Kampagnen-Ziel</Label>
                <Input
                  value={formData.goal}
                  onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                  placeholder="z.B. Leads generieren, Brand Awareness steigern"
                />
              </div>

              <div>
                <Label>Startdatum</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div>
                <Label>Enddatum (optional)</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>

              {formData.type === 'ads' && (
                <div className="col-span-2">
                  <Label>Budget (€)</Label>
                  <Input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="z.B. 5000"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={!formData.name.trim()}>
              {editingCampaign ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteCampaignId} onOpenChange={() => setDeleteCampaignId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kampagne löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden.
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

export default MarketingCampaigns;
