import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// Public pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";

// Dashboard layout & pages
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadDetail from "./pages/LeadDetail";
import Campaigns from "./pages/Campaigns";
import Calls from "./pages/Calls";
import CallDetail from "./pages/CallDetail";
import NewCall from "./pages/NewCall";
import PhoneNumbers from "./pages/PhoneNumbers";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Admin from "./pages/Admin";
import Meetings from "./pages/Meetings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected App Routes */}
            <Route path="/app" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="leads" element={<Leads />} />
              <Route path="leads/:leadId" element={<LeadDetail />} />
              <Route path="campaigns" element={<Campaigns />} />
              <Route path="calls" element={<Calls />} />
              <Route path="calls/new" element={<NewCall />} />
              <Route path="calls/:callId" element={<CallDetail />} />
              <Route path="phone-numbers" element={<PhoneNumbers />} />
              <Route path="meetings" element={<Meetings />} />
              <Route path="settings/*" element={<Settings />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="admin" element={<Admin />} />
            </Route>

            {/* Legacy redirects - keep old routes working */}
            <Route path="/leads" element={<Leads />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/calls" element={<Calls />} />
            <Route path="/calls/new" element={<NewCall />} />
            <Route path="/settings/*" element={<Settings />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
