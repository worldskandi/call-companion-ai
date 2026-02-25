import { motion } from 'framer-motion';
import { 
  Clock, Database, Workflow, Coins, Zap, Globe, Lock
} from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Clock,
    title: '24/7 Reaktionsfähigkeit',
    description: 'Nie wieder Leads oder Anfragen verpassen. Beavy beantwortet E-Mails, nimmt Anrufe an und koordiniert Termine, auch außerhalb der Öffnungszeiten.',
  },
  {
    number: '02',
    icon: Database,
    title: 'Eingebautes CRM + automatische Dokumentation',
    description: 'Alles wird automatisch erfasst. Jede Mail, jeder Call, jeder Termin landet im CRM inkl. Zusammenfassung, Status und Next Step.',
  },
  {
    number: '03',
    icon: Workflow,
    title: 'End-to-End Workflows statt Einzellösungen',
    description: 'Von Anfrage über Qualifizierung, Termin und Reminder bis zum Follow-up. Beavy verbindet Schritte zu echten Abläufen.',
  },
  {
    number: '04',
    icon: Coins,
    title: 'Skalierbarkeit durch Credits',
    description: 'Monatsguthaben (Credits) deckt den Standard ab. Bei Spitzen einfach nachkaufen, ohne neue Mitarbeiter einzustellen.',
  },
];

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="features" className="py-16 relative overflow-hidden bg-gradient-to-b from-[#F5F8FC] via-white to-[#F0F4FA]">
      {/* Subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#3B82F6]/5 rounded-full blur-[120px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#3B82F6]/5 border border-[#3B82F6]/15 text-[#3B82F6] text-sm font-medium mb-4">
            <Zap className="w-3.5 h-3.5" />
            Deine Vorteile
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[#1E293B]">
            Warum
            <span className="text-[#3B82F6]"> Beavy?</span>
          </h2>
          <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
            Mehr als ein Tool. Dein digitaler Mitarbeiter für den kompletten Prozess.
          </p>
        </motion.div>

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
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(50%+2rem)] w-[calc(100%-2rem)] h-0.5 bg-gradient-to-r from-[#3B82F6]/10 to-transparent z-0" />
              )}
              
              <div className="h-full p-8 text-center relative z-10 bg-white/80 backdrop-blur-xl border border-[#3B82F6]/10 rounded-2xl hover:bg-white hover:border-[#3B82F6]/20 hover:shadow-lg hover:shadow-[#3B82F6]/5 transition-all duration-300">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white border border-[#3B82F6]/15 text-xs font-bold text-[#3B82F6] font-mono shadow-sm">
                  {step.number}
                </div>

                <div className="w-16 h-16 rounded-2xl bg-[#3B82F6]/8 flex items-center justify-center mb-6 group-hover:bg-[#3B82F6]/15 group-hover:scale-110 transition-all duration-300 mx-auto mt-4">
                  <step.icon className="w-8 h-8 text-[#3B82F6]" />
                </div>

                <h3 className="text-lg font-semibold mb-3 text-[#1E293B] group-hover:text-[#3B82F6] transition-colors">
                  {step.title}
                </h3>
                <p className="text-[#64748B] leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 p-8 md:p-12 bg-white/80 backdrop-blur-xl border border-[#3B82F6]/10 rounded-3xl shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Zap, value: '< 5 Min', label: 'Setup-Zeit', desc: 'Schnell startklar' },
              { icon: Globe, value: '20+', label: 'Integrationen', desc: 'Alle Tools verbinden' },
              { icon: Lock, value: '100%', label: 'DSGVO', desc: 'Vollständig konform' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/8 flex items-center justify-center mb-4">
                  <stat.icon className="w-6 h-6 text-[#3B82F6]" />
                </div>
                <div className="text-3xl font-bold text-[#3B82F6] mb-1">{stat.value}</div>
                <div className="font-semibold mb-1 text-[#1E293B]">{stat.label}</div>
                <div className="text-sm text-[#64748B]">{stat.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
