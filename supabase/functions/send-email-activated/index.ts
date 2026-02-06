import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TEMPLATE_KEY = "email_01_activated_configured_v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ActivatedEmailRequest {
  userId: string;
  email: string;
  fullName: string;
  businessId?: string;
  businessName?: string;
}

// VistaCEO Premium Design System
const BRAND = {
  gradientStart: "#298FDA",
  gradientMid: "#3B79D9", 
  gradientEnd: "#5D73E1",
  backgroundDark: "#0B0F17",
  cardDark: "#0F1624",
  borderColor: "rgba(255,255,255,0.08)",
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.82)",
  textMuted: "rgba(255,255,255,0.62)",
  logoUrl: "https://nlewrgmcawzcdazhfiyy.supabase.co/storage/v1/object/public/email-assets/vistaceo-logo.png?v=1",
};

function generateActivatedEmail(
  firstName: string,
  dashboardUrl: string,
  setupUrl: string,
): { html: string; text: string } {
  const utmBase = "utm_source=vistaceo&utm_medium=email&utm_campaign=email_01_activated";
  
  const dashboardUrlWithUtm = `${dashboardUrl}?${utmBase}&utm_content=cta_primary`;
  const setupUrlWithUtm = `${setupUrl}?${utmBase}&utm_content=cta_secondary`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>VistaCEO® activado</title>
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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    body { margin: 0; padding: 0; background-color: ${BRAND.backgroundDark}; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    table { border-spacing: 0; }
    td { padding: 0; }
    img { border: 0; display: block; }
    
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 16px !important; }
      .content { padding: 24px 20px !important; }
      .cta-btn { width: 100% !important; display: block !important; }
      .hero-title { font-size: 28px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.backgroundDark};">
  <!-- Preview Text -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    La IA ya está calibrándose a tu contexto de negocio o servicio de manera personalizada — prioridades más precisas y crecimiento más rápido.
    ‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.backgroundDark};">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: ${BRAND.cardDark}; border-radius: 20px; border: 1px solid ${BRAND.borderColor}; overflow: hidden;">
          
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding: 32px 40px 24px; border-bottom: 1px solid ${BRAND.borderColor};">
              <a href="https://vistaceo.com" target="_blank" style="text-decoration: none;">
                <img src="${BRAND.logoUrl}" alt="VistaCEO® Latinoamérica" width="180" height="auto" style="display: block; max-width: 180px; height: auto;" />
              </a>
            </td>
          </tr>

          <!-- Hero Section -->
          <tr>
            <td class="content" style="padding: 40px 40px 32px;">
              <!-- Gradient Accent Line -->
              <div style="width: 60px; height: 4px; background: linear-gradient(135deg, ${BRAND.gradientStart}, ${BRAND.gradientEnd}); border-radius: 2px; margin-bottom: 24px;"></div>
              
              <h1 class="hero-title" style="margin: 0 0 8px; font-size: 32px; font-weight: 700; color: ${BRAND.textPrimary}; line-height: 1.2;">
                Bienvenido
              </h1>
              <p style="margin: 0 0 24px; font-size: 20px; font-weight: 500; color: ${BRAND.textSecondary}; line-height: 1.4;">
                Tu CEO digital te está esperando
              </p>

              <p style="margin: 0 0 24px; font-size: 16px; color: ${BRAND.textSecondary}; line-height: 1.7;">
                <strong style="color: ${BRAND.textPrimary};">${firstName}</strong>, acabás de activar la inteligencia suprema que toma el control de tu negocio. A partir de ahora, nuestra IA aprende día a día de tus decisiones, contexto y mercado para darte la dirección exacta hacia el crecimiento.
              </p>

              <p style="margin: 0 0 32px; font-size: 16px; color: ${BRAND.textSecondary}; line-height: 1.7;">
                Ya no estarás solo: tenés un copiloto digital que analiza, prioriza y te guía con acciones concretas, las 24 horas.
              </p>

              <!-- Action Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(41,143,218,0.1), rgba(93,115,225,0.1)); border-radius: 16px; border: 1px solid ${BRAND.borderColor};">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: ${BRAND.gradientStart}; text-transform: uppercase; letter-spacing: 0.5px;">
                      Tu próximo paso
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top;">
                          <span style="color: ${BRAND.gradientStart}; font-size: 16px; margin-right: 12px;">✓</span>
                        </td>
                        <td style="padding: 8px 0;">
                          <span style="color: ${BRAND.textPrimary}; font-size: 15px;">Explorá tu Radar de prioridades en el Dashboard</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top;">
                          <span style="color: ${BRAND.gradientStart}; font-size: 16px; margin-right: 12px;">✓</span>
                        </td>
                        <td style="padding: 8px 0;">
                          <span style="color: ${BRAND.textPrimary}; font-size: 15px;">Completá tu primera Misión guiada</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top;">
                          <span style="color: ${BRAND.gradientStart}; font-size: 16px; margin-right: 12px;">✓</span>
                        </td>
                        <td style="padding: 8px 0;">
                          <span style="color: ${BRAND.textPrimary}; font-size: 15px;">Mirá cómo la IA aprende de tu negocio</span>
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
                    <a href="${dashboardUrlWithUtm}" target="_blank" class="cta-btn" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.gradientStart}, ${BRAND.gradientEnd}); color: ${BRAND.textPrimary}; text-decoration: none; padding: 18px 48px; border-radius: 14px; font-size: 16px; font-weight: 600; min-width: 200px; text-align: center; box-shadow: 0 8px 24px rgba(41,143,218,0.3);">
                      Entrar al dashboard →
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <a href="${setupUrlWithUtm}" target="_blank" class="cta-btn" style="display: inline-block; background: transparent; color: ${BRAND.textSecondary}; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 500; border: 1px solid ${BRAND.borderColor};">
                      Editar configuración
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Link -->
              <p style="margin: 16px 0 0; font-size: 12px; color: ${BRAND.textMuted}; text-align: center; line-height: 1.6;">
                Si el botón no funciona, abrí este enlace:<br>
                <a href="${dashboardUrlWithUtm}" style="color: ${BRAND.gradientStart}; text-decoration: underline; word-break: break-all;">${dashboardUrlWithUtm}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: rgba(0,0,0,0.3); border-top: 1px solid ${BRAND.borderColor};">
              <p style="margin: 0 0 8px; font-size: 14px; color: ${BRAND.textSecondary}; text-align: center;">
                ¿Tenés dudas? Respondé este email y te ayudamos.
              </p>
              <p style="margin: 0; font-size: 12px; color: ${BRAND.textMuted}; text-align: center;">
                <a href="mailto:info@vistaceo.com" style="color: ${BRAND.gradientStart}; text-decoration: none;">info@vistaceo.com</a>
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
VistaCEO® activado: tu inteligencia suprema ya está operativa

Bienvenido
Tu CEO digital te está esperando

${firstName}, acabás de activar la inteligencia suprema que toma el control de tu negocio. A partir de ahora, nuestra IA aprende día a día de tus decisiones, contexto y mercado para darte la dirección exacta hacia el crecimiento.

Ya no estarás solo: tenés un copiloto digital que analiza, prioriza y te guía con acciones concretas, las 24 horas.

Tu próximo paso:
✓ Explorá tu Radar de prioridades en el Dashboard
✓ Completá tu primera Misión guiada  
✓ Mirá cómo la IA aprende de tu negocio

→ Entrar al dashboard: ${dashboardUrlWithUtm}

→ Editar configuración: ${setupUrlWithUtm}

---

¿Tenés dudas? Respondé este email y te ayudamos.
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

  // Validate required env vars
  if (!RESEND_API_KEY) {
    console.log("[Email] RESEND_NOT_CONFIGURED - skipping email");
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
    const { userId, email, fullName, businessId }: ActivatedEmailRequest = await req.json();

    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: "userId and email are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check idempotency - don't send duplicate
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

    // Create or update event record
    const { error: upsertError } = await supabase
      .from("email_events")
      .upsert({
        user_id: userId,
        business_id: businessId || null,
        template_key: TEMPLATE_KEY,
        status: "pending",
        metadata: { email, fullName },
      }, { onConflict: "user_id,template_key" });

    if (upsertError) {
      console.error("[Email] Failed to create event:", upsertError);
    }

    const firstName = fullName?.split(" ")[0] || email.split("@")[0];
    const dashboardUrl = `${APP_BASE_URL}${DASHBOARD_PATH}`;
    const setupUrl = `${APP_BASE_URL}/setup`;

    const { html, text } = generateActivatedEmail(firstName, dashboardUrl, setupUrl);

    const resend = new Resend(RESEND_API_KEY);
    const emailResponse = await resend.emails.send({
      from: "VistaCEO® Latinoamérica <info@vistaceo.com>",
      replyTo: "info@vistaceo.com",
      to: [email],
      subject: "VistaCEO® activado: tu inteligencia suprema ya está operativa",
      html,
      text,
    });

    console.log(`[Email] Sent ${TEMPLATE_KEY} to ${email}:`, emailResponse);

    // Update event as sent
    await supabase
      .from("email_events")
      .update({
        status: "sent",
        provider_message_id: emailResponse.data?.id || null,
        sent_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("template_key", TEMPLATE_KEY);

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
