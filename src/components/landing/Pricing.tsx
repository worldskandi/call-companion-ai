import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Core',
    price: '79',
    description: 'Automation + CRM für kleine Unternehmen',
    features: [
      'KI-gesteuerte E-Mail-Automation',
      'Telefonautomatisierung & Termine',
      'Kalenderintegration & Erinnerungen',
      'Eingebautes CRM',
      'Workflow-Automation',
      '1.000 Credits/Monat',
    ],
    popular: false,
    cta: 'Kostenlos testen',
  },
  {
    name: 'Growth',
    price: '199',
    description: 'Für Start-ups und Unternehmen mit Wachstumszielen',
    features: [
      'Alles aus Core',
      'Sales Automation & Deal-Tracking',
      'Marketing Automation & Kampagnen',
      'Analytics & Performance-Insights',
      'Lead-Scoring & Pipeline-Management',
      'Custom Views & Filter',
      '5.000 Credits/Monat',
    ],
    popular: true,
    cta: 'Jetzt starten',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Für große Unternehmen mit hohem Volumen',
    features: [
      'Alles aus Growth',
      'Custom API-Integrationen',
      'Höhere Kapazitäten & Ressourcen',
      'Dedicated Support & SLA',
      'SSO & erweiterte Sicherheit',
      'Datenresidenz & Compliance',
      'Flexible Credits nach Bedarf',
    ],
    popular: false,
    cta: 'Kontakt aufnehmen',
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <section id="preise" className="py-16 relative overflow-hidden bg-gradient-to-b from-[#141e32] via-[#172136] to-[#131c2e]">
      {/* Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#3B82F6]/8 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[#3B82F6] text-sm font-medium mb-4">
            Preise
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 text-[#F8FAFC]">
            Transparent &
            <span className="text-[#3B82F6]"> fair</span>
          </h2>
          <p className="text-lg text-[#F8FAFC]/50 max-w-2xl mx-auto">
            Wähle den Plan, der zu deinem Unternehmen passt. Alle Pläne mit 14 Tage kostenloser Testphase.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto pt-6">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center gap-1 px-4 py-1 rounded-full bg-[#3B82F6] text-white text-sm font-medium shadow-lg shadow-[#3B82F6]/25">
                    <Sparkles className="w-4 h-4" />
                    Beliebteste Wahl
                  </div>
                </div>
              )}

              <div
                className={`h-full p-8 ${plan.popular ? 'pt-12' : ''} flex flex-col bg-white/5 backdrop-blur-xl border rounded-2xl ${
                  plan.popular
                    ? 'border-[#3B82F6]/50 shadow-xl shadow-[#3B82F6]/10'
                    : 'border-white/10'
                }`}
              >
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-[#F8FAFC]">{plan.name}</h3>
                  <p className="text-sm text-[#F8FAFC]/50">{plan.description}</p>
                </div>

                <div className="mb-6">
                  {plan.price === 'Custom' ? (
                    <div className="text-3xl font-bold text-[#F8FAFC]">Auf Anfrage</div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-[#F8FAFC]">€{plan.price}</span>
                      <span className="text-[#F8FAFC]/40">/Monat</span>
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-[#3B82F6]" />
                      </div>
                      <span className="text-sm text-[#F8FAFC]/70">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => navigate('/auth')}
                  className={`w-full h-12 ${
                    plan.popular
                      ? 'bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white shadow-lg shadow-[#3B82F6]/20'
                      : 'bg-white/10 hover:bg-white/15 text-[#F8FAFC] border border-white/10'
                  }`}
                  variant={plan.popular ? 'default' : 'ghost'}
                >
                  {plan.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-10"
        >
          <p className="text-[#F8FAFC]/40">
            Fragen zu den Preisen?{' '}
            <button className="text-[#3B82F6] hover:underline font-medium">
              Kontaktiere uns
            </button>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
