import { Twitter, Linkedin, Github, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import beavyLogo from '@/assets/beavy-logo.png';

const Footer = () => {
  return (
    <footer className="border-t border-white/20 py-16 relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-1 mb-4">
              <img src={beavyLogo} alt="Beavy" className="h-16 w-auto drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]" />
              <span className="font-bold text-2xl tracking-tight text-[#1E293B]">Beavy <span className="text-[#2563EB]">AI</span></span>
            </div>
            <p className="text-[#64748B] mb-6">
              Dein digitaler Mitarbeiter für automatisierte Workflows, CRM und KI-Kommunikation.
            </p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <button
                  key={i}
                  className="w-10 h-10 rounded-lg bg-white/50 backdrop-blur-xl border border-white/40 flex items-center justify-center hover:bg-white/70 transition-colors shadow-sm"
                >
                  <Icon className="w-5 h-5 text-[#64748B]" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#1E293B]">Produkt</h4>
            <ul className="space-y-3">
              {['Features', 'Preise', 'Integrationen', 'API Docs', 'Changelog'].map((item) => (
                <li key={item}><a href="#" className="text-[#64748B] hover:text-[#2563EB] transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#1E293B]">Unternehmen</h4>
            <ul className="space-y-3">
              {['Über uns', 'Karriere', 'Blog', 'Presse', 'Kontakt'].map((item) => (
                <li key={item}><a href="#" className="text-[#64748B] hover:text-[#2563EB] transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#1E293B]">Newsletter</h4>
            <p className="text-[#64748B] mb-4">Erhalte die neuesten Updates direkt in dein Postfach.</p>
            <div className="flex gap-2">
              <Input type="email" placeholder="E-Mail Adresse" className="bg-white/50 backdrop-blur-xl border-white/40 text-[#1E293B] placeholder:text-[#94A3B8]" />
              <Button size="icon" className="shrink-0 bg-[#3B82F6] hover:bg-[#2563EB]">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#94A3B8]">© 2025 BEAVY. Alle Rechte vorbehalten.</p>
          <div className="flex flex-wrap gap-6 text-sm text-[#94A3B8]">
            <a href="#" className="hover:text-[#2563EB] transition-colors">Datenschutz</a>
            <a href="#" className="hover:text-[#2563EB] transition-colors">AGB</a>
            <a href="#" className="hover:text-[#2563EB] transition-colors">Impressum</a>
            <a href="#" className="hover:text-[#2563EB] transition-colors">Cookie-Einstellungen</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
