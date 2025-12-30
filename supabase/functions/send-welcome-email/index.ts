import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  fullName: string;
  authMethod: 'email' | 'google';
  locale?: string; // 'es' | 'pt' | 'en'
  continueUrl?: string;
}

// Get localized content based on locale
const getLocalizedContent = (locale: string = 'es') => {
  const content = {
    es: {
      subject: '¡Bienvenido a Vistaceo! 🚀 Tu CEO digital te espera',
      greeting: 'Hola',
      welcome: '¡Bienvenido a Vistaceo!',
      subtitle: 'Tu CEO digital personal está listo para ayudarte',
      bodyIntro: 'Empezaste a crear tu cuenta y estamos muy emocionados de tenerte con nosotros.',
      googleLoginText: 'Ingresa con tu cuenta de Google cuando quieras acceder.',
      emailLoginText: 'Tus credenciales de acceso:',
      emailLabel: 'Email:',
      passwordLabel: 'Contraseña:',
      passwordHint: 'La que elegiste al registrarte',
      nextStep: '¿Qué sigue?',
      nextStepDesc: 'Configura tu negocio en menos de 3 minutos y desbloquea tu dashboard personalizado con recomendaciones inteligentes.',
      ctaButton: 'Configurar mi negocio',
      benefits: [
        '📊 Dashboard con salud de tu negocio en tiempo real',
        '🎯 1 acción diaria enfocada en resultados',
        '🧠 IA que aprende de tu negocio cada día',
      ],
      footer: 'Si tienes preguntas, responde a este email. Estamos aquí para ayudarte.',
      team: 'El equipo de Vistaceo',
    },
    pt: {
      subject: 'Bem-vindo ao Vistaceo! 🚀 Seu CEO digital te espera',
      greeting: 'Olá',
      welcome: 'Bem-vindo ao Vistaceo!',
      subtitle: 'Seu CEO digital pessoal está pronto para te ajudar',
      bodyIntro: 'Você começou a criar sua conta e estamos muito animados em tê-lo conosco.',
      googleLoginText: 'Entre com sua conta do Google quando quiser acessar.',
      emailLoginText: 'Suas credenciais de acesso:',
      emailLabel: 'Email:',
      passwordLabel: 'Senha:',
      passwordHint: 'A que você escolheu ao se registrar',
      nextStep: 'O que vem agora?',
      nextStepDesc: 'Configure seu negócio em menos de 3 minutos e desbloqueie seu dashboard personalizado com recomendações inteligentes.',
      ctaButton: 'Configurar meu negócio',
      benefits: [
        '📊 Dashboard com saúde do seu negócio em tempo real',
        '🎯 1 ação diária focada em resultados',
        '🧠 IA que aprende do seu negócio cada dia',
      ],
      footer: 'Se tiver dúvidas, responda a este email. Estamos aqui para te ajudar.',
      team: 'Equipe Vistaceo',
    },
    en: {
      subject: 'Welcome to Vistaceo! 🚀 Your digital CEO awaits',
      greeting: 'Hello',
      welcome: 'Welcome to Vistaceo!',
      subtitle: 'Your personal digital CEO is ready to help you',
      bodyIntro: 'You started creating your account and we are very excited to have you with us.',
      googleLoginText: 'Sign in with your Google account whenever you want to access.',
      emailLoginText: 'Your login credentials:',
      emailLabel: 'Email:',
      passwordLabel: 'Password:',
      passwordHint: 'The one you chose when registering',
      nextStep: "What's next?",
      nextStepDesc: 'Set up your business in less than 3 minutes and unlock your personalized dashboard with smart recommendations.',
      ctaButton: 'Set up my business',
      benefits: [
        '📊 Dashboard with real-time business health',
        '🎯 1 daily action focused on results',
        '🧠 AI that learns from your business every day',
      ],
      footer: 'If you have questions, reply to this email. We are here to help you.',
      team: 'The Vistaceo Team',
    },
  };

  return content[locale as keyof typeof content] || content.es;
};

// Generate beautiful HTML email
const generateWelcomeEmail = (
  fullName: string, 
  email: string, 
  authMethod: 'email' | 'google',
  locale: string = 'es',
  continueUrl: string = 'https://vistaceo.com/setup'
): string => {
  const t = getLocalizedContent(locale);
  const firstName = fullName?.split(' ')[0] || email.split('@')[0];

  const loginSection = authMethod === 'google' 
    ? `
      <div style="background: linear-gradient(135deg, #4285F4 0%, #34A853 100%); border-radius: 12px; padding: 20px; margin: 24px 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="50" valign="middle">
              <div style="background: white; border-radius: 8px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                <img src="https://www.google.com/favicon.ico" alt="Google" width="24" height="24" style="display: block;"/>
              </div>
            </td>
            <td valign="middle" style="padding-left: 16px;">
              <p style="margin: 0; color: white; font-size: 16px; font-weight: 600;">${t.googleLoginText}</p>
            </td>
          </tr>
        </table>
      </div>
    `
    : `
      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #e2e8f0;">
        <p style="margin: 0 0 12px 0; color: #475569; font-weight: 600;">${t.emailLoginText}</p>
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 8px 0;">
              <span style="color: #64748b; font-size: 14px;">${t.emailLabel}</span>
            </td>
            <td style="padding: 8px 0 8px 12px;">
              <span style="color: #1e293b; font-weight: 600;">${email}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">
              <span style="color: #64748b; font-size: 14px;">${t.passwordLabel}</span>
            </td>
            <td style="padding: 8px 0 8px 12px;">
              <span style="color: #64748b; font-style: italic;">${t.passwordHint}</span>
            </td>
          </tr>
        </table>
      </div>
    `;

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.welcome}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #D946EF 100%); padding: 40px 40px 30px 40px; text-align: center;">
              <!-- Logo placeholder - uses text as fallback -->
              <div style="margin-bottom: 20px;">
                <span style="font-size: 36px; font-weight: 800; color: white; letter-spacing: -1px;">Vistaceo</span>
              </div>
              <h1 style="margin: 0 0 8px 0; color: white; font-size: 28px; font-weight: 700;">${t.greeting}, ${firstName}!</h1>
              <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 16px;">${t.subtitle}</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; color: #334155; font-size: 16px; line-height: 1.6;">
                ${t.bodyIntro}
              </p>
              
              ${loginSection}
              
              <!-- Next Step Section -->
              <div style="margin: 32px 0;">
                <h2 style="margin: 0 0 12px 0; color: #1e293b; font-size: 20px; font-weight: 700;">${t.nextStep}</h2>
                <p style="margin: 0 0 20px 0; color: #475569; font-size: 15px; line-height: 1.6;">
                  ${t.nextStepDesc}
                </p>
                
                <!-- CTA Button -->
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td align="center" style="padding: 8px 0;">
                      <a href="${continueUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);">
                        ${t.ctaButton} →
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Benefits -->
              <div style="background: #faf5ff; border-radius: 12px; padding: 24px; margin-top: 24px;">
                ${t.benefits.map(benefit => `
                  <p style="margin: 0 0 12px 0; color: #6b21a8; font-size: 15px; line-height: 1.5;">
                    ${benefit}
                  </p>
                `).join('')}
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px;">
                ${t.footer}
              </p>
              <p style="margin: 0; color: #8B5CF6; font-weight: 600; font-size: 14px;">
                ${t.team}
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Unsubscribe footer -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin-top: 24px;">
          <tr>
            <td align="center">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                © ${new Date().getFullYear()} Vistaceo. All rights reserved.
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
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, authMethod, locale, continueUrl }: WelcomeEmailRequest = await req.json();

    console.log(`Sending welcome email to ${email} (${authMethod})`);

    const t = getLocalizedContent(locale || 'es');
    const html = generateWelcomeEmail(
      fullName, 
      email, 
      authMethod, 
      locale || 'es',
      continueUrl || 'https://vistaceo.com/setup'
    );

    const emailResponse = await resend.emails.send({
      from: "Vistaceo <onboarding@resend.dev>",
      to: [email],
      subject: t.subject,
      html,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
