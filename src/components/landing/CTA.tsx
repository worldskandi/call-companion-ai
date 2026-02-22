import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Workflow } from 'lucide-react';

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background – Beavy Blue gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary opacity-95" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center text-white"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8"
          >
            <Workflow className="w-10 h-10" />
          </motion.div>

          {/* Headline */}
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Bereit, deine Prozesse zu automatisieren?
          </h2>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Starte noch heute kostenlos und erlebe, wie Beavy dein Business transformiert.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="h-14 px-8 text-lg bg-white text-primary hover:bg-white/90 transition-all shadow-xl hover:shadow-2xl group"
            >
              Kostenlos starten
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg border-2 border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              Demo vereinbaren
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              14 Tage kostenlos
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              Keine Kreditkarte nötig
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              Jederzeit kündbar
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
