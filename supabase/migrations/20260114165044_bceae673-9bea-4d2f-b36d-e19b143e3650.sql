-- Update all 5 system email templates with professional HTML designs

-- 1. Follow-up Template (Violett/Lila Theme)
UPDATE email_templates SET html_content = '<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vielen Dank für das Gespräch</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: ''Segoe UI'', ''Helvetica Neue'', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 48px 40px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="width: 80px; height: 80px; background-color: rgba(255,255,255,0.2); border-radius: 20px; margin: 0 auto 20px; display: inline-block; line-height: 80px; font-size: 36px; backdrop-filter: blur(10px);">
                      {{company_logo}}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px; font-weight: 700; letter-spacing: -0.5px;">{{company_name}}</h1>
                    <p style="color: rgba(255,255,255,0.85); font-size: 16px; margin: 0;">Ihr Partner für Erfolg</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Badge -->
          <tr>
            <td align="center" style="padding: 0;">
              <div style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; padding: 10px 24px; border-radius: 100px; font-size: 13px; font-weight: 600; margin-top: -20px; position: relative; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
                ✨ Gesprächszusammenfassung
              </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 48px;">
              <h2 style="color: #1e293b; font-size: 26px; margin: 0 0 24px; font-weight: 700; line-height: 1.3;">
                Vielen Dank für das Gespräch, {{lead_first_name}}! 🎉
              </h2>
              
              <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">
                es war mir eine Freude, heute mit Ihnen zu sprechen. Wie versprochen, hier eine kurze Zusammenfassung unseres Gesprächs:
              </p>
              
              <!-- Summary Box -->
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 16px; padding: 28px; margin: 28px 0; border-left: 5px solid #6366f1;">
                <h3 style="color: #1e40af; font-size: 15px; margin: 0 0 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                  📋 Gesprächsnotizen
                </h3>
                <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
                  {{custom_content}}
                </p>
              </div>
              
              <!-- Next Steps -->
              <div style="background-color: #fafafa; border-radius: 16px; padding: 24px; margin: 28px 0;">
                <h3 style="color: #1e293b; font-size: 15px; margin: 0 0 16px; font-weight: 700;">
                  🚀 Nächste Schritte
                </h3>
                <ul style="color: #475569; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Ich melde mich in den nächsten Tagen bei Ihnen</li>
                  <li>Bei Fragen können Sie jederzeit antworten</li>
                  <li>Alle besprochenen Unterlagen finden Sie im Anhang</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="mailto:{{company_email}}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                      Fragen? Jetzt antworten →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Signature -->
              <table cellpadding="0" cellspacing="0" style="margin-top: 40px; border-top: 2px solid #f1f5f9; padding-top: 32px; width: 100%;">
                <tr>
                  <td style="width: 64px; vertical-align: top;">
                    <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px; text-align: center; line-height: 56px; color: #fff; font-size: 22px; font-weight: 700; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);">
                      {{ai_initial}}
                    </div>
                  </td>
                  <td style="padding-left: 16px; vertical-align: top;">
                    <p style="color: #1e293b; font-size: 17px; margin: 0; font-weight: 700;">{{ai_name}}</p>
                    <p style="color: #6366f1; font-size: 14px; margin: 4px 0 0; font-weight: 500;">{{ai_role}}</p>
                    <p style="color: #64748b; font-size: 14px; margin: 4px 0 0;">{{company_name}}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); padding: 32px 48px; border-top: 1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="color: #64748b; font-size: 14px; margin: 0 0 8px;">
                      📧 {{company_email}} • 📞 {{company_phone}}
                    </p>
                    <p style="color: #64748b; font-size: 14px; margin: 0 0 16px;">
                      🌐 {{company_website}}
                    </p>
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                      © {{current_year}} {{company_name}} • Diese E-Mail wurde automatisch versendet
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
WHERE category = 'follow-up' AND is_system = true;

-- 2. Angebot/Quote Template (Grün Theme)
UPDATE email_templates SET html_content = '<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ihr persönliches Angebot</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: ''Segoe UI'', ''Helvetica Neue'', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%); padding: 48px 40px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="width: 80px; height: 80px; background-color: rgba(255,255,255,0.2); border-radius: 20px; margin: 0 auto 20px; display: inline-block; line-height: 80px; font-size: 36px;">
                      {{company_logo}}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px; font-weight: 700;">{{company_name}}</h1>
                    <p style="color: rgba(255,255,255,0.85); font-size: 16px; margin: 0;">Qualität, die überzeugt</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Badge -->
          <tr>
            <td align="center" style="padding: 0;">
              <div style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; padding: 10px 24px; border-radius: 100px; font-size: 13px; font-weight: 600; margin-top: -20px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);">
                💎 Exklusives Angebot
              </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 48px;">
              <h2 style="color: #1e293b; font-size: 26px; margin: 0 0 24px; font-weight: 700;">
                Ihr persönliches Angebot, {{lead_first_name}}!
              </h2>
              
              <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">
                vielen Dank für Ihr Interesse! Basierend auf unserem Gespräch habe ich ein maßgeschneidertes Angebot für Sie erstellt:
              </p>
              
              <!-- Price Highlight Box -->
              <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 20px; padding: 32px; margin: 28px 0; text-align: center; border: 2px solid #10b981;">
                <p style="color: #059669; font-size: 14px; margin: 0 0 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Gesamtbetrag</p>
                <p style="color: #047857; font-size: 42px; margin: 0; font-weight: 800;">{{offer_total}}</p>
                <p style="color: #059669; font-size: 14px; margin: 12px 0 0;">inkl. MwSt. • Gültig bis {{offer_valid_until}}</p>
              </div>
              
              <!-- Offer Details -->
              <div style="background-color: #fafafa; border-radius: 16px; padding: 28px; margin: 28px 0;">
                <h3 style="color: #1e293b; font-size: 15px; margin: 0 0 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                  📦 Leistungsübersicht
                </h3>
                <p style="color: #475569; font-size: 15px; line-height: 1.8; margin: 0;">
                  {{custom_content}}
                </p>
              </div>
              
              <!-- Trust Elements -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                <tr>
                  <td width="33%" align="center" style="padding: 16px;">
                    <div style="font-size: 28px; margin-bottom: 8px;">✅</div>
                    <p style="color: #475569; font-size: 13px; margin: 0; font-weight: 600;">Zufriedenheits-<br>garantie</p>
                  </td>
                  <td width="33%" align="center" style="padding: 16px;">
                    <div style="font-size: 28px; margin-bottom: 8px;">🚀</div>
                    <p style="color: #475569; font-size: 13px; margin: 0; font-weight: 600;">Schnelle<br>Umsetzung</p>
                  </td>
                  <td width="33%" align="center" style="padding: 16px;">
                    <div style="font-size: 28px; margin-bottom: 8px;">💬</div>
                    <p style="color: #475569; font-size: 13px; margin: 0; font-weight: 600;">Persönlicher<br>Support</p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="mailto:{{company_email}}?subject=Angebot%20annehmen" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-weight: 700; font-size: 17px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.4);">
                      ✓ Angebot annehmen
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <a href="mailto:{{company_email}}?subject=Fragen%20zum%20Angebot" style="color: #059669; text-decoration: none; font-size: 14px; font-weight: 600;">
                      Fragen? Kontaktieren Sie mich →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Attachment Hint -->
              <div style="background-color: #fffbeb; border-radius: 12px; padding: 16px 20px; margin: 24px 0; border-left: 4px solid #f59e0b;">
                <p style="color: #92400e; font-size: 14px; margin: 0;">
                  📎 <strong>Anhang:</strong> Das vollständige Angebot als PDF finden Sie im Anhang dieser E-Mail.
                </p>
              </div>
              
              <!-- Signature -->
              <table cellpadding="0" cellspacing="0" style="margin-top: 40px; border-top: 2px solid #f1f5f9; padding-top: 32px; width: 100%;">
                <tr>
                  <td style="width: 64px; vertical-align: top;">
                    <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 16px; text-align: center; line-height: 56px; color: #fff; font-size: 22px; font-weight: 700;">
                      {{ai_initial}}
                    </div>
                  </td>
                  <td style="padding-left: 16px; vertical-align: top;">
                    <p style="color: #1e293b; font-size: 17px; margin: 0; font-weight: 700;">{{ai_name}}</p>
                    <p style="color: #059669; font-size: 14px; margin: 4px 0 0; font-weight: 500;">{{ai_role}}</p>
                    <p style="color: #64748b; font-size: 14px; margin: 4px 0 0;">{{company_name}}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); padding: 32px 48px; border-top: 1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="color: #64748b; font-size: 14px; margin: 0 0 8px;">
                      📧 {{company_email}} • 📞 {{company_phone}}
                    </p>
                    <p style="color: #64748b; font-size: 14px; margin: 0 0 16px;">
                      🌐 {{company_website}}
                    </p>
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                      © {{current_year}} {{company_name}} • Diese E-Mail wurde automatisch versendet
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
WHERE category = 'quote' AND is_system = true;

-- 3. Termin/Meeting Template (Blau Theme)
UPDATE email_templates SET html_content = '<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ihr Termin ist bestätigt</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: ''Segoe UI'', ''Helvetica Neue'', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%); padding: 48px 40px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="width: 80px; height: 80px; background-color: rgba(255,255,255,0.2); border-radius: 20px; margin: 0 auto 20px; display: inline-block; line-height: 80px; font-size: 36px;">
                      {{company_logo}}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px; font-weight: 700;">{{company_name}}</h1>
                    <p style="color: rgba(255,255,255,0.85); font-size: 16px; margin: 0;">Wir freuen uns auf Sie!</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Badge -->
          <tr>
            <td align="center" style="padding: 0;">
              <div style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; padding: 10px 24px; border-radius: 100px; font-size: 13px; font-weight: 600; margin-top: -20px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
                ✓ Termin bestätigt
              </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 48px;">
              <h2 style="color: #1e293b; font-size: 26px; margin: 0 0 24px; font-weight: 700;">
                Hallo {{lead_first_name}}, Ihr Termin steht! 📅
              </h2>
              
              <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">
                Vielen Dank für Ihre Terminbuchung. Hier sind alle Details:
              </p>
              
              <!-- Calendar Card -->
              <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 20px; overflow: hidden; margin: 28px 0; border: 2px solid #3b82f6;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="100" style="background: linear-gradient(180deg, #2563eb, #1d4ed8); text-align: center; padding: 24px 16px;">
                      <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0 0 4px; text-transform: uppercase; font-weight: 600;">Termin</p>
                      <p style="color: #ffffff; font-size: 36px; margin: 0; font-weight: 800;">📆</p>
                    </td>
                    <td style="padding: 24px 28px;">
                      <p style="color: #1e40af; font-size: 20px; margin: 0 0 8px; font-weight: 700;">{{meeting_date}}</p>
                      <p style="color: #3b82f6; font-size: 24px; margin: 0; font-weight: 800;">{{meeting_time}}</p>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Meeting Link -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="{{meeting_link}}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-weight: 700; font-size: 17px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
                      🎥 Zum Video-Meeting beitreten
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 12px;">
                    <p style="color: #64748b; font-size: 13px; margin: 0;">
                      Link: {{meeting_link}}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Preparation Tips -->
              <div style="background-color: #fafafa; border-radius: 16px; padding: 28px; margin: 28px 0;">
                <h3 style="color: #1e293b; font-size: 15px; margin: 0 0 20px; font-weight: 700;">
                  💡 Tipps zur Vorbereitung
                </h3>
                <ul style="color: #475569; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Stellen Sie eine stabile Internetverbindung sicher</li>
                  <li>Testen Sie Kamera und Mikrofon vorab</li>
                  <li>Halten Sie relevante Unterlagen bereit</li>
                  <li>Seien Sie ca. 5 Minuten vor Beginn online</li>
                </ul>
              </div>
              
              <!-- Reminder Info -->
              <div style="background-color: #fef3c7; border-radius: 12px; padding: 16px 20px; margin: 24px 0; border-left: 4px solid #f59e0b;">
                <p style="color: #92400e; font-size: 14px; margin: 0;">
                  ⏰ <strong>Erinnerung:</strong> Sie erhalten 15 Minuten vor dem Termin eine automatische Erinnerung.
                </p>
              </div>
              
              <!-- Additional Info -->
              <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 24px 0;">
                {{custom_content}}
              </p>
              
              <!-- Reschedule Link -->
              <p style="color: #64748b; font-size: 14px; margin: 24px 0; text-align: center;">
                Termin passt nicht? <a href="mailto:{{company_email}}?subject=Terminverschiebung" style="color: #2563eb; text-decoration: none; font-weight: 600;">Termin verschieben →</a>
              </p>
              
              <!-- Signature -->
              <table cellpadding="0" cellspacing="0" style="margin-top: 40px; border-top: 2px solid #f1f5f9; padding-top: 32px; width: 100%;">
                <tr>
                  <td style="width: 64px; vertical-align: top;">
                    <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); border-radius: 16px; text-align: center; line-height: 56px; color: #fff; font-size: 22px; font-weight: 700;">
                      {{ai_initial}}
                    </div>
                  </td>
                  <td style="padding-left: 16px; vertical-align: top;">
                    <p style="color: #1e293b; font-size: 17px; margin: 0; font-weight: 700;">{{ai_name}}</p>
                    <p style="color: #2563eb; font-size: 14px; margin: 4px 0 0; font-weight: 500;">{{ai_role}}</p>
                    <p style="color: #64748b; font-size: 14px; margin: 4px 0 0;">{{company_name}}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); padding: 32px 48px; border-top: 1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="color: #64748b; font-size: 14px; margin: 0 0 8px;">
                      📧 {{company_email}} • 📞 {{company_phone}}
                    </p>
                    <p style="color: #64748b; font-size: 14px; margin: 0 0 16px;">
                      🌐 {{company_website}}
                    </p>
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                      © {{current_year}} {{company_name}} • Diese E-Mail wurde automatisch versendet
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
WHERE category = 'meeting' AND is_system = true;

-- 4. Info Template (Lila/Magenta Theme)
UPDATE email_templates SET html_content = '<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ihre gewünschten Informationen</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: ''Segoe UI'', ''Helvetica Neue'', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a855f7 100%); padding: 48px 40px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="width: 80px; height: 80px; background-color: rgba(255,255,255,0.2); border-radius: 20px; margin: 0 auto 20px; display: inline-block; line-height: 80px; font-size: 36px;">
                      {{company_logo}}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px; font-weight: 700;">{{company_name}}</h1>
                    <p style="color: rgba(255,255,255,0.85); font-size: 16px; margin: 0;">Wissen, das weiterbringt</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Badge -->
          <tr>
            <td align="center" style="padding: 0;">
              <div style="display: inline-block; background: linear-gradient(135deg, #ec4899, #db2777); color: #ffffff; padding: 10px 24px; border-radius: 100px; font-size: 13px; font-weight: 600; margin-top: -20px; box-shadow: 0 4px 14px rgba(236, 72, 153, 0.4);">
                📚 Ihre Informationen
              </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 48px;">
              <h2 style="color: #1e293b; font-size: 26px; margin: 0 0 24px; font-weight: 700;">
                Hallo {{lead_first_name}}, hier sind Ihre Infos! 📖
              </h2>
              
              <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">
                wie gewünscht sende ich Ihnen die besprochenen Informationen zu unseren Leistungen:
              </p>
              
              <!-- Feature Highlights -->
              <div style="margin: 32px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-radius: 16px; padding: 24px; margin-bottom: 16px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="50" style="vertical-align: top;">
                            <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #7c3aed, #8b5cf6); border-radius: 12px; text-align: center; line-height: 44px; font-size: 20px;">🎯</div>
                          </td>
                          <td style="padding-left: 16px; vertical-align: top;">
                            <p style="color: #1e293b; font-size: 16px; margin: 0 0 4px; font-weight: 700;">Maßgeschneiderte Lösungen</p>
                            <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.5;">Individuell auf Ihre Bedürfnisse abgestimmt</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr><td style="height: 12px;"></td></tr>
                  <tr>
                    <td style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-radius: 16px; padding: 24px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="50" style="vertical-align: top;">
                            <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #7c3aed, #8b5cf6); border-radius: 12px; text-align: center; line-height: 44px; font-size: 20px;">⚡</div>
                          </td>
                          <td style="padding-left: 16px; vertical-align: top;">
                            <p style="color: #1e293b; font-size: 16px; margin: 0 0 4px; font-weight: 700;">Schnelle Umsetzung</p>
                            <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.5;">Effiziente Prozesse für schnelle Ergebnisse</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr><td style="height: 12px;"></td></tr>
                  <tr>
                    <td style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-radius: 16px; padding: 24px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="50" style="vertical-align: top;">
                            <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #7c3aed, #8b5cf6); border-radius: 12px; text-align: center; line-height: 44px; font-size: 20px;">🤝</div>
                          </td>
                          <td style="padding-left: 16px; vertical-align: top;">
                            <p style="color: #1e293b; font-size: 16px; margin: 0 0 4px; font-weight: 700;">Persönliche Betreuung</p>
                            <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.5;">Ein fester Ansprechpartner für alle Anliegen</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Info Content -->
              <div style="background: linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%); border-radius: 16px; padding: 28px; margin: 28px 0; border-left: 5px solid #7c3aed;">
                <h3 style="color: #5b21b6; font-size: 15px; margin: 0 0 16px; font-weight: 700;">
                  📋 Details
                </h3>
                <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
                  {{custom_content}}
                </p>
              </div>
              
              <!-- Attachment Hint -->
              <div style="background-color: #fafafa; border-radius: 16px; padding: 24px; margin: 28px 0;">
                <h3 style="color: #1e293b; font-size: 15px; margin: 0 0 16px; font-weight: 700;">
                  📎 Anhänge
                </h3>
                <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0;">
                  Alle relevanten Dokumente und Informationsmaterialien finden Sie im Anhang dieser E-Mail.
                </p>
              </div>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="mailto:{{company_email}}?subject=Rückfrage%20zu%20Informationen" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
                      Fragen? Jetzt kontaktieren →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Signature -->
              <table cellpadding="0" cellspacing="0" style="margin-top: 40px; border-top: 2px solid #f1f5f9; padding-top: 32px; width: 100%;">
                <tr>
                  <td style="width: 64px; vertical-align: top;">
                    <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); border-radius: 16px; text-align: center; line-height: 56px; color: #fff; font-size: 22px; font-weight: 700;">
                      {{ai_initial}}
                    </div>
                  </td>
                  <td style="padding-left: 16px; vertical-align: top;">
                    <p style="color: #1e293b; font-size: 17px; margin: 0; font-weight: 700;">{{ai_name}}</p>
                    <p style="color: #7c3aed; font-size: 14px; margin: 4px 0 0; font-weight: 500;">{{ai_role}}</p>
                    <p style="color: #64748b; font-size: 14px; margin: 4px 0 0;">{{company_name}}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); padding: 32px 48px; border-top: 1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="color: #64748b; font-size: 14px; margin: 0 0 8px;">
                      📧 {{company_email}} • 📞 {{company_phone}}
                    </p>
                    <p style="color: #64748b; font-size: 14px; margin: 0 0 16px;">
                      🌐 {{company_website}}
                    </p>
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                      © {{current_year}} {{company_name}} • Diese E-Mail wurde automatisch versendet
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
WHERE category = 'info' AND is_system = true;

-- 5. Absage/Rejection Template (Warm Grey Theme)
UPDATE email_templates SET html_content = '<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vielen Dank für Ihr Interesse</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: ''Segoe UI'', ''Helvetica Neue'', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #475569 0%, #64748b 50%, #94a3b8 100%); padding: 48px 40px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="width: 80px; height: 80px; background-color: rgba(255,255,255,0.2); border-radius: 20px; margin: 0 auto 20px; display: inline-block; line-height: 80px; font-size: 36px;">
                      {{company_logo}}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px; font-weight: 700;">{{company_name}}</h1>
                    <p style="color: rgba(255,255,255,0.85); font-size: 16px; margin: 0;">Vielen Dank für Ihre Zeit</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 48px;">
              <h2 style="color: #1e293b; font-size: 26px; margin: 0 0 24px; font-weight: 700;">
                Hallo {{lead_first_name}} 👋
              </h2>
              
              <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">
                vielen Dank, dass Sie sich die Zeit für unser Gespräch genommen haben. Wir schätzen Ihr Interesse an {{company_name}} sehr.
              </p>
              
              <!-- Understanding Box -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; padding: 28px; margin: 28px 0; border-left: 5px solid #64748b;">
                <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
                  Wir verstehen, dass der Zeitpunkt aktuell nicht der richtige ist. Das ist völlig in Ordnung – wir sind jederzeit für Sie da, wenn sich Ihre Situation ändert.
                </p>
              </div>
              
              <!-- Additional Message -->
              <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 24px 0;">
                {{custom_content}}
              </p>
              
              <!-- Future Contact Box -->
              <div style="background-color: #fafafa; border-radius: 16px; padding: 28px; margin: 28px 0; text-align: center;">
                <p style="font-size: 32px; margin: 0 0 16px;">🌱</p>
                <h3 style="color: #1e293b; font-size: 18px; margin: 0 0 12px; font-weight: 700;">
                  Vielleicht ein andermal?
                </h3>
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">
                  Sollte sich Ihre Situation ändern oder Sie in Zukunft Bedarf haben,<br>sind wir nur eine E-Mail entfernt.
                </p>
              </div>
              
              <!-- Stay Connected -->
              <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 16px; padding: 24px; margin: 28px 0; text-align: center;">
                <p style="color: #1e40af; font-size: 15px; margin: 0 0 16px; font-weight: 600;">
                  📬 Bleiben Sie informiert über Neuigkeiten und Angebote
                </p>
                <a href="{{company_website}}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                  Website besuchen
                </a>
              </div>
              
              <!-- Feedback Request -->
              <div style="text-align: center; margin: 32px 0; padding: 24px; border: 2px dashed #e2e8f0; border-radius: 16px;">
                <p style="color: #64748b; font-size: 14px; margin: 0 0 12px;">
                  💬 Haben Sie Feedback für uns? Wir lernen gerne dazu!
                </p>
                <a href="mailto:{{company_email}}?subject=Feedback" style="color: #2563eb; text-decoration: none; font-size: 14px; font-weight: 600;">
                  Feedback geben →
                </a>
              </div>
              
              <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 24px 0;">
                Wir wünschen Ihnen alles Gute und viel Erfolg! 🍀
              </p>
              
              <!-- Signature -->
              <table cellpadding="0" cellspacing="0" style="margin-top: 40px; border-top: 2px solid #f1f5f9; padding-top: 32px; width: 100%;">
                <tr>
                  <td style="width: 64px; vertical-align: top;">
                    <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #475569 0%, #64748b 100%); border-radius: 16px; text-align: center; line-height: 56px; color: #fff; font-size: 22px; font-weight: 700;">
                      {{ai_initial}}
                    </div>
                  </td>
                  <td style="padding-left: 16px; vertical-align: top;">
                    <p style="color: #1e293b; font-size: 17px; margin: 0; font-weight: 700;">{{ai_name}}</p>
                    <p style="color: #64748b; font-size: 14px; margin: 4px 0 0; font-weight: 500;">{{ai_role}}</p>
                    <p style="color: #64748b; font-size: 14px; margin: 4px 0 0;">{{company_name}}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); padding: 32px 48px; border-top: 1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="color: #64748b; font-size: 14px; margin: 0 0 8px;">
                      📧 {{company_email}} • 📞 {{company_phone}}
                    </p>
                    <p style="color: #64748b; font-size: 14px; margin: 0 0 16px;">
                      🌐 {{company_website}}
                    </p>
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                      © {{current_year}} {{company_name}} • Diese E-Mail wurde automatisch versendet
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>'
WHERE category = 'rejection' AND is_system = true;