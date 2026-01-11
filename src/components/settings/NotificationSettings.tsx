import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { 
  Bell, 
  Loader2, 
  Save,
  Mail,
  Phone,
  Calendar,
  Star,
  BarChart3
} from 'lucide-react';

interface NotificationToggleProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const NotificationToggle = ({ icon, label, description, checked, onCheckedChange }: NotificationToggleProps) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

export const NotificationSettings = () => {
  const { toast } = useToast();
  const { settings, loading, updateSettings, isSaving } = useNotificationSettings();
  
  const [emailOnCallCompleted, setEmailOnCallCompleted] = useState(true);
  const [emailOnMeetingScheduled, setEmailOnMeetingScheduled] = useState(true);
  const [emailOnLeadInterested, setEmailOnLeadInterested] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [dailySummary, setDailySummary] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  useEffect(() => {
    if (settings) {
      setEmailOnCallCompleted(settings.email_on_call_completed ?? true);
      setEmailOnMeetingScheduled(settings.email_on_meeting_scheduled ?? true);
      setEmailOnLeadInterested(settings.email_on_lead_interested ?? true);
      setPushEnabled(settings.push_enabled ?? false);
      setDailySummary(settings.daily_summary ?? true);
      setWeeklyReport(settings.weekly_report ?? false);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings({
        email_on_call_completed: emailOnCallCompleted,
        email_on_meeting_scheduled: emailOnMeetingScheduled,
        email_on_lead_interested: emailOnLeadInterested,
        push_enabled: pushEnabled,
        daily_summary: dailySummary,
        weekly_report: weeklyReport,
      });
      toast({
        title: "Einstellungen gespeichert",
        description: "Deine Benachrichtigungseinstellungen wurden aktualisiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 animate-fade-in">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Benachrichtigungen
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Wähle aus, worüber du informiert werden möchtest.
        </p>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Echtzeit-Benachrichtigungen
          </h3>
          
          <NotificationToggle
            icon={<Phone className="w-5 h-5 text-primary" />}
            label="Anruf abgeschlossen"
            description="E-Mail nach jedem beendeten Anruf erhalten"
            checked={emailOnCallCompleted}
            onCheckedChange={setEmailOnCallCompleted}
          />

          <NotificationToggle
            icon={<Calendar className="w-5 h-5 text-primary" />}
            label="Termin geplant"
            description="Benachrichtigung wenn ein Meeting vereinbart wurde"
            checked={emailOnMeetingScheduled}
            onCheckedChange={setEmailOnMeetingScheduled}
          />

          <NotificationToggle
            icon={<Star className="w-5 h-5 text-primary" />}
            label="Lead interessiert"
            description="Info wenn ein Lead Interesse zeigt"
            checked={emailOnLeadInterested}
            onCheckedChange={setEmailOnLeadInterested}
          />
        </div>

        <div className="space-y-3 mt-6">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Zusammenfassungen
          </h3>
          
          <NotificationToggle
            icon={<Mail className="w-5 h-5 text-primary" />}
            label="Tägliche Zusammenfassung"
            description="Täglicher Bericht über alle Aktivitäten"
            checked={dailySummary}
            onCheckedChange={setDailySummary}
          />

          <NotificationToggle
            icon={<BarChart3 className="w-5 h-5 text-primary" />}
            label="Wöchentlicher Report"
            description="Wöchentliche Analyse und Statistiken"
            checked={weeklyReport}
            onCheckedChange={setWeeklyReport}
          />
        </div>

        <div className="mt-6">
          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto gap-2">
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Einstellungen speichern
          </Button>
        </div>
      </div>

      {/* Push Notifications (Future) */}
      <div className="glass-card p-6 animate-fade-in opacity-60" style={{ animationDelay: '100ms' }}>
        <h3 className="font-medium mb-2">Push-Benachrichtigungen</h3>
        <p className="text-sm text-muted-foreground">
          Browser-Push-Benachrichtigungen werden demnächst verfügbar sein.
        </p>
      </div>
    </div>
  );
};
