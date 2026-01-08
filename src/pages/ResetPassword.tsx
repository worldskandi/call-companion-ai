import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Lock, ArrowLeft, Loader2 } from 'lucide-react';

const passwordSchema = z.string()
  .min(6, 'Passwort muss mindestens 6 Zeichen lang sein')
  .max(72, 'Passwort darf maximal 72 Zeichen lang sein');

const ResetPassword = () => {
  const navigate = useNavigate();
  const { updatePassword, session, loading } = useAuth();
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  useEffect(() => {
    // Check if we have a session (user clicked the reset link)
    if (!loading && !session) {
      toast({
        title: "Ungültiger Link",
        description: "Der Reset-Link ist ungültig oder abgelaufen.",
        variant: "destructive",
      });
      navigate('/auth');
    }
  }, [session, loading, navigate, toast]);

  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    const { error } = await updatePassword(password);
    
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
      navigate('/');
    }
    
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="bg-card/80 backdrop-blur-lg border border-border rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Neues Passwort setzen
            </h1>
            <p className="text-muted-foreground mt-2">
              Gib dein neues Passwort ein
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Neues Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <Input
                type="password"
                placeholder="Passwort bestätigen"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Passwort ändern'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/auth')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
