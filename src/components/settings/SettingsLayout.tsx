import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Settings as SettingsIcon,
  User,
  Link2,
  Phone,
  Bot,
  Bell,
  Key,
  Users,
  PhoneIncoming,
  Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'credits', label: 'Credits & Billing', icon: Coins },
  { id: 'integrations', label: 'Integrationen', icon: Link2 },
  { id: 'telephony', label: 'Telefonie', icon: Phone },
  { id: 'inbound', label: 'Inbound', icon: PhoneIncoming },
  { id: 'ai-agent', label: 'KI-Agent', icon: Bot },
  { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'api', label: 'API & Entwickler', icon: Key },
];

export const SettingsLayout = ({ children, activeTab, onTabChange }: SettingsLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-lg">Einstellungen</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <nav className="lg:w-64 flex-shrink-0">
            <div className="glass-card p-2 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
