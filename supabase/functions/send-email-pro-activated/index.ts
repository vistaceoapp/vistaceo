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
  // Email-safe hosted assets (absolute URLs required for email clients)
  logoUrl: "https://nlewrgmcawzcdazhfiyy.supabase.co/storage/v1/object/public/email-assets/vistaceo-logo-white.png?v=3",
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
    body { margin: 0; padding: 0; background-color: ${BRAND.backgroundDark}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    td { padding: 0; }
    img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; display: block; }
    a { color: ${BRAND.goldAccent}; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.backgroundDark}; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    Ahora tenés el poder completo de VistaCEO® — análisis profundo, prioridades estratégicas y ejecución sin límites.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BRAND.backgroundDark};">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <!--[if mso]><table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td><![endif]-->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 560px; margin: 0 auto; background-color: ${BRAND.cardDark}; border-radius: 16px; border: 1px solid ${BRAND.borderGold}; box-shadow: 0 0 40px rgba(245,158,11,0.1);">
          
          <!-- HEADER -->
          <tr>
            <td style="padding: 32px 24px; text-align: center; border-bottom: 1px solid ${BRAND.borderColor}; background: linear-gradient(180deg, rgba(245,158,11,0.06), transparent);">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <img src="${BRAND.logoUrl}" alt="VistaCEO" width="160" height="40" style="display: block; width: 160px; max-width: 160px; height: auto; margin: 0 auto;" />
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background: linear-gradient(135deg, ${BRAND.goldAccent}, ${BRAND.goldLight}); border-radius: 20px; padding: 6px 16px;">
                          <span style="color: #000; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">👑 PRO ACTIVADO</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding: 32px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 20px;">
                    <div style="width: 60px; height: 3px; background: linear-gradient(135deg, ${BRAND.goldAccent}, ${BRAND.gradientEnd}); border-radius: 2px;"></div>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 28px; font-weight: 700; color: ${BRAND.textPrimary}; padding-bottom: 8px; line-height: 1.2;">
                    Pro activado 👑
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 16px; font-weight: 500; color: ${BRAND.goldAccent}; padding-bottom: 24px; line-height: 1.4;">
                    Bienvenido al nivel estratégico de VistaCEO®
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 15px; color: ${BRAND.textSecondary}; line-height: 1.7; padding-bottom: 16px;">
                    <strong style="color: ${BRAND.textPrimary};">${firstName}</strong>, acabás de desbloquear el modo sin límites. Ahora tenés acceso completo a la inteligencia suprema que analiza, prioriza y ejecuta junto a vos para acelerar el crecimiento de tu negocio.
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 15px; color: ${BRAND.textSecondary}; line-height: 1.7; padding-bottom: 28px;">
                    Tu CEO digital ahora trabaja con máxima potencia: más datos, más precisión, más control sobre cada decisión estratégica.
                  </td>
                </tr>
              </table>

              <!-- PRO BENEFITS CARD -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(93,115,225,0.06)); border-radius: 12px; border: 1px solid ${BRAND.borderGold}; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-size: 12px; font-weight: 600; color: ${BRAND.goldAccent}; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 16px;">
                          TUS NUEVAS CAPACIDADES PRO
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: ${BRAND.textPrimary}; padding: 5px 0;">
                          ⚡ &nbsp;<strong>Misiones ilimitadas</strong> <span style="color: ${BRAND.textMuted};">— Ejecutá tantas como necesites</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: ${BRAND.textPrimary}; padding: 5px 0;">
                          🔮 &nbsp;<strong>Predicciones avanzadas</strong> <span style="color: ${BRAND.textMuted};">— Anticipate a problemas</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: ${BRAND.textPrimary}; padding: 5px 0;">
                          📊 &nbsp;<strong>Analytics completo</strong> <span style="color: ${BRAND.textMuted};">— Métricas profundas</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: ${BRAND.textPrimary}; padding: 5px 0;">
                          🧠 &nbsp;<strong>Brain sin restricciones</strong> <span style="color: ${BRAND.textMuted};">— IA ilimitada</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: ${BRAND.textPrimary}; padding: 5px 0;">
                          🎯 &nbsp;<strong>Radar estratégico</strong> <span style="color: ${BRAND.textMuted};">— Todas las prioridades</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- FIRST WIN CARD -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${BRAND.cardPro}; border-radius: 12px; border: 1px solid ${BRAND.borderColor};">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-size: 12px; font-weight: 600; color: ${BRAND.gradientStart}; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 14px;">
                          🚀 TU PRIMER WIN (HOY)
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: ${BRAND.textPrimary}; padding: 5px 0;">
                          <span style="display: inline-block; width: 20px; height: 20px; background: ${BRAND.gradientStart}; border-radius: 50%; color: white; text-align: center; line-height: 20px; font-size: 11px; font-weight: 700; margin-right: 10px;">1</span>
                          Entrá al Dashboard Pro y explorá tu Radar
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: ${BRAND.textPrimary}; padding: 5px 0;">
                          <span style="display: inline-block; width: 20px; height: 20px; background: ${BRAND.gradientStart}; border-radius: 50%; color: white; text-align: center; line-height: 20px; font-size: 11px; font-weight: 700; margin-right: 10px;">2</span>
                          Elegí la primera Misión Pro recomendada
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: ${BRAND.textPrimary}; padding: 5px 0;">
                          <span style="display: inline-block; width: 20px; height: 20px; background: ${BRAND.gradientStart}; border-radius: 50%; color: white; text-align: center; line-height: 20px; font-size: 11px; font-weight: 700; margin-right: 10px;">3</span>
                          Completala y mirá cómo la IA aprende
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA SECTION -->
          <tr>
            <td style="padding: 0 24px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="background: linear-gradient(135deg, ${BRAND.goldAccent}, ${BRAND.goldLight}); border-radius: 12px;">
                          <a href="${primaryCta.url}" target="_blank" style="display: block; padding: 16px 24px; color: #000000; font-size: 15px; font-weight: 700; text-decoration: none; text-align: center;">
                            ${primaryCta.text}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="border: 1px solid ${BRAND.borderColor}; border-radius: 10px;">
                          <a href="${secondaryCta.url}" target="_blank" style="display: block; padding: 14px 24px; color: ${BRAND.textSecondary}; font-size: 14px; font-weight: 500; text-decoration: none; text-align: center;">
                            ${secondaryCta.text}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 11px; color: ${BRAND.textMuted}; text-align: center; line-height: 1.6; padding-top: 8px;">
                    Si el botón no funciona, copiá este enlace:<br>
                    <a href="${primaryCta.url}" style="color: ${BRAND.goldAccent}; word-break: break-all;">${primaryCta.url}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 24px; background: linear-gradient(180deg, transparent, rgba(245,158,11,0.03)); border-top: 1px solid ${BRAND.borderColor}; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-size: 13px; color: ${BRAND.textSecondary}; padding-bottom: 8px;">
                    ¿Tenés dudas sobre tu plan Pro? Respondé este email.
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: ${BRAND.textMuted};">
                    <a href="mailto:info@vistaceo.com" style="color: ${BRAND.goldAccent}; text-decoration: none;">info@vistaceo.com</a>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 11px; color: ${BRAND.textMuted}; padding-top: 16px;">
                    © ${new Date().getFullYear()} VistaCEO® Latinoamérica
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!--[if mso]></td></tr></table><![endif]-->
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
      subject: "¡Felicitaciones! Pro activado 👑 Inteligencia suprema sin límites",
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
