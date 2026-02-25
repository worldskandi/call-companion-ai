import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Workflow } from 'lucide-react';

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 relative overflow-hidden bg-gradient-to-b from-[#D2DFF2] via-[#C4D6ED] to-[#CADAF0]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-[#3B82F6]/10 rounded-full blur-[150px]" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-20 h-20 rounded-2xl bg-white/50 backdrop-blur-2xl border border-white/50 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-500/5"
          >
            <Workflow className="w-10 h-10 text-[#2563EB]" />
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-[#1E293B]">
            Bereit, deine Prozesse zu automatisieren?
          </h2>

          <p className="text-lg md:text-xl text-[#475569] mb-10 max-w-2xl mx-auto">
            Starte noch heute kostenlos und erlebe, wie Beavy dein Business transformiert.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="h-14 px-8 text-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-all shadow-xl shadow-[#3B82F6]/25 group"
            >
              Kostenlos starten
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg border border-white/50 bg-white/50 backdrop-blur-xl text-[#1E293B] hover:bg-white/70"
            >
              Demo vereinbaren
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-[#64748B]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
              14 Tage kostenlos
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
              Keine Kreditkarte nötig
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
              Jederzeit kündbar
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
