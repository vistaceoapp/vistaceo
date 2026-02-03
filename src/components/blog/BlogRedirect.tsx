// Blog redirect component - redirects to subdomain
import { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

const BLOG_SUBDOMAIN = 'https://blog.vistaceo.com';

export default function BlogRedirect() {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();

  useEffect(() => {
    // Construct the redirect URL
    let targetUrl = BLOG_SUBDOMAIN;
    
    if (slug) {
      targetUrl = `${BLOG_SUBDOMAIN}/${slug}`;
    } else if (location.pathname.startsWith('/blog/tema/')) {
      // Handle cluster redirects
      const clusterPath = location.pathname.replace('/blog', '');
      targetUrl = `${BLOG_SUBDOMAIN}${clusterPath}`;
    }
    
    // Redirect to the blog subdomain
    window.location.replace(targetUrl);
  }, [slug, location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Redirigiendo al blog...</p>
      </div>
    </div>
  );
}
