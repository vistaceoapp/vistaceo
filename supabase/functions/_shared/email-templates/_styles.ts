export const brand = {
  primary: '#2692DC',
  primaryDark: '#1e7ab8',
  gradient: 'linear-gradient(135deg, #2692DC 0%, #746CE6 100%)',
  foreground: '#0f172a',
  muted: '#64748b',
  bg: '#ffffff',
  surface: '#f8fafc',
  radius: '14px',
  logoUrl: 'https://nlewrgmcawzcdazhfiyy.supabase.co/storage/v1/object/public/email-assets/logo-vistaceo.png',
}

export const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Arial, sans-serif',
}
export const container = {
  padding: '32px 28px',
  maxWidth: '560px',
  margin: '0 auto',
}
export const logo = { display: 'inline-block' as const }
export const h1 = {
  fontSize: '24px',
  fontWeight: 700 as const,
  color: brand.foreground,
  margin: '0 0 16px',
  letterSpacing: '-0.01em',
}
export const text = {
  fontSize: '15px',
  color: brand.foreground,
  lineHeight: '1.6',
  margin: '0 0 16px',
}
export const link = { color: brand.primary, textDecoration: 'underline' }
export const button = {
  backgroundImage: brand.gradient,
  backgroundColor: brand.primary,
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 600 as const,
  borderRadius: brand.radius,
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block' as const,
}
export const footer = {
  fontSize: '12px',
  color: brand.muted,
  margin: '24px 0 0',
  lineHeight: '1.5',
}
export const divider = {
  borderTop: '1px solid #e2e8f0',
  margin: '28px 0 16px',
}
export const code = {
  display: 'inline-block' as const,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '22px',
  letterSpacing: '0.3em',
  background: brand.surface,
  color: brand.foreground,
  padding: '14px 20px',
  borderRadius: brand.radius,
  border: '1px solid #e2e8f0',
}
