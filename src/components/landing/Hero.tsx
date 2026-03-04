import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Layers, Workflow, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Hero background image */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="/hero-bg.jpg"
          alt=""
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#E0EAFC]/40 via-transparent to-[#E0EAFC]/80" />
      </div>

      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#3B82F6]/10 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{ x: [0, -80, 0], y: [0, 60, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -right-40 w-[700px] h-[700px] bg-[#60A5FA]/10 rounded-full blur-[160px]"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-2xl border border-white/40 shadow-lg shadow-blue-500/5 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
            <span className="text-sm font-medium text-[#1E293B]/70">
              KI-gestützte Automatisierung
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="text-[#1E293B]">
              Dein digitaler Mitarbeiter.
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent">
              Beavy erledigt das.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-[#475569] mb-10 max-w-2xl mx-auto"
          >
            E-Mails beantworten, Anrufe führen, Termine koordinieren. 
            Beavy automatisiert deine Workflows mit integriertem CRM.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="h-14 px-10 text-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-all shadow-lg shadow-[#3B82F6]/25 hover:shadow-xl hover:shadow-[#3B82F6]/35 group"
            >
              Jetzt starten
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg border border-white/50 bg-white/50 backdrop-blur-xl text-[#1E293B] hover:bg-white/70 shadow-sm group"
            >
              <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
              Demo ansehen
            </Button>
          </motion.div>

          {/* Stats Counter */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="grid grid-cols-3 gap-8 max-w-xl mx-auto p-6 rounded-2xl bg-white/40 backdrop-blur-2xl border border-white/50 shadow-lg shadow-blue-500/5"
          >
            {[
              { value: '10K+', label: 'Tasks/Tag' },
              { value: '95%', label: 'Zeitersparnis' },
              { value: '3x', label: 'Mehr Output' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-[#2563EB]">
                  {stat.value}
                </div>
                <div className="text-sm text-[#64748B]">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating Feature Cards – glass style */}
        <div className="hidden lg:block">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="absolute left-8 top-1/2 -translate-y-1/2"
          >
            <div className="p-4 flex items-center gap-3 animate-float bg-white/50 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-lg shadow-blue-500/5">
              <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <div className="font-semibold text-sm text-[#1E293B]">Multi-Channel</div>
                <div className="text-xs text-[#64748B]">Voice, Email, Chat</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="absolute right-8 top-1/3"
          >
            <div className="p-4 flex items-center gap-3 animate-float bg-white/50 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-lg shadow-blue-500/5" style={{ animationDelay: '1s' }}>
              <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                <Workflow className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <div className="font-semibold text-sm text-[#1E293B]">AI Workflows</div>
                <div className="text-xs text-[#64748B]">Automatisch ausführen</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="absolute right-16 bottom-1/4"
          >
            <div className="p-4 flex items-center gap-3 animate-float bg-white/50 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-lg shadow-blue-500/5" style={{ animationDelay: '2s' }}>
              <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <div className="font-semibold text-sm text-[#1E293B]">DSGVO-konform</div>
                <div className="text-xs text-[#64748B]">100% sicher</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-[#3B82F6]/25 flex justify-center pt-2"
        >
          <div className="w-1.5 h-2.5 rounded-full bg-[#3B82F6]/35" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
