/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text, Hr, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  firstName?: string
  appUrl?: string
  variant?: number
  trackingId?: string
  recipientEmail?: string
  businessName?: string
  daysSinceLastLogin?: number
}

const ICON = 'https://www.vistaceo.com/email-icon.png'
const TRACK_BASE = 'https://nlewrgmcawzcdazhfiyy.supabase.co/functions/v1/track-email'

const wrapClick = (url: string, trackingId?: string, recipient?: string, tpl?: string) => {
  if (!trackingId) return url
  const q = new URLSearchParams({ e: trackingId, t: 'click', u: url, tpl: tpl || '', r: recipient || '' })
  return `${TRACK_BASE}?${q.toString()}`
}

const SUBJECTS = [
  '{firstName}, tu negocio siguió moviéndose sin vos',
  'Pasaron {days} días — hay 3 señales nuevas para tu negocio',
  'Tu CEO digital preparó algo para cuando vuelvas',
  '{firstName}, ¿te muestro qué cambió en tu radar?',
]

function resolveSubject(variant: number, firstName?: string, days?: number): string {
  const raw = SUBJECTS[variant % SUBJECTS.length] || SUBJECTS[0]
  return raw
    .replace('{firstName}', (firstName || '').trim() || 'hola')
    .replace('{days}', String(days ?? 7))
}

const Email = ({ firstName, appUrl, variant = 0, trackingId, recipientEmail, businessName, daysSinceLastLogin }: Props) => {
  const name = (firstName || '').trim() || 'hola'
  const days = daysSinceLastLogin ?? 7
  const baseUrl = appUrl || 'https://www.vistaceo.com/app'
  const tplKey = `user-silent-reactivation-v${variant}`
  const url = wrapClick(baseUrl, trackingId, recipientEmail, tplKey)
  const pixel = trackingId
    ? `${TRACK_BASE}?e=${encodeURIComponent(trackingId)}&t=open&tpl=${tplKey}&r=${encodeURIComponent(recipientEmail || '')}`
    : null
  const bizLabel = businessName ? ` para ${businessName}` : ''

  return (
    <Html lang="es" dir="ltr">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Preview>{`Pasaron ${days} días. Tu radar detectó movimientos${bizLabel}.`}</Preview>
      <Body style={main}>
        <Container style={outer}>
          <Section style={hero}>
            <Img src={ICON} width="64" height="64" alt="VISTACEO" style={iconImg} />
            <Text style={heroKicker}>VISTACEO® · Radar activo</Text>
            <Text style={heroTitle}>Tu negocio no se pausa</Text>
          </Section>

          <Container style={container}>
            <Heading style={h1}>{name}, pasaron {days} días desde tu último check.</Heading>
            <Text style={lead}>
              Mientras estabas afuera, tu CEO digital siguió leyendo señales{bizLabel}. Preparé
              lo que cambió en tu sector, oportunidades nuevas y la acción que más impacto tiene
              esta semana.
            </Text>

            <Section style={ctaWrap}>
              <Button href={url} style={cta}>Ver mi panel actualizado →</Button>
              <Text style={ctaHint}>3 minutos · Sin fricción · 100% personalizado</Text>
            </Section>

            <Hr style={hr} />
            <Text style={blockTitle}>Lo que te espera adentro</Text>
            <Text style={bullet}>✓ Salud actualizada de tu negocio por dimensión</Text>
            <Text style={bullet}>✓ Oportunidades nuevas priorizadas por impacto</Text>
            <Text style={bullet}>✓ Chat estratégico con contexto de todo tu historial</Text>
            <Text style={bullet}>✓ Radar del sector con lo que se movió esta semana</Text>

            <Section style={ctaWrap}>
              <Button href={url} style={cta}>Retomar en 1 clic</Button>
            </Section>

            <Hr style={hr} />
            <Text style={footer}>
              ¿Alguna duda o sugerencia? Respondé este email y te leemos personalmente.
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
  subject: (data: Record<string, any>) =>
    resolveSubject(Number(data.variant ?? 0), data.firstName, data.daysSinceLastLogin),
  displayName: 'Usuario · Reactivación silenciosa (7d)',
  previewData: { firstName: 'Juan', appUrl: 'https://www.vistaceo.com/app', variant: 0, businessName: 'Café del Sur', daysSinceLastLogin: 7 },
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
