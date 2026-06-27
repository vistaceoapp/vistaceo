/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text, Hr, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { sanitizeBusinessName } from './_hooks.ts'


interface Props {
  firstName?: string
  businessName?: string
  dashboardUrl?: string
  trackingId?: string
  recipientEmail?: string
}

const ICON = 'https://www.vistaceo.com/email-icon.png'
const TRACK_BASE = 'https://nlewrgmcawzcdazhfiyy.supabase.co/functions/v1/track-email'

const wrapClick = (url: string, trackingId?: string, recipient?: string, tpl?: string) => {
  if (!trackingId) return url
  const q = new URLSearchParams({ e: trackingId, t: 'click', u: url, tpl: tpl || '', r: recipient || '' })
  return `${TRACK_BASE}?${q.toString()}`
}

const Email = ({ firstName, businessName, dashboardUrl, trackingId, recipientEmail }: Props) => {
  const name = firstName || 'hola'
  const biz = sanitizeBusinessName(businessName) || 'tu negocio'
  const baseUrl = dashboardUrl || 'https://www.vistaceo.com/app'
  const url = wrapClick(baseUrl, trackingId, recipientEmail, 'user-activated')
  const pixel = trackingId
    ? `${TRACK_BASE}?e=${encodeURIComponent(trackingId)}&t=open&tpl=user-activated&r=${encodeURIComponent(recipientEmail || '')}`
    : null
  return (
    <Html lang="es" dir="ltr">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          @media only screen and (max-width:600px){
            .vc-container{padding:24px 18px !important;border-radius:0 !important}
            .vc-hero{padding:28px 18px !important;border-radius:0 !important}
            .vc-h1{font-size:24px !important;line-height:1.2 !important}
            .vc-lead{font-size:15px !important}
            .vc-cta{width:100% !important;display:block !important;padding:16px 20px !important;font-size:16px !important;box-sizing:border-box !important}
            .vc-icon{width:56px !important;height:56px !important}
            .vc-card{padding:14px !important}
          }
        `}</style>
      </Head>
      <Preview>🎯 {biz} ya está calibrado — tu primera acción te espera</Preview>
      <Body style={main}>
        <Container style={outer}>
          <Section style={hero} className="vc-hero">
            <Img src={ICON} width="64" height="64" alt="VISTACEO" style={iconImg} className="vc-icon" />
            <Text style={heroKicker}>VISTACEO® · Activación completa</Text>
            <Text style={heroTitle}>{biz} ya está activo 🎯</Text>
          </Section>

          <Container style={container} className="vc-container">
            <Heading style={h1} className="vc-h1">{name}, tu negocio está calibrado.</Heading>
            <Text style={lead} className="vc-lead">
              Tu calibración inicial está lista. Ya podés ver la salud de tu negocio,
              las oportunidades priorizadas por impacto y la primera acción
              recomendada del día.
            </Text>

            <Section style={ctaWrap}>
              <Button href={url} style={cta} className="vc-cta">Entrar a mi panel →</Button>
            </Section>

            <Hr style={hr} />
            <Text style={blockTitle}>Tu panel incluye</Text>
            <Section style={card} className="vc-card">
              <Text style={cardTitle}>📊 Salud por dimensión</Text>
              <Text style={cardBody}>7 dimensiones medidas: tráfico, rentabilidad, equipo, finanzas, eficiencia, crecimiento y reputación.</Text>
            </Section>
            <Section style={card} className="vc-card">
              <Text style={cardTitle}>🎯 Acción del día</Text>
              <Text style={cardBody}>Una sola tarea priorizada por impacto vs esfuerzo. Sin parálisis por análisis.</Text>
            </Section>
            <Section style={card} className="vc-card">
              <Text style={cardTitle}>💬 Chat estratégico</Text>
              <Text style={cardBody}>Tu CEO digital responde con contexto real de tu negocio. Pedile lo que necesites.</Text>
            </Section>

            <Hr style={hr} />
            <Text style={blockTitle}>Recomendación clave</Text>
            <Text style={body}>
              Reservá <strong>10 minutos al día</strong> esta semana para revisar tu acción
              recomendada y ejecutar. Es la forma más rápida de ver impacto real
              en menos de 15 días.
            </Text>

            <Hr style={hr} />
            <Text style={footer}>
              ¿Necesitás ayuda? Respondé este email y te leemos.
              <br /><br />— Equipo VISTACEO® Plataforma IA
            </Text>
            <Text style={footerLinks}>
              <Link href="https://www.vistaceo.com" style={footerLink}>vistaceo.com</Link>
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
  subject: '🎯 Tu negocio ya está activo en VISTACEO',
  displayName: 'Usuario · Activado',
  previewData: { firstName: 'Juan', businessName: 'Café Aroma', dashboardUrl: 'https://www.vistaceo.com/app' },
} satisfies TemplateEntry

const main = { backgroundColor: '#f6f7fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', margin: 0, padding: '24px 0' }
const outer = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #ececef' }
const hero = { background: 'linear-gradient(135deg,#2692DC 0%,#746CE6 100%)', padding: '36px 28px', textAlign: 'center' as const }
const iconImg = { display: 'block', margin: '0 auto 14px', width: '64px', height: '64px', borderRadius: '14px', backgroundColor: '#ffffff', padding: '8px' }
const heroKicker = { margin: '0 0 6px', color: 'rgba(255,255,255,0.85)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' as const, textAlign: 'center' as const }
const heroTitle = { margin: 0, color: '#ffffff', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.2px', textAlign: 'center' as const }
const container = { padding: '32px 28px' }
const h1 = { fontSize: '26px', fontWeight: 700, color: '#0a0a0a', margin: '0 0 14px', letterSpacing: '-0.4px', lineHeight: '1.25' }
const lead = { fontSize: '15px', color: '#3a3a3c', margin: '0 0 22px', lineHeight: '1.65' }
const ctaWrap = { textAlign: 'center' as const, margin: '18px 0 6px' }
const cta = { background: 'linear-gradient(135deg,#2692DC 0%,#746CE6 100%)', color: '#ffffff', padding: '15px 30px', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '15px', display: 'inline-block' }
const hr = { borderTop: '1px solid #f0f0f2', margin: '26px 0 16px' }
const blockTitle = { margin: '0 0 12px', color: '#2692DC', fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const }
const card = { backgroundColor: '#fafbfd', border: '1px solid #eef0f4', borderRadius: '12px', padding: '16px 18px', margin: '0 0 10px' }
const cardTitle = { margin: '0 0 6px', fontSize: '14px', fontWeight: 600, color: '#0a0a0a' }
const cardBody = { margin: 0, fontSize: '13px', color: '#55575d', lineHeight: '1.55' }
const body = { fontSize: '14px', color: '#1d1d1f', margin: '0 0 8px', lineHeight: '1.65' }
const footer = { fontSize: '13px', color: '#86868b', margin: '16px 0 12px', lineHeight: '1.6' }
const footerLinks = { fontSize: '12px', color: '#86868b', margin: '8px 0 0', textAlign: 'center' as const }
const footerLink = { color: '#2692DC', textDecoration: 'none' }
const pixelStyle = { display: 'block', width: '1px', height: '1px', opacity: 0 }
