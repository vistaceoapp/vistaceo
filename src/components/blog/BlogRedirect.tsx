// Blog redirect component - redirects to subdomain with proper SEO signals
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useLocation } from 'react-router-dom';

const BLOG_SUBDOMAIN = 'https://blog.vistaceo.com';

export default function BlogRedirect() {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();

  // Build target URL
  let targetUrl = BLOG_SUBDOMAIN;
  if (slug) {
    targetUrl = `${BLOG_SUBDOMAIN}/${slug}`;
  } else if (location.pathname.startsWith('/blog/tema/')) {
    const clusterPath = location.pathname.replace('/blog', '');
    targetUrl = `${BLOG_SUBDOMAIN}${clusterPath}`;
  }

  useEffect(() => {
    window.location.replace(targetUrl);
  }, [targetUrl]);

  return (
    <>
      <Helmet>
        {/* Tell Google this is NOT a page to index — the real content is on the subdomain */}
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={targetUrl} />
        {/* HTTP-Equiv refresh as fallback for bots that don't run JS */}
        <meta httpEquiv="refresh" content={`0;url=${targetUrl}`} />
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
