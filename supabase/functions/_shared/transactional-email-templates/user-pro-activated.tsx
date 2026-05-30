/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  firstName?: string
  planLabel?: string
  dashboardUrl?: string
}

const Email = ({ firstName, planLabel, dashboardUrl }: Props) => {
  const name = firstName || 'hola'
  const plan = planLabel || 'VISTACEO Pro'
  const url = dashboardUrl || 'https://www.vistaceo.com/app'
  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>Tu plan {plan} está activo — desbloqueaste alta capacidad e inteligencia avanzada.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={badge}><Text style={badgeText}>VISTACEO · PRO ACTIVO</Text></Section>
          <Heading style={h1}>{name}, tu {plan} está activo.</Heading>
          <Text style={lead}>
            Ya tenés alta capacidad de chat estratégico, radar premium, predicciones
            avanzadas y planes de acción personalizados. Listo para usar.
          </Text>

          <Section style={ctaWrap}>
            <Button href={url} style={cta}>Ir a mi panel Pro</Button>
          </Section>

          <Hr style={hr} />
          <Text style={blockTitle}>Qué ganaste</Text>
          <Text style={bullet}>· Chat estratégico con alta capacidad y modelo premium.</Text>
          <Text style={bullet}>· Radar y predicciones avanzadas en tu sector.</Text>
          <Text style={bullet}>· Planes de acción personalizados.</Text>
          <Text style={bullet}>· Soporte prioritario por email.</Text>

          <Hr style={hr} />
          <Text style={footer}>
            Gracias por confiar en nosotros.
            <br />— Equipo VISTACEO® Plataforma IA
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: '🚀 VISTACEO Pro activado — alta capacidad desbloqueada',
  displayName: 'Usuario · Pro activado',
  previewData: { firstName: 'Juan', planLabel: 'VISTACEO Pro Mensual', dashboardUrl: 'https://www.vistaceo.com/app' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #ececef' }
const badge = { display: 'inline-block', padding: '6px 12px', borderRadius: '999px', backgroundColor: '#746CE615', marginBottom: '14px' }
const badgeText = { margin: 0, color: '#746CE6', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px' }
const h1 = { fontSize: '24px', fontWeight: 700, color: '#0a0a0a', margin: '6px 0 10px', letterSpacing: '-0.3px', lineHeight: '1.25' }
const lead = { fontSize: '15px', color: '#3a3a3c', margin: '0 0 22px', lineHeight: '1.6' }
const ctaWrap = { textAlign: 'center' as const, margin: '8px 0 6px' }
const cta = { background: 'linear-gradient(135deg,#2692DC 0%,#746CE6 100%)', color: '#ffffff', padding: '14px 28px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '15px', display: 'inline-block' }
const hr = { borderTop: '1px solid #f0f0f2', margin: '22px 0 14px' }
const blockTitle = { margin: '0 0 8px', color: '#746CE6', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase' as const }
const bullet = { margin: '4px 0', color: '#1d1d1f', fontSize: '14px', lineHeight: '1.6' }
const footer = { fontSize: '12px', color: '#86868b', margin: '16px 0 0', lineHeight: '1.6' }
