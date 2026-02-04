import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Sparkles, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const tokenPackages = [
  { tokens: 100, price: 9 },
  { tokens: 500, price: 39 },
  { tokens: 1000, price: 69 },
];

// Calculate tokens for a given price with volume discount
const calculateTokensForPrice = (price: number): number => {
  if (price <= 0) return 0;
  
  // Base rate: €0.09 per token at low volumes
  // Best rate: €0.069 per token at high volumes
  // Interpolate based on price
  const minRate = 0.069; // Best rate at €69+
  const maxRate = 0.09;  // Starting rate
  
  // As price increases, rate decreases (volume discount)
  const discountFactor = Math.min(price / 69, 1);
  const currentRate = maxRate - (maxRate - minRate) * discountFactor;
  
  return Math.round(price / currentRate);
};

const getPricePerToken = (price: number): number => {
  const tokens = calculateTokensForPrice(price);
  if (tokens === 0) return 0.09;
  return price / tokens;
};

export const Tokens = () => {
  const [sliderValue, setSliderValue] = useState([30]);
  const selectedPrice = sliderValue[0];
  const calculatedTokens = calculateTokensForPrice(selectedPrice);
  const pricePerToken = getPricePerToken(selectedPrice);
  const savingsPercent = Math.round((1 - pricePerToken / 0.09) * 100);

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

        {/* Interactive Slider Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="glass-card rounded-2xl border border-border/50 p-8">
            <div className="flex items-center gap-2 mb-6">
              <TrendingDown className="w-5 h-5 text-accent" />
              <span className="font-semibold">Je mehr du kaufst, desto günstiger</span>
            </div>
            
            {/* Result Display */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-4xl font-bold text-primary">€{selectedPrice}</span>
                <span className="text-2xl text-muted-foreground">=</span>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <span className="text-4xl font-bold">{calculatedTokens.toLocaleString()}</span>
                  <span className="text-lg text-muted-foreground">Tokens</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  €{pricePerToken.toFixed(3)} pro Token
                </span>
                {savingsPercent > 0 && (
                  <Badge variant="secondary" className="bg-accent/20 text-accent">
                    {savingsPercent}% Ersparnis
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Slider */}
            <div className="px-2">
              <Slider
                value={sliderValue}
                onValueChange={setSliderValue}
                min={5}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>€5</span>
                <span>€25</span>
                <span>€50</span>
                <span>€75</span>
                <span>€100</span>
              </div>
            </div>
            
            {/* Quick Select Buttons */}
            <div className="flex justify-center gap-3 mt-6">
              {tokenPackages.map((pkg) => (
                <Button
                  key={pkg.price}
                  variant={selectedPrice === pkg.price ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSliderValue([pkg.price])}
                  className="text-xs"
                >
                  €{pkg.price} → {pkg.tokens} Tokens
                </Button>
              ))}
            </div>
          </div>
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
              const pkgPricePerToken = (pkg.price / pkg.tokens).toFixed(2);
              const isPopular = pkg.tokens === 500;
              const pkgSavingsPercent = index > 0 
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
                  {pkgSavingsPercent > 0 && (
                    <Badge variant="secondary" className="absolute -top-3 right-4 bg-accent/20 text-accent">
                      -{pkgSavingsPercent}%
                    </Badge>
                  )}
                  
                  <div className="flex items-center justify-center gap-2 mb-2 mt-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="text-3xl font-bold">{pkg.tokens.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Tokens</p>
                  
                  <p className="text-3xl font-bold text-primary mb-1">€{pkg.price}</p>
                  <p className="text-sm text-muted-foreground">€{pkgPricePerToken} pro Token</p>
                  
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
          
          {/* Info */}
          <p className="text-sm text-muted-foreground text-center mt-6">
            Sofort verfügbar nach Kauf • Sichere Zahlung via Stripe
          </p>
        </motion.div>
      </div>
    </section>
  );
};
