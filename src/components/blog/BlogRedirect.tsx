// Blog redirect component - redirects to subdomain with proper SEO signals
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useLocation } from 'react-router-dom';

const BLOG_SUBDOMAIN = 'https://blog.vistaceo.com';

export default function BlogRedirect() {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();

  // Build target URL — ALWAYS with trailing slash (canonical form on blog.vistaceo.com).
  // This prevents the with/without-slash duplicate signals reported by GSC.
  let targetUrl = `${BLOG_SUBDOMAIN}/`;
  if (slug) {
    targetUrl = `${BLOG_SUBDOMAIN}/${slug}/`;
  } else if (location.pathname.startsWith('/blog/tema/')) {
    const clusterPath = location.pathname.replace('/blog', '').replace(/\/?$/, '/');
    targetUrl = `${BLOG_SUBDOMAIN}${clusterPath}`;
  }

  useEffect(() => {
    // Use 301-equivalent redirect via replace
    window.location.replace(targetUrl);
  }, [targetUrl]);

  return (
    <>
      <Helmet>
        {/* noindex: Google should NOT index this transit page */}
        <meta name="robots" content="noindex, nofollow" />
        {/* Canonical points to the real content on the subdomain */}
        <link rel="canonical" href={targetUrl} />
        {/* HTTP-Equiv refresh as fallback for bots that don't run JS */}
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
