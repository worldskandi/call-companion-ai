import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/hooks/useWorkspace';
import { 
  Users, 
  Loader2, 
  Plus,
  Crown,
  Shield,
  User,
  Eye,
  Mail,
  Trash2,
  Building2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';

const roleIcons: Record<string, React.ReactNode> = {
  owner: <Crown className="w-4 h-4 text-amber-500" />,
  admin: <Shield className="w-4 h-4 text-blue-500" />,
  member: <User className="w-4 h-4 text-muted-foreground" />,
  viewer: <Eye className="w-4 h-4 text-muted-foreground" />,
};

const roleLabels: Record<string, string> = {
  owner: 'Eigentümer',
  admin: 'Admin',
  member: 'Mitglied',
  viewer: 'Betrachter',
};

export const TeamSettings = () => {
  const { toast } = useToast();
  const { 
    workspace, 
    members, 
    invitations,
    loading, 
    createWorkspace,
    inviteMember, 
    removeMember,
    isInviting 
  } = useWorkspace();
  
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [workspaceName, setWorkspaceName] = useState('');

  const handleInvite = async () => {
    if (!inviteEmail) return;
    
    try {
      await inviteMember(inviteEmail, inviteRole);
      toast({
        title: "Einladung gesendet",
        description: `Eine Einladung wurde an ${inviteEmail} gesendet.`,
      });
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteRole('member');
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Einladung konnte nicht gesendet werden.",
        variant: "destructive",
      });
    }
  };

  const handleCreateWorkspace = async () => {
    if (!workspaceName) return;
    
    try {
      await createWorkspace(workspaceName);
      toast({
        title: "Workspace erstellt",
        description: `"${workspaceName}" wurde erfolgreich erstellt.`,
      });
      setShowCreateDialog(false);
      setWorkspaceName('');
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Workspace konnte nicht erstellt werden.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember(memberId);
      toast({
        title: "Mitglied entfernt",
        description: "Das Teammitglied wurde entfernt.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Mitglied konnte nicht entfernt werden.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // No workspace yet
  if (!workspace) {
    return (
      <div className="glass-card p-6 animate-fade-in">
        <div className="text-center py-8">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-lg font-semibold mb-2">Kein Workspace vorhanden</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Erstelle einen Workspace, um mit deinem Team zusammenzuarbeiten und Leads, Kampagnen und Anrufe zu teilen.
          </p>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Workspace erstellen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neuen Workspace erstellen</DialogTitle>
                <DialogDescription>
                  Ein Workspace ermöglicht die Zusammenarbeit mit deinem Team.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <label className="text-sm font-medium mb-1 block">
                  Workspace-Name
                </label>
                <Input
                  placeholder="z.B. Meine Firma"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleCreateWorkspace} disabled={!workspaceName}>
                  Erstellen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workspace Info */}
      <div className="glass-card p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Team - {workspace.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              Verwalte dein Team und lade neue Mitglieder ein.
            </p>
          </div>
          
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Einladen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Teammitglied einladen</DialogTitle>
                <DialogDescription>
                  Sende eine Einladung per E-Mail an ein neues Teammitglied.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    E-Mail-Adresse
                  </label>
                  <Input
                    type="email"
                    placeholder="kollege@firma.de"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Rolle
                  </label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          {roleIcons.admin}
                          <span>Admin - Kann alles verwalten</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="member">
                        <div className="flex items-center gap-2">
                          {roleIcons.member}
                          <span>Mitglied - Kann Anrufe tätigen</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="viewer">
                        <div className="flex items-center gap-2">
                          {roleIcons.viewer}
                          <span>Betrachter - Nur Lesezugriff</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleInvite} disabled={!inviteEmail || isInviting}>
                  {isInviting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Einladung senden'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Members List */}
        <div className="space-y-3">
          {members && members.length > 0 ? (
            members.map((member) => (
              <div 
                key={member.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{member.user_id}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      {roleIcons[member.role]}
                      {roleLabels[member.role]}
                    </p>
                  </div>
                </div>
                {member.role !== 'owner' && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Noch keine Teammitglieder</p>
              <p className="text-sm">Lade Kollegen ein, um zusammenzuarbeiten.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations && invitations.length > 0 && (
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Ausstehende Einladungen
          </h3>
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div>
                  <p className="font-medium">{inv.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Eingeladen als {roleLabels[inv.role]}
                  </p>
                </div>
                <Badge variant="secondary">Ausstehend</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
