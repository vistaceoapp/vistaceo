# Centro de Salud Operativa — /admin/salud

Un único panel donde ves **qué se rompió, dónde, cuándo, y cómo se arregló** — para la app completa y el blog. Detecta y auto-repara errores, regresiones de UX/UI, problemas SEO, demoras y fallas estructurales (notas de blog incompletas, hero con texto, etc.).

## Arquitectura

```text
                   ┌─────────────────────────────────────────┐
                   │   /admin/salud  (UI única, tiempo real) │
                   │  Incidents · Auto-fixes · SLO · Trends  │
                   └────────────────┬────────────────────────┘
                                    │
                ┌───────────────────┴───────────────────┐
                │   tabla: ops_incidents (event store)  │
                └───────────────────┬───────────────────┘
                                    │
       ┌────────────────────────────┼─────────────────────────────┐
       ▼                            ▼                             ▼
   App Sensors                Blog Sensors               Auto-Healers
 (frontend hooks)         (edge function scheduled)    (edge functions)
       │                            │                             │
  - Window error           - hero image OCR text         - blog-autoheal
  - Unhandled rejection    - missing TOC / menú          - app-autoheal
  - React ErrorBoundary    - meta description vacía       (re-render notes,
  - Slow render (>200ms)   - sin canonical / JSON-LD      regenerate hero,
  - Failed fetch           - <h1> duplicado               clear stale cache)
  - Console warnings       - thin content / 404           - sends Resend alert
  - Web Vitals (LCP/INP)   - imagen rota / WebP fail
```

## Tabla nueva: `ops_incidents`

```sql
id uuid pk
source text       -- 'app' | 'blog' | 'edge_fn' | 'db' | 'seo'
category text     -- 'error' | 'ux' | 'perf' | 'seo' | 'content' | 'structural'
severity text     -- 'critical' | 'high' | 'medium' | 'low'
title text
where_path text   -- ruta o slug
detected_by text  -- nombre del sensor
context jsonb     -- stack, url, viewport, user_id, etc.
status text       -- 'open' | 'auto_fixing' | 'fixed' | 'ignored' | 'manual_required'
fix_strategy text -- qué intentó hacer el auto-healer
fix_result jsonb  -- qué pasó al arreglar
fixed_at timestamptz
created_at, updated_at
```

RLS: solo admins (`has_role(auth.uid(), 'admin')`).

## Sensores App (frontend)

Hook nuevo `useAppSensors()` montado en `AppLayout`:
- Captura `window.onerror` + `unhandledrejection` y los enruta a `report-incident`.
- Mide `PerformanceObserver` para INP/LCP > umbrales → registra `perf` incident.
- Captura `fetch` fallidos vía interceptor (status ≥ 500 o timeout).
- ErrorBoundary global ya existe → lo conectamos para que reporte.

## Sensores Blog (edge function `blog-health-scan`)

Cron cada 6h. Recorre cada `blog_posts.status='published'` y valida:
1. **Hero sin texto**: descarga `og_image_url` y pasa por Gemini Vision con prompt "¿contiene texto escrito? sí/no". Si sí → incident `content/critical` + dispara `blog-regenerate-hero`.
2. **Menú/TOC**: parsea HTML renderizado del blog Astro y verifica presencia de `<nav>` + `BlogTableOfContents`.
3. **SEO mínimos**: meta description 60–160 chars, canonical, JSON-LD Article, ≥1 H1, alt en imágenes.
4. **Contenido**: ≥1500 chars, sin `{{placeholder}}`, sin "Lorem".
5. **Links rotos**: HEAD a links internos y externos.

## Auto-healers

- **`blog-autoheal`**: recibe incident_id, ejecuta estrategia según `category` (regenerar hero, re-renderizar nota, reinyectar meta tags, llenar TOC), actualiza incident con `fix_result`.
- **`app-autoheal`**: limpieza de cache localStorage corrupto, invalidación de queries colgadas, re-fetch automático tras fallo transitorio.
- Si el auto-fix falla 2 veces → status `manual_required` + alerta por email vía Resend al admin.

## UI `/admin/salud`

Una página con 4 tabs:
1. **En vivo** — incidents abiertos, agrupados por severidad, con botón "Reintentar fix".
2. **Resueltos** — timeline de qué se arregló y cómo (diff legible).
3. **Métricas** — SLO de la app (uptime, error rate, p95 INP, blog health %).
4. **Salud del Blog** — grilla de notas con score 0-100 y issues activos.

Cada fila expande para mostrar: stack trace, screenshot (si aplica), estrategia de fix, resultado, link al recurso.

## Cron

```sql
select cron.schedule('blog-health-every-6h','0 */6 * * *', $$
  select net.http_post(url:='.../functions/v1/blog-health-scan', ...);
$$);
```

## Plan de implementación

**Fase 1 — Cimientos (esta iteración):**
1. Migración: tabla `ops_incidents` + RLS admin + grants.
2. Edge function `report-incident` (POST → insert).
3. Hook `useAppSensors` + integración en `AppLayout` + `ErrorBoundary`.
4. Página `/admin/salud` con tabs En vivo / Resueltos / Métricas / Blog (lectura).

**Fase 2 — Blog scanning:**
5. Edge function `blog-health-scan` con todos los validadores.
6. Cron cada 6h.
7. Tab "Salud del Blog" con detalle por nota.

**Fase 3 — Auto-healing:**
8. Edge function `blog-autoheal` (regenera hero, reinyecta meta, etc.).
9. Edge function `app-autoheal` (clear cache, re-fetch).
10. Alertas Resend a admin cuando `manual_required`.

## Para empezar necesito confirmes

- ¿Arranco por **Fase 1 completa** (cimientos + página de lectura) y luego enganchamos Fase 2 y 3? Recomendado porque cada fase ya entrega valor visible.
- ¿Querés también que reporte **eventos del navegador del usuario final** (errores que les pasan a ellos) o solo los tuyos en /admin? Recomiendo: sí, anónimos, para captar problemas reales en producción.
- ¿OK que el auto-healer del blog **modifique la nota en vivo** sin tu aprobación cuando el fix sea seguro (regenerar hero, reinyectar meta), y solo te pida confirmación para cosas riesgosas (reescribir contenido)?
