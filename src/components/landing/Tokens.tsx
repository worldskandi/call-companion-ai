import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Sparkles, TrendingDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const tokenPackages = [
  { tokens: 100, price: 9 },
  { tokens: 500, price: 39 },
  { tokens: 1000, price: 69 },
];

const calculateTokensForPrice = (price: number): number => {
  if (price <= 0) return 0;
  const minRate = 0.069;
  const maxRate = 0.09;
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
  const { user } = useAuth();
  const [sliderValue, setSliderValue] = useState([30]);
  const selectedPrice = sliderValue[0];
  const calculatedTokens = calculateTokensForPrice(selectedPrice);
  const pricePerToken = getPricePerToken(selectedPrice);
  const savingsPercent = Math.round((1 - pricePerToken / 0.09) * 100);

  if (!user) return null;

  return (
    <section id="tokens" className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#F0F4FA] via-white to-[#F0F4FA]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-[#3B82F6]/5 border border-[#3B82F6]/15 text-[#3B82F6] text-sm font-medium mb-4">
            <Coins className="w-3.5 h-3.5 mr-1.5 inline" />
            Flexibles Guthaben
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[#1E293B]">
            Tokens{' '}
            <span className="text-[#3B82F6]">aufladen</span>
          </h2>
          <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
            Kaufe Tokens nach Bedarf. Keine Abo-Pflicht, keine versteckten Kosten. Tokens laufen nie ab.
          </p>
        </motion.div>

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
                  className={`relative rounded-2xl border p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-xl ${
                    isPopular ? 'border-[#3B82F6]/30' : 'border-[#3B82F6]/10'
                  }`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3B82F6] text-white">
                      Beliebt
                    </Badge>
                  )}
                  {pkgSavingsPercent > 0 && (
                    <Badge variant="secondary" className="absolute -top-3 right-4 bg-[#3B82F6]/10 text-[#3B82F6]">
                      -{pkgSavingsPercent}%
                    </Badge>
                  )}
                  
                  <div className="flex items-center justify-center gap-2 mb-2 mt-2">
                    <Sparkles className="w-5 h-5 text-[#3B82F6]" />
                    <span className="text-3xl font-bold text-[#1E293B]">{pkg.tokens.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-[#64748B] mb-4">Tokens</p>
                  
                  <p className="text-3xl font-bold text-[#3B82F6] mb-1">€{pkg.price}</p>
                  <p className="text-sm text-[#64748B]">€{pkgPricePerToken} pro Token</p>
                  
                  <Button 
                    className={`w-full mt-6 ${isPopular ? 'bg-[#3B82F6] hover:bg-[#2563EB]' : ''}`}
                    variant={isPopular ? 'default' : 'outline'}
                  >
                    Kaufen
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mt-12"
        >
          <div className="rounded-2xl border border-[#3B82F6]/10 p-8 bg-white/80 backdrop-blur-xl shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <TrendingDown className="w-5 h-5 text-[#3B82F6]" />
              <span className="font-semibold text-[#1E293B]">Je mehr du kaufst, desto günstiger</span>
            </div>
            
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-4xl font-bold text-[#3B82F6]">€{selectedPrice}</span>
                <span className="text-2xl text-[#94A3B8]">=</span>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-[#3B82F6]" />
                  <span className="text-4xl font-bold text-[#1E293B]">{calculatedTokens.toLocaleString()}</span>
                  <span className="text-lg text-[#64748B]">Tokens</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="text-[#64748B]">
                  €{pricePerToken.toFixed(3)} pro Token
                </span>
                {savingsPercent > 0 && (
                  <Badge variant="secondary" className="bg-[#3B82F6]/10 text-[#3B82F6]">
                    {savingsPercent}% Ersparnis
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="px-2">
              <Slider
                value={sliderValue}
                onValueChange={setSliderValue}
                min={5}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-xs text-[#94A3B8]">
                <span>€5</span>
                <span>€25</span>
                <span>€50</span>
                <span>€75</span>
                <span>€100</span>
              </div>
            </div>
            
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
          
          <p className="text-sm text-[#94A3B8] text-center mt-6">
            Sofort verfügbar nach Kauf • Sichere Zahlung via Stripe
          </p>
        </motion.div>
      </div>
    </section>
  );
};
