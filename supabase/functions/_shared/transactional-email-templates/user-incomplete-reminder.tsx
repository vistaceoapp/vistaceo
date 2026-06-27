/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text, Hr, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { pickHook } from './_hooks.ts'

interface Props {
  firstName?: string
  setupUrl?: string
  stage?: 'day1' | 'day3'
  variant?: number
  trackingId?: string
  recipientEmail?: string
  businessName?: string
  businessCategory?: string
}

const ICON = 'https://www.vistaceo.com/email-icon.png'
const TRACK_BASE = 'https://nlewrgmcawzcdazhfiyy.supabase.co/functions/v1/track-email'

const wrapClick = (url: string, trackingId?: string, recipient?: string, tpl?: string) => {
  if (!trackingId) return url
  const q = new URLSearchParams({ e: trackingId, t: 'click', u: url, tpl: tpl || '', r: recipient || '' })
  return `${TRACK_BASE}?${q.toString()}`
}

// Subject variants — A/B/C/D per stage. Mantener todos en español neutro,
// específicos, sin la palabra "setup" y orientados a completar.
export const SUBJECT_VARIANTS: Record<'day1' | 'day3', string[]> = {
  day1: [
    'Te falta 1 paso para activar tu CEO digital',
    '{firstName}, tu negocio quedó a mitad de calibrar',
    'Tu diagnóstico personalizado te está esperando',
    'En 3 minutos ves la salud real de tu negocio',
  ],
  day3: [
    '{firstName}, retomá donde lo dejaste — guardamos tus respuestas',
    'Tu CEO digital sigue listo cuando quieras',
    'No pierdas tu diagnóstico personalizado, {firstName}',
    'Te dejamos todo listo: terminá en 3 minutos',
  ],
}

export function resolveSubject(stage: 'day1' | 'day3', variant: number, firstName?: string): string {
  const list = SUBJECT_VARIANTS[stage] || SUBJECT_VARIANTS.day1
  const raw = list[variant % list.length] || list[0]
  const name = (firstName || '').trim()
  return raw.replace('{firstName}', name || 'hola')
}

// Copy adaptado por etapa
const COPY: Record<'day1' | 'day3', { kicker: string; heroTitle: string; h1: (n: string) => string; lead: string; cta: string }> = {
  day1: {
    kicker: 'VISTACEO® · Tu calibración te espera',
    heroTitle: 'Solo te faltan 3 minutos ✨',
    h1: (n) => `${n}, dejamos tu negocio guardado a mitad de camino.`,
    lead: 'Empezaste a calibrar tu negocio pero quedó pausado. Cuando lo termines, vas a ver la salud real de tu operación, oportunidades priorizadas por impacto y una acción diaria pensada para vos.',
    cta: 'Retomar mi calibración →',
  },
  day3: {
    kicker: 'VISTACEO® · Te guardamos tus respuestas',
    heroTitle: 'Tu CEO digital sigue listo',
    h1: (n) => `${n}, todavía podés ver el diagnóstico de tu negocio.`,
    lead: 'Pasaron unos días y tu calibración sigue intacta — no perdiste nada. En 3 minutos terminás y desbloqueás tu panel personalizado: salud por dimensión, oportunidades reales y un plan accionable.',
    cta: 'Terminar en 3 minutos →',
  },
}

const Email = ({ firstName, setupUrl, stage = 'day1', variant = 0, trackingId, recipientEmail, businessName, businessCategory }: Props) => {
  const name = (firstName || '').trim() || 'hola'
  const baseUrl = setupUrl || 'https://www.vistaceo.com/setup'
  const tplKey = `user-incomplete-reminder-${stage}-v${variant}`
  const url = wrapClick(baseUrl, trackingId, recipientEmail, tplKey)
  const pixel = trackingId
    ? `${TRACK_BASE}?e=${encodeURIComponent(trackingId)}&t=open&tpl=${tplKey}&r=${encodeURIComponent(recipientEmail || '')}`
    : null
  const copy = COPY[stage]
  const seed = `${stage}-${recipientEmail || trackingId || name}`
  const safeBiz = sanitizeBusinessName(businessName)
  const hook = pickHook(businessCategory, seed, firstName, safeBiz)
  const bizLine = safeBiz ? ` para ${safeBiz}` : ''


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
      <Preview>{hook.opener}</Preview>
      <Body style={main}>
        <Container style={outer}>
          <Section style={hero} className="vc-hero">
            <Img src={ICON} width="64" height="64" alt="VISTACEO" style={iconImg} className="vc-icon" />
            <Text style={heroKicker}>{copy.kicker}</Text>
            <Text style={heroTitle}>{copy.heroTitle}{bizLine ? ' · ' + (businessName || '') : ''}</Text>
          </Section>

          <Container style={container} className="vc-container">
            <Heading style={h1} className="vc-h1">{copy.h1(name)}</Heading>
            <Text style={lead} className="vc-lead">{hook.opener}</Text>
            <Text style={lead} className="vc-lead">{copy.lead}</Text>

            <Section style={ctaWrap}>
              <Button href={url} style={cta} className="vc-cta">{hook.cta}</Button>
              <Text style={ctaHint}>Toma 3 minutos · Sin tarjeta · 100% personalizado</Text>
            </Section>

            <Hr style={hr} />

            <Text style={blockTitle}>Lo que vas a desbloquear</Text>
            <Text style={bullet}>✓ Panel con la salud real de tu negocio</Text>
            <Text style={bullet}>✓ 1 acción diaria priorizada por impacto</Text>
            <Text style={bullet}>✓ Radar de oportunidades en tu sector</Text>
            <Text style={bullet}>✓ Chat estratégico con tu CEO digital, 24/7</Text>

            <Section style={ctaWrap}>
              <Button href={url} style={cta} className="vc-cta">{copy.cta}</Button>
            </Section>

            <Hr style={hr} />
            <Text style={footer}>
              ¿Tenés alguna duda? Respondé este email y te leemos.
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

// Dos entradas en el registry apuntan al MISMO componente,
// con stage distinto, para que el log de envíos quede separado por etapa.
export const templateDay1 = {
  component: (props: Props) => <Email {...props} stage="day1" />,
  subject: (data: Record<string, any>) => {
    const seed = `day1-${data.recipientEmail || data.trackingId || data.firstName || ''}`
    const hook = pickHook(data.businessCategory, seed, data.firstName, data.businessName)
    // mezcla 50/50 entre subject por categoría y subject genérico A/B
    if ((seed.length % 2) === 0) return hook.subject
    return resolveSubject('day1', Number(data.variant ?? 0), data.firstName)
  },
  displayName: 'Usuario · Recordatorio día 1',
  previewData: { firstName: 'Juan', setupUrl: 'https://www.vistaceo.com/setup', variant: 0, businessName: 'Café del Sur', businessCategory: 'gastro' },
} satisfies TemplateEntry

export const templateDay3 = {
  component: (props: Props) => <Email {...props} stage="day3" />,
  subject: (data: Record<string, any>) => {
    const seed = `day3-${data.recipientEmail || data.trackingId || data.firstName || ''}`
    const hook = pickHook(data.businessCategory, seed, data.firstName, data.businessName)
    if ((seed.length % 2) === 0) return hook.subject
    return resolveSubject('day3', Number(data.variant ?? 0), data.firstName)
  },
  displayName: 'Usuario · Recordatorio día 3',
  previewData: { firstName: 'Juan', setupUrl: 'https://www.vistaceo.com/setup', variant: 0, businessName: 'Sentidos Importados', businessCategory: 'retail' },
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
const bullet = { margin: '6px 0', color: '#1d1d1f', fontSize: '14px', lineHeight: '1.6' }
const footer = { fontSize: '13px', color: '#86868b', margin: '20px 0 12px', lineHeight: '1.6' }
const footerLinks = { fontSize: '12px', color: '#86868b', margin: '8px 0 0', textAlign: 'center' as const }
const footerLink = { color: '#2692DC', textDecoration: 'none' }
const pixelStyle = { display: 'block', width: '1px', height: '1px', opacity: 0 }
