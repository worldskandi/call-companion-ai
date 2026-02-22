import { Twitter, Linkedin, Github, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import beavyLogo from '@/assets/beavy-logo.png';

const Footer = () => {
  return (
    <footer className="bg-[#0a0f1a] border-t border-white/5 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src={beavyLogo} alt="Beavy" className="h-8 w-auto brightness-0 invert" />
              <span className="font-bold text-xl tracking-tight text-[#F8FAFC]">BEAVY</span>
            </div>
            <p className="text-[#F8FAFC]/40 mb-6">
              Dein digitaler Mitarbeiter für automatisierte Workflows, CRM und KI-Kommunikation.
            </p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <button
                  key={i}
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <Icon className="w-5 h-5 text-[#F8FAFC]/50" />
                </button>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold mb-4 text-[#F8FAFC]">Produkt</h4>
            <ul className="space-y-3">
              {['Features', 'Preise', 'Integrationen', 'API Docs', 'Changelog'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-[#F8FAFC]/40 hover:text-[#F8FAFC] transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#F8FAFC]">Unternehmen</h4>
            <ul className="space-y-3">
              {['Über uns', 'Karriere', 'Blog', 'Presse', 'Kontakt'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-[#F8FAFC]/40 hover:text-[#F8FAFC] transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4 text-[#F8FAFC]">Newsletter</h4>
            <p className="text-[#F8FAFC]/40 mb-4">
              Erhalte die neuesten Updates direkt in dein Postfach.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="E-Mail Adresse"
                className="bg-white/5 border-white/10 text-[#F8FAFC] placeholder:text-[#F8FAFC]/30"
              />
              <Button size="icon" className="shrink-0 bg-[#3B82F6] hover:bg-[#3B82F6]/90">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#F8FAFC]/30">
            © 2025 BEAVY. Alle Rechte vorbehalten.
          </p>
          <div className="flex flex-wrap gap-6 text-sm text-[#F8FAFC]/30">
            <a href="#" className="hover:text-[#F8FAFC] transition-colors">Datenschutz</a>
            <a href="#" className="hover:text-[#F8FAFC] transition-colors">AGB</a>
            <a href="#" className="hover:text-[#F8FAFC] transition-colors">Impressum</a>
            <a href="#" className="hover:text-[#F8FAFC] transition-colors">Cookie-Einstellungen</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
