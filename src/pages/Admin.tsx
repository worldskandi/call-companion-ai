import { useNavigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  Settings, 
  Activity,
  CreditCard,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: isAdmin, isLoading } = useIsAdmin();

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

  const adminSections = [
    {
      title: 'Team-Verwaltung',
      description: 'Benutzer einladen und Rollen verwalten',
      icon: Users,
      href: '/app/settings/team',
      badge: 'Verfügbar',
    },
    {
      title: 'Workspace-Einstellungen',
      description: 'Globale Konfiguration und Branding',
      icon: Settings,
      href: '/app/settings',
      badge: 'Verfügbar',
    },
    {
      title: 'Nutzungsstatistiken',
      description: 'API-Aufrufe, Anrufminuten und Limits',
      icon: Activity,
      href: '#',
      badge: 'In Entwicklung',
      disabled: true,
    },
    {
      title: 'Abonnement',
      description: 'Plan verwalten und Rechnungen einsehen',
      icon: CreditCard,
      href: '#',
      badge: 'In Entwicklung',
      disabled: true,
    },
    {
      title: 'Audit-Log',
      description: 'Alle Aktivitäten im Workspace nachverfolgen',
      icon: FileText,
      href: '#',
      badge: 'In Entwicklung',
      disabled: true,
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

      {/* Admin Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.05 }}
          >
            <Card 
              className={`h-full transition-all ${
                section.disabled 
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'hover:shadow-lg cursor-pointer hover:scale-[1.02]'
              }`}
              onClick={() => !section.disabled && navigate(section.href)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant={section.disabled ? 'secondary' : 'default'}>
                    {section.badge}
                  </Badge>
                </div>
                <CardTitle className="mt-4">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              {!section.disabled && (
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Öffnen
                  </Button>
                </CardContent>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Admin;