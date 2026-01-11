import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Save, Plus, X, Globe } from 'lucide-react';
import { useCompanyProfile, type CompanyProfileUpdate } from '@/hooks/useCompanyProfile';
import { ProductsEditor } from './ProductsEditor';
import { FirecrawlImport } from './FirecrawlImport';

export function CompanySettings() {
  const { profile, isLoading, saveProfile, isSaving } = useCompanyProfile();
  
  const [formData, setFormData] = useState<CompanyProfileUpdate>({
    company_name: profile?.company_name || '',
    industry: profile?.industry || '',
    website: profile?.website || '',
    address_street: profile?.address_street || '',
    address_city: profile?.address_city || '',
    address_zip: profile?.address_zip || '',
    address_country: profile?.address_country || 'Deutschland',
    phone: profile?.phone || '',
    email: profile?.email || '',
    short_description: profile?.short_description || '',
    long_description: profile?.long_description || '',
    usp: profile?.usp || [],
    products_services: profile?.products_services || [],
  });

  const [newUsp, setNewUsp] = useState('');

  // Update form when profile loads
  useState(() => {
    if (profile) {
      setFormData({
        company_name: profile.company_name,
        industry: profile.industry || '',
        website: profile.website || '',
        address_street: profile.address_street || '',
        address_city: profile.address_city || '',
        address_zip: profile.address_zip || '',
        address_country: profile.address_country || 'Deutschland',
        phone: profile.phone || '',
        email: profile.email || '',
        short_description: profile.short_description || '',
        long_description: profile.long_description || '',
        usp: profile.usp || [],
        products_services: profile.products_services || [],
      });
    }
  });

  const handleChange = (field: keyof CompanyProfileUpdate, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddUsp = () => {
    if (newUsp.trim()) {
      handleChange('usp', [...(formData.usp || []), newUsp.trim()]);
      setNewUsp('');
    }
  };

  const handleRemoveUsp = (index: number) => {
    handleChange('usp', (formData.usp || []).filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!formData.company_name?.trim()) {
      return;
    }
    saveProfile(formData);
  };

  const handleImportData = (importedData: CompanyProfileUpdate) => {
    setFormData(prev => ({
      ...prev,
      ...importedData,
      // Merge arrays instead of replacing
      usp: [...new Set([...(prev.usp || []), ...(importedData.usp || [])])],
      products_services: [
        ...(prev.products_services || []),
        ...(importedData.products_services || []),
      ],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Firma & Produkte</h2>
          <p className="text-muted-foreground">
            Hinterlegen Sie Ihre Firmendaten für personalisierte KI-Gespräche
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving || !formData.company_name?.trim()}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Speichern
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basisdaten</TabsTrigger>
          <TabsTrigger value="products">Produkte & Services</TabsTrigger>
          <TabsTrigger value="import">
            <Globe className="h-4 w-4 mr-2" />
            Firecrawl-Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Firmendaten
              </CardTitle>
              <CardDescription>
                Grundlegende Informationen über Ihr Unternehmen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Firmenname *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name || ''}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                    placeholder="Muster GmbH"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Branche</Label>
                  <Input
                    id="industry"
                    value={formData.industry || ''}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    placeholder="z.B. Software, Immobilien, Versicherungen"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://www.beispiel.de"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="kontakt@beispiel.de"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+49 123 456789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_street">Adresse</Label>
                <Input
                  id="address_street"
                  value={formData.address_street || ''}
                  onChange={(e) => handleChange('address_street', e.target.value)}
                  placeholder="Musterstraße 123"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="address_zip">PLZ</Label>
                  <Input
                    id="address_zip"
                    value={formData.address_zip || ''}
                    onChange={(e) => handleChange('address_zip', e.target.value)}
                    placeholder="12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_city">Stadt</Label>
                  <Input
                    id="address_city"
                    value={formData.address_city || ''}
                    onChange={(e) => handleChange('address_city', e.target.value)}
                    placeholder="Berlin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_country">Land</Label>
                  <Input
                    id="address_country"
                    value={formData.address_country || ''}
                    onChange={(e) => handleChange('address_country', e.target.value)}
                    placeholder="Deutschland"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Beschreibung</CardTitle>
              <CardDescription>
                Was macht Ihr Unternehmen? Diese Infos werden in KI-Prompts verwendet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="short_description">Kurzbeschreibung</Label>
                <Textarea
                  id="short_description"
                  value={formData.short_description || ''}
                  onChange={(e) => handleChange('short_description', e.target.value)}
                  placeholder="Ein Satz, der Ihr Unternehmen beschreibt..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="long_description">Ausführliche Beschreibung</Label>
                <Textarea
                  id="long_description"
                  value={formData.long_description || ''}
                  onChange={(e) => handleChange('long_description', e.target.value)}
                  placeholder="Detaillierte Beschreibung Ihres Unternehmens, Ihrer Geschichte und Werte..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>USPs (Alleinstellungsmerkmale)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.usp || []).map((usp, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {usp}
                      <button
                        type="button"
                        onClick={() => handleRemoveUsp(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newUsp}
                    onChange={(e) => setNewUsp(e.target.value)}
                    placeholder="Neues USP hinzufügen..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUsp())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddUsp}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <ProductsEditor
            products={formData.products_services || []}
            onChange={(products) => handleChange('products_services', products as any)}
          />
        </TabsContent>

        <TabsContent value="import">
          <FirecrawlImport
            currentWebsite={formData.website || ''}
            onImport={handleImportData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
