import { useNavigate } from 'react-router-dom';
import { useDashboardStats, useRecentActivity, formatDuration } from '@/hooks/useDashboard';
import { Button } from '@/components/ui/button';
import { OpenClawChat } from '@/components/OpenClawChat';
import { 
  Phone, 
  Users, 
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  Megaphone,
  PhoneCall,
  UserPlus,
  ArrowUpRight,
  PhoneIncoming,
  PhoneMissed
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivity(10);

  const statsCards = [
    { 
      label: 'Anrufe heute', 
      value: stats?.calls_today?.toString() || '0', 
      icon: Phone, 
      color: 'from-primary to-primary/70',
      trend: '+12%'
    },
    { 
      label: 'Eingehend', 
      value: stats?.inbound_calls_today?.toString() || '0', 
      icon: PhoneIncoming, 
      color: 'from-accent to-accent/70',
      subtext: `${stats?.missed_calls_today || 0} verpasst`
    },
    { 
      label: 'Erfolgsquote', 
      value: `${Math.round(stats?.success_rate || 0)}%`, 
      icon: TrendingUp, 
      color: 'from-success to-success/70',
      trend: '+5%'
    },
    { 
      label: 'Durchschn. Dauer', 
      value: formatDuration(stats?.avg_call_duration_seconds || 0), 
      icon: Clock, 
      color: 'from-warning to-warning/70',
      trend: '-2%'
    },
  ];

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">
          Willkommen zurück! 👋
        </h1>
        <p className="text-muted-foreground">
          Hier ist dein Überblick für heute.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((stat, index) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              {stat.trend && (
                <span className="text-xs font-medium text-success flex items-center gap-1">
                  {stat.trend}
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              )}
            </div>
            <p className="text-3xl font-bold mb-1">
              {statsLoading ? (
                <span className="inline-block w-12 h-8 bg-muted/50 rounded animate-pulse" />
              ) : (
                stat.value
              )}
            </p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            {stat.subtext && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <PhoneMissed className="w-3 h-3" />
                {stat.subtext}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick Actions + Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions Column */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Call Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-8"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">Anruf starten</h2>
                <p className="text-muted-foreground">
                  Wähle einen Lead und starte einen KI-gestützten Anruf
                </p>
              </div>
            </div>
            <Button 
              className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-xl shadow-lg gap-2"
              onClick={() => navigate('/app/calls/new')}
            >
              <Phone className="w-5 h-5" />
              Neuen Anruf starten
            </Button>
          </motion.div>

          {/* Add Lead Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel p-8"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
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
              onClick={() => navigate('/app/leads')}
            >
              <Plus className="w-5 h-5" />
              Leads verwalten
            </Button>
          </motion.div>
        </div>

        {/* OpenClaw Chat */}
        <OpenClawChat className="lg:col-span-1" />
      </div>

      {/* Recent Activity */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Letzte Aktivitäten</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/calls')}>
            Alle ansehen
          </Button>
        </div>
        
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
      </motion.div>
    </div>
  );
};

export default Dashboard;