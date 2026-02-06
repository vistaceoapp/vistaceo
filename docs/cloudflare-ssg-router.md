# VistaSEOOS — Cloudflare Worker Router

Este Worker es el **componente crítico** que sirve el HTML estático de los blog posts desde Supabase Storage.

## Instalación en Cloudflare

### 1. Crear el Worker

1. Ir a **Cloudflare Dashboard** → **Workers & Pages** → **Create**
2. Nombrar: `vistaceo-ssg-router`
3. Pegar el código del archivo `cloudflare-worker.js`

### 2. Configurar Variables de Entorno

En **Settings** → **Variables**:

```
SUPABASE_URL = https://nlewrgmcawzcdazhfiyy.supabase.co
STORAGE_BUCKET = blog-ssg-pages
ORIGIN_URL = https://www.vistaceo.com
```

### 3. Configurar Routes

En **Settings** → **Triggers** → **Routes**, agregar:

```
www.vistaceo.com/blog/*
www.vistaceo.com/sitemap.xml
www.vistaceo.com/robots.txt
```

**IMPORTANTE**: Asegurarse de que el DNS de `www.vistaceo.com` esté en modo **Proxy (orange cloud)** en Cloudflare.

## Cómo Funciona

```
Request: /blog/mi-slug
    ↓
Worker detecta /blog/*
    ↓
Intenta fetch de Storage: blog-ssg-pages/blog/mi-slug/index.html
    ↓
¿Existe? → Servir HTML estático con cache
¿No existe? → Fallback a edge function blog-seo
¿Tampoco? → 404
```

## Código del Worker

Ver archivo: `cloudflare-worker.js`

## Flujo de Publicación

1. Cron publica post → status = `published`
2. Trigger llama a `generate-blog-ssg?slug=X`
3. HTML se guarda en Storage
4. Sitemap se regenera
5. Worker ya sirve el nuevo HTML

## Testing

### Verificar SSG funcionando:

```bash
# Debe devolver HTML del post (no SPA)
curl -I https://www.vistaceo.com/blog/agujeros-rentabilidad-servicios-profesionales

# Verificar headers
curl -s https://www.vistaceo.com/blog/agujeros-rentabilidad-servicios-profesionales | head -50
```

### Verificar en LinkedIn Post Inspector:

1. Ir a https://www.linkedin.com/post-inspector/
2. Ingresar URL del post
3. Verificar:
   - **Title**: Título del post (no home)
   - **Description**: Excerpt del post
   - **Image**: OG image del post
   - **Resolved URL**: Debe ser `/blog/slug`

## Purgar Cache

Si el HTML no se actualiza:

1. **Cloudflare**: Dashboard → Caching → Purge Cache → Custom Purge → URL específica
2. **LinkedIn**: Usar Post Inspector para forzar re-fetch
3. **Regenerar SSG**: Llamar a `generate-blog-ssg?slug=X`

## Troubleshooting

### El post muestra metadata de home

- Verificar que el Worker esté activo en las routes
- Verificar que el HTML exista en Storage (`blog-ssg-pages/blog/slug/index.html`)
- Purgar cache de Cloudflare

### LinkedIn sigue mostrando mal

- LinkedIn cachea agresivamente (hasta 7 días)
- Usar Post Inspector repetidamente para forzar refresh
- Verificar que canonical y og:url apunten al post

### 404 en posts nuevos

- Ejecutar `generate-blog-ssg?slug=nuevo-slug`
- Verificar que el post esté `published` en DB

## Archivos Relacionados

- `supabase/functions/generate-blog-ssg/index.ts` - Genera HTML estático
- `supabase/functions/seo-test-suite/index.ts` - Valida SEO
- `supabase/functions/sitemap/index.ts` - Genera sitemap
- `supabase/functions/blog-seo/index.ts` - Fallback dinámico
