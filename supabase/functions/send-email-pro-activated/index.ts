import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TEMPLATE_KEY = "email_03_pro_activated_v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProActivatedRequest {
  userId: string;
  email: string;
  fullName: string;
  businessId?: string;
  planId?: string;
  setupCompleted?: boolean;
}

// VistaCEO Premium Design System
const BRAND = {
  gradientStart: "#298FDA",
  gradientMid: "#3B79D9",
  gradientEnd: "#5D73E1",
  goldAccent: "#F59E0B",
  goldLight: "#FBBF24",
  backgroundDark: "#0B0F17",
  cardDark: "#0F1624",
  cardPro: "#1A1F2E",
  borderColor: "rgba(255,255,255,0.08)",
  borderGold: "rgba(245,158,11,0.3)",
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.82)",
  textMuted: "rgba(255,255,255,0.62)",
  logoUrl: "https://nlewrgmcawzcdazhfiyy.supabase.co/storage/v1/object/public/email-assets/vistaceo-logo.png?v=1",
};

function generateProActivatedEmail(
  firstName: string,
  dashboardUrl: string,
  setupUrl: string,
  setupCompleted: boolean,
): { html: string; text: string } {
  const utmBase = "utm_source=vistaceo&utm_medium=email&utm_campaign=email_03_pro_activated";
  
  const dashboardUrlWithUtm = `${dashboardUrl}?${utmBase}&utm_content=cta_dashboard`;
  const setupUrlWithUtm = `${setupUrl}?${utmBase}&utm_content=cta_setup`;

  // Dynamic CTA based on setup status
  const primaryCta = setupCompleted
    ? { text: "Abrir Dashboard Pro →", url: dashboardUrlWithUtm }
    : { text: "Completar configuración →", url: setupUrlWithUtm };
  
  const secondaryCta = setupCompleted
    ? { text: "Ver guía rápida", url: dashboardUrlWithUtm }
    : { text: "Entrar al Dashboard Pro", url: dashboardUrlWithUtm };

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>VistaCEO® Pro activado 👑</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    body { margin: 0; padding: 0; background-color: ${BRAND.backgroundDark}; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    table { border-spacing: 0; }
    td { padding: 0; }
    img { border: 0; display: block; }
    
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 16px !important; }
      .content { padding: 24px 20px !important; }
      .cta-btn { width: 100% !important; display: block !important; }
      .hero-title { font-size: 32px !important; }
      .pro-badge { font-size: 14px !important; padding: 8px 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.backgroundDark};">
  <!-- Preview Text -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    Ahora tenés el poder completo de VistaCEO® — análisis profundo, prioridades estratégicas y ejecución sin límites para llevar tu negocio al siguiente nivel.
    ‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.backgroundDark};">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: ${BRAND.cardDark}; border-radius: 20px; border: 1px solid ${BRAND.borderGold}; overflow: hidden; box-shadow: 0 0 60px rgba(245,158,11,0.15);">
          
          <!-- Header with Logo + Pro Badge -->
          <tr>
            <td align="center" style="padding: 32px 40px 24px; border-bottom: 1px solid ${BRAND.borderColor}; background: linear-gradient(180deg, rgba(245,158,11,0.08), transparent);">
              <a href="https://vistaceo.com" target="_blank" style="text-decoration: none;">
                <img src="${BRAND.logoUrl}" alt="VistaCEO® Latinoamérica" width="180" height="auto" style="display: block; max-width: 180px; height: auto;" />
              </a>
              <div class="pro-badge" style="display: inline-block; margin-top: 16px; background: linear-gradient(135deg, ${BRAND.goldAccent}, ${BRAND.goldLight}); color: #000; font-size: 12px; font-weight: 700; padding: 6px 16px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px;">
                👑 PRO ACTIVADO
              </div>
            </td>
          </tr>

          <!-- Hero Section -->
          <tr>
            <td class="content" style="padding: 40px 40px 32px;">
              <!-- Gold Gradient Accent Line -->
              <div style="width: 80px; height: 4px; background: linear-gradient(135deg, ${BRAND.goldAccent}, ${BRAND.gradientEnd}); border-radius: 2px; margin-bottom: 24px;"></div>
              
              <h1 class="hero-title" style="margin: 0 0 8px; font-size: 36px; font-weight: 800; color: ${BRAND.textPrimary}; line-height: 1.2;">
                Pro activado 👑
              </h1>
              <p style="margin: 0 0 24px; font-size: 18px; font-weight: 500; color: ${BRAND.goldAccent}; line-height: 1.4;">
                Bienvenido al nivel estratégico de VistaCEO®
              </p>

              <p style="margin: 0 0 20px; font-size: 16px; color: ${BRAND.textSecondary}; line-height: 1.7;">
                <strong style="color: ${BRAND.textPrimary};">${firstName}</strong>, acabás de desbloquear el modo sin límites. Ahora tenés acceso completo a la inteligencia suprema que analiza, prioriza y ejecuta junto a vos para acelerar el crecimiento de tu negocio.
              </p>

              <p style="margin: 0 0 32px; font-size: 16px; color: ${BRAND.textSecondary}; line-height: 1.7;">
                Tu CEO digital ahora trabaja con máxima potencia: más datos, más precisión, más control sobre cada decisión estratégica.
              </p>

              <!-- Pro Benefits Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(245,158,11,0.1), rgba(93,115,225,0.08)); border-radius: 16px; border: 1px solid ${BRAND.borderGold}; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: ${BRAND.goldAccent}; text-transform: uppercase; letter-spacing: 0.5px;">
                      Tus nuevas capacidades Pro
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 0; vertical-align: top;">
                          <span style="color: ${BRAND.goldAccent}; font-size: 18px; margin-right: 12px;">⚡</span>
                        </td>
                        <td style="padding: 10px 0;">
                          <span style="color: ${BRAND.textPrimary}; font-size: 15px; font-weight: 500;">Misiones ilimitadas</span>
                          <span style="color: ${BRAND.textMuted}; font-size: 14px; display: block; margin-top: 2px;">Ejecutá tantas como necesites</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; vertical-align: top;">
                          <span style="color: ${BRAND.goldAccent}; font-size: 18px; margin-right: 12px;">🔮</span>
                        </td>
                        <td style="padding: 10px 0;">
                          <span style="color: ${BRAND.textPrimary}; font-size: 15px; font-weight: 500;">Predicciones avanzadas</span>
                          <span style="color: ${BRAND.textMuted}; font-size: 14px; display: block; margin-top: 2px;">Anticipate a problemas y oportunidades</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; vertical-align: top;">
                          <span style="color: ${BRAND.goldAccent}; font-size: 18px; margin-right: 12px;">📊</span>
                        </td>
                        <td style="padding: 10px 0;">
                          <span style="color: ${BRAND.textPrimary}; font-size: 15px; font-weight: 500;">Analytics completo</span>
                          <span style="color: ${BRAND.textMuted}; font-size: 14px; display: block; margin-top: 2px;">Métricas profundas de tu negocio</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; vertical-align: top;">
                          <span style="color: ${BRAND.goldAccent}; font-size: 18px; margin-right: 12px;">🧠</span>
                        </td>
                        <td style="padding: 10px 0;">
                          <span style="color: ${BRAND.textPrimary}; font-size: 15px; font-weight: 500;">Brain sin restricciones</span>
                          <span style="color: ${BRAND.textMuted}; font-size: 14px; display: block; margin-top: 2px;">IA que aprende ilimitadamente de vos</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; vertical-align: top;">
                          <span style="color: ${BRAND.goldAccent}; font-size: 18px; margin-right: 12px;">🎯</span>
                        </td>
                        <td style="padding: 10px 0;">
                          <span style="color: ${BRAND.textPrimary}; font-size: 15px; font-weight: 500;">Radar estratégico</span>
                          <span style="color: ${BRAND.textMuted}; font-size: 14px; display: block; margin-top: 2px;">Todas las prioridades, sin filtros</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- First Win Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.cardPro}; border-radius: 16px; border: 1px solid ${BRAND.borderColor};">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: ${BRAND.gradientStart}; text-transform: uppercase; letter-spacing: 0.5px;">
                      🚀 Tu primer win (hoy)
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background: linear-gradient(135deg, ${BRAND.gradientStart}, ${BRAND.gradientEnd}); border-radius: 50%; text-align: center; line-height: 24px; color: white; font-size: 12px; font-weight: 700;">1</div>
                        </td>
                        <td style="padding: 8px 0 8px 12px;">
                          <span style="color: ${BRAND.textPrimary}; font-size: 15px;">Entrá al Dashboard Pro y explorá tu Radar</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background: linear-gradient(135deg, ${BRAND.gradientStart}, ${BRAND.gradientEnd}); border-radius: 50%; text-align: center; line-height: 24px; color: white; font-size: 12px; font-weight: 700;">2</div>
                        </td>
                        <td style="padding: 8px 0 8px 12px;">
                          <span style="color: ${BRAND.textPrimary}; font-size: 15px;">Elegí la primera Misión Pro recomendada</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background: linear-gradient(135deg, ${BRAND.gradientStart}, ${BRAND.gradientEnd}); border-radius: 50%; text-align: center; line-height: 24px; color: white; font-size: 12px; font-weight: 700;">3</div>
                        </td>
                        <td style="padding: 8px 0 8px 12px;">
                          <span style="color: ${BRAND.textPrimary}; font-size: 15px;">Completala y mirá cómo la IA aprende</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Section -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <!-- Primary CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <a href="${primaryCta.url}" target="_blank" class="cta-btn" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.goldAccent}, ${BRAND.goldLight}); color: #000; text-decoration: none; padding: 18px 48px; border-radius: 14px; font-size: 16px; font-weight: 700; min-width: 200px; text-align: center; box-shadow: 0 8px 24px rgba(245,158,11,0.4);">
                      ${primaryCta.text}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <a href="${secondaryCta.url}" target="_blank" class="cta-btn" style="display: inline-block; background: transparent; color: ${BRAND.textSecondary}; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 500; border: 1px solid ${BRAND.borderColor};">
                      ${secondaryCta.text}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Link -->
              <p style="margin: 16px 0 0; font-size: 12px; color: ${BRAND.textMuted}; text-align: center; line-height: 1.6;">
                Si el botón no funciona, abrí este enlace:<br>
                <a href="${primaryCta.url}" style="color: ${BRAND.goldAccent}; text-decoration: underline; word-break: break-all;">${primaryCta.url}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background: linear-gradient(180deg, transparent, rgba(245,158,11,0.05)); border-top: 1px solid ${BRAND.borderColor};">
              <p style="margin: 0 0 8px; font-size: 14px; color: ${BRAND.textSecondary}; text-align: center;">
                ¿Tenés dudas sobre tu plan Pro? Respondé este email.
              </p>
              <p style="margin: 0; font-size: 12px; color: ${BRAND.textMuted}; text-align: center;">
                <a href="mailto:info@vistaceo.com" style="color: ${BRAND.goldAccent}; text-decoration: none;">info@vistaceo.com</a>
              </p>
              <p style="margin: 16px 0 0; font-size: 11px; color: ${BRAND.textMuted}; text-align: center;">
                © ${new Date().getFullYear()} VistaCEO® Latinoamérica. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `
VistaCEO® Pro activado 👑 — inteligencia suprema sin límites

Pro activado 👑
Bienvenido al nivel estratégico de VistaCEO®

${firstName}, acabás de desbloquear el modo sin límites. Ahora tenés acceso completo a la inteligencia suprema que analiza, prioriza y ejecuta junto a vos para acelerar el crecimiento de tu negocio.

Tu CEO digital ahora trabaja con máxima potencia: más datos, más precisión, más control sobre cada decisión estratégica.

Tus nuevas capacidades Pro:
⚡ Misiones ilimitadas - Ejecutá tantas como necesites
🔮 Predicciones avanzadas - Anticipate a problemas y oportunidades
📊 Analytics completo - Métricas profundas de tu negocio
🧠 Brain sin restricciones - IA que aprende ilimitadamente de vos
🎯 Radar estratégico - Todas las prioridades, sin filtros

🚀 Tu primer win (hoy):
1. Entrá al Dashboard Pro y explorá tu Radar
2. Elegí la primera Misión Pro recomendada
3. Completala y mirá cómo la IA aprende

→ ${primaryCta.text}: ${primaryCta.url}

→ ${secondaryCta.text}: ${secondaryCta.url}

---

¿Tenés dudas sobre tu plan Pro? Respondé este email.
info@vistaceo.com

© ${new Date().getFullYear()} VistaCEO® Latinoamérica. Todos los derechos reservados.
`;

  return { html, text };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://vistaceo.com";
  const DASHBOARD_PATH = Deno.env.get("DASHBOARD_PATH") || "/app";

  if (!RESEND_API_KEY) {
    console.log("[Email] RESEND_NOT_CONFIGURED - skipping");
    return new Response(
      JSON.stringify({ status: "skipped", reason: "RESEND_NOT_CONFIGURED" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { userId, email, fullName, businessId, planId, setupCompleted }: ProActivatedRequest = await req.json();

    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: "userId and email are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check idempotency
    const { data: existingEvent } = await supabase
      .from("email_events")
      .select("id, status")
      .eq("user_id", userId)
      .eq("template_key", TEMPLATE_KEY)
      .single();

    if (existingEvent?.status === "sent") {
      console.log(`[Email] Already sent ${TEMPLATE_KEY} to user ${userId}`);
      return new Response(
        JSON.stringify({ status: "skipped", reason: "already_sent" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check setup status if not provided
    let isSetupCompleted = setupCompleted;
    if (isSetupCompleted === undefined && businessId) {
      const { data: business } = await supabase
        .from("businesses")
        .select("setup_completed")
        .eq("id", businessId)
        .single();
      isSetupCompleted = business?.setup_completed || false;
    }

    // Create or update event record
    await supabase.from("email_events").upsert({
      user_id: userId,
      business_id: businessId || null,
      template_key: TEMPLATE_KEY,
      status: "pending",
      metadata: { email, fullName, planId, setupCompleted: isSetupCompleted },
    }, { onConflict: "user_id,template_key" });

    const firstName = fullName?.split(" ")[0] || email.split("@")[0];
    const dashboardUrl = `${APP_BASE_URL}${DASHBOARD_PATH}`;
    const setupUrl = `${APP_BASE_URL}/setup`;

    const { html, text } = generateProActivatedEmail(
      firstName,
      dashboardUrl,
      setupUrl,
      isSetupCompleted || false
    );

    const resend = new Resend(RESEND_API_KEY);
    const emailResponse = await resend.emails.send({
      from: "VistaCEO® Latinoamérica <info@vistaceo.com>",
      replyTo: "info@vistaceo.com",
      to: [email],
      subject: "VistaCEO® Pro activado 👑 — inteligencia suprema sin límites",
      html,
      text,
    });

    console.log(`[Email] Sent ${TEMPLATE_KEY} to ${email}:`, emailResponse);

    // Update event as sent
    await supabase.from("email_events").update({
      status: "sent",
      provider_message_id: emailResponse.data?.id || null,
      sent_at: new Date().toISOString(),
    }).eq("user_id", userId).eq("template_key", TEMPLATE_KEY);

    return new Response(
      JSON.stringify({ success: true, status: "sent", ...emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("[Email] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message, status: "failed" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
