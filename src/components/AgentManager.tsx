import { useState } from 'react';
import { useElevenLabsAgents, ElevenLabsAgent } from '@/hooks/useElevenLabsAgents';
import { useElevenLabsConfig } from '@/hooks/useElevenLabsConfig';
import { Button } from '@/components/ui/button';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AgentBuilderWizard from '@/components/AgentBuilderWizard';
import { 
  Plus, Bot, Sparkles, MoreHorizontal, Edit2, Trash2, 
  Volume2, Globe, AlertCircle, Loader2, Wand2, Key
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const AgentManager = () => {
  const navigate = useNavigate();
  const { agents, isLoading, deleteAgent } = useElevenLabsAgents();
  const { isConfigured: hasApiKey } = useElevenLabsConfig();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<ElevenLabsAgent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleEdit = (agent: ElevenLabsAgent) => {
    setEditingAgent(agent);
    setWizardOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteAgent(deleteId);
      setDeleteId(null);
    }
  };

  const handleCloseWizard = () => {
    setWizardOpen(false);
    setEditingAgent(null);
  };

  if (!hasApiKey) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Key className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">ElevenLabs API-Key erforderlich</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          Um Agents zu erstellen, hinterlege zuerst deinen ElevenLabs API-Key in den KI-Agent Einstellungen.
        </p>
        <Button onClick={() => navigate('/app/settings?tab=ai-agent')} className="gap-2">
          <Key className="w-4 h-4" />
          API-Key konfigurieren
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Meine Agents</h2>
            <p className="text-sm text-muted-foreground">
              {agents?.length || 0} Agent{(agents?.length || 0) !== 1 ? 'en' : ''} erstellt
            </p>
          </div>
        </div>
        <Button onClick={() => setWizardOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Neuer Agent
        </Button>
      </div>

      {/* Agent List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : agents && agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="group hover:shadow-lg transition-all h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={agent.status === 'active' ? 'default' : agent.status === 'error' ? 'destructive' : 'secondary'}>
                        {agent.status === 'active' ? 'Aktiv' : agent.status === 'error' ? 'Fehler' : 'Entwurf'}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(agent)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteId(agent.id)} className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <h3 className="font-semibold mb-1">{agent.name}</h3>
                  
                  {agent.error_message && (
                    <div className="flex items-start gap-1.5 text-xs text-destructive mb-2">
                      <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{agent.error_message}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {agent.voice_name && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Volume2 className="w-3 h-3" />
                        {agent.voice_name}
                      </Badge>
                    )}
                    {agent.language && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Globe className="w-3 h-3" />
                        {agent.language.toUpperCase()}
                      </Badge>
                    )}
                  </div>

                  {agent.first_message && (
                    <p className="text-xs text-muted-foreground italic line-clamp-2 mb-3">
                      "{agent.first_message}"
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    {agent.elevenlabs_agent_id && (
                      <code className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {agent.elevenlabs_agent_id.substring(0, 16)}…
                      </code>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatDistanceToNow(new Date(agent.created_at), { addSuffix: true, locale: de })}
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
          className="text-center py-16 bg-card border border-border/50 rounded-xl"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Wand2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Noch keine Agents</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Erstelle deinen ersten KI-Agent mit dem Wizard. Er wird automatisch über die ElevenLabs API deployed.
          </p>
          <Button onClick={() => setWizardOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Ersten Agent erstellen
          </Button>
        </motion.div>
      )}

      {/* Wizard */}
      <AgentBuilderWizard
        open={wizardOpen}
        onClose={handleCloseWizard}
        editingAgent={editingAgent}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Agent löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Der Agent wird auch bei ElevenLabs gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AgentManager;
