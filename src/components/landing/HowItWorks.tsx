import { motion } from 'framer-motion';
import { Upload, Settings, Rocket, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Leads importieren',
    description: 'Lade deine Kontaktliste hoch oder verbinde dein CRM. Wir unterstützen CSV, Excel und alle gängigen Formate.',
  },
  {
    icon: Settings,
    step: '02',
    title: 'Kampagne konfigurieren',
    description: 'Definiere dein Gesprächsskript, Zielgruppe und KI-Persönlichkeit. Unsere Vorlagen machen den Start einfach.',
  },
  {
    icon: Rocket,
    step: '03',
    title: 'Anrufe starten',
    description: 'Starte deine Kampagne und lass die KI arbeiten. Überwache alles in Echtzeit über unser Dashboard.',
  },
  {
    icon: TrendingUp,
    step: '04',
    title: 'Ergebnisse optimieren',
    description: 'Analysiere Performance-Daten, optimiere deine Skripte und skaliere erfolgreiche Kampagnen.',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            So funktioniert's
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            In 4 Schritten zum
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Erfolg</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Von der Einrichtung bis zum ersten erfolgreichen Anruf in wenigen Minuten.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connection Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary -translate-x-1/2" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`relative flex items-center gap-8 mb-12 last:mb-0 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Content Card */}
              <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                <div className="glass-card p-6 inline-block">
                  <div className={`flex items-center gap-4 mb-4 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-4xl font-bold text-muted-foreground/20">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>

              {/* Center Dot */}
              <div className="hidden md:flex w-12 h-12 rounded-full bg-background border-4 border-primary items-center justify-center z-10 shadow-lg">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-primary to-accent" />
              </div>

              {/* Spacer */}
              <div className="hidden md:block flex-1" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
