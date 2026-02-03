import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://blog.vistaceo.com',
  base: '/',
  output: 'static',
  build: {
    format: 'directory'
  },
  vite: {
    define: {
      'import.meta.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL),
      'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY)
    }
  }
});
