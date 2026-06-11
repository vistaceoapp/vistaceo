/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import { brand, button, container, footer, h1, main, text, logo, divider } from './_styles.ts'

interface Props { siteName: string; siteUrl: string; recipient: string; confirmationUrl: string; email?: string; newEmail?: string }

export const EmailChangeEmail = ({ confirmationUrl, email, newEmail }: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Confirmá el cambio de correo en VISTACEO</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={{ textAlign: 'center', marginBottom: 24 }}>
          <Img src={brand.logoUrl} alt="VISTACEO" width="140" style={logo} />
        </Section>
        <Heading style={h1}>Confirmá el cambio de correo</Heading>
        <Text style={text}>
          Pediste cambiar el correo de tu cuenta en <strong>VISTACEO</strong>
          {email && newEmail ? <> de <strong>{email}</strong> a <strong>{newEmail}</strong></> : null}.
        </Text>
        <Section style={{ textAlign: 'center', margin: '28px 0' }}>
          <Button style={button} href={confirmationUrl}>Confirmar cambio</Button>
        </Section>
        <Text style={footer}>Si no pediste este cambio, ignorá este mensaje y tu correo seguirá igual.</Text>
        <div style={divider} />
        <Text style={footer}>VISTACEO · Inteligencia ejecutiva para tu negocio</Text>
      </Container>
    </Body>
  </Html>
)
export default EmailChangeEmail
