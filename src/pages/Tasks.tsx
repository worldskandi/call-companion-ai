import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  Clock,
  Tag,
  Filter,
  MoreHorizontal,
  Circle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data for demo - will be replaced with real data from database
const mockTasks = [
  {
    id: '1',
    title: 'Angebot für Müller GmbH erstellen',
    description: 'Angebot basierend auf dem letzten Gespräch vorbereiten',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // Tomorrow
    priority: 'high' as const,
    completed: false,
    category: 'Vertrieb',
    aiGenerated: true,
  },
  {
    id: '2',
    title: 'Follow-up E-Mail an Anna Schmidt senden',
    description: 'Bezüglich der Terminverschiebung',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours
    priority: 'medium' as const,
    completed: false,
    category: 'Kommunikation',
    aiGenerated: true,
  },
  {
    id: '3',
    title: 'Wochenreport vorbereiten',
    description: 'KPIs und Highlights für das Team-Meeting',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48), // 2 days
    priority: 'medium' as const,
    completed: false,
    category: 'Intern',
    aiGenerated: false,
  },
  {
    id: '4',
    title: 'Rechnung #12345 bezahlen',
    description: 'Fällig am 15.02.2026',
    dueDate: new Date('2026-02-15'),
    priority: 'low' as const,
    completed: false,
    category: 'Finanzen',
    aiGenerated: true,
  },
  {
    id: '5',
    title: 'CRM-Daten aktualisieren',
    description: 'Neue Kontakte aus der Messe eintragen',
    dueDate: null,
    priority: 'low' as const,
    completed: true,
    category: 'Admin',
    aiGenerated: false,
  },
];

const Tasks = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');

  const toggleTask = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: '',
      dueDate: null,
      priority: 'medium' as const,
      completed: false,
      category: 'Allgemein',
      aiGenerated: false,
    };
    
    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'medium': return <Circle className="w-4 h-4 text-warning" />;
      case 'low': return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatDueDate = (date: Date | null) => {
    if (!date) return null;
    
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 0) return { text: 'Überfällig', className: 'text-destructive' };
    if (hours < 24) return { text: `In ${hours} Std.`, className: 'text-warning' };
    if (days === 1) return { text: 'Morgen', className: 'text-muted-foreground' };
    return { text: date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }), className: 'text-muted-foreground' };
  };

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'today':
        return task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();
      case 'upcoming':
        return task.dueDate && new Date(task.dueDate) > new Date() && !task.completed;
      case 'completed':
        return task.completed;
      default:
        return true;
    }
  });

  const pendingTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  return (
    <div className="container mx-auto px-6 py-8 max-w-5xl">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <CheckSquare className="w-8 h-8 text-primary" />
              Aufgaben
            </h1>
            <p className="text-muted-foreground">
              {pendingTasks.length} offene Aufgaben
            </p>
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Quick Add */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Plus className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Neue Aufgabe hinzufügen..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                className="border-0 bg-transparent focus-visible:ring-0 text-base"
              />
              <Button 
                onClick={addTask}
                disabled={!newTaskTitle.trim()}
                className="shrink-0"
              >
                Hinzufügen
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-2 mb-6"
      >
        {[
          { key: 'all', label: 'Alle' },
          { key: 'today', label: 'Heute' },
          { key: 'upcoming', label: 'Anstehend' },
          { key: 'completed', label: 'Erledigt' },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter(tab.key as typeof filter)}
          >
            {tab.label}
          </Button>
        ))}
      </motion.div>

      {/* Task List */}
      <div className="space-y-2">
        {pendingTasks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            {pendingTasks.map((task, index) => {
              const dueInfo = formatDueDate(task.dueDate);
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="group"
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="pt-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                        </div>
                        
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTask(task.id)}
                          className="mt-1"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{task.title}</span>
                              {task.aiGenerated && (
                                <Badge variant="outline" className="text-xs gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  KI
                                </Badge>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                                <DropdownMenuItem>Fälligkeitsdatum</DropdownMenuItem>
                                <DropdownMenuItem>Priorität ändern</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">Löschen</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-3 mt-2">
                            {getPriorityIcon(task.priority)}
                            
                            <Badge variant="secondary" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {task.category}
                            </Badge>
                            
                            {dueInfo && (
                              <span className={`text-xs flex items-center gap-1 ${dueInfo.className}`}>
                                <Clock className="w-3 h-3" />
                                {dueInfo.text}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Erledigt ({completedTasks.length})
            </h3>
            <div className="space-y-2 opacity-60">
              {completedTasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                      />
                      <span className="line-through text-muted-foreground">
                        {task.title}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">
              {filter === 'completed' 
                ? 'Noch keine Aufgaben erledigt'
                : 'Keine Aufgaben gefunden'}
            </p>
            <p className="text-sm text-muted-foreground">
              Füge eine neue Aufgabe hinzu, um loszulegen
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
