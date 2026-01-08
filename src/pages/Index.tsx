import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats, useRecentActivity, formatDuration } from '@/hooks/useDashboard';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  Megaphone,
  PhoneCall,
  UserPlus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivity(10);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="animate-pulse text-primary">Laden...</div>
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const statsCards = [
    { 
      label: 'Anrufe heute', 
      value: stats?.calls_today?.toString() || '0', 
      icon: Phone, 
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    { 
      label: 'Leads gesamt', 
      value: stats?.total_leads?.toString() || '0', 
      icon: Users, 
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    { 
      label: 'Erfolgsquote', 
      value: `${Math.round(stats?.success_rate || 0)}%`, 
      icon: TrendingUp, 
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    { 
      label: 'Durchschn. Dauer', 
      value: formatDuration(stats?.avg_call_duration_seconds || 0), 
      icon: Clock, 
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
  ];

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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-lg">AI Cold Caller</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="gap-2" onClick={() => navigate('/leads')}>
              <Users className="w-4 h-4" />
              Leads
            </Button>
            <Button variant="ghost" className="gap-2" onClick={() => navigate('/campaigns')}>
              <Megaphone className="w-4 h-4" />
              Kampagnen
            </Button>
            <Button variant="ghost" className="gap-2" onClick={() => navigate('/calls')}>
              <PhoneCall className="w-4 h-4" />
              Anrufe
            </Button>
            <Button variant="ghost" className="gap-2" onClick={() => navigate('/settings')}>
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
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">
            Willkommen zurück! 👋
          </h1>
          <p className="text-muted-foreground">
            Hier ist dein Überblick für heute.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat, index) => (
            <div 
              key={stat.label}
              className="glass-card p-6 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">
                {statsLoading ? (
                  <span className="inline-block w-12 h-8 bg-muted/50 rounded animate-pulse" />
                ) : (
                  stat.value
                )}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Start Call Card */}
          <div className="glass-panel p-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-glow">
                <Phone className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">Anruf starten</h2>
                <p className="text-muted-foreground">
                  Wähle einen Lead und starte einen KI-gestützten Anruf
                </p>
              </div>
            </div>
            <Button 
              className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl shadow-glow hover:shadow-glow-lg transition-all gap-2"
              onClick={() => navigate('/calls/new')}
            >
              <Phone className="w-5 h-5" />
              Neuen Anruf starten
            </Button>
          </div>

          {/* Add Lead Card */}
          <div className="glass-panel p-8 animate-fade-in" style={{ animationDelay: '500ms' }}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
                <Users className="w-7 h-7 text-accent-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">Leads verwalten</h2>
                <p className="text-muted-foreground">
                  Füge neue Leads hinzu oder importiere sie aus einer CSV
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-xl gap-2"
              onClick={() => navigate('/leads')}
            >
              <Plus className="w-5 h-5" />
              Leads verwalten
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <h2 className="text-lg font-semibold mb-4">Letzte Aktivitäten</h2>
          
          {activitiesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                  <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="w-32 h-4 bg-muted rounded animate-pulse" />
                    <div className="w-48 h-3 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-2">
              {activities.map((activity) => (
                <div 
                  key={`${activity.activity_type}-${activity.activity_id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.activity_type === 'call' ? 'bg-primary/10' : 'bg-accent/10'
                  }`}>
                    {activity.activity_type === 'call' ? (
                      <PhoneCall className="w-5 h-5 text-primary" />
                    ) : (
                      <UserPlus className="w-5 h-5 text-accent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{activity.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: de })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-2">
                Noch keine Aktivitäten vorhanden
              </p>
              <p className="text-sm text-muted-foreground">
                Starte deinen ersten Anruf, um loszulegen!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
