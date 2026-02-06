import { defineConfig } from 'astro/config';
import seoFiles from './src/integrations/seo-files';

export default defineConfig({
  site: 'https://blog.vistaceo.com',
  base: '/',
  output: 'static',
  build: {
    // Keep directory format for trailing-slash URLs across the site.
    // sitemap.xml and robots.txt are generated as real files via integration.
    format: 'directory',
  },
  integrations: [seoFiles()],
  vite: {
    define: {
      'import.meta.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL),
      'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY),
    },
  },
});

