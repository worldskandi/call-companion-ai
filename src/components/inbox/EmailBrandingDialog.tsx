import { useState, useEffect } from 'react';
import {
  Palette,
  Image,
  Type,
  Link as LinkIcon,
  Save,
  Eye,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmailBranding, EmailBranding } from '@/hooks/useEmailBranding';

interface EmailBrandingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailBrandingDialog({ open, onOpenChange }: EmailBrandingDialogProps) {
  const { branding, isLoading, isSaving, saveBranding, generateEmailHtml } = useEmailBranding();
  const [localBranding, setLocalBranding] = useState<EmailBranding>(branding);
  const [activeTab, setActiveTab] = useState<'design' | 'signature' | 'preview'>('design');

  useEffect(() => {
    setLocalBranding(branding);
  }, [branding]);

  const handleSave = async () => {
    await saveBranding(localBranding);
  };

  const updateField = <K extends keyof EmailBranding>(field: K, value: EmailBranding[K]) => {
    setLocalBranding(prev => ({ ...prev, [field]: value }));
  };

  const updateSocialLink = (platform: keyof EmailBranding['socialLinks'], value: string) => {
    setLocalBranding(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }));
  };

  const previewHtml = generateEmailHtml(`Sehr geehrte/r Herr/Frau Mustermann,

vielen Dank für Ihre Anfrage. Gerne möchte ich Ihnen mehr Informationen zu unserem Angebot zukommen lassen.

Dies ist eine Beispielvorschau, wie Ihre E-Mails mit dem aktuellen Design aussehen werden.

Mit freundlichen Grüßen`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>E-Mail-Design</DialogTitle>
              <DialogDescription>
                Gestalte ein einheitliches Design für alle ausgehenden E-Mails
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-4 border-b">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="design" className="gap-2">
                <Palette className="w-4 h-4" />
                Design
              </TabsTrigger>
              <TabsTrigger value="signature" className="gap-2">
                <Type className="w-4 h-4" />
                Signatur
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="w-4 h-4" />
                Vorschau
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <TabsContent value="design" className="p-6 pt-4 m-0 space-y-6">
              {/* Logo & Company */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Logo & Unternehmen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      value={localBranding.logoUrl}
                      onChange={(e) => updateField('logoUrl', e.target.value)}
                      placeholder="https://example.com/logo.png"
                    />
                    {localBranding.logoUrl && (
                      <div className="p-4 bg-muted rounded-lg flex items-center justify-center">
                        <img 
                          src={localBranding.logoUrl} 
                          alt="Logo Preview" 
                          className="max-h-12 max-w-[200px] object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Firmenname</Label>
                    <Input
                      id="companyName"
                      value={localBranding.companyName}
                      onChange={(e) => updateField('companyName', e.target.value)}
                      placeholder="Meine Firma GmbH"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Colors */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Farben
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primärfarbe</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={localBranding.primaryColor}
                          onChange={(e) => updateField('primaryColor', e.target.value)}
                          className="w-14 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          value={localBranding.primaryColor}
                          onChange={(e) => updateField('primaryColor', e.target.value)}
                          placeholder="#6366f1"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Sekundärfarbe</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={localBranding.secondaryColor}
                          onChange={(e) => updateField('secondaryColor', e.target.value)}
                          className="w-14 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          value={localBranding.secondaryColor}
                          onChange={(e) => updateField('secondaryColor', e.target.value)}
                          placeholder="#8b5cf6"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Social Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={localBranding.socialLinks.website || ''}
                        onChange={(e) => updateSocialLink('website', e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={localBranding.socialLinks.linkedin || ''}
                        onChange={(e) => updateSocialLink('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/company/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter / X</Label>
                      <Input
                        id="twitter"
                        value={localBranding.socialLinks.twitter || ''}
                        onChange={(e) => updateSocialLink('twitter', e.target.value)}
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={localBranding.socialLinks.instagram || ''}
                        onChange={(e) => updateSocialLink('instagram', e.target.value)}
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signature" className="p-6 pt-4 m-0 space-y-6">
              {/* Signature */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    E-Mail-Signatur
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signatureHtml">Signatur (HTML erlaubt)</Label>
                    <Textarea
                      id="signatureHtml"
                      value={localBranding.signatureHtml}
                      onChange={(e) => updateField('signatureHtml', e.target.value)}
                      rows={6}
                      placeholder={`<strong>Max Mustermann</strong><br>
Geschäftsführer<br>
Tel: +49 123 456789<br>
<a href="mailto:max@example.com">max@example.com</a>`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footerText">Footer-Text</Label>
                    <Textarea
                      id="footerText"
                      value={localBranding.footerText}
                      onChange={(e) => updateField('footerText', e.target.value)}
                      rows={2}
                      placeholder="© 2025 Meine Firma GmbH. Alle Rechte vorbehalten."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="p-6 pt-4 m-0">
              <div className="border rounded-xl overflow-hidden bg-muted/30">
                <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <Eye className="w-3 h-3" />
                    Live-Vorschau
                  </span>
                </div>
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-[500px] border-0 bg-white"
                  title="Email Preview"
                />
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Actions Footer */}
        <div className="p-4 border-t bg-muted/30 flex items-center gap-2">
          <div className="flex-1" />
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Speichern
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
