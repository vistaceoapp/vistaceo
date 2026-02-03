# VistaCEO Blog - Next.js SSG/ISR

Blog profesional con SEO perfecto para LinkedIn, Google y redes sociales.

## 🚀 Características

- ✅ **SSG + ISR**: HTML real en cada URL (no SPA)
- ✅ **SEO Perfecto**: OG tags, Twitter Cards, JSON-LD
- ✅ **Sitemap dinámico**: Actualizado automáticamente
- ✅ **RSS Feed**: Para agregadores y Google News
- ✅ **Revalidación automática**: Endpoint para cron
- ✅ **Diseño editorial**: Minimalista y profesional

## 📦 Instalación

```bash
# Clonar/copiar este directorio
cd blog-nextjs-template

# Instalar dependencias
npm install

# También necesitás:
npm install @tailwindcss/typography
```

## 🔧 Configuración

1. Copiá `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

2. Completá las variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://nlewrgmcawzcdazhfiyy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
REVALIDATE_SECRET=un_secret_de_32_chars_minimo
NEXT_PUBLIC_SITE_URL=https://blog.vistaceo.com
NEXT_PUBLIC_MAIN_SITE_URL=https://www.vistaceo.com
```

## 🌐 Deploy en Vercel

1. Subí este código a un nuevo repositorio en GitHub
2. Conectá el repo a Vercel: https://vercel.com/new
3. Configurá las variables de entorno en Vercel
4. Deploy!

## 🔄 Configurar Subdominio

En Cloudflare (o tu DNS):

1. Agregá un registro CNAME:
   - Name: `blog`
   - Target: `cname.vercel-dns.com`
   - Proxy: OFF (solo DNS)

2. En Vercel, agregá el dominio `blog.vistaceo.com` al proyecto

## 🔄 Integración con Cron

Cuando el cron publique un post, debe llamar:

```bash
curl -X POST https://blog.vistaceo.com/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: TU_SECRET" \
  -d '{"slug": "mi-nuevo-post", "cluster": "empleo"}'
```

### Desde Edge Function (Supabase)

```typescript
await fetch("https://blog.vistaceo.com/api/revalidate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-revalidate-secret": Deno.env.get("REVALIDATE_SECRET")!,
  },
  body: JSON.stringify({
    slug: post.slug,
    cluster: post.pillar,
  }),
});
```

## 📁 Estructura

```
blog-nextjs-template/
├── src/
│   ├── app/
│   │   ├── [slug]/page.tsx      # Posts individuales
│   │   ├── tema/[cluster]/      # Hubs por categoría
│   │   ├── api/revalidate/      # Endpoint de revalidación
│   │   ├── sitemap.ts           # Sitemap dinámico
│   │   ├── robots.ts            # robots.txt
│   │   ├── rss.xml/route.ts     # RSS Feed
│   │   └── page.tsx             # Home
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── PostCard.tsx
│   │   └── MarkdownContent.tsx
│   └── lib/
│       ├── supabase.ts          # Cliente Supabase
│       ├── posts.ts             # Funciones de datos
│       ├── schema.ts            # JSON-LD schemas
│       └── types.ts             # TypeScript types
└── public/
    ├── favicon.png
    └── og-default.jpg           # OG image por defecto
```

## ✅ Verificación SEO

Después del deploy, verificá:

1. **View Source**: `view-source:https://blog.vistaceo.com/tu-slug`
   - Debe mostrar HTML completo con meta tags

2. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
   - Debe mostrar título, descripción e imagen correctos

3. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
   - Debe mostrar card con imagen grande

4. **Google Rich Results Test**: https://search.google.com/test/rich-results
   - Debe detectar Article schema

## 🔧 Comandos

```bash
npm run dev      # Desarrollo local
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter
```

## 📝 Notas

- El blog usa la misma DB de Supabase que la app principal
- ISR revalida cada 5 minutos por defecto
- El endpoint `/api/revalidate` permite revalidación bajo demanda
- Las imágenes OG deben ser públicas (no requieren auth)
