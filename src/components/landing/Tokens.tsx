import { motion } from 'framer-motion';
import { Coins, Sparkles, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const tokenPackages = [
  { tokens: 100, price: 9 },
  { tokens: 500, price: 39 },
  { tokens: 1000, price: 69 },
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
          className="max-w-3xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {tokenPackages.map((pkg, index) => {
              const pricePerToken = (pkg.price / pkg.tokens).toFixed(2);
              const isPopular = pkg.tokens === 500;
              const savingsPercent = index > 0 
                ? Math.round((1 - (pkg.price / pkg.tokens) / (tokenPackages[0].price / tokenPackages[0].tokens)) * 100)
                : 0;
              
              return (
                <motion.div 
                  key={pkg.tokens}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative glass-card rounded-2xl border p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1 ${
                    isPopular ? 'border-primary/50 bg-primary/5' : 'border-border/50'
                  }`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                      Beliebt
                    </Badge>
                  )}
                  {savingsPercent > 0 && (
                    <Badge variant="secondary" className="absolute -top-3 right-4 bg-accent/20 text-accent">
                      -{savingsPercent}%
                    </Badge>
                  )}
                  
                  <div className="flex items-center justify-center gap-2 mb-2 mt-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="text-3xl font-bold">{pkg.tokens.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Tokens</p>
                  
                  <p className="text-3xl font-bold text-primary mb-1">€{pkg.price}</p>
                  <p className="text-sm text-muted-foreground">€{pricePerToken} pro Token</p>
                  
                  <Button 
                    className={`w-full mt-6 ${isPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={isPopular ? 'default' : 'outline'}
                  >
                    Kaufen
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Price per Token Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl border border-border/50 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-accent" />
              <span className="font-semibold">Je mehr du kaufst, desto günstiger</span>
            </div>
            
            <div className="relative">
              {/* Price Line */}
              <div className="flex items-end justify-between gap-4">
                {tokenPackages.map((pkg, index) => {
                  const pricePerToken = pkg.price / pkg.tokens;
                  const maxPrice = tokenPackages[0].price / tokenPackages[0].tokens;
                  const heightPercent = (pricePerToken / maxPrice) * 100;
                  
                  return (
                    <div key={pkg.tokens} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col items-center">
                        <span className="text-lg font-bold text-primary mb-2">
                          €{pricePerToken.toFixed(2)}
                        </span>
                        <div 
                          className="w-full rounded-t-lg bg-gradient-to-t from-primary/20 to-primary/60 transition-all"
                          style={{ height: `${heightPercent}px`, minHeight: '20px', maxHeight: '80px' }}
                        />
                      </div>
                      <div className="mt-3 text-center">
                        <span className="text-sm font-medium">{pkg.tokens}</span>
                        <span className="text-xs text-muted-foreground block">Tokens</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Connecting line */}
              <div className="absolute top-8 left-[16.66%] right-[16.66%] h-0.5 bg-gradient-to-r from-primary via-accent to-primary/50 opacity-50" />
            </div>
            
            <p className="text-sm text-muted-foreground text-center mt-6">
              Spare bis zu <span className="font-semibold text-accent">23%</span> beim Kauf von 1.000 Tokens
            </p>
          </motion.div>
          
          {/* Info */}
          <p className="text-sm text-muted-foreground text-center mt-6">
            Sofort verfügbar nach Kauf • Sichere Zahlung via Stripe
          </p>
        </motion.div>
      </div>
    </section>
  );
};
