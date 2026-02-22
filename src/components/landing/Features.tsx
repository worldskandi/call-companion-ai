import { motion } from 'framer-motion';
import { 
  Clock,
  Database,
  Workflow,
  Coins,
  Zap,
  Globe,
  Lock
} from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Clock,
    title: '24/7 Reaktionsfähigkeit',
    description: 'Nie wieder Leads/Anfragen verpassen. Beavy beantwortet E-Mails, nimmt Anrufe an und koordiniert Termine – auch außerhalb der Öffnungszeiten.',
    color: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    number: '02',
    icon: Database,
    title: 'Eingebautes CRM + automatische Dokumentation',
    description: 'Alles wird automatisch erfasst. Jede Mail, jeder Call, jeder Termin landet im CRM inkl. Zusammenfassung, Status und Next Step – ohne manuelles Nachpflegen.',
    color: 'bg-accent/10',
    iconColor: 'text-accent',
  },
  {
    number: '03',
    icon: Workflow,
    title: 'End-to-End Workflows statt Einzellösungen',
    description: 'Von Anfrage → Qualifizierung → Termin → Reminder → Follow-up – Beavy verbindet Schritte zu echten Abläufen, nicht nur zu Textausgaben.',
    color: 'bg-accent/10',
    iconColor: 'text-accent',
  },
  {
    number: '04',
    icon: Coins,
    title: 'Skalierbarkeit durch Credits',
    description: 'Monatsguthaben (Credits) deckt den Standard ab, bei Spitzen einfach nachkaufen – ohne neue Mitarbeiter einzustellen.',
    color: 'bg-primary/10',
    iconColor: 'text-primary',
  },
];

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full glass border border-primary/20 text-primary text-sm font-medium mb-4">
            Deine Vorteile
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Warum
            <span className="text-primary"> Beavy?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mehr als ein Tool – Dein digitaler Mitarbeiter für den kompletten Prozess.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative"
            >
              {/* Connector Line (hidden on mobile, shown on desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(50%+2rem)] w-[calc(100%-2rem)] h-0.5 bg-gradient-to-r from-border to-transparent z-0" />
              )}
              
              <div className="h-full glass-card p-8 hover:shadow-xl transition-all duration-300 border-transparent hover:border-primary/20 text-center relative z-10">
                {/* Step Number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full glass border border-border text-xs font-bold text-primary font-mono">
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto mt-4`}>
                  <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                </div>

                {/* Content */}
                <h3 className="font-display text-lg font-semibold mb-3 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 glass-panel p-8 md:p-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Zap, value: '< 5 Min', label: 'Setup-Zeit', desc: 'Schnell startklar' },
              { icon: Globe, value: '20+', label: 'Integrationen', desc: 'Alle Tools verbinden' },
              { icon: Lock, value: '100%', label: 'DSGVO', desc: 'Vollständig konform' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-display font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="font-semibold mb-1">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
