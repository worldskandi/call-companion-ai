import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { motion } from 'framer-motion';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Phone,
  LayoutDashboard,
  Users,
  Megaphone,
  PhoneCall,
  PhoneIncoming,
  Settings,
  LogOut,
  ChevronUp,
  Sparkles,
  BarChart3,
  Shield,
  CalendarDays,
  Building2,
} from 'lucide-react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

const navigationItems = [
  { title: 'Dashboard', url: '/app', icon: LayoutDashboard },
  { title: 'Leads', url: '/app/leads', icon: Users },
  { title: 'Kampagnen', url: '/app/campaigns', icon: Megaphone },
  { title: 'Anrufe', url: '/app/calls', icon: PhoneCall },
  { title: 'Termine', url: '/app/meetings', icon: CalendarDays },
  { title: 'Firma & Produkte', url: '/app/company', icon: Building2 },
  { title: 'Analytics', url: '/app/analytics', icon: BarChart3 },
  { title: 'Telefonnummern', url: '/app/phone-numbers', icon: PhoneIncoming },
  { title: 'Einstellungen', url: '/app/settings', icon: Settings },
];

function AppSidebar() {
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg flex-shrink-0">
            <Phone className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            >
              CallFlow AI
            </motion.span>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={collapsed ? item.title : undefined}>
                    <NavLink
                      to={item.url}
                      end={item.url === '/app'}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Admin Link - Only visible to admins */}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={collapsed ? 'Admin' : undefined}>
                    <NavLink
                      to="/app/admin"
                      className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <Shield className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span>Admin</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* New Call Button */}
        {!collapsed && (
          <div className="px-2 mt-4">
            <Button
              onClick={() => navigate('/app/calls/new')}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Neuer Anruf
            </Button>
          </div>
        )}
      </SidebarContent>

      {/* Footer with User Menu */}
      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-muted/50 transition-colors">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <div className="flex-1 text-left overflow-hidden">
                    <p className="text-sm font-medium truncate">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {isAdmin ? 'Administrator' : 'Free Plan'}
                    </p>
                  </div>
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate('/app/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Einstellungen
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem onClick={() => navigate('/app/admin')}>
                <Shield className="w-4 h-4 mr-2" />
                Admin-Bereich
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

const DashboardLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <span className="text-muted-foreground">Laden...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-screen min-w-0">
          {/* Top Bar */}
          <header className="h-14 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center px-4 sticky top-0 z-40">
            <SidebarTrigger className="mr-4" />
            <div className="flex-1" />
            <NotificationCenter />
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;