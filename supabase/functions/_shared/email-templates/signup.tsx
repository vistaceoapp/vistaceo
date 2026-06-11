/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

import { brand, button, container, footer, h1, link, main, text, logo, divider } from './_styles.ts'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Confirmá tu cuenta en VISTACEO</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={{ textAlign: 'center', marginBottom: 24 }}>
          <Img src={brand.logoUrl} alt="VISTACEO" width="140" style={logo} />
        </Section>
        <Heading style={h1}>Confirmá tu correo</Heading>
        <Text style={text}>
          Gracias por crear tu cuenta en{' '}
          <Link href={siteUrl} style={link}><strong>VISTACEO</strong></Link>, tu inteligencia ejecutiva para decidir mejor cada día.
        </Text>
        <Text style={text}>
          Confirmá que <Link href={`mailto:${recipient}`} style={link}>{recipient}</Link> es tu dirección presionando el botón:
        </Text>
        <Section style={{ textAlign: 'center', margin: '28px 0' }}>
          <Button style={button} href={confirmationUrl}>Confirmar mi cuenta</Button>
        </Section>
        <Text style={footer}>
          Si vos no creaste esta cuenta, podés ignorar este mensaje sin problemas.
        </Text>
        <div style={divider} />
        <Text style={footer}>VISTACEO · Inteligencia ejecutiva para tu negocio</Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
