import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { AccountSettings } from '@/components/settings/AccountSettings';
import { IntegrationsSettings } from '@/components/settings/IntegrationsSettings';
import { TelephonySettings } from '@/components/settings/TelephonySettings';
import { AIAgentSettings } from '@/components/settings/AIAgentSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { TeamSettings } from '@/components/settings/TeamSettings';
import { APISettings } from '@/components/settings/APISettings';
import { CompanySettings } from '@/components/settings/CompanySettings';
import { InboundSettings } from '@/components/settings/InboundSettings';

const Settings = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('account');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-mesh">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'account': return <AccountSettings />;
      case 'company': return <CompanySettings />;
      case 'integrations': return <IntegrationsSettings />;
      case 'telephony': return <TelephonySettings />;
      case 'inbound': return <InboundSettings />;
      case 'ai-agent': return <AIAgentSettings />;
      case 'notifications': return <NotificationSettings />;
      case 'team': return <TeamSettings />;
      case 'api': return <APISettings />;
      default: return <AccountSettings />;
    }
  };

  return (
    <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </SettingsLayout>
  );
};

export default Settings;
