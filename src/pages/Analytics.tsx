import { useState } from 'react';
import { useCallAnalytics, useCampaignAnalytics } from '@/hooks/useAnalytics';
import { useDashboardStats } from '@/hooks/useDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Phone, 
  PhoneIncoming, 
  PhoneOutgoing,
  Clock,
  Target,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDuration } from '@/hooks/useDashboard';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))'];

const Analytics = () => {
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');
  const { data: stats } = useDashboardStats();
  const { data: callAnalytics, isLoading: analyticsLoading } = useCallAnalytics(parseInt(period));
  const { data: campaignAnalytics, isLoading: campaignLoading } = useCampaignAnalytics();

  // Prepare chart data
  const callChartData = callAnalytics?.slice().reverse().map(day => ({
    date: new Date(day.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
    Eingehend: day.inbound_count,
    Ausgehend: day.outbound_count,
    Erfolgreich: day.success_count,
  })) || [];

  const pieData = [
    { name: 'Eingehend', value: stats?.inbound_calls_today || 0 },
    { name: 'Ausgehend', value: stats?.outbound_calls_today || 0 },
  ];

  const campaignChartData = campaignAnalytics?.map(c => ({
    name: c.campaign_name?.substring(0, 15) || 'Keine',
    Anrufe: c.total_calls,
    Erfolgreich: c.successful_calls,
    Rate: Math.round(c.success_rate),
  })) || [];

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Analytics
            </h1>
            <p className="text-muted-foreground">
              Detaillierte Einblicke in deine Anruf-Performance
            </p>
          </div>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as '7' | '30' | '90')}>
            <TabsList>
              <TabsTrigger value="7">7 Tage</TabsTrigger>
              <TabsTrigger value="30">30 Tage</TabsTrigger>
              <TabsTrigger value="90">90 Tage</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Anrufe heute</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.calls_today || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.inbound_calls_today || 0} eingehend, {stats?.outbound_calls_today || 0} ausgehend
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Eingehende Anrufe</CardTitle>
              <PhoneIncoming className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.inbound_calls_today || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.missed_calls_today || 0} verpasst
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Erfolgsquote</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats?.success_rate || 0)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats?.interested_leads || 0} interessierte Leads
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Durchschn. Dauer</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(stats?.avg_call_duration_seconds || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Minuten pro Anruf
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Call Trend Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Anruf-Trend</CardTitle>
              <CardDescription>Anzahl der Anrufe pro Tag</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-pulse text-muted-foreground">Laden...</div>
                </div>
              ) : callChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={callChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Ausgehend" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="Eingehend" stroke="hsl(var(--accent))" strokeWidth={2} />
                    <Line type="monotone" dataKey="Erfolgreich" stroke="hsl(var(--success))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Keine Daten vorhanden
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Call Type Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Anrufverteilung heute</CardTitle>
              <CardDescription>Eingehend vs. Ausgehend</CardDescription>
            </CardHeader>
            <CardContent>
              {pieData.every(d => d.value === 0) ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Keine Anrufe heute
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Campaign Performance */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Kampagnen-Performance
            </CardTitle>
            <CardDescription>Erfolgsquote nach Kampagne</CardDescription>
          </CardHeader>
          <CardContent>
            {campaignLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Laden...</div>
              </div>
            ) : campaignChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={campaignChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="Anrufe" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Erfolgreich" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Keine Kampagnen-Daten vorhanden
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Analytics;