/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  email?: string
  fullName?: string
  authMethod?: string
  userId?: string
  timestamp?: string
  // Google identity
  avatarUrl?: string
  googleSubject?: string
  emailVerified?: boolean
  createdAt?: string
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
  // Comportamiento
  pendingPlan?: string
  sessionStart?: string
  signupAt?: string
  currentUrl?: string
}

const Email = (p: Props) => {
  const origen = p.utmSource
    ? `${p.utmSource}${p.utmMedium ? ' / ' + p.utmMedium : ''}${p.utmCampaign ? ' · ' + p.utmCampaign : ''}`
    : (p.referrer ? `Referrer: ${p.referrer}` : 'Directo / desconocido')

  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>Nuevo usuario VISTACEO: {p.email || ''} — {origen}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={badge}>
            <Text style={badgeText}>VISTACEO · NUEVO REGISTRO</Text>
          </Section>
          <Heading style={h1}>{p.fullName || p.email || 'Nuevo usuario'}</Heading>
          <Text style={subtitle}>{p.email}</Text>
          <Text style={timestampStyle}>{p.timestamp || new Date().toLocaleString('es-AR')}</Text>

          {/* Identidad */}
          <SectionBlock title="Identidad">
            <Row label="Email" value={p.email} />
            <Row label="Nombre completo" value={p.fullName} />
            <Row label="Método" value={p.authMethod === 'google' ? 'Google OAuth' : 'Email + contraseña'} />
            <Row label="Email verificado" value={p.emailVerified === true ? 'Sí' : p.emailVerified === false ? 'No' : undefined} />
            <Row label="User ID" value={p.userId} mono />
            <Row label="Google Subject" value={p.googleSubject} mono />
            <Row label="Avatar" value={p.avatarUrl} />
            <Row label="Cuenta creada" value={p.createdAt} />
          </SectionBlock>

          {/* Origen / atribución */}
          <SectionBlock title="Origen y atribución">
            <Row label="UTM source" value={p.utmSource} />
            <Row label="UTM medium" value={p.utmMedium} />
            <Row label="UTM campaign" value={p.utmCampaign} />
            <Row label="UTM content" value={p.utmContent} />
            <Row label="UTM term" value={p.utmTerm} />
            <Row label="Referrer" value={p.referrer || '(directo)'} />
            <Row label="Landing URL" value={p.landingUrl} />
            <Row label="Primer touch" value={p.firstTouchAt} />
            <Row label="Plan pendiente" value={p.pendingPlan} />
          </SectionBlock>

          {/* Contexto técnico */}
          <SectionBlock title="Dispositivo y contexto">
            <Row label="Dispositivo" value={p.device} />
            <Row label="Sistema operativo" value={p.os} />
            <Row label="Navegador" value={p.browser} />
            <Row label="Idioma" value={p.language} />
            <Row label="Zona horaria" value={p.timezone} />
            <Row label="Pantalla" value={p.screen} />
            <Row label="User Agent" value={p.userAgent} mono small />
          </SectionBlock>

          <Hr style={hr} />
          <Text style={footer}>
            Aviso interno automático de VISTACEO. Este usuario aún no completó el setup —
            recibirá el email de recordatorio. {p.email ? <>Contacto directo: <Link href={`mailto:${p.email}`} style={linkStyle}>{p.email}</Link>.</> : null}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const SectionBlock = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Section style={blockSection}>
    <Text style={blockTitle}>{title}</Text>
    {children}
  </Section>
)

const Row = ({ label, value, mono, small }: { label: string; value?: string | boolean; mono?: boolean; small?: boolean }) => {
  if (value === undefined || value === null || value === '') return null
  return (
    <Section style={rowStyle}>
      <Text style={rowLabel}>{label}</Text>
      <Text style={{
        ...rowValue,
        ...(mono ? rowValueMono : {}),
        ...(small ? { fontSize: '12px', wordBreak: 'break-all' as const } : {}),
      }}>{String(value)}</Text>
    </Section>
  )
}

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => {
    const origen = d.utmSource ? ` · ${d.utmSource}` : ''
    return `🆕 Nuevo usuario VISTACEO: ${d.email ?? 'sin email'}${origen}`
  },
  displayName: 'Admin · Nuevo usuario',
  to: 'info@vistaceo.com',
  previewData: {
    email: 'usuario@ejemplo.com',
    fullName: 'Juan Pérez',
    authMethod: 'google',
    userId: 'abc-123',
    emailVerified: true,
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'lanzamiento_2026',
    referrer: 'https://www.google.com/',
    landingUrl: 'https://vistaceo.com/?utm_source=google&utm_medium=cpc',
    device: 'Móvil',
    os: 'iOS',
    browser: 'Safari',
    language: 'es-AR',
    timezone: 'America/Argentina/Buenos_Aires',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#f6f7f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '620px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #ececef' }
const badge = { display: 'inline-block', padding: '6px 12px', borderRadius: '999px', backgroundColor: '#0071e315', marginBottom: '12px' }
const badgeText = { margin: 0, color: '#0071e3', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px' }
const h1 = { fontSize: '24px', fontWeight: 700, color: '#111111', margin: '8px 0 2px', letterSpacing: '-0.3px' }
const subtitle = { fontSize: '14px', color: '#1d1d1f', margin: '0 0 4px' }
const timestampStyle = { fontSize: '12px', color: '#86868b', margin: '0 0 18px' }
const blockSection = { marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #f0f0f2' }
const blockTitle = { margin: '0 0 8px', color: '#0071e3', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase' as const }
const hr = { borderTop: '1px solid #f0f0f2', margin: '20px 0 12px' }
const rowStyle = { padding: '6px 0' }
const rowLabel = { margin: '0 0 1px', color: '#86868b', fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '0.5px', fontWeight: 600 }
const rowValue = { margin: 0, color: '#1d1d1f', fontSize: '14px', fontWeight: 500, wordBreak: 'break-word' as const }
const rowValueMono = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '12px', color: '#3a3a3c' }
const footer = { fontSize: '12px', color: '#86868b', margin: '12px 0 0', lineHeight: '1.6' }
const linkStyle = { color: '#0071e3', textDecoration: 'none' }
