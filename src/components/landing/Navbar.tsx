import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import beavyLogo from '@/assets/beavy-logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/55 backdrop-blur-2xl border-b border-white/40 shadow-lg shadow-blue-500/5'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 h-18 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2.5 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/')}
          >
            <img src={beavyLogo} alt="Beavy" className="h-16 w-auto drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]" />
          </motion.div>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Vorteile', id: 'features' },
              { label: 'So funktioniert\'s', id: 'how-it-works' },
              { label: 'Preise', id: 'preise' },
              { label: 'Kundenstimmen', id: 'über-uns' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-base font-medium text-[#475569] hover:text-[#1E293B] transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#3B82F6] transition-all group-hover:w-full" />
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
              className="text-base text-[#475569] hover:text-[#1E293B] hover:bg-white/40"
            >
              Anmelden
            </Button>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white text-base shadow-lg shadow-[#3B82F6]/20"
            >
              Kostenlos starten
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-[#1E293B] hover:bg-white/40"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 bg-white/70 backdrop-blur-2xl border-b border-white/40 md:hidden"
          >
            <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {[
                { label: 'Vorteile', id: 'features' },
                { label: 'So funktioniert\'s', id: 'how-it-works' },
                { label: 'Preise', id: 'preise' },
                { label: 'Kundenstimmen', id: 'über-uns' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-left py-2 text-[#475569] hover:text-[#1E293B] transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-white/30">
                <Button variant="outline" onClick={() => navigate('/auth')} className="border-white/40 bg-white/40 text-[#1E293B] hover:bg-white/60">
                  Anmelden
                </Button>
                <Button onClick={() => navigate('/auth')} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white">
                  Kostenlos starten
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
