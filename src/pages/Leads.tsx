import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLeads, useDeleteLead, LeadStatus } from '@/hooks/useLeads';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreHorizontal,
  Upload,
  Sparkles
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LeadModal from '@/components/LeadModal';
import CSVImportModal from '@/components/CSVImportModal';
import { LeadGeneratorModal } from '@/components/LeadGeneratorModal';
import { LeadQualityBadge } from '@/components/LeadQualityBadge';
import { MeetingsCalendar } from '@/components/MeetingsCalendar';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const statusLabels: Record<LeadStatus, string> = {
  new: 'Neu',
  called: 'Angerufen',
  interested: 'Interessiert',
  callback: 'Rückruf',
  not_interested: 'Kein Interesse',
  qualified: 'Qualifiziert',
};

const statusColors: Record<LeadStatus, string> = {
  new: 'status-new',
  called: 'status-called',
  interested: 'status-interested',
  callback: 'status-callback',
  not_interested: 'status-not-interested',
  qualified: 'status-qualified',
};

const Leads = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [deleteLeadId, setDeleteLeadId] = useState<string | null>(null);

  const { data: leads, isLoading } = useLeads({
    status: statusFilter === 'all' ? undefined : statusFilter,
    campaignId: campaignFilter === 'all' ? undefined : campaignFilter,
    search: search || undefined,
  });
  const { data: campaigns } = useCampaigns();
  const deleteLead = useDeleteLead();

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


  const handleEdit = (leadId: string) => {
    setEditingLeadId(leadId);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteLeadId) {
      await deleteLead.mutateAsync(deleteLeadId);
      setDeleteLeadId(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLeadId(null);
  };

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>


      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-2">Leads</h1>
            <p className="text-muted-foreground">
              Verwalte deine Kontakte und Leads
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="gap-2"
              onClick={() => setIsCSVModalOpen(true)}
            >
              <Upload className="w-4 h-4" />
              CSV Import
            </Button>
            <Button 
              variant="outline"
              className="gap-2"
              onClick={() => setIsGeneratorModalOpen(true)}
            >
              <Sparkles className="w-4 h-4" />
              KI Lead-Suche
            </Button>
            <Button 
              className="gap-2 bg-primary hover:bg-primary/90 shadow-glow"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Lead hinzufügen
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - Leads Table */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters */}
            <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Suche nach Name, Firma, E-Mail..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeadStatus | 'all')}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Status</SelectItem>
                    <SelectItem value="new">Neu</SelectItem>
                    <SelectItem value="called">Angerufen</SelectItem>
                    <SelectItem value="interested">Interessiert</SelectItem>
                    <SelectItem value="callback">Rückruf</SelectItem>
                    <SelectItem value="not_interested">Kein Interesse</SelectItem>
                    <SelectItem value="qualified">Qualifiziert</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Kampagne" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Kampagnen</SelectItem>
                    {campaigns?.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Leads Table */}
            <div className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '200ms' }}>
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-pulse text-muted-foreground">Laden...</div>
                </div>
              ) : leads && leads.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Firma</TableHead>
                      <TableHead className="hidden sm:table-cell">Telefon</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Qualität</TableHead>
                      <TableHead className="hidden xl:table-cell">Erstellt</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow 
                        key={lead.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/app/leads/${lead.id}`)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{lead.first_name} {lead.last_name}</p>
                            {lead.email && (
                              <p className="text-sm text-muted-foreground">{lead.email}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {lead.company || '-'}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {lead.phone_number}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[lead.status]}`}>
                            {statusLabels[lead.status]}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <LeadQualityBadge lead={lead} />
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: de })}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(lead.id)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/calls/new?leadId=${lead.id}`)}>
                                <Phone className="w-4 h-4 mr-2" />
                                Anrufen
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeleteLeadId(lead.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Löschen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium mb-2">Keine Leads vorhanden</p>
                  <p className="text-muted-foreground mb-4">
                    Füge deinen ersten Lead hinzu, um loszulegen.
                  </p>
                  <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Lead hinzufügen
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Calendar */}
          <div className="lg:col-span-1 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <MeetingsCalendar />
          </div>
        </div>
      </main>

      {/* Lead Modal */}
      <LeadModal
        open={isModalOpen}
        onClose={handleCloseModal}
        leadId={editingLeadId}
        campaigns={campaigns || []}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        open={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        campaignId={campaignFilter !== 'all' ? campaignFilter : undefined}
      />

      {/* Lead Generator Modal */}
      <LeadGeneratorModal
        open={isGeneratorModalOpen}
        onClose={() => setIsGeneratorModalOpen(false)}
        campaigns={campaigns || []}
        defaultCampaignId={campaignFilter !== 'all' ? campaignFilter : undefined}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteLeadId} onOpenChange={() => setDeleteLeadId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lead löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Der Lead und alle zugehörigen Daten werden permanent gelöscht.
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

export default Leads;
