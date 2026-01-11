import { useNavigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  Settings, 
  Activity,
  CreditCard,
  FileText,
  AlertTriangle,
  BarChart3,
  Gauge
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { UsageStatsCard } from '@/components/admin/UsageStatsCard';
import { ApiLimitsCard } from '@/components/admin/ApiLimitsCard';
import { AuditLogCard } from '@/components/admin/AuditLogCard';

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: isAdmin, isLoading } = useIsAdmin();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/app');
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Laden...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const quickActions = [
    {
      title: 'Team-Verwaltung',
      description: 'Benutzer einladen und Rollen verwalten',
      icon: Users,
      href: '/app/settings/team',
    },
    {
      title: 'Workspace-Einstellungen',
      description: 'Globale Konfiguration und Branding',
      icon: Settings,
      href: '/app/settings',
    },
    {
      title: 'Abonnement',
      description: 'Plan verwalten und Rechnungen einsehen',
      icon: CreditCard,
      href: '#',
      disabled: true,
      badge: 'Bald',
    },
  ];

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin-Bereich</h1>
            <p className="text-muted-foreground">
              Workspace-Verwaltung und erweiterte Einstellungen
            </p>
          </div>
        </div>
      </motion.div>

      {/* Admin Notice */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="flex items-start gap-4 pt-6">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-warning">Administrator-Zugriff</p>
              <p className="text-sm text-muted-foreground">
                Du bist als Administrator angemeldet ({user?.email}). Änderungen hier betreffen alle Benutzer im Workspace.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Übersicht</span>
          </TabsTrigger>
          <TabsTrigger value="usage" className="gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Nutzung</span>
          </TabsTrigger>
          <TabsTrigger value="limits" className="gap-2">
            <Gauge className="w-4 h-4" />
            <span className="hidden sm:inline">Limits</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Audit</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-semibold mb-4">Schnellzugriff</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Card 
                  key={action.title}
                  className={`transition-all ${
                    action.disabled 
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'hover:shadow-lg cursor-pointer hover:scale-[1.02]'
                  }`}
                  onClick={() => !action.disabled && navigate(action.href)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <action.icon className="w-5 h-5 text-primary" />
                      </div>
                      {action.badge && (
                        <Badge variant="secondary">{action.badge}</Badge>
                      )}
                    </div>
                    <CardTitle className="text-base mt-3">{action.title}</CardTitle>
                    <CardDescription className="text-sm">{action.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Quick Stats Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <UsageStatsCard />
          </motion.div>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <UsageStatsCard />
          </motion.div>
        </TabsContent>

        {/* Limits Tab */}
        <TabsContent value="limits">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ApiLimitsCard />
          </motion.div>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AuditLogCard />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;