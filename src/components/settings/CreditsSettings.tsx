import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Coins, 
  Zap, 
  TrendingUp, 
  Clock, 
  CreditCard,
  Sparkles,
  Mail,
  Phone,
  Calendar,
  Bot
} from 'lucide-react';

const creditUsageExamples = [
  { task: 'E-Mail beantworten', credits: '1-3', icon: Mail, description: 'Je nach Länge und Komplexität' },
  { task: 'Telefonat führen', credits: '5-15', icon: Phone, description: 'Pro Minute Gesprächszeit' },
  { task: 'Termin planen', credits: '2-5', icon: Calendar, description: 'Inkl. Bestätigungen' },
  { task: 'Workflow ausführen', credits: '3-10', icon: Bot, description: 'Je nach Workflow-Komplexität' },
];

const creditPackages = [
  { credits: 500, price: 29, popular: false, savings: null },
  { credits: 1500, price: 79, popular: true, savings: '12%' },
  { credits: 5000, price: 199, popular: false, savings: '25%' },
  { credits: 15000, price: 499, popular: false, savings: '33%' },
];

export const CreditsSettings = () => {
  // Mock data - in real app, this would come from a hook
  const currentCredits = 847;
  const totalCredits = 1000;
  const usedThisMonth = 153;
  const planName = 'Core';

  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary" />
                Aktuelles Guthaben
              </CardTitle>
              <CardDescription>Deine verfügbaren Credits für KI-Prozesse</CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              {planName} Plan
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold text-primary">{currentCredits.toLocaleString()}</span>
            <span className="text-muted-foreground mb-2">/ {totalCredits.toLocaleString()} Credits</span>
          </div>
          
          <Progress value={(currentCredits / totalCredits) * 100} className="h-3" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verbraucht (Monat)</p>
                <p className="text-lg font-semibold">{usedThisMonth} Credits</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Durchschnitt/Tag</p>
                <p className="text-lg font-semibold">~{Math.round(usedThisMonth / 30)} Credits</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reichweite</p>
                <p className="text-lg font-semibold">~{Math.round(currentCredits / (usedThisMonth / 30))} Tage</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Usage Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Credit-Verbrauch
          </CardTitle>
          <CardDescription>
            Credits sind ein Guthaben für KI-Rechenleistung. Je nach Task-Komplexität werden unterschiedlich viele Credits verbraucht.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {creditUsageExamples.map((example) => {
              const Icon = example.icon;
              return (
                <div 
                  key={example.task}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{example.task}</p>
                      <Badge variant="secondary">{example.credits} Credits</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{example.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Buy Credits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Credits nachkaufen
          </CardTitle>
          <CardDescription>
            Kaufe zusätzliche Credits jederzeit nach. Je mehr Credits, desto günstiger pro Credit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {creditPackages.map((pkg) => (
              <div 
                key={pkg.credits}
                className={`relative p-5 rounded-xl border-2 transition-all hover:shadow-lg cursor-pointer ${
                  pkg.popular 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary">
                    Beliebt
                  </Badge>
                )}
                {pkg.savings && (
                  <Badge variant="secondary" className="absolute -top-2.5 right-2">
                    {pkg.savings} sparen
                  </Badge>
                )}
                
                <div className="text-center pt-2">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Coins className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-bold">{pkg.credits.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Credits</p>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-bold">€{pkg.price}</span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-4">
                    €{(pkg.price / pkg.credits * 100).toFixed(1)} pro 100 Credits
                  </p>
                  
                  <Button 
                    className="w-full" 
                    variant={pkg.popular ? 'default' : 'outline'}
                  >
                    Kaufen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaktionen</CardTitle>
          <CardDescription>Deine letzten Credit-Transaktionen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: '28. Jan 2026', type: 'Monatliches Guthaben', credits: '+1.000', status: 'Gutgeschrieben' },
              { date: '15. Jan 2026', type: 'Nachkauf', credits: '+500', status: 'Bezahlt - €29' },
              { date: '28. Dez 2025', type: 'Monatliches Guthaben', credits: '+1.000', status: 'Gutgeschrieben' },
            ].map((transaction, index) => (
              <div key={index}>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{transaction.type}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{transaction.credits}</p>
                    <p className="text-sm text-muted-foreground">{transaction.status}</p>
                  </div>
                </div>
                {index < 2 && <Separator />}
              </div>
            ))}
          </div>
          
          <Button variant="outline" className="w-full mt-4">
            Alle Transaktionen anzeigen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
