-- Update system email templates with professional HTML styling

-- 1. Follow-up Template
UPDATE email_templates SET html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 40px 30px; text-align: center;">
              <div style="width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 12px; margin: 0 auto 16px; display: inline-block; line-height: 60px; font-size: 24px;">
                {{company_logo}}
              </div>
              <h1 style="color: #ffffff; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 24px; margin: 0; font-weight: 600;">{{company_name}}</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #18181b; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 22px; margin: 0 0 24px; font-weight: 600;">
                Vielen Dank für das Gespräch! ✨
              </h2>
              <p style="color: #3f3f46; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                Hallo <strong>{{lead_name}}</strong>,
              </p>
              <p style="color: #3f3f46; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                vielen Dank für das freundliche Gespräch heute. Wie besprochen, sende ich Ihnen hiermit eine kurze Zusammenfassung:
              </p>
              <!-- Info Box -->
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #6366f1; border-radius: 0 12px 12px 0; padding: 20px; margin: 24px 0;">
                <p style="color: #1e40af; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 15px; line-height: 1.6; margin: 0;">
                  {{custom_content}}
                </p>
              </div>
              <p style="color: #3f3f46; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 24px 0;">
                Bei Fragen stehe ich Ihnen jederzeit zur Verfügung.
              </p>
              <!-- Signature -->
              <table cellpadding="0" cellspacing="0" style="margin-top: 32px; border-top: 1px solid #e4e4e7; padding-top: 24px; width: 100%;">
                <tr>
                  <td style="width: 50px; vertical-align: top;">
                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 50%; text-align: center; line-height: 48px; color: #fff; font-size: 20px; font-weight: 600;">
                      {{ai_initial}}
                    </div>
                  </td>
                  <td style="padding-left: 16px; vertical-align: top;">
                    <p style="color: #18181b; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; margin: 0; font-weight: 600;">{{ai_name}}</p>
                    <p style="color: #71717a; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 14px; margin: 4px 0 0;">{{company_name}}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 24px 40px; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="color: #a1a1aa; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 12px; margin: 0;">
                © {{current_year}} {{company_name}} • Diese E-Mail wurde automatisch versendet
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
WHERE category = 'follow-up' AND is_system = true;

-- 2. Quote/Offer Template
UPDATE email_templates SET html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 40px 40px 30px; text-align: center;">
              <div style="width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 12px; margin: 0 auto 16px; display: inline-block; line-height: 60px; font-size: 28px;">
                💼
              </div>
              <h1 style="color: #ffffff; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 24px; margin: 0; font-weight: 600;">Ihr persönliches Angebot</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #3f3f46; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                Hallo <strong>{{lead_name}}</strong>,
              </p>
              <p style="color: #3f3f46; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                wie telefonisch besprochen, erhalten Sie anbei Ihr individuelles Angebot.
              </p>
              <!-- Offer Box -->
              <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #10b981; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                <p style="color: #047857; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px; font-weight: 600;">Angebot</p>
                <p style="color: #065f46; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0;">
                  {{custom_content}}
                </p>
              </div>
              <p style="color: #3f3f46; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                📎 Die Details finden Sie im beigefügten Dokument.
              </p>
              <!-- Validity Badge -->
              <div style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 20px; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 14px; font-weight: 500;">
                ⏰ Angebot gültig bis: 14 Tage
              </div>
              <p style="color: #3f3f46; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 24px 0;">
                Bei Rückfragen erreichen Sie uns jederzeit.
              </p>
              <!-- Signature -->
              <table cellpadding="0" cellspacing="0" style="margin-top: 32px; border-top: 1px solid #e4e4e7; padding-top: 24px; width: 100%;">
                <tr>
                  <td style="width: 50px; vertical-align: top;">
                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 50%; text-align: center; line-height: 48px; color: #fff; font-size: 20px; font-weight: 600;">
                      {{ai_initial}}
                    </div>
                  </td>
                  <td style="padding-left: 16px; vertical-align: top;">
                    <p style="color: #18181b; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; margin: 0; font-weight: 600;">{{ai_name}}</p>
                    <p style="color: #71717a; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 14px; margin: 4px 0 0;">{{company_name}}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 24px 40px; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="color: #a1a1aa; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 12px; margin: 0;">
                © {{current_year}} {{company_name}} • Diese E-Mail wurde automatisch versendet
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
WHERE category = 'quote' AND is_system = true;

-- 3. Meeting Confirmation Template
UPDATE email_templates SET html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 40px 40px 30px; text-align: center;">
              <div style="width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 12px; margin: 0 auto 16px; display: inline-block; line-height: 60px; font-size: 28px;">
                📅
              </div>
              <h1 style="color: #ffffff; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 24px; margin: 0; font-weight: 600;">Termin bestätigt!</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #3f3f46; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Hallo <strong>{{lead_name}}</strong>,
              </p>
              <p style="color: #3f3f46; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                hiermit bestätige ich unseren Termin:
              </p>
              <!-- Meeting Details Card -->
              <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 16px; padding: 24px; margin: 24px 0;">
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(59, 130, 246, 0.2);">
                      <span style="color: #3b82f6; font-size: 20px; margin-right: 12px;">📅</span>
                      <span style="color: #1e40af; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; font-weight: 600;">{{meeting_date}}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(59, 130, 246, 0.2);">
                      <span style="color: #3b82f6; font-size: 20px; margin-right: 12px;">🕐</span>
                      <span style="color: #1e40af; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; font-weight: 600;">{{meeting_time}}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <span style="color: #3b82f6; font-size: 20px; margin-right: 12px;">🔗</span>
                      <span style="color: #1e40af; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px;">Meeting-Link</span>
                    </td>
                  </tr>
                </table>
              </div>
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="{{meeting_link}}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: #ffffff; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 12px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
                  🚀 Meeting beitreten
                </a>
              </div>
              <p style="color: #3f3f46; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 24px 0; text-align: center;">
                Ich freue mich auf unser Gespräch!
              </p>
              <!-- Signature -->
              <table cellpadding="0" cellspacing="0" style="margin-top: 32px; border-top: 1px solid #e4e4e7; padding-top: 24px; width: 100%;">
                <tr>
                  <td style="width: 50px; vertical-align: top;">
                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); border-radius: 50%; text-align: center; line-height: 48px; color: #fff; font-size: 20px; font-weight: 600;">
                      {{ai_initial}}
                    </div>
                  </td>
                  <td style="padding-left: 16px; vertical-align: top;">
                    <p style="color: #18181b; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; margin: 0; font-weight: 600;">{{ai_name}}</p>
                    <p style="color: #71717a; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 14px; margin: 4px 0 0;">{{company_name}}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 24px 40px; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="color: #a1a1aa; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 12px; margin: 0;">
                © {{current_year}} {{company_name}} • Diese E-Mail wurde automatisch versendet
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
WHERE category = 'meeting' AND is_system = true;

-- 4. Info/Product Template
UPDATE email_templates SET html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 40px 30px; text-align: center;">
              <div style="width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 12px; margin: 0 auto 16px; display: inline-block; line-height: 60px; font-size: 28px;">
                📋
              </div>
              <h1 style="color: #ffffff; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 24px; margin: 0; font-weight: 600;">Ihre angeforderten Informationen</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #3f3f46; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                Hallo <strong>{{lead_name}}</strong>,
              </p>
              <p style="color: #3f3f46; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                vielen Dank für Ihr Interesse an unseren Produkten und Dienstleistungen.
              </p>
              <!-- Info Box -->
              <div style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-radius: 12px; padding: 24px; margin: 24px 0;">
                <p style="color: #6b21a8; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 15px; line-height: 1.7; margin: 0;">
                  {{custom_content}}
                </p>
              </div>
              <p style="color: #3f3f46; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                📎 Weitere Details finden Sie in den beigefügten Unterlagen.
              </p>
              <!-- CTA -->
              <div style="text-align: center; margin: 32px 0;">
                <p style="color: #71717a; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 14px; margin: 0 0 16px;">
                  Bereit für den nächsten Schritt?
                </p>
                <a href="mailto:{{company_email}}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: #ffffff; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
                  💬 Beratungstermin vereinbaren
                </a>
              </div>
              <!-- Signature -->
              <table cellpadding="0" cellspacing="0" style="margin-top: 32px; border-top: 1px solid #e4e4e7; padding-top: 24px; width: 100%;">
                <tr>
                  <td style="width: 50px; vertical-align: top;">
                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); border-radius: 50%; text-align: center; line-height: 48px; color: #fff; font-size: 20px; font-weight: 600;">
                      {{ai_initial}}
                    </div>
                  </td>
                  <td style="padding-left: 16px; vertical-align: top;">
                    <p style="color: #18181b; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; margin: 0; font-weight: 600;">{{ai_name}}</p>
                    <p style="color: #71717a; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 14px; margin: 4px 0 0;">{{company_name}}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 24px 40px; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="color: #a1a1aa; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 12px; margin: 0;">
                © {{current_year}} {{company_name}} • Diese E-Mail wurde automatisch versendet
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
WHERE category = 'info' AND is_system = true;

-- 5. Rejection/Goodbye Template
UPDATE email_templates SET html_content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #64748b 0%, #94a3b8 100%); padding: 40px 40px 30px; text-align: center;">
              <div style="width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 12px; margin: 0 auto 16px; display: inline-block; line-height: 60px; font-size: 28px;">
                👋
              </div>
              <h1 style="color: #ffffff; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 24px; margin: 0; font-weight: 600;">Vielen Dank für das Gespräch</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #3f3f46; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                Hallo <strong>{{lead_name}}</strong>,
              </p>
              <p style="color: #3f3f46; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                vielen Dank für das freundliche Gespräch und Ihr Interesse an {{company_name}}.
              </p>
              <p style="color: #3f3f46; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Wir verstehen, dass der Zeitpunkt oder unser Angebot aktuell nicht passend ist. Das ist völlig in Ordnung!
              </p>
              <!-- Friendly Box -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                <p style="color: #475569; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 15px; line-height: 1.6; margin: 0;">
                  🌟 Sollte sich Ihre Situation ändern, freuen wir uns, von Ihnen zu hören.
                </p>
              </div>
              <p style="color: #3f3f46; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 24px 0; text-align: center;">
                Wir wünschen Ihnen alles Gute! 🍀
              </p>
              <!-- Signature -->
              <table cellpadding="0" cellspacing="0" style="margin-top: 32px; border-top: 1px solid #e4e4e7; padding-top: 24px; width: 100%;">
                <tr>
                  <td style="width: 50px; vertical-align: top;">
                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #64748b 0%, #94a3b8 100%); border-radius: 50%; text-align: center; line-height: 48px; color: #fff; font-size: 20px; font-weight: 600;">
                      {{ai_initial}}
                    </div>
                  </td>
                  <td style="padding-left: 16px; vertical-align: top;">
                    <p style="color: #18181b; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 16px; margin: 0; font-weight: 600;">{{ai_name}}</p>
                    <p style="color: #71717a; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 14px; margin: 4px 0 0;">{{company_name}}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 24px 40px; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="color: #a1a1aa; font-family: ''Segoe UI'', Arial, sans-serif; font-size: 12px; margin: 0;">
                © {{current_year}} {{company_name}} • Diese E-Mail wurde automatisch versendet
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
WHERE category = 'rejection' AND is_system = true;