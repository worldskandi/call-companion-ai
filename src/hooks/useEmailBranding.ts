import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmailBranding {
  id?: string;
  logoUrl: string;
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  signatureHtml: string;
  footerText: string;
  socialLinks: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
}

const defaultBranding: EmailBranding = {
  logoUrl: '',
  companyName: '',
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  signatureHtml: '',
  footerText: '',
  socialLinks: {}
};

export function useEmailBranding() {
  const [branding, setBranding] = useState<EmailBranding>(defaultBranding);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Try to get company profile first for logo and company name
      const { data: profile } = await supabase
        .from('company_profiles')
        .select('company_name, logo_url, email')
        .eq('user_id', user.id)
        .maybeSingle();

      // Try to get saved branding from user_integrations metadata
      const { data: integration } = await supabase
        .from('user_integrations')
        .select('metadata')
        .eq('user_id', user.id)
        .eq('provider', 'email_branding')
        .maybeSingle();

      const savedBranding = integration?.metadata as unknown as EmailBranding | null;

      setBranding({
        ...defaultBranding,
        companyName: profile?.company_name || '',
        logoUrl: profile?.logo_url || '',
        ...savedBranding
      });
    } catch (error) {
      console.error('Error loading email branding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBranding = async (newBranding: Partial<EmailBranding>) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht angemeldet');

      const updatedBranding = { ...branding, ...newBranding };

      // Upsert to user_integrations
      const { error } = await supabase
        .from('user_integrations')
        .upsert({
          user_id: user.id,
          provider: 'email_branding',
          access_token: 'branding_settings', // Required field, using placeholder
          metadata: updatedBranding,
          is_active: true
        }, {
          onConflict: 'user_id,provider'
        });

      if (error) throw error;

      setBranding(updatedBranding);
      toast.success('E-Mail-Design gespeichert');
    } catch (error) {
      console.error('Error saving email branding:', error);
      toast.error('Fehler beim Speichern');
    } finally {
      setIsSaving(false);
    }
  };

  const generateEmailHtml = (content: string): string => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { padding: 20px; text-align: center; background: linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor}); }
    .logo { max-height: 50px; max-width: 200px; }
    .content { padding: 30px; line-height: 1.6; color: #333; }
    .signature { padding: 20px 30px; border-top: 1px solid #eee; }
    .footer { padding: 20px; text-align: center; background: #f9fafb; font-size: 12px; color: #6b7280; }
    .social-links { margin-top: 10px; }
    .social-links a { color: ${branding.primaryColor}; margin: 0 8px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    ${branding.logoUrl ? `
    <div class="header">
      <img src="${branding.logoUrl}" alt="${branding.companyName}" class="logo" />
    </div>
    ` : ''}
    <div class="content">
      ${content.replace(/\n/g, '<br>')}
    </div>
    ${branding.signatureHtml ? `
    <div class="signature">
      ${branding.signatureHtml}
    </div>
    ` : ''}
    <div class="footer">
      ${branding.footerText || `© ${new Date().getFullYear()} ${branding.companyName}`}
      ${Object.values(branding.socialLinks).some(v => v) ? `
      <div class="social-links">
        ${branding.socialLinks.website ? `<a href="${branding.socialLinks.website}">Website</a>` : ''}
        ${branding.socialLinks.linkedin ? `<a href="${branding.socialLinks.linkedin}">LinkedIn</a>` : ''}
        ${branding.socialLinks.twitter ? `<a href="${branding.socialLinks.twitter}">Twitter</a>` : ''}
        ${branding.socialLinks.instagram ? `<a href="${branding.socialLinks.instagram}">Instagram</a>` : ''}
      </div>
      ` : ''}
    </div>
  </div>
</body>
</html>
    `.trim();
  };

  return {
    branding,
    isLoading,
    isSaving,
    saveBranding,
    generateEmailHtml,
    loadBranding
  };
}
