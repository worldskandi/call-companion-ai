import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface SendEmailRequest {
  draftId: string;
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Nicht autorisiert" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !userData.user) {
      return new Response(
        JSON.stringify({ success: false, error: "Ungültiges Token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    const { draftId, to, subject, htmlContent, textContent }: SendEmailRequest = await req.json();

    // Validate required fields
    if (!to || !subject || (!htmlContent && !textContent)) {
      return new Response(
        JSON.stringify({ success: false, error: "Fehlende Pflichtfelder (to, subject, content)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Resend API key
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "E-Mail-Service nicht konfiguriert" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get sender email from settings or use default
    const emailFrom = Deno.env.get("EMAIL_FROM") || "Beavy <noreply@resend.dev>";
    
    // Get user's email branding if available
    const { data: brandingData } = await supabase
      .from("user_integrations")
      .select("metadata")
      .eq("user_id", userId)
      .eq("provider", "email_branding")
      .maybeSingle();

    const branding = brandingData?.metadata as any || null;

    // Build branded HTML email
    let finalHtml = htmlContent;
    if (!htmlContent.includes("<!DOCTYPE") && branding) {
      // Wrap plain text content in branded template
      finalHtml = generateBrandedEmail(textContent || htmlContent, branding);
    }

    // Send email via Resend
    const resend = new Resend(resendKey);
    const emailResponse = await resend.emails.send({
      from: emailFrom,
      to: [to],
      subject: subject,
      html: finalHtml,
      text: textContent || undefined,
    });

    console.log(`Email sent to ${to}:`, emailResponse);

    // Update draft status if draftId provided
    if (draftId) {
      const { error: updateError } = await supabase
        .from("email_drafts")
        .update({ 
          status: "sent",
          updated_at: new Date().toISOString()
        })
        .eq("id", draftId)
        .eq("user_id", userId);

      if (updateError) {
        console.warn("Could not update draft status:", updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResponse.data?.id,
        message: "E-Mail erfolgreich gesendet"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("Send inbox email error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Unbekannter Fehler" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateBrandedEmail(content: string, branding: any): string {
  const primaryColor = branding?.primaryColor || "#6366f1";
  const secondaryColor = branding?.secondaryColor || "#8b5cf6";
  const logoUrl = branding?.logoUrl || "";
  const companyName = branding?.companyName || "Beavy";
  const signatureHtml = branding?.signatureHtml || "";
  const footerText = branding?.footerText || `© ${new Date().getFullYear()} ${companyName}`;
  const socialLinks = branding?.socialLinks || {};

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${companyName}</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      margin: 0; 
      padding: 0; 
      background: #f5f5f5; 
      line-height: 1.6;
      color: #333;
    }
    .container { 
      max-width: 600px; 
      margin: 20px auto; 
      background: white; 
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header { 
      padding: 24px; 
      text-align: center; 
      background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); 
    }
    .header img { 
      max-height: 50px; 
      max-width: 200px; 
    }
    .content { 
      padding: 32px; 
      font-size: 15px;
    }
    .signature { 
      padding: 20px 32px; 
      border-top: 1px solid #eee; 
      font-size: 14px;
      color: #666;
    }
    .footer { 
      padding: 20px; 
      text-align: center; 
      background: #f9fafb; 
      font-size: 12px; 
      color: #6b7280; 
    }
    .social-links { 
      margin-top: 12px; 
    }
    .social-links a { 
      color: ${primaryColor}; 
      margin: 0 8px; 
      text-decoration: none; 
    }
    .social-links a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    ${logoUrl ? `
    <div class="header">
      <img src="${logoUrl}" alt="${companyName}" />
    </div>
    ` : ''}
    <div class="content">
      ${content.replace(/\n/g, '<br>')}
    </div>
    ${signatureHtml ? `
    <div class="signature">
      ${signatureHtml}
    </div>
    ` : ''}
    <div class="footer">
      ${footerText}
      ${Object.values(socialLinks).some(v => v) ? `
      <div class="social-links">
        ${socialLinks.website ? `<a href="${socialLinks.website}">Website</a>` : ''}
        ${socialLinks.linkedin ? `<a href="${socialLinks.linkedin}">LinkedIn</a>` : ''}
        ${socialLinks.twitter ? `<a href="${socialLinks.twitter}">Twitter</a>` : ''}
        ${socialLinks.instagram ? `<a href="${socialLinks.instagram}">Instagram</a>` : ''}
      </div>
      ` : ''}
    </div>
  </div>
</body>
</html>
  `.trim();
}
