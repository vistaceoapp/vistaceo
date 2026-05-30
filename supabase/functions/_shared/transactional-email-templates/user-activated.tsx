/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  firstName?: string
  businessName?: string
  dashboardUrl?: string
}

const Email = ({ firstName, businessName, dashboardUrl }: Props) => {
  const name = firstName || 'hola'
  const biz = businessName || 'tu negocio'
  const url = dashboardUrl || 'https://www.vistaceo.com/app'
  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>{biz} ya está calibrado — entrá a tu panel para ver tu primera acción.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={badge}><Text style={badgeText}>VISTACEO · ACTIVADO</Text></Section>
          <Heading style={h1}>{name}, {biz} ya está activo.</Heading>
          <Text style={lead}>
            Tu calibración inicial está lista. Ya podés ver la salud de tu negocio,
            tus oportunidades priorizadas y la primera acción del día.
          </Text>

          <Section style={ctaWrap}>
            <Button href={url} style={cta}>Entrar a mi panel</Button>
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

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #ececef' }
const badge = { display: 'inline-block', padding: '6px 12px', borderRadius: '999px', backgroundColor: '#2692DC15', marginBottom: '14px' }
const badgeText = { margin: 0, color: '#2692DC', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px' }
const h1 = { fontSize: '24px', fontWeight: 700, color: '#0a0a0a', margin: '6px 0 10px', letterSpacing: '-0.3px', lineHeight: '1.25' }
const lead = { fontSize: '15px', color: '#3a3a3c', margin: '0 0 22px', lineHeight: '1.6' }
const ctaWrap = { textAlign: 'center' as const, margin: '8px 0 6px' }
const cta = { background: 'linear-gradient(135deg,#2692DC 0%,#746CE6 100%)', color: '#ffffff', padding: '14px 28px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '15px', display: 'inline-block' }
const hr = { borderTop: '1px solid #f0f0f2', margin: '22px 0 14px' }
const blockTitle = { margin: '0 0 8px', color: '#2692DC', fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase' as const }
const body = { fontSize: '14px', color: '#1d1d1f', margin: '0 0 8px', lineHeight: '1.6' }
const footer = { fontSize: '12px', color: '#86868b', margin: '16px 0 0', lineHeight: '1.6' }
