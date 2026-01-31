import { motion } from 'framer-motion';
import { Coins, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const tokenPackages = [
  { tokens: 100, price: 9 },
  { tokens: 500, price: 39 },
  { tokens: 1000, price: 69 },
  { tokens: 2500, price: 149 },
  { tokens: 5000, price: 249 },
  { tokens: 10000, price: 449 },
];

export const Tokens = () => {
  return (
    <section id="tokens" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 px-4 py-1.5">
            <Coins className="w-3.5 h-3.5 mr-1.5" />
            Flexibles Guthaben
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Tokens{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              aufladen
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Kaufe Tokens nach Bedarf. Keine Abo-Pflicht, keine versteckten Kosten – Tokens laufen nie ab.
          </p>
        </motion.div>

        {/* Token Packages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y md:divide-y-0 divide-border/50">
              {tokenPackages.map((pkg, index) => {
                const pricePerToken = (pkg.price / pkg.tokens).toFixed(2);
                const isPopular = pkg.tokens === 1000;
                
                return (
                  <div 
                    key={pkg.tokens}
                    className={`relative p-6 text-center transition-colors hover:bg-muted/50 ${isPopular ? 'bg-primary/5' : ''}`}
                  >
                    {isPopular && (
                      <Badge className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-xs">
                        Beliebt
                      </Badge>
                    )}
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-2xl font-bold">{pkg.tokens.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">Tokens</p>
                    <p className="text-xl font-bold text-primary">€{pkg.price}</p>
                    <p className="text-xs text-muted-foreground">€{pricePerToken}/Token</p>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="text-center mt-8">
            <Button size="lg" className="px-8">
              <Coins className="w-5 h-5 mr-2" />
              Tokens kaufen
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              Sofort verfügbar nach Kauf • Sichere Zahlung via Stripe
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
