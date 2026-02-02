import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Search, 
  Sparkles,
  Globe,
  Building2,
  MapPin,
  Filter,
  Download,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LeadGenerator = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLeads, setGeneratedLeads] = useState<any[]>([]);

  const exampleQueries = [
    'IT-Unternehmen in München mit 10-50 Mitarbeitern',
    'Marketing-Agenturen in Berlin',
    'SaaS-Startups in DACH-Region',
    'E-Commerce Unternehmen in Hamburg',
  ];

  const handleGenerate = async () => {
    if (!searchQuery.trim()) return;
    
    setIsGenerating(true);
    // Simulate API call - will be connected to Firecrawl
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock generated leads
    setGeneratedLeads([
      {
        id: '1',
        company: 'TechStart GmbH',
        firstName: 'Max',
        lastName: 'Müller',
        email: 'max@techstart.de',
        phone: '+49 89 12345678',
        website: 'techstart.de',
        industry: 'Software',
        score: 85,
      },
      {
        id: '2',
        company: 'Digital Solutions AG',
        firstName: 'Anna',
        lastName: 'Schmidt',
        email: 'a.schmidt@digitalsolutions.de',
        phone: '+49 89 87654321',
        website: 'digitalsolutions.de',
        industry: 'IT-Beratung',
        score: 72,
      },
      {
        id: '3',
        company: 'CloudTech Services',
        firstName: 'Thomas',
        lastName: 'Weber',
        email: 'weber@cloudtech.io',
        phone: '+49 89 11223344',
        website: 'cloudtech.io',
        industry: 'Cloud Services',
        score: 68,
      },
    ]);
    
    setIsGenerating(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-success/10 text-success border-success/20';
    if (score >= 60) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <UserPlus className="w-8 h-8 text-primary" />
          KI Lead-Generator
        </h1>
        <p className="text-muted-foreground">
          Finde automatisch qualifizierte Leads basierend auf deinen Zielkunden-Kriterien
        </p>
      </motion.div>

      {/* Search Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Zielkunden beschreiben
            </CardTitle>
            <CardDescription>
              Beschreibe deine idealen Kunden und unsere KI findet passende Leads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="z.B. IT-Unternehmen in München mit 10-50 Mitarbeitern, die Cloud-Lösungen anbieten..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-h-[100px]"
            />
            
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Beispiele:</span>
              {exampleQueries.map((query, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setSearchQuery(query)}
                >
                  {query}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-2">
              <Select defaultValue="de">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Deutschland</SelectItem>
                  <SelectItem value="at">Österreich</SelectItem>
                  <SelectItem value="ch">Schweiz</SelectItem>
                  <SelectItem value="dach">DACH-Region</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Branche" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Branchen</SelectItem>
                  <SelectItem value="it">IT & Software</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="finance">Finanzen</SelectItem>
                  <SelectItem value="healthcare">Gesundheit</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={handleGenerate}
                disabled={!searchQuery.trim() || isGenerating}
                className="ml-auto gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Suche läuft...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Leads generieren
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      {generatedLeads.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {generatedLeads.length} Leads gefunden
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtern
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Exportieren
              </Button>
              <Button size="sm" className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Alle importieren
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {generatedLeads.map((lead, index) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{lead.company}</h3>
                            <Badge variant="outline" className={getScoreColor(lead.score)}>
                              Score: {lead.score}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {lead.firstName} {lead.lastName} • {lead.industry}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Globe className="w-4 h-4" />
                              {lead.website}
                            </span>
                            <span>{lead.email}</span>
                            <span>{lead.phone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                        <Button size="sm">
                          Importieren
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!isGenerating && generatedLeads.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Starte deine Lead-Suche</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Beschreibe oben deine Zielkunden und unsere KI findet automatisch 
            passende Unternehmen und Ansprechpartner für dich.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default LeadGenerator;
