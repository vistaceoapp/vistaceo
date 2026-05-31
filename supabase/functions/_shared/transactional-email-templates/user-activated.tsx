/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  firstName?: string
  businessName?: string
  dashboardUrl?: string
  trackingId?: string
  recipientEmail?: string
}

const LOGO = 'https://www.vistaceo.com/logo-full-text.png'
const TRACK_BASE = 'https://nlewrgmcawzcdazhfiyy.supabase.co/functions/v1/track-email'

const wrapClick = (url: string, trackingId?: string, recipient?: string, tpl?: string) => {
  if (!trackingId) return url
  const q = new URLSearchParams({ e: trackingId, t: 'click', u: url, tpl: tpl || '', r: recipient || '' })
  return `${TRACK_BASE}?${q.toString()}`
}

const Email = ({ firstName, businessName, dashboardUrl, trackingId, recipientEmail }: Props) => {
  const name = firstName || 'hola'
  const biz = businessName || 'tu negocio'
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
            .vc-container{padding:20px 16px !important;border-radius:0 !important;border-left:none !important;border-right:none !important}
            .vc-h1{font-size:22px !important;line-height:1.25 !important}
            .vc-lead{font-size:14px !important}
            .vc-cta{width:100% !important;display:block !important;padding:14px 18px !important;font-size:15px !important}
          }
        `}</style>
      </Head>
      <Preview>{biz} ya está calibrado — entrá a tu panel para ver tu primera acción.</Preview>
      <Body style={main}>
        <Container style={container} className="vc-container">
          <Section style={logoWrap}>
            <Img src={LOGO} width="140" height="32" alt="VISTACEO" style={logoImg} />
          </Section>
          <Section style={badge}><Text style={badgeText}>ACTIVADO</Text></Section>
          <Heading style={h1} className="vc-h1">{name}, {biz} ya está activo.</Heading>
          <Text style={lead} className="vc-lead">
            Tu calibración inicial está lista. Ya podés ver la salud de tu negocio,
            tus oportunidades priorizadas y la primera acción del día.
          </Text>

          <Section style={ctaWrap}>
            <Button href={url} style={cta} className="vc-cta">Entrar a mi panel</Button>
          </Section>

          <Hr style={hr} />
          <Text style={blockTitle}>Recomendación</Text>
          <Text style={body}>
            Reservá 10 minutos al día durante esta semana para revisar tu acción
            recomendada. Es la forma más rápida de ver impacto real.
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            ¿Necesitás ayuda? Respondé este email.
            <br />— Equipo VISTACEO® Plataforma IA
          </Text>
          {pixel && <Img src={pixel} width="1" height="1" alt="" style={pixelStyle} />}
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: '✅ Tu negocio está activo en VISTACEO',
  displayName: 'Usuario · Activado',
  previewData: { firstName: 'Juan', businessName: 'Café Aroma', dashboardUrl: 'https://www.vistaceo.com/app' },
} satisfies TemplateEntry

const main = { backgroundColor: '#f6f7fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', margin: 0, padding: '24px 0' }
const container = { padding: '32px 28px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #ececef' }
const logoWrap = { textAlign: 'left' as const, marginBottom: '18px' }
const logoImg = { display: 'block', height: '32px', width: 'auto' }
const badge = { display: 'inline-block', padding: '5px 11px', borderRadius: '999px', backgroundColor: '#2692DC15', marginBottom: '14px' }
const badgeText = { margin: 0, color: '#2692DC', fontSize: '10px', fontWeight: 700, letterSpacing: '0.7px' }
const h1 = { fontSize: '24px', fontWeight: 700, color: '#0a0a0a', margin: '6px 0 10px', letterSpacing: '-0.3px', lineHeight: '1.25' }
const lead = { fontSize: '15px', color: '#3a3a3c', margin: '0 0 22px', lineHeight: '1.6' }
const ctaWrap = { textAlign: 'center' as const, margin: '8px 0 6px' }
const cta = { background: 'linear-gradient(135deg,#2692DC 0%,#746CE6 100%)', color: '#ffffff', padding: '14px 28px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '15px', display: 'inline-block' }
const hr = { borderTop: '1px solid #f0f0f2', margin: '22px 0 14px' }
const blockTitle = { margin: '0 0 8px', color: '#2692DC', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase' as const }
const body = { fontSize: '14px', color: '#1d1d1f', margin: '0 0 8px', lineHeight: '1.6' }
const footer = { fontSize: '12px', color: '#86868b', margin: '16px 0 0', lineHeight: '1.6' }
const pixelStyle = { display: 'block', width: '1px', height: '1px', opacity: 0 }
