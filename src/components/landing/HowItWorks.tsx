import { motion } from 'framer-motion';
import { Link2, Settings, Rocket, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: Link2,
    step: '01',
    title: 'Daten verbinden',
    description: 'Verbinde deine Tools und importiere Kontakte. Wir unterstützen CSV, Excel und direkte Integrationen.',
  },
  {
    icon: Settings,
    step: '02',
    title: 'Workflows erstellen',
    description: 'Definiere Automatisierungen mit unserem visuellen Builder. Vorlagen machen den Start einfach.',
  },
  {
    icon: Rocket,
    step: '03',
    title: 'Automation aktivieren',
    description: 'Starte deine Workflows und lass die KI arbeiten. Überwache alles in Echtzeit über dein Dashboard.',
  },
  {
    icon: TrendingUp,
    step: '04',
    title: 'Performance skalieren',
    description: 'Analysiere Ergebnisse, optimiere Prozesse und skaliere, was funktioniert.',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 relative bg-gradient-to-b from-[#162033] via-[#1a2640] to-[#152035]">
      {/* Glow */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[400px] bg-[#3B82F6]/8 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-[#3B82F6]/5 rounded-full blur-[100px]" />
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[#3B82F6] text-sm font-medium mb-4">
            <Settings className="w-3.5 h-3.5" />
            So funktioniert's
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[#F8FAFC]">
            In 4 Schritten zur
            <span className="text-[#3B82F6]"> Automation</span>
          </h2>
          <p className="text-lg text-[#F8FAFC]/50 max-w-2xl mx-auto">
            Von der Einrichtung bis zum ersten automatisierten Prozess in wenigen Minuten.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connection Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#3B82F6]/40 via-[#3B82F6]/20 to-[#3B82F6]/40 -translate-x-1/2" />

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
                <div className="p-6 inline-block bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <div className={`flex items-center gap-4 mb-4 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-[#3B82F6]" />
                    </div>
                    <span className="text-4xl font-bold text-white/10">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[#F8FAFC]">{step.title}</h3>
                  <p className="text-[#F8FAFC]/50">{step.description}</p>
                </div>
              </div>

              {/* Center Dot */}
              <div className="hidden md:flex w-12 h-12 rounded-full bg-[#1e293b] border-4 border-[#3B82F6]/40 items-center justify-center z-10 shadow-lg shadow-[#3B82F6]/10">
                <div className="w-4 h-4 rounded-full bg-[#3B82F6]" />
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
