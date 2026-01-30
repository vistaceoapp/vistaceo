import { Helmet } from "react-helmet-async";

const CANONICAL_DOMAIN = "https://www.vistaceo.com";

interface SiteHeadProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
}

// Organization + WebSite structured data
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VistaCEO",
  alternateName: "VISTACEO",
  url: CANONICAL_DOMAIN,
  logo: `${CANONICAL_DOMAIN}/favicon.png`,
  description: "Tu CEO digital con IA. Inteligencia artificial que analiza tu negocio, detecta oportunidades y te guía con acciones concretas cada día.",
  foundingDate: "2024",
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["Spanish"],
  },
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "VistaCEO",
  alternateName: "VISTACEO - Tu CEO Digital con IA",
  url: CANONICAL_DOMAIN,
  description: "VISTACEO te dice qué hacer HOY en tu negocio. Un CEO digital con IA que piensa en tu empresa 24/7.",
  publisher: {
    "@type": "Organization",
    name: "VistaCEO",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${CANONICAL_DOMAIN}/blog?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export function SiteHead({
  title = "VISTACEO - Tu CEO Digital con IA",
  description = "VISTACEO te dice qué hacer HOY en tu negocio. Un CEO digital con IA que piensa en tu empresa 24/7, cada vez más inteligente, para hacerla crecer según tus objetivos.",
  path = "/",
  image = `${CANONICAL_DOMAIN}/og-image.png`,
  type = "website",
  noindex = false,
}: SiteHeadProps) {
  const canonicalUrl = `${CANONICAL_DOMAIN}${path}`;
  const fullTitle = title.includes("VISTACEO") ? title : `${title} | VistaCEO`;

  return (
    <Helmet>
      {/* Basic meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {noindex && <meta name="robots" content="noindex,follow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="VistaCEO" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="es_LA" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@vistaceo" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data - only on home */}
      {path === "/" && (
        <>
          <script type="application/ld+json">
            {JSON.stringify(organizationSchema)}
          </script>
          <script type="application/ld+json">
            {JSON.stringify(webSiteSchema)}
          </script>
        </>
      )}
    </Helmet>
  );
}

export const CANONICAL_URL = CANONICAL_DOMAIN;
