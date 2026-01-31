import { motion } from 'framer-motion';
import { Coins, Mail, Phone, Calendar, Bot, Zap, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const tokenExamples = [
  { task: 'E-Mail beantworten', tokens: '1-3', icon: Mail, color: 'from-blue-500 to-blue-600' },
  { task: 'Telefonat führen', tokens: '5-15', icon: Phone, color: 'from-green-500 to-green-600' },
  { task: 'Termin planen', tokens: '2-5', icon: Calendar, color: 'from-purple-500 to-purple-600' },
  { task: 'Workflow ausführen', tokens: '3-10', icon: Bot, color: 'from-orange-500 to-orange-600' },
];

export const Tokens = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 px-4 py-1.5">
            <Coins className="w-3.5 h-3.5 mr-1.5" />
            Flexibles Preismodell
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Bezahle nur, was du{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              nutzt
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tokens sind dein Guthaben für KI-Rechenleistung. Je nach Task-Komplexität werden unterschiedlich viele Tokens verbraucht.
          </p>
        </motion.div>

        {/* Token Examples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {tokenExamples.map((example, index) => {
            const Icon = example.icon;
            return (
              <motion.div
                key={example.task}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300"
                  style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
                />
                <div className="glass-card p-6 rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-300 h-full">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${example.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{example.task}</h3>
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-primary" />
                    <span className="text-2xl font-bold text-primary">{example.tokens}</span>
                    <span className="text-muted-foreground">Tokens</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 rounded-2xl border border-border/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Keine versteckten Kosten</h4>
                <p className="text-sm text-muted-foreground">
                  Du siehst genau, wie viele Tokens jeder Task verbraucht. Volle Transparenz.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Skaliert mit dir</h4>
                <p className="text-sm text-muted-foreground">
                  Kaufe mehr Tokens wenn du wächst. Je mehr, desto günstiger pro Token.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Coins className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Jederzeit nachkaufen</h4>
                <p className="text-sm text-muted-foreground">
                  Tokens laufen nicht ab. Kaufe nach Bedarf zusätzliches Guthaben.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
