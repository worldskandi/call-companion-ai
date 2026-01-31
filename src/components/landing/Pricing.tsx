import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '49',
    description: 'Perfekt für kleine Teams und Einzelunternehmer',
    features: [
      '500 Workflow-Runs/Monat',
      '2 Kanäle (Voice + Email)',
      'AI Assistant Basic',
      'E-Mail Support',
      'Standard Analytics',
    ],
    popular: false,
    cta: 'Kostenlos testen',
  },
  {
    name: 'Professional',
    price: '149',
    description: 'Für wachsende Unternehmen mit höheren Anforderungen',
    features: [
      '5.000 Workflow-Runs/Monat',
      'Alle Kanäle',
      'Advanced AI Assistant',
      'Priority Support',
      'Erweiterte Analytics',
      'Custom AI Training',
      'API Zugang',
    ],
    popular: true,
    cta: 'Jetzt starten',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Maßgeschneiderte Lösungen für große Unternehmen',
    features: [
      'Unbegrenzte Workflow-Runs',
      'Unbegrenzte Kanäle',
      'Dediziertes AI Training',
      'Dedicated Support',
      'White-Label Option',
      'Custom Integrationen',
      'SLA Garantie',
      'On-Premise Option',
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
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Preise
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Transparent &
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> fair</span>
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
                  <div className="flex items-center gap-1 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm font-medium shadow-lg">
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
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {plan.price === 'Custom' ? (
                    <div className="text-3xl font-bold">Auf Anfrage</div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">€{plan.price}</span>
                      <span className="text-muted-foreground">/Monat</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-success" />
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
                      ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90'
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
