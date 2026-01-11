import { Phone, Twitter, Linkedin, Github, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">CallFlow AI</span>
            </div>
            <p className="text-background/60 mb-6">
              Die intelligente Plattform für automatisierte Telefonkommunikation.
            </p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <button
                  key={i}
                  className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold mb-4">Produkt</h4>
            <ul className="space-y-3">
              {['Features', 'Preise', 'Integrationen', 'API Docs', 'Changelog'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-background/60 hover:text-background transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Unternehmen</h4>
            <ul className="space-y-3">
              {['Über uns', 'Karriere', 'Blog', 'Presse', 'Kontakt'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-background/60 hover:text-background transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-background/60 mb-4">
              Erhalte die neuesten Updates direkt in dein Postfach.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="E-Mail Adresse"
                className="bg-background/10 border-background/20 text-background placeholder:text-background/40"
              />
              <Button size="icon" className="shrink-0">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/40">
            © 2025 CallFlow AI. Alle Rechte vorbehalten.
          </p>
          <div className="flex flex-wrap gap-6 text-sm text-background/40">
            <a href="#" className="hover:text-background transition-colors">Datenschutz</a>
            <a href="#" className="hover:text-background transition-colors">AGB</a>
            <a href="#" className="hover:text-background transition-colors">Impressum</a>
            <a href="#" className="hover:text-background transition-colors">Cookie-Einstellungen</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
