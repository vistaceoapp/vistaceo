/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text, Hr, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  firstName?: string
  checkoutUrl?: string
  localDisplay?: string       // ej "$1.200 ARS" o "$1 USD"
  usdDisplay?: string         // ej "$1 USD"
  expiresAt?: string          // ISO
  recipientEmail?: string
  trackingId?: string
  businessName?: string
}

const ICON = 'https://www.vistaceo.com/email-icon.png'
const TRACK_BASE = 'https://nlewrgmcawzcdazhfiyy.supabase.co/functions/v1/track-email'

const wrapClick = (url: string, trackingId?: string, recipient?: string, tpl?: string) => {
  if (!trackingId) return url
  const q = new URLSearchParams({ e: trackingId, t: 'click', u: url, tpl: tpl || '', r: recipient || '' })
  return `${TRACK_BASE}?${q.toString()}`
}

const Email = ({ firstName, checkoutUrl, localDisplay, usdDisplay, expiresAt, recipientEmail, trackingId, businessName }: Props) => {
  const name = (firstName || '').trim() || 'hola'
  const tpl = 'user-promo-24h'
  const url = wrapClick(checkoutUrl || 'https://www.vistaceo.com/checkout', trackingId, recipientEmail, tpl)
  const priceMain = localDisplay || usdDisplay || '$1 USD'
  const equiv = localDisplay && usdDisplay && localDisplay !== usdDisplay ? `≈ ${usdDisplay}` : ''
  const deadline = expiresAt
    ? new Date(expiresAt).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '24 horas'
  const bizLine = businessName ? ` para ${businessName}` : ''
  const pixel = trackingId
    ? `${TRACK_BASE}?e=${encodeURIComponent(trackingId)}&t=open&tpl=${tpl}&r=${encodeURIComponent(recipientEmail || '')}`
    : null

  return (
    <Html lang="es" dir="ltr">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          @media only screen and (max-width:600px){
            .vc-container{padding:24px 18px !important;border-radius:0 !important}
            .vc-hero{padding:28px 18px !important;border-radius:0 !important}
            .vc-h1{font-size:26px !important;line-height:1.2 !important}
            .vc-price{font-size:44px !important}
            .vc-cta{width:100% !important;display:block !important;padding:16px 20px !important;font-size:16px !important;box-sizing:border-box !important}
          }
        `}</style>
      </Head>
      <Preview>{`24 horas: primer mes de VISTACEO Pro por ${priceMain}`}</Preview>
      <Body style={main}>
        <Container style={outer}>
          <Section style={hero} className="vc-hero">
            <Img src={ICON} width="64" height="64" alt="VISTACEO" style={iconImg} />
            <Text style={heroKicker}>OFERTA PRIVADA · 24 HORAS</Text>
            <Text style={heroTitle}>Tu primer mes Pro por {priceMain}</Text>
          </Section>

          <Container style={container} className="vc-container">
            <Heading style={h1} className="vc-h1">{name}, esto es solo para vos.</Heading>
            <Text style={lead}>
              Abrimos una ventana de <strong>24 horas</strong> para que actives VISTACEO Pro{bizLine} por <strong>{priceMain}</strong> el primer mes. Sin códigos, sin trucos: el link te lleva directo con el precio aplicado.
            </Text>

            <Section style={priceBox}>
              <Text style={priceLabel}>Primer mes Pro</Text>
              <Text style={priceMainStyle} className="vc-price">{priceMain}</Text>
              {equiv && <Text style={priceEquiv}>{equiv}</Text>}
              <Text style={priceHint}>Después $49 USD/mes · cancelás cuando quieras</Text>
            </Section>

            <Section style={ctaWrap}>
              <Button href={url} style={cta} className="vc-cta">Activar por {priceMain} →</Button>
              <Text style={ctaHint}>Vence el {deadline}. Un solo uso, personal.</Text>
            </Section>

            <Hr style={hr} />

            <Text style={blockTitle}>Lo que se desbloquea</Text>
            <Text style={bullet}>✓ Chat estratégico ultra-inteligente 24/7</Text>
            <Text style={bullet}>✓ Misiones y oportunidades sin límites</Text>
            <Text style={bullet}>✓ Radar I+D + Google Reviews + Analytics avanzado</Text>
            <Text style={bullet}>✓ Predicciones y análisis de fotos/documentos</Text>

            <Hr style={hr} />
            <Text style={footer}>
              Si el botón no funciona, copiá y pegá este link:
              <br />
              <Link href={url} style={footerLink}>{url}</Link>
            </Text>
            <Text style={footer}>
              — Equipo VISTACEO® Plataforma IA
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
  subject: (data: Record<string, any>) => {
    const price = data.localDisplay || data.usdDisplay || '$1 USD'
    return `⏱ 24 horas: tu primer mes Pro por ${price}`
  },
  displayName: 'Promo · Primer mes $1 USD (24hs)',
  previewData: {
    firstName: 'Juan',
    checkoutUrl: 'https://www.vistaceo.com/checkout?promo=demo',
    localDisplay: '$1.200 ARS',
    usdDisplay: '$1 USD',
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    businessName: '5 Sentidos',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#f6f7fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', margin: 0, padding: '24px 0' }
const outer = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #ececef' }
const hero = { background: 'linear-gradient(135deg,#2692DC 0%,#746CE6 100%)', padding: '36px 28px', textAlign: 'center' as const }
const iconImg = { display: 'block', margin: '0 auto 14px', width: '64px', height: '64px', borderRadius: '14px', backgroundColor: '#ffffff', padding: '8px' }
const heroKicker = { margin: '0 0 6px', color: 'rgba(255,255,255,0.92)', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, textAlign: 'center' as const }
const heroTitle = { margin: 0, color: '#ffffff', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.2px', textAlign: 'center' as const }
const container = { padding: '32px 28px' }
const h1 = { fontSize: '28px', fontWeight: 700, color: '#0a0a0a', margin: '0 0 14px', letterSpacing: '-0.4px', lineHeight: '1.25' }
const lead = { fontSize: '15px', color: '#3a3a3c', margin: '0 0 20px', lineHeight: '1.65' }
const priceBox = { border: '2px solid #2692DC', borderRadius: '14px', padding: '22px 18px', margin: '20px 0', textAlign: 'center' as const, background: 'linear-gradient(135deg, rgba(38,146,220,0.04) 0%, rgba(116,108,230,0.04) 100%)' }
const priceLabel = { margin: '0 0 6px', color: '#2692DC', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' as const }
const priceMainStyle = { margin: '0', color: '#0a0a0a', fontSize: '52px', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1 }
const priceEquiv = { margin: '4px 0 0', color: '#3a3a3c', fontSize: '13px', fontWeight: 500 }
const priceHint = { margin: '10px 0 0', color: '#86868b', fontSize: '12px' }
const ctaWrap = { textAlign: 'center' as const, margin: '20px 0 6px' }
const cta = { background: 'linear-gradient(135deg,#2692DC 0%,#746CE6 100%)', color: '#ffffff', padding: '16px 32px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '16px', display: 'inline-block' }
const ctaHint = { margin: '10px 0 0', fontSize: '12px', color: '#86868b', textAlign: 'center' as const }
const hr = { borderTop: '1px solid #f0f0f2', margin: '28px 0 18px' }
const blockTitle = { margin: '0 0 12px', color: '#2692DC', fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const }
const bullet = { margin: '6px 0', color: '#1d1d1f', fontSize: '14px', lineHeight: '1.6' }
const footer = { fontSize: '12px', color: '#86868b', margin: '16px 0 8px', lineHeight: '1.6', wordBreak: 'break-all' as const }
const footerLink = { color: '#2692DC', textDecoration: 'none' }
const pixelStyle = { display: 'block', width: '1px', height: '1px', opacity: 0 }
