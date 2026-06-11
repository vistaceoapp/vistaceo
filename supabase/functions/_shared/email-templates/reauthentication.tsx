/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Img, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import { brand, code, container, footer, h1, main, text, logo, divider } from './_styles.ts'

interface Props { siteName: string; siteUrl: string; recipient: string; token: string }

export const ReauthenticationEmail = ({ token }: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tu código de verificación VISTACEO</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={{ textAlign: 'center', marginBottom: 24 }}>
          <Img src={brand.logoUrl} alt="VISTACEO" width="140" style={logo} />
        </Section>
        <Heading style={h1}>Tu código de verificación</Heading>
        <Text style={text}>Ingresá el siguiente código en VISTACEO para confirmar la acción:</Text>
        <Section style={{ textAlign: 'center', margin: '28px 0' }}>
          <span style={code}>{token}</span>
        </Section>
        <Text style={footer}>Si no pediste este código, ignorá este mensaje.</Text>
        <div style={divider} />
        <Text style={footer}>VISTACEO · Inteligencia ejecutiva para tu negocio</Text>
      </Container>
    </Body>
  </Html>
)
export default ReauthenticationEmail
