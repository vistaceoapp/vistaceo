# VistaCEO Blog

Blog estático con Astro SSG para VistaCEO. SEO perfecto, OG tags correctos, deploy automático en GitHub Pages.

## 🚀 Setup Rápido

### 1. Crear Repo

```bash
# Desde el repo de vistaceo
cp -r astro-blog ../vistaceo-blog
cd ../vistaceo-blog
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/vistaceoapp/vistaceo-blog.git
git push -u origin main
```

### 2. Configurar Secrets en GitHub

En el repo `vistaceo-blog` → Settings → Secrets → Actions:

- `SUPABASE_URL`: `https://nlewrgmcawzcdazhfiyy.supabase.co`
- `SUPABASE_ANON_KEY`: Tu anon key

### 3. Activar GitHub Pages

Settings → Pages → Source: GitHub Actions

### 4. Configurar DNS (Cloudflare)

Agregar registro CNAME:
- Type: CNAME
- Name: blog
- Target: vistaceoapp.github.io
- Proxy: OFF (nube gris)

## 📁 Estructura

```
src/
├── pages/
│   ├── index.astro          # Home
│   ├── [slug].astro         # Posts dinámicos
│   ├── tema/[cluster].astro # Hubs por tema
│   ├── sitemap.xml.ts
│   ├── robots.txt.ts
│   └── rss.xml.ts
├── layouts/
│   ├── BaseLayout.astro
│   └── PostLayout.astro
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── ToC.astro
│   ├── PostMeta.astro
│   └── RelatedPosts.astro
├── lib/
│   ├── supabase.ts
│   ├── seo.ts
│   ├── clusters.ts
│   └── text.ts
└── styles/
    └── global.css
```

## 🔧 Comandos

```bash
npm run dev      # Desarrollo local
npm run build    # Build producción
npm run preview  # Preview del build
npm run seo:check # Validar SEO
```

## ✅ Checklist Validación

1. `view-source:https://blog.vistaceo.com/<slug>` muestra OG específico del post
2. [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) muestra preview correcta
3. `/sitemap.xml` y `/robots.txt` funcionan
4. JSON-LD presente en cada página

## 📊 Auto-Deploy

El blog se actualiza automáticamente cada 30 minutos via GitHub Actions.
Cualquier post nuevo con `status='published'` aparecerá en el próximo build.
