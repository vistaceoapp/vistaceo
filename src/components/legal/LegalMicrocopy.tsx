import { Link } from "react-router-dom";

// ============================================
// MICROCOPY PARA USO EN TODA LA APP
// ============================================

/**
 * Signup/Login: Texto de aceptación de términos
 */
export const TermsAcceptanceText = () => (
  <p className="text-xs text-muted-foreground text-center">
    Al crear una cuenta, aceptás las{" "}
    <Link to="/condiciones" className="text-primary hover:underline">
      Condiciones del Servicio
    </Link>{" "}
    y la{" "}
    <Link to="/politicas" className="text-primary hover:underline">
      Política de Privacidad
    </Link>
    .
  </p>
);

/**
 * Checkout/Paywall: Disclaimers de precios y moneda
 */
export const PricingDisclaimers = ({ className = "" }: { className?: string }) => (
  <div className={`space-y-2 text-xs text-muted-foreground ${className}`}>
    <p>
      💵 Precios en USD. Conversión estimada a moneda local según el tipo de 
      cambio del sistema al momento.
    </p>
    <p>
      ⚠️ Pueden aplicar impuestos, retenciones y comisiones del procesador de 
      pago, banco o emisor.
    </p>
    <p>
      VistaCEO no controla ni se responsabiliza por esos cargos.
    </p>
  </div>
);

/**
 * Checkout: Versión compacta del disclaimer
 */
export const CompactPricingDisclaimer = () => (
  <p className="text-xs text-muted-foreground">
    Precios en USD. Pueden aplicar impuestos y comisiones adicionales.{" "}
    <Link to="/condiciones#facturacion" className="text-primary hover:underline">
      Más información
    </Link>
  </p>
);

/**
 * File/Content Upload: Advertencia de responsabilidad
 */
export const ContentUploadWarning = () => (
  <p className="text-xs text-muted-foreground flex items-start gap-2">
    <span className="text-warning">⚠️</span>
    <span>
      No subas datos de terceros sin autorización. Sos responsable del contenido 
      que cargás.{" "}
      <Link to="/condiciones#contenido-usuario" className="text-primary hover:underline">
        Ver más
      </Link>
    </span>
  </p>
);

/**
 * Footer Links: Links legales para el footer
 */
export const FooterLegalLinks = () => (
  <div className="flex items-center gap-4 text-sm text-muted-foreground">
    <Link to="/condiciones" className="hover:text-foreground transition-colors">
      Condiciones
    </Link>
    <Link to="/politicas" className="hover:text-foreground transition-colors">
      Privacidad
    </Link>
    <a 
      href="mailto:info@vistaceo.com" 
      className="hover:text-foreground transition-colors"
    >
      Contacto
    </a>
  </div>
);

/**
 * Settings: Links legales con descripciones
 */
export const SettingsLegalLinks = () => (
  <div className="space-y-3">
    <Link 
      to="/condiciones" 
      className="block p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
    >
      <p className="font-medium text-foreground">Condiciones del Servicio</p>
      <p className="text-sm text-muted-foreground">
        Términos de uso de VistaCEO
      </p>
    </Link>
    <Link 
      to="/politicas" 
      className="block p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
    >
      <p className="font-medium text-foreground">Política de Privacidad</p>
      <p className="text-sm text-muted-foreground">
        Cómo manejamos tus datos personales
      </p>
    </Link>
  </div>
);

/**
 * AI Disclaimer: Para mostrar en el chat
 */
export const AIDisclaimer = () => (
  <p className="text-xs text-muted-foreground bg-card/50 border border-border/50 rounded-lg p-3">
    💡 Las respuestas de la IA son sugerencias y pueden contener errores. 
    Validá información importante y consultá profesionales cuando corresponda.{" "}
    <Link to="/condiciones#ia-limitaciones" className="text-primary hover:underline">
      Más información
    </Link>
  </p>
);

/**
 * Plan Cards: Texto para mostrar en cada plan
 */
export const FreePlanNote = () => (
  <p className="text-xs text-muted-foreground">
    ✓ 100% gratis, sin tarjeta de crédito
  </p>
);

export const ProPlanNote = () => (
  <p className="text-xs text-muted-foreground">
    Renovación automática. Cancelá cuando quieras.
  </p>
);
