import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { 
  Workflow,
  Plus,
  Zap,
  Mail,
  Calendar,
  MessageSquare,
  Phone,
  FileText,
  Share2,
  Image,
  Sparkles,
  Clock,
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
  LayoutGrid,
  List,
  Play,
  Pause,
  Settings,
  MoreHorizontal,
  Megaphone,
  Users,
  Target,
  Bot,
  Palette,
  Instagram,
  Linkedin,
  Facebook
} from 'lucide-react';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Automation Templates
const automationTemplates = [
  {
    id: 'email-followup',
    name: 'E-Mail Follow-up',
    description: 'Automatische Follow-up E-Mails nach Kontakt',
    icon: Mail,
    category: 'communication',
    triggers: ['Nach Anruf', 'Nach Meeting', 'Nach X Tagen'],
    popular: true,
  },
  {
    id: 'calendar-sync',
    name: 'Kalender-Sync',
    description: 'Termine automatisch synchronisieren',
    icon: Calendar,
    category: 'productivity',
    triggers: ['Neuer Termin', 'Termin geändert'],
    popular: true,
  },
  {
    id: 'whatsapp-notification',
    name: 'WhatsApp Benachrichtigung',
    description: 'Updates via WhatsApp senden',
    icon: MessageSquare,
    category: 'communication',
    triggers: ['Neuer Lead', 'Deal gewonnen'],
    popular: false,
  },
  {
    id: 'voice-campaign',
    name: 'Voice Agent Kampagne',
    description: 'Automatisierte Anruf-Kampagnen',
    icon: Phone,
    category: 'sales',
    triggers: ['Zeitplan', 'Lead Status'],
    popular: true,
  },
  {
    id: 'lead-scoring',
    name: 'Lead Scoring',
    description: 'Leads automatisch bewerten und priorisieren',
    icon: Target,
    category: 'sales',
    triggers: ['Neuer Lead', 'Aktivität'],
    popular: false,
  },
  {
    id: 'task-creation',
    name: 'Aufgaben erstellen',
    description: 'Automatisch Tasks aus E-Mails generieren',
    icon: FileText,
    category: 'productivity',
    triggers: ['Neue E-Mail', 'Erwähnung'],
    popular: false,
  },
  {
    id: 'slack-notification',
    name: 'Slack Benachrichtigung',
    description: 'Team über wichtige Events informieren',
    icon: MessageSquare,
    category: 'communication',
    triggers: ['Deal Update', 'Neuer Kunde'],
    popular: false,
  },
  {
    id: 'report-generation',
    name: 'Report Generator',
    description: 'Automatische Berichte erstellen und versenden',
    icon: FileText,
    category: 'analytics',
    triggers: ['Täglich', 'Wöchentlich', 'Monatlich'],
    popular: false,
  },
];

// Pomelli Integration Templates
const pomelliTemplates = [
  {
    id: 'pomelli-social-campaign',
    name: 'Social Media Kampagne',
    description: 'KI-generierte Social-Media-Posts mit Pomelli',
    icon: Share2,
    platforms: ['Instagram', 'LinkedIn', 'Facebook'],
    features: ['On-Brand Content', 'Multi-Format', 'Batch Generation'],
  },
  {
    id: 'pomelli-visual-content',
    name: 'Visual Content Creator',
    description: 'Bilder und Grafiken für Marketing erstellen',
    icon: Image,
    platforms: ['Blog', 'Ads', 'Social'],
    features: ['Brand Guidelines', 'Auto-Resize', 'Templates'],
  },
  {
    id: 'pomelli-ad-campaign',
    name: 'Ad Creative Generator',
    description: 'Werbeanzeigen automatisch erstellen',
    icon: Megaphone,
    platforms: ['Google Ads', 'Meta Ads', 'LinkedIn Ads'],
    features: ['A/B Varianten', 'Targeting', 'Copy Generation'],
  },
];

// Active Workflows (Mock Data)
const activeWorkflows = [
  {
    id: '1',
    name: 'Lead Nurturing Sequence',
    description: 'Automatische E-Mail-Serie für neue Leads',
    status: 'active',
    runs: 234,
    lastRun: '2 Minuten',
    trigger: 'Neuer Lead',
    actions: ['E-Mail senden', 'Task erstellen', 'Slack benachrichtigen'],
  },
  {
    id: '2',
    name: 'Meeting Follow-up',
    description: 'Nach jedem Meeting automatisch Zusammenfassung senden',
    status: 'active',
    runs: 89,
    lastRun: '1 Stunde',
    trigger: 'Meeting beendet',
    actions: ['Zusammenfassung generieren', 'E-Mail senden'],
  },
  {
    id: '3',
    name: 'Social Content Pipeline',
    description: 'Wöchentliche Social-Posts mit Pomelli generieren',
    status: 'paused',
    runs: 12,
    lastRun: '3 Tage',
    trigger: 'Wöchentlich (Montag)',
    actions: ['Pomelli Content', 'Review Queue', 'Auto-Post'],
    isPomelli: true,
  },
];

const Workflows = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPomelliDialogOpen, setIsPomelliDialogOpen] = useState(false);

  const categories = [
    { id: 'all', name: 'Alle', count: automationTemplates.length },
    { id: 'communication', name: 'Kommunikation', count: 3 },
    { id: 'sales', name: 'Sales', count: 2 },
    { id: 'productivity', name: 'Produktivität', count: 2 },
    { id: 'analytics', name: 'Analytics', count: 1 },
  ];

  const filteredTemplates = automationTemplates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateWorkflow = (templateId: string) => {
    toast({
      title: "Workflow erstellt",
      description: "Der Workflow wird jetzt konfiguriert.",
    });
    setIsCreateDialogOpen(false);
  };

  const handleConnectPomelli = () => {
    toast({
      title: "Pomelli verbinden",
      description: "Öffne Google Labs Pomelli um dein Konto zu verknüpfen.",
    });
    window.open('https://labs.google.com/pomelli', '_blank');
  };

  const handleToggleWorkflow = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    toast({
      title: newStatus === 'active' ? "Workflow aktiviert" : "Workflow pausiert",
      description: `Der Workflow wurde ${newStatus === 'active' ? 'gestartet' : 'angehalten'}.`,
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
            <Workflow className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Workflows & Automatisierungen</h1>
            <p className="text-muted-foreground">
              Automatisiere deine Backoffice-Prozesse mit KI
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="gap-2"
            onClick={() => setIsPomelliDialogOpen(true)}
          >
            <Palette className="w-4 h-4" />
            Pomelli AI
          </Button>
          <Button 
            className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Workflow erstellen
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Play className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Aktive Workflows</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">335</p>
              <p className="text-sm text-muted-foreground">Ausführungen heute</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">12h</p>
              <p className="text-sm text-muted-foreground">Zeit gespart</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-muted-foreground">Verfügbare Templates</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Active Workflows */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Aktive Workflows
          </h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Alle anzeigen
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="space-y-4">
          {activeWorkflows.map((workflow, index) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  workflow.isPomelli ? 'bg-gradient-to-br from-pink-500/20 to-orange-500/20' : 'bg-primary/10'
                }`}>
                  {workflow.isPomelli ? (
                    <Palette className="w-5 h-5 text-pink-500" />
                  ) : (
                    <Workflow className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{workflow.name}</h3>
                    {workflow.isPomelli && (
                      <Badge variant="secondary" className="text-xs bg-gradient-to-r from-pink-500/10 to-orange-500/10 text-pink-600">
                        Pomelli
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{workflow.description}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {workflow.runs} Ausführungen
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Zuletzt: {workflow.lastRun}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                  {workflow.status === 'active' ? 'Aktiv' : 'Pausiert'}
                </Badge>
                <Switch
                  checked={workflow.status === 'active'}
                  onCheckedChange={() => handleToggleWorkflow(workflow.id, workflow.status)}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="w-4 h-4 mr-2" />
                      Logs anzeigen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Automation Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Automatisierungs-Templates
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Templates suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList className="flex-wrap">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="gap-1">
                {cat.name}
                <Badge variant="secondary" className="ml-1 text-xs">{cat.count}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Templates Grid */}
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => handleCreateWorkflow(template.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <template.icon className="w-5 h-5 text-primary" />
                </div>
                {template.popular && (
                  <Badge variant="secondary" className="text-xs">Beliebt</Badge>
                )}
              </div>
              <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">{template.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
              <div className="flex flex-wrap gap-1">
                {template.triggers.map(trigger => (
                  <Badge key={trigger} variant="outline" className="text-xs">
                    {trigger}
                  </Badge>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Pomelli Dialog */}
      <Dialog open={isPomelliDialogOpen} onOpenChange={setIsPomelliDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                <Palette className="w-4 h-4 text-white" />
              </div>
              Pomelli by Google Labs
            </DialogTitle>
            <DialogDescription>
              Erstelle on-brand Marketing-Content mit KI-Unterstützung
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-orange-500/10 border border-pink-500/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-pink-500 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Was ist Pomelli?</h4>
                  <p className="text-sm text-muted-foreground">
                    Pomelli ist ein KI-Experiment von Google Labs, das kleinen und mittleren Unternehmen 
                    hilft, skalierbare Social-Media-Kampagnen mit konsistentem Branding zu erstellen.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pomelliTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-pink-500/50 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center mb-3">
                    <template.icon className="w-5 h-5 text-pink-500" />
                  </div>
                  <h4 className="font-medium mb-1">{template.name}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
                  <div className="flex gap-1 mb-2">
                    {template.platforms.slice(0, 2).map(p => (
                      <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                    ))}
                    {template.platforms.length > 2 && (
                      <Badge variant="outline" className="text-xs">+{template.platforms.length - 2}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ExternalLink className="w-4 h-4" />
                labs.google.com/pomelli
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsPomelliDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleConnectPomelli}
                  className="gap-2 bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90"
                >
                  <ExternalLink className="w-4 h-4" />
                  Pomelli öffnen
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Workflow Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Workflow className="w-5 h-5 text-primary" />
              Neuen Workflow erstellen
            </DialogTitle>
            <DialogDescription>
              Wähle ein Template oder erstelle einen eigenen Workflow
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-h-96 overflow-y-auto">
            {automationTemplates.map((template) => (
              <div
                key={template.id}
                className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => handleCreateWorkflow(template.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <template.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium group-hover:text-primary transition-colors">{template.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.triggers.slice(0, 2).map(trigger => (
                        <Badge key={trigger} variant="outline" className="text-xs">{trigger}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Leerer Workflow
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workflows;
