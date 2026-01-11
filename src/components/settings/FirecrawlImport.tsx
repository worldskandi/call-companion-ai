import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Globe, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CompanyProfileUpdate, ProductService } from '@/hooks/useCompanyProfile';

interface FirecrawlImportProps {
  currentWebsite: string;
  onImport: (data: CompanyProfileUpdate) => void;
}

interface ScrapedData {
  company_name?: string;
  industry?: string;
  short_description?: string;
  long_description?: string;
  usp?: string[];
  products_services?: ProductService[];
  phone?: string;
  email?: string;
  address?: string;
  brand_colors?: Record<string, string>;
}

export function FirecrawlImport({ currentWebsite, onImport }: FirecrawlImportProps) {
  const [url, setUrl] = useState(currentWebsite);
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({
    company_name: true,
    industry: true,
    short_description: true,
    long_description: true,
    usp: true,
    products_services: true,
    phone: true,
    email: true,
    brand_colors: true,
  });

  const handleScrape = async () => {
    if (!url.trim()) {
      toast.error('Bitte geben Sie eine URL ein');
      return;
    }

    setIsLoading(true);
    setError(null);
    setScrapedData(null);

    try {
      const { data, error } = await supabase.functions.invoke('firecrawl-company-profile', {
        body: { url: url.trim() },
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Scraping fehlgeschlagen');
      }

      setScrapedData(data.data);
      toast.success('Website erfolgreich analysiert!');
    } catch (err) {
      console.error('Scraping error:', err);
      const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setError(message);
      toast.error('Fehler beim Scraping', { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (!scrapedData) return;

    const importData: CompanyProfileUpdate = {};

    if (selectedFields.company_name && scrapedData.company_name) {
      importData.company_name = scrapedData.company_name;
    }
    if (selectedFields.industry && scrapedData.industry) {
      importData.industry = scrapedData.industry;
    }
    if (selectedFields.short_description && scrapedData.short_description) {
      importData.short_description = scrapedData.short_description;
    }
    if (selectedFields.long_description && scrapedData.long_description) {
      importData.long_description = scrapedData.long_description;
    }
    if (selectedFields.usp && scrapedData.usp) {
      importData.usp = scrapedData.usp;
    }
    if (selectedFields.products_services && scrapedData.products_services) {
      importData.products_services = scrapedData.products_services;
    }
    if (selectedFields.phone && scrapedData.phone) {
      importData.phone = scrapedData.phone;
    }
    if (selectedFields.email && scrapedData.email) {
      importData.email = scrapedData.email;
    }
    if (selectedFields.brand_colors && scrapedData.brand_colors) {
      importData.brand_colors = scrapedData.brand_colors;
    }

    importData.scraped_at = new Date().toISOString();
    importData.scrape_source = url;

    onImport(importData);
    toast.success('Daten importiert!', {
      description: 'Vergessen Sie nicht zu speichern.',
    });
  };

  const toggleField = (field: string) => {
    setSelectedFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const fieldLabels: Record<string, string> = {
    company_name: 'Firmenname',
    industry: 'Branche',
    short_description: 'Kurzbeschreibung',
    long_description: 'Ausführliche Beschreibung',
    usp: 'USPs',
    products_services: 'Produkte & Services',
    phone: 'Telefon',
    email: 'E-Mail',
    brand_colors: 'Markenfarben',
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Website analysieren
          </CardTitle>
          <CardDescription>
            Lassen Sie Ihre Website automatisch analysieren und importieren Sie Firmendaten, 
            Produkte und mehr mit KI-Unterstützung.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scrape-url">Website-URL</Label>
            <div className="flex gap-2">
              <Input
                id="scrape-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.ihre-firma.de"
                disabled={isLoading}
              />
              <Button onClick={handleScrape} disabled={isLoading || !url.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analysiere...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analysieren
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {scrapedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Gefundene Daten
            </CardTitle>
            <CardDescription>
              Wählen Sie aus, welche Daten Sie übernehmen möchten.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(scrapedData).map(([key, value]) => {
              if (!value || key === 'address') return null;
              
              const label = fieldLabels[key];
              if (!label) return null;

              return (
                <div key={key} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
                  <Checkbox
                    id={`field-${key}`}
                    checked={selectedFields[key]}
                    onCheckedChange={() => toggleField(key)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={`field-${key}`} className="font-medium cursor-pointer">
                      {label}
                    </Label>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {Array.isArray(value) ? (
                        <div className="flex flex-wrap gap-1">
                          {value.slice(0, 5).map((item, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {typeof item === 'object' ? (item as any).name : item}
                            </Badge>
                          ))}
                          {value.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{value.length - 5} mehr
                            </Badge>
                          )}
                        </div>
                      ) : typeof value === 'object' ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(value).map(([k, v]) => (
                            <Badge key={k} variant="outline" className="text-xs">
                              <span
                                className="w-3 h-3 rounded-full mr-1"
                                style={{ backgroundColor: v as string }}
                              />
                              {k}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="line-clamp-2">{value}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end pt-4">
              <Button onClick={handleImport}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Ausgewählte Daten übernehmen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
