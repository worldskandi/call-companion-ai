import { useNavigate } from 'react-router-dom';
import { useDashboardStats, useRecentActivity, formatDuration } from '@/hooks/useDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OpenClawChat } from '@/components/OpenClawChat';
import { 
  Mail, 
  CheckSquare, 
  Calendar,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  PhoneCall,
  UserPlus,
  Sun,
  Coffee
} from 'lucide-react';
import { formatDistanceToNow, format, isToday } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion } from 'framer-motion';

// Mock data for demo - will be replaced with real hooks
const mockUpcomingMeetings = [
  { id: '1', title: 'Team-Meeting', time: '10:00', attendees: 4 },
  { id: '2', title: 'Kundengespräch Müller GmbH', time: '14:00', attendees: 2 },
];

const mockImportantEmails = [
  { id: '1', from: 'Max Müller', subject: 'Anfrage zu Ihrem Angebot', priority: 'high' },
  { id: '2', from: 'Rechnungswesen', subject: 'Rechnung #12345 fällig', priority: 'medium' },
];

const mockOpenTasks = [
  { id: '1', title: 'Angebot für Müller GmbH erstellen', dueToday: true },
  { id: '2', title: 'Follow-up E-Mail senden', dueToday: false },
  { id: '3', title: 'Wochenreport vorbereiten', dueToday: false },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivity(5);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Guten Morgen!', icon: Coffee };
    if (hour < 18) return { text: 'Guten Tag!', icon: Sun };
    return { text: 'Guten Abend!', icon: Sun };
  };

  const greeting = getGreeting();

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Welcome Section with AI Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <greeting.icon className="w-6 h-6 text-primary" />
                  {greeting.text} Hier ist dein Tag:
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background/80 backdrop-blur-sm">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{mockImportantEmails.length}</p>
                      <p className="text-sm text-muted-foreground">Neue E-Mails</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background/80 backdrop-blur-sm">
                    <Calendar className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-2xl font-bold">{mockUpcomingMeetings.length}</p>
                      <p className="text-sm text-muted-foreground">Termine heute</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background/80 backdrop-blur-sm">
                    <CheckSquare className="w-5 h-5 text-success" />
                    <div>
                      <p className="text-2xl font-bold">{mockOpenTasks.length}</p>
                      <p className="text-sm text-muted-foreground">Offene Aufgaben</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Meetings & Emails */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Meetings */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  Anstehende Termine
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/calendar')}>
                  Alle ansehen
                </Button>
              </CardHeader>
              <CardContent>
                {mockUpcomingMeetings.length > 0 ? (
                  <div className="space-y-3">
                    {mockUpcomingMeetings.map((meeting) => (
                      <div 
                        key={meeting.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium">{meeting.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {meeting.attendees} Teilnehmer
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-primary">
                          {meeting.time}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-6">
                    Keine Termine heute
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Important Emails */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Wichtige E-Mails
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/inbox')}>
                  Alle ansehen
                </Button>
              </CardHeader>
              <CardContent>
                {mockImportantEmails.length > 0 ? (
                  <div className="space-y-3">
                    {mockImportantEmails.map((email) => (
                      <div 
                        key={email.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            email.priority === 'high' ? 'bg-destructive/10' : 'bg-primary/10'
                          }`}>
                            <Mail className={`w-5 h-5 ${
                              email.priority === 'high' ? 'text-destructive' : 'text-primary'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium">{email.from}</p>
                            <p className="text-sm text-muted-foreground">
                              {email.subject}
                            </p>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-6">
                    Keine wichtigen E-Mails
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Tasks & Chat */}
        <div className="space-y-6">
          {/* Open Tasks */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-success" />
                  Offene Aufgaben
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/tasks')}>
                  Alle
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockOpenTasks.map((task) => (
                    <div 
                      key={task.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                      <span className={`text-sm ${task.dueToday ? 'font-medium' : 'text-muted-foreground'}`}>
                        {task.title}
                      </span>
                      {task.dueToday && (
                        <span className="text-xs text-warning ml-auto">Heute</span>
                      )}
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 gap-2"
                  onClick={() => navigate('/app/tasks')}
                >
                  <Plus className="w-4 h-4" />
                  Neue Aufgabe
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Statistiken
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Leads gesamt</span>
                    <span className="font-medium">{stats?.total_leads || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Anrufe heute</span>
                    <span className="font-medium">{stats?.calls_today || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Erfolgsquote</span>
                    <span className="font-medium text-success">{Math.round(stats?.success_rate || 0)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* OpenClaw Chat */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <OpenClawChat />
      </motion.div>
    </div>
  );
};

export default Dashboard;
