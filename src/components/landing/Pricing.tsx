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
    <section id="preise" className="py-24 relative overflow-hidden">
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
            Preise
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Transparent &
            <span className="text-primary"> fair</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Wähle den Plan, der zu deinem Unternehmen passt. Alle Pläne mit 14 Tage kostenloser Testphase.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center gap-1 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-lg">
                    <Sparkles className="w-4 h-4" />
                    Beliebteste Wahl
                  </div>
                </div>
              )}

              <div
                className={`h-full glass-card p-8 flex flex-col ${
                  plan.popular
                    ? 'border-2 border-primary shadow-xl shadow-primary/10'
                    : ''
                }`}
              >
                {/* Header */}
                <div className="mb-6">
                  <h3 className="font-display text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {plan.price === 'Custom' ? (
                    <div className="text-3xl font-display font-bold">Auf Anfrage</div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-display font-bold">€{plan.price}</span>
                      <span className="text-muted-foreground">/Monat</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-accent" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  onClick={() => navigate('/auth')}
                  className={`w-full h-12 ${
                    plan.popular
                      ? 'bg-primary hover:bg-primary/90'
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground">
            Fragen zu den Preisen?{' '}
            <button className="text-primary hover:underline font-medium">
              Kontaktiere uns
            </button>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
