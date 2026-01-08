import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings as SettingsIcon, 
  Lock, 
  ArrowLeft, 
  Loader2,
  User,
  Mail
} from 'lucide-react';

const passwordSchema = z.string()
  .min(6, 'Passwort muss mindestens 6 Zeichen lang sein')
  .max(72, 'Passwort darf maximal 72 Zeichen lang sein');

const Settings = () => {
  const navigate = useNavigate();
  const { user, updatePassword, loading } = useAuth();
  const { toast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

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

  const validateForm = () => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};
    
    const passwordResult = passwordSchema.safeParse(newPassword);
    if (!passwordResult.success) {
      newErrors.newPassword = passwordResult.error.errors[0].message;
    }
    
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    const { error } = await updatePassword(newPassword);
    
    if (error) {
      toast({
        title: "Fehler",
        description: error.message || "Passwort konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Passwort aktualisiert",
        description: "Dein Passwort wurde erfolgreich geändert.",
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    
    setIsLoading(false);
  };

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
      <main className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        {/* Account Info */}
        <div className="glass-card p-6 mb-6 animate-fade-in">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Account
          </h2>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">E-Mail</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Passwort ändern
          </h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Neues Passwort
              </label>
              <Input
                type="password"
                placeholder="Neues Passwort eingeben"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={errors.newPassword ? 'border-destructive' : ''}
              />
              {errors.newPassword && (
                <p className="text-sm text-destructive mt-1">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Passwort bestätigen
              </label>
              <Input
                type="password"
                placeholder="Neues Passwort bestätigen"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !newPassword || !confirmPassword}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Passwort ändern'
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Settings;
