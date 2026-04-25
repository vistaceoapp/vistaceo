/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  email?: string
  fullName?: string
  authMethod?: string
  userId?: string
  timestamp?: string
}

const Email = ({ email, fullName, authMethod, userId, timestamp }: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Nuevo usuario registrado en VistaCEO: {email || ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={badge}>
          <Text style={badgeText}>VISTACEO · NOTIFICACIÓN</Text>
        </Section>
        <Heading style={h1}>Nuevo usuario registrado</Heading>
        <Text style={timestampStyle}>{timestamp || new Date().toLocaleString('es-AR')}</Text>
        <Hr style={hr} />
        <Row label="Email" value={email} />
        <Row label="Nombre" value={fullName} />
        <Row label="Método" value={authMethod === 'google' ? 'Google' : 'Email + contraseña'} />
        <Row label="User ID" value={userId} />
        <Hr style={hr} />
        <Text style={footer}>
          Aviso interno automático de VistaCEO. Respondé este email solo si necesitás contactar al usuario.
        </Text>
      </Container>
    </Body>
  </Html>
)

const Row = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null
  return (
    <Section style={rowStyle}>
      <Text style={rowLabel}>{label}</Text>
      <Text style={rowValue}>{value}</Text>
    </Section>
  )
}

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `🆕 Nuevo usuario: ${d.email ?? 'sin email'}`,
  displayName: 'Admin · Nuevo usuario',
  to: 'info@vistaceo.com',
  previewData: {
    email: 'usuario@ejemplo.com',
    fullName: 'Juan Pérez',
    authMethod: 'google',
    userId: 'abc-123',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px', margin: '0 auto' }
const badge = { display: 'inline-block', padding: '6px 12px', borderRadius: '999px', backgroundColor: '#0071e315', marginBottom: '12px' }
const badgeText = { margin: 0, color: '#0071e3', fontSize: '11px', fontWeight: 600, letterSpacing: '0.4px' }
const h1 = { fontSize: '22px', fontWeight: 700, color: '#111111', margin: '8px 0 4px', letterSpacing: '-0.3px' }
const timestampStyle = { fontSize: '13px', color: '#86868b', margin: '0 0 16px' }
const hr = { borderTop: '1px solid #f0f0f2', margin: '16px 0' }
const rowStyle = { padding: '8px 0' }
const rowLabel = { margin: '0 0 2px', color: '#86868b', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.4px' }
const rowValue = { margin: 0, color: '#1d1d1f', fontSize: '14px', fontWeight: 500 }
const footer = { fontSize: '12px', color: '#a1a1a6', margin: '16px 0 0', lineHeight: '1.5' }
