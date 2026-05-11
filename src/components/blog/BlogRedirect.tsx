// Blog redirect component — manda SIEMPRE a la URL canónica del subdominio
// con trailing slash. Evita la duplicación /slug vs /slug/ que GSC marca.
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useLocation } from 'react-router-dom';

const BLOG_SUBDOMAIN = 'https://blog.vistaceo.com';

function withTrailingSlash(url: string): string {
  if (url.endsWith('/')) return url;
  // No agregar slash si hay query/hash
  if (url.includes('?') || url.includes('#')) return url;
  return `${url}/`;
}

export default function BlogRedirect() {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();

  // Build target URL — siempre canónico con trailing slash
  let targetUrl = `${BLOG_SUBDOMAIN}/`;
  if (slug) {
    targetUrl = withTrailingSlash(`${BLOG_SUBDOMAIN}/${slug}`);
  } else if (location.pathname.startsWith('/blog/tema/')) {
    const clusterPath = location.pathname.replace('/blog', '');
    targetUrl = withTrailingSlash(`${BLOG_SUBDOMAIN}${clusterPath}`);
  }

  useEffect(() => {
    // Replace para no dejar entrada en history (equivale visualmente a 301)
    window.location.replace(targetUrl);
  }, [targetUrl]);

  return (
    <>
      <Helmet>
        {/* noindex: Google NO debe indexar esta página de tránsito */}
        <meta name="robots" content="noindex, nofollow" />
        {/* Canonical apunta al contenido real en el subdominio */}
        <link rel="canonical" href={targetUrl} />
        {/* Refresh fallback para bots sin JS */}
        <meta httpEquiv="refresh" content={`0;url=${targetUrl}`} />
        <title>Redirigiendo al blog de VISTACEO...</title>
      </Helmet>
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirigiendo al blog...</p>
          <a href={targetUrl} className="text-primary underline text-sm mt-2 block">
            Ir al blog →
          </a>
        </div>
      </div>
    </>
  );
}
