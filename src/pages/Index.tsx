import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
  CheckCircle2
} from 'lucide-react';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

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

  // Placeholder stats
  const stats = [
    { label: 'Anrufe heute', value: '0', icon: Phone, trend: '+0%' },
    { label: 'Leads gesamt', value: '0', icon: Users, trend: '+0%' },
    { label: 'Erfolgsquote', value: '0%', icon: TrendingUp, trend: '+0%' },
    { label: 'Durchschn. Dauer', value: '0:00', icon: Clock, trend: '0:00' },
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
            <Button variant="ghost" className="gap-2">
              <Users className="w-4 h-4" />
              Leads
            </Button>
            <Button variant="ghost" className="gap-2">
              <Phone className="w-4 h-4" />
              Kampagnen
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
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="glass-card p-6 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                  {stat.trend}
                </span>
              </div>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
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
            <Button className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl shadow-glow hover:shadow-glow-lg transition-all gap-2">
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
            <Button variant="outline" className="w-full h-12 rounded-xl gap-2">
              <Plus className="w-5 h-5" />
              Lead hinzufügen
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <h2 className="text-lg font-semibold mb-4">Letzte Aktivitäten</h2>
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
        </div>
      </main>
    </div>
  );
};

export default Index;
