/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  // Identidad
  email?: string
  fullName?: string
  userId?: string
  timestamp?: string
  // Negocio
  businessName?: string
  businessId?: string
  countryCode?: string
  areaId?: string
  businessTypeId?: string
  businessTypeLabel?: string
  setupMode?: string
  setupVersion?: string
  precisionScore?: number | string
  // Google
  googleConnected?: boolean
  googlePlaceId?: string
  googleAddress?: string
  googleRating?: number | string
  googleReviewCount?: number | string
  // Integraciones
  integrationsProfiled?: any
  // Cuestionario
  answersCount?: number | string
  answersSummary?: string
  // Tracking de origen
  landingUrl?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  firstTouchAt?: string
  // Contexto técnico
  userAgent?: string
  device?: string
  os?: string
  browser?: string
  language?: string
  timezone?: string
  screen?: string
  pendingPlan?: string
  signupAt?: string
}

const formatIntegrations = (val: any): string | undefined => {
  if (!val) return undefined
  if (Array.isArray(val)) return val.join(', ')
  if (typeof val === 'object') {
    return Object.entries(val)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}${typeof v === 'boolean' ? '' : ': ' + v}`)
      .join(', ')
  }
  return String(val)
}

const Email = (p: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>{p.businessName || 'Negocio'} completó el setup — {p.email || ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={badge}>
          <Text style={badgeText}>VISTACEO · SETUP COMPLETADO</Text>
        </Section>
        <Heading style={h1}>{p.businessName || 'Negocio activo'}</Heading>
        <Text style={subtitle}>
          {p.fullName || p.email}{p.countryCode ? ` · ${p.countryCode}` : ''}
        </Text>
        <Text style={timestampStyle}>{p.timestamp || new Date().toLocaleString('es-AR')}</Text>

        {/* Negocio */}
        <SectionBlock title="Negocio">
          <Row label="Nombre del negocio" value={p.businessName} />
          <Row label="País" value={p.countryCode} />
          <Row label="Área / vertical" value={p.areaId} />
          <Row label="Tipo de negocio" value={p.businessTypeLabel || p.businessTypeId} />
          <Row label="Tipo (ID)" value={p.businessTypeId} mono />
          <Row label="Modo de setup" value={p.setupMode} />
          <Row label="Setup version" value={p.setupVersion} />
          <Row label="Precision score" value={p.precisionScore !== undefined ? `${p.precisionScore}` : undefined} />
          <Row label="Business ID" value={p.businessId} mono />
        </SectionBlock>

        {/* Cuestionario */}
        <SectionBlock title="Cuestionario completado">
          <Row label="Respuestas" value={p.answersCount !== undefined ? `${p.answersCount}` : undefined} />
          <Row label="Detalle" value={p.answersSummary} small />
        </SectionBlock>

        {/* Google */}
        <SectionBlock title="Google Business / dirección">
          <Row label="Google conectado" value={p.googleConnected === true ? 'Sí' : p.googleConnected === false ? 'No' : undefined} />
          <Row label="Place ID" value={p.googlePlaceId} mono />
          <Row label="Dirección" value={p.googleAddress} />
          <Row label="Rating Google" value={p.googleRating !== undefined ? `${p.googleRating} ⭐` : undefined} />
          <Row label="Reviews" value={p.googleReviewCount !== undefined ? `${p.googleReviewCount}` : undefined} />
        </SectionBlock>

        {/* Integraciones */}
        <SectionBlock title="Integraciones declaradas">
          <Row label="Plataformas" value={formatIntegrations(p.integrationsProfiled)} small />
        </SectionBlock>

        {/* Identidad */}
        <SectionBlock title="Identidad del usuario">
          <Row label="Email" value={p.email} />
          <Row label="Nombre" value={p.fullName} />
          <Row label="User ID" value={p.userId} mono />
        </SectionBlock>

        {/* Origen */}
        <SectionBlock title="Origen y atribución">
          <Row label="UTM source" value={p.utmSource} />
          <Row label="UTM medium" value={p.utmMedium} />
          <Row label="UTM campaign" value={p.utmCampaign} />
          <Row label="UTM content" value={p.utmContent} />
          <Row label="Referrer" value={p.referrer || '(directo)'} />
          <Row label="Landing URL" value={p.landingUrl} />
          <Row label="Primer touch" value={p.firstTouchAt} />
          <Row label="Plan pendiente" value={p.pendingPlan} />
        </SectionBlock>

        {/* Contexto técnico */}
        <SectionBlock title="Dispositivo">
          <Row label="Dispositivo" value={p.device} />
          <Row label="OS" value={p.os} />
          <Row label="Navegador" value={p.browser} />
          <Row label="Idioma" value={p.language} />
          <Row label="Zona horaria" value={p.timezone} />
          <Row label="Pantalla" value={p.screen} />
        </SectionBlock>

        <Hr style={hr} />
        <Text style={footer}>
          Aviso interno automático de VISTACEO. Un usuario terminó el onboarding y empezó a usar la app.
          {p.email ? <> Contacto directo: <Link href={`mailto:${p.email}`} style={linkStyle}>{p.email}</Link>.</> : null}
        </Text>
      </Container>
    </Body>
  </Html>
)

const SectionBlock = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Section style={blockSection}>
    <Text style={blockTitle}>{title}</Text>
    {children}
  </Section>
)

const Row = ({ label, value, mono, small }: { label: string; value?: string; mono?: boolean; small?: boolean }) => {
  if (value === undefined || value === null || value === '') return null
  return (
    <Section style={rowStyle}>
      <Text style={rowLabel}>{label}</Text>
      <Text style={{
        ...rowValue,
        ...(mono ? rowValueMono : {}),
        ...(small ? { fontSize: '12px', whiteSpace: 'pre-wrap' as const, wordBreak: 'break-word' as const } : {}),
      }}>{value}</Text>
    </Section>
  )
}

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    `✅ Setup completado · ${d.businessName ?? 'negocio'} (${d.email ?? '—'})`,
  displayName: 'Admin · Setup completado',
  to: 'info@vistaceo.com',
  previewData: {
    email: 'usuario@ejemplo.com',
    fullName: 'Juan Pérez',
    businessName: 'Mi Restaurante',
    businessId: 'biz-456',
    countryCode: 'AR',
    areaId: 'gastronomia',
    businessTypeLabel: 'Restaurante a la carta',
    businessTypeId: 'restaurant_carta',
    setupMode: 'guided',
    precisionScore: 87,
    googleConnected: true,
    googleRating: 4.6,
    googleReviewCount: 124,
    answersCount: 18,
    answersSummary: 'ticket_promedio: 12000 | empleados: 8 | dayparts: almuerzo, cena',
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'lanzamiento_2026',
    device: 'Escritorio',
    os: 'macOS',
    browser: 'Chrome',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#f6f7f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '620px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #ececef' }
const badge = { display: 'inline-block', padding: '6px 12px', borderRadius: '999px', backgroundColor: '#34c75915', marginBottom: '12px' }
const badgeText = { margin: 0, color: '#1f9d4f', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px' }
const h1 = { fontSize: '24px', fontWeight: 700, color: '#111111', margin: '8px 0 2px', letterSpacing: '-0.3px' }
const subtitle = { fontSize: '14px', color: '#1d1d1f', margin: '0 0 4px' }
const timestampStyle = { fontSize: '12px', color: '#86868b', margin: '0 0 18px' }
const blockSection = { marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #f0f0f2' }
const blockTitle = { margin: '0 0 8px', color: '#1f9d4f', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase' as const }
const hr = { borderTop: '1px solid #f0f0f2', margin: '20px 0 12px' }
const rowStyle = { padding: '6px 0' }
const rowLabel = { margin: '0 0 1px', color: '#86868b', fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '0.5px', fontWeight: 600 }
const rowValue = { margin: 0, color: '#1d1d1f', fontSize: '14px', fontWeight: 500, wordBreak: 'break-word' as const }
const rowValueMono = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '12px', color: '#3a3a3c' }
const footer = { fontSize: '12px', color: '#86868b', margin: '12px 0 0', lineHeight: '1.6' }
const linkStyle = { color: '#1f9d4f', textDecoration: 'none' }
