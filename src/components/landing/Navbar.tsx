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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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
            ? 'bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2.5 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/')}
          >
            <img src={beavyLogo} alt="Beavy" className="h-8 w-auto brightness-0 invert" />
            <span className="font-bold text-xl tracking-tight text-[#F8FAFC]">
              BEAVY
            </span>
          </motion.div>

          {/* Desktop Navigation */}
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
                className="text-sm font-medium text-[#F8FAFC]/50 hover:text-[#F8FAFC] transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#3B82F6] transition-all group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
              className="text-sm text-[#F8FAFC]/70 hover:text-[#F8FAFC] hover:bg-white/5"
            >
              Anmelden
            </Button>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white text-sm"
            >
              Kostenlos starten
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-[#F8FAFC] hover:bg-white/5"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/10 md:hidden"
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
                  className="text-left py-2 text-[#F8FAFC]/50 hover:text-[#F8FAFC] transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                <Button variant="outline" onClick={() => navigate('/auth')} className="border-white/20 text-[#F8FAFC] hover:bg-white/5">
                  Anmelden
                </Button>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
                >
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
