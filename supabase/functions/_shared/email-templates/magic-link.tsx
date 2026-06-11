/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import { brand, button, container, footer, h1, link, main, text, logo, divider } from './_styles.ts'

interface Props { siteName: string; siteUrl: string; recipient: string; confirmationUrl: string }

export const MagicLinkEmail = ({ siteUrl, confirmationUrl }: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tu enlace de acceso a VISTACEO</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={{ textAlign: 'center', marginBottom: 24 }}>
          <Img src={brand.logoUrl} alt="VISTACEO" width="140" style={logo} />
        </Section>
        <Heading style={h1}>Iniciar sesión en VISTACEO</Heading>
        <Text style={text}>
          Recibimos tu pedido para entrar a <Link href={siteUrl} style={link}><strong>VISTACEO</strong></Link>. Hacé clic en el botón para acceder de forma segura:
        </Text>
        <Section style={{ textAlign: 'center', margin: '28px 0' }}>
          <Button style={button} href={confirmationUrl}>Entrar a VISTACEO</Button>
        </Section>
        <Text style={footer}>Este enlace expira en pocos minutos. Si no fuiste vos, ignorá este mensaje.</Text>
        <div style={divider} />
        <Text style={footer}>VISTACEO · Inteligencia ejecutiva para tu negocio</Text>
      </Container>
    </Body>
  </Html>
)
export default MagicLinkEmail
