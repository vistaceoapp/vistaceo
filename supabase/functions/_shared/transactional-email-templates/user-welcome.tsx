/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text, Hr, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  firstName?: string
  setupUrl?: string
  trackingId?: string
  recipientEmail?: string
}

const ICON = 'https://www.vistaceo.com/email-icon.png'
const WORDMARK = 'https://www.vistaceo.com/logo-full-text.png'
const TRACK_BASE = 'https://nlewrgmcawzcdazhfiyy.supabase.co/functions/v1/track-email'

const wrapClick = (url: string, trackingId?: string, recipient?: string, tpl?: string) => {
  if (!trackingId) return url
  const q = new URLSearchParams({ e: trackingId, t: 'click', u: url, tpl: tpl || '', r: recipient || '' })
  return `${TRACK_BASE}?${q.toString()}`
}

const Email = ({ firstName, setupUrl, trackingId, recipientEmail }: Props) => {
  const name = firstName || 'hola'
  const baseUrl = setupUrl || 'https://www.vistaceo.com/setup'
  const url = wrapClick(baseUrl, trackingId, recipientEmail, 'user-welcome')
  const pixel = trackingId
    ? `${TRACK_BASE}?e=${encodeURIComponent(trackingId)}&t=open&tpl=user-welcome&r=${encodeURIComponent(recipientEmail || '')}`
    : null
  return (
    <Html lang="es" dir="ltr">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          @media only screen and (max-width:600px){
            .vc-container{padding:24px 18px !important;border-radius:0 !important;border-left:none !important;border-right:none !important}
            .vc-hero{padding:28px 18px !important;border-radius:0 !important}
            .vc-h1{font-size:24px !important;line-height:1.2 !important}
            .vc-lead{font-size:15px !important}
            .vc-cta{width:100% !important;display:block !important;padding:16px 20px !important;font-size:16px !important;box-sizing:border-box !important}
            .vc-step{padding:14px !important}
            .vc-icon{width:56px !important;height:56px !important}
          }
        `}</style>
      </Head>
      <Preview>✨ Tu CEO digital VISTACEO te espera — calibrá tu negocio en 3 minutos</Preview>
      <Body style={main}>
        <Container style={outer}>
          {/* Hero gradient con icono */}
          <Section style={hero} className="vc-hero">
            <Img src={ICON} width="64" height="64" alt="VISTACEO" style={iconImg} className="vc-icon" />
            <Text style={heroKicker}>VISTACEO® · Plataforma IA</Text>
            <Text style={heroTitle}>Bienvenida/o a tu CEO digital ✨</Text>
          </Section>

          <Container style={container} className="vc-container">
            <Heading style={h1} className="vc-h1">Hola {name}, estamos listos para acelerar tu negocio.</Heading>
            <Text style={lead} className="vc-lead">
              Gracias por crear tu cuenta. En menos de <strong>3 minutos</strong> vas a tener un panel
              con la salud real de tu negocio, oportunidades priorizadas por impacto y
              una acción diaria enfocada en resultados concretos.
            </Text>

            <Section style={ctaWrap}>
              <Button href={url} style={cta} className="vc-cta">Calibrar mi negocio ahora →</Button>
              <Text style={ctaHint}>Toma 3 minutos · Sin tarjeta · 100% personalizado</Text>
            </Section>

            <Hr style={hr} />

            <Text style={blockTitle}>Cómo funciona</Text>
            <Section style={step} className="vc-step">
              <Text style={stepNum}>1</Text>
              <Text style={stepTitle}>Calibrás tu negocio</Text>
              <Text style={stepBody}>Respondés un cuestionario inteligente que se adapta a tu sector y país.</Text>
            </Section>
            <Section style={step} className="vc-step">
              <Text style={stepNum}>2</Text>
              <Text style={stepTitle}>Recibís tu diagnóstico</Text>
              <Text style={stepBody}>Salud por dimensión, oportunidades reales y riesgos a controlar.</Text>
            </Section>
            <Section style={step} className="vc-step">
              <Text style={stepNum}>3</Text>
              <Text style={stepTitle}>Ejecutás con tu CEO digital</Text>
              <Text style={stepBody}>Una acción diaria priorizada y un chat estratégico siempre disponible.</Text>
            </Section>

            <Hr style={hr} />

            <Text style={blockTitle}>Qué vas a desbloquear</Text>
            <Text style={bullet}>✓ Panel con la salud de tu negocio en tiempo real</Text>
            <Text style={bullet}>✓ 1 acción diaria priorizada por impacto y esfuerzo</Text>
            <Text style={bullet}>✓ Radar de oportunidades y riesgos en tu sector</Text>
            <Text style={bullet}>✓ Chat estratégico con tu CEO digital, 24/7</Text>

            <Section style={ctaWrap}>
              <Button href={url} style={cta} className="vc-cta">Comenzar mi calibración</Button>
            </Section>

            <Hr style={hr} />
            <Text style={footer}>
              ¿Dudas? Respondé este email y te leemos. Estamos para acompañarte en cada paso.
              <br /><br />— Equipo VISTACEO® Plataforma IA
            </Text>
            <Text style={footerLinks}>
              <Link href="https://www.vistaceo.com" style={footerLink}>vistaceo.com</Link>
              {' · '}
              <Link href="https://www.vistaceo.com/blog" style={footerLink}>Blog</Link>
            </Text>
          </Container>
          {pixel && <Img src={pixel} width="1" height="1" alt="" style={pixelStyle} />}
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: '✨ Bienvenida/o a VISTACEO — calibrá tu negocio en 3 minutos',
  displayName: 'Usuario · Bienvenida',
  previewData: { firstName: 'Juan', setupUrl: 'https://www.vistaceo.com/setup' },
} satisfies TemplateEntry

const main = { backgroundColor: '#f6f7fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', margin: 0, padding: '24px 0' }
const outer = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #ececef' }
const hero = { background: 'linear-gradient(135deg,#2692DC 0%,#746CE6 100%)', padding: '36px 28px', textAlign: 'center' as const }
const iconImg = { display: 'block', margin: '0 auto 14px', width: '64px', height: '64px', borderRadius: '14px', backgroundColor: '#ffffff', padding: '8px' }
const heroKicker = { margin: '0 0 6px', color: 'rgba(255,255,255,0.85)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' as const, textAlign: 'center' as const }
const heroTitle = { margin: 0, color: '#ffffff', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.2px', textAlign: 'center' as const }
const container = { padding: '32px 28px' }
const h1 = { fontSize: '26px', fontWeight: 700, color: '#0a0a0a', margin: '0 0 14px', letterSpacing: '-0.4px', lineHeight: '1.25' }
const lead = { fontSize: '15px', color: '#3a3a3c', margin: '0 0 24px', lineHeight: '1.65' }
const ctaWrap = { textAlign: 'center' as const, margin: '20px 0 6px' }
const cta = { background: 'linear-gradient(135deg,#2692DC 0%,#746CE6 100%)', color: '#ffffff', padding: '15px 30px', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '15px', display: 'inline-block' }
const ctaHint = { margin: '10px 0 0', fontSize: '12px', color: '#86868b', textAlign: 'center' as const }
const hr = { borderTop: '1px solid #f0f0f2', margin: '28px 0 18px' }
const blockTitle = { margin: '0 0 12px', color: '#2692DC', fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const }
const step = { backgroundColor: '#fafbfd', border: '1px solid #eef0f4', borderRadius: '12px', padding: '16px 18px', margin: '0 0 10px' }
const stepNum = { display: 'inline-block', width: '24px', height: '24px', borderRadius: '999px', background: 'linear-gradient(135deg,#2692DC,#746CE6)', color: '#fff', textAlign: 'center' as const, lineHeight: '24px', fontSize: '12px', fontWeight: 700, margin: '0 0 6px' }
const stepTitle = { margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: '#0a0a0a' }
const stepBody = { margin: 0, fontSize: '13px', color: '#55575d', lineHeight: '1.55' }
const bullet = { margin: '6px 0', color: '#1d1d1f', fontSize: '14px', lineHeight: '1.6' }
const footer = { fontSize: '13px', color: '#86868b', margin: '20px 0 12px', lineHeight: '1.6' }
const footerLinks = { fontSize: '12px', color: '#86868b', margin: '8px 0 0', textAlign: 'center' as const }
const footerLink = { color: '#2692DC', textDecoration: 'none' }
const pixelStyle = { display: 'block', width: '1px', height: '1px', opacity: 0 }
