/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import { brand, button, container, footer, h1, main, text, logo, divider } from './_styles.ts'

interface Props { siteName: string; siteUrl: string; recipient: string; confirmationUrl: string }

export const InviteEmail = ({ confirmationUrl }: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Te invitamos a VISTACEO</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={{ textAlign: 'center', marginBottom: 24 }}>
          <Img src={brand.logoUrl} alt="VISTACEO" width="140" style={logo} />
        </Section>
        <Heading style={h1}>Tenés una invitación a VISTACEO</Heading>
        <Text style={text}>
          Te invitamos a unirte a <strong>VISTACEO</strong>, la plataforma de inteligencia ejecutiva. Aceptá la invitación para crear tu cuenta:
        </Text>
        <Section style={{ textAlign: 'center', margin: '28px 0' }}>
          <Button style={button} href={confirmationUrl}>Aceptar invitación</Button>
        </Section>
        <div style={divider} />
        <Text style={footer}>VISTACEO · Inteligencia ejecutiva para tu negocio</Text>
      </Container>
    </Body>
  </Html>
)
export default InviteEmail
