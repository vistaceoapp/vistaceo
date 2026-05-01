# Landing /promo + Auth low-friction + Setup Express

Una landing nueva, dedicada a tráfico pago, con un único objetivo: **crear cuenta gratis**. No reemplaza la home actual ni rompe rutas existentes.

---

## 1. Nueva ruta `/promo`

Archivo: `src/pages/PromoLanding.tsx` (registrado en `src/App.tsx` como `<Route path="/promo" element={<PromoLanding />} />`).

Estética: **white premium**, gradientes muy sutiles celeste→violeta (`#2692DC` → `#746CE6`), tipografía Codec Pro/Inter, mucho aire, cards con bordes suaves y sombras sutiles. Sin orange (siguiendo memoria de marca). Mobile-first.

### Estructura de secciones

1. **Header mínimo** (sticky, fondo blanco con leve blur)
   - `VistaceoLogo` a la izquierda
   - Centro: micro-trust "Gratis · Sin tarjeta · En minutos" (oculto en mobile)
   - Derecha: link "Ingresar" (`/auth?mode=login` + UTMs) + botón primario "Crear cuenta gratis"
   - Sin nav a Blog / Features / Precios / FAQs

2. **Hero** (arriba del fold, layout 2-col en desktop, stack en mobile)
   - Eyebrow chip: "VISTACEO para tu negocio"
   - H1 (variante A por defecto): "Crea tu cuenta gratis y recibí un plan claro para hacer crecer tu negocio."
   - Subtítulo: "VISTACEO analiza tu negocio, detecta prioridades y te entrega misiones accionables para saber qué hacer hoy."
   - CTA primario: "Crear cuenta gratis" → `buildSignupHref()` (ver §4)
   - CTA secundario ghost: "Ver qué recibo gratis" → scroll a sección beneficios
   - Microcopy: "Gratis · Sin tarjeta · En minutos"
   - **Card visual lateral** (panel inteligente VISTACEO):
     - Header: "Tu primer resultado" + dot pulsante
     - 4 filas con icono + label: Diagnóstico inicial · Prioridades de la semana · 3 misiones concretas · Chat CEO 24/7
     - 2-3 burbujas flotantes sutiles con micro-animación CSS (delays escalonados): "Detectamos una oportunidad comercial", "Nueva misión sugerida", "Prioridad alta para hoy"
     - Sin números/usuarios falsos

3. **¿Qué pasa después de crear tu cuenta?** — 3 pasos numerados horizontales (verticales en mobile)
   1. Contás qué tipo de negocio o servicio tenés
   2. VISTACEO analiza tu contexto y tus objetivos
   3. Recibís prioridades, misiones y próximos pasos

4. **Tu cuenta gratis incluye** — grid 2x2 (1 col mobile)
   - Diagnóstico inicial · Misiones inteligentes · Radar de oportunidades · Chat CEO con IA
   - Cada card: icono lucide, título, copy corto

5. **Pensado para negocios reales** — chips/píldoras con: Restaurantes, Clínicas, Agencias, Comercios, Servicios profesionales, Emprendedores, PyMEs, Marcas personales, Consultores + copy corto

6. **Fila de métricas conceptuales** (sin inventar usuarios) — 4 columnas
   - `3` misiones iniciales · `2 min` para empezar · `0 USD` sin tarjeta · `1` plan claro para hoy

7. **FAQ** — accordion con exactamente 4 preguntas (las del brief)

8. **CTA final**
   - Título: "Empezá gratis y descubrí qué debería hacer hoy tu negocio."
   - Botón: "Crear cuenta gratis"
   - Microcopy: "Sin tarjeta · En minutos · Pensado para negocios de LATAM"

9. **Footer ultra mínimo**: © VISTACEO · links discretos a `/politicas` y `/condiciones` solo (legal compliance, no distractivo)

10. **Sticky CTA mobile** (`md:hidden`, `fixed bottom-0`, safe-area inset)
    - Botón ancho "Crear cuenta gratis" + microcopy "Gratis · Sin tarjeta"
    - Aparece después de hacer scroll > 400px (IntersectionObserver sobre el hero CTA)

---

## 2. Variantes A/B (preparadas, sin activar runtime)

`src/lib/promo/variants.ts` exporta:
```ts
export const HERO_VARIANTS = { A: {...}, B: {...}, C: {...} }
export const CTA_VARIANTS = { A: "Crear cuenta gratis", B: "Recibir mi plan gratis", C: "Empezar gratis ahora" }
export const ACTIVE_HERO = "A"; export const ACTIVE_CTA = "A";
```
La landing lee el variant activo. Para testear, basta cambiar la constante (sin sistema A/B nuevo).

---

## 3. Helper UTM-preserving

`src/lib/promo/utm.ts`:
- `buildSignupHref(extra?)`: lee `window.location.search`, conserva `utm_source/medium/campaign/term/content/gclid`, devuelve `/auth?mode=signup&...`.
- `buildLoginHref()`: idem para `mode=login`.
- Ya existe `captureFirstTouchIfMissing()` y `collectSignupTrackingContext()` en `src/lib/signup-tracking.ts` — reutilizar, no duplicar.

---

## 4. Tracking de funnel

Eventos con el `useActivityTracker` existente (`trackFeatureUse`) + `useLifecycleTracking.track`:

| Evento | Dónde |
|---|---|
| `promo_landing_view` | `useEffect` en PromoLanding |
| `promo_signup_cta_click` | onClick de cada CTA principal (hero, sticky, final) — payload: `{ source, medium, campaign, term, content, landing_path: '/promo', device, timestamp, cta_position }` |
| `signup_started` | Auth.tsx al submit del form / click Google (si viene de `/promo` detectado por referrer o flag en `sessionStorage` `vc_promo_origin=1`) |
| `signup_completed` | Auth.tsx tras éxito |
| `setup_started` / `setup_completed` | Ya emitidos por `useActivityTracker` existente |
| `first_value_shown` / `first_mission_generated` | SetupCompletePage al renderizar el primer diagnóstico |

Al aterrizar en `/promo` se setea `sessionStorage.vc_promo_origin = '1'` para que Auth y Setup sepan aplicar el flujo express.

---

## 5. Auth de baja fricción (`/auth?mode=signup`)

Edits a `src/pages/Auth.tsx`:
- Cuando `mode=signup` **y** existe `vc_promo_origin` en sessionStorage **o** referrer contiene `/promo`: inicializar `showEmailForm = true` (form visible desde el inicio en lugar de toggle oculto).
- Reordenar: Google primero, luego separador "o continuar con email", luego el form ya expandido.
- Mantener Google login y todos los flujos existentes intactos para usuarios que vienen de otras rutas (no romper).
- Botón submit signup: copy "Crear cuenta gratis" + microcopy "Gratis · Sin tarjeta · En minutos" debajo.
- No tocar handlers de signIn/signUp/Google ni la lógica de redirect post-auth.

---

## 6. Setup Express para origen `/promo`

Edits a `src/pages/SetupPage.tsx` (lectura primero para confirmar el shape de pasos):
- Si `sessionStorage.vc_promo_origin === '1'` → activar modo express con **3 preguntas únicamente**:
  1. Nombre del negocio (input)
  2. Rubro o tipo de negocio (select del catálogo existente, simplificado)
  3. Objetivo principal (radio: Vender más / Conseguir más clientes / Ordenar procesos / Mejorar rentabilidad / Detectar oportunidades / Tomar mejores decisiones)
- Al completar las 3, persistir en `businesses` los campos mínimos y disparar la generación inicial (mismo flujo que el setup completo, pero con flags `setup_mode='express'` y `setup_completed_at` parcial).
- Redirigir a `SetupCompletePage` que muestre: "Tu diagnóstico inicial está listo" + 3 misiones (usar el generador existente; si requiere datos faltantes, generar con defaults sectoriales del catálogo `setupBusinessTypes`).
- Banner persistente en `/app`: "Completá tu perfil para mejorar la precisión de VISTACEO." → CTA al setup completo.
- El setup full sigue funcionando idéntico para usuarios que NO vienen de `/promo`.

---

## 7. SEO y robots

- `<SiteHead>` en `/promo` con: title "Crea tu cuenta gratis · VISTACEO", meta description orientada a Ads, `robots: noindex, follow` (es landing de Ads, no debe canibalizar la home en orgánico) — alinea con la memoria SEO Indexation Strategy.
- Agregar `/promo` a la exclusión de `scripts/generate-sitemap.mjs` (ya excluye `/checkout`, `/auth`, `/setup`).

---

## 8. Performance

- Cero librerías nuevas. Animaciones con CSS (`@keyframes`) + `transition`. Si Framer Motion ya está instalado lo uso solo para fade-in del hero, opcional.
- Imágenes: solo el icono de marca ya importado (`iconBrand`). Nada más pesado.
- Lazy: la sección FAQ con accordion radix (ya en deps).
- LCP target: el H1 + CTA primario están server-rendered en el primer paint del componente, sin Suspense.

---

## 9. Detalles técnicos

- **Archivos nuevos**:
  - `src/pages/PromoLanding.tsx`
  - `src/components/promo/PromoHeader.tsx`
  - `src/components/promo/PromoHero.tsx`
  - `src/components/promo/PromoIntelligencePanel.tsx` (la card visual lateral)
  - `src/components/promo/PromoStickyCTA.tsx`
  - `src/components/promo/PromoFAQ.tsx`
  - `src/lib/promo/utm.ts`
  - `src/lib/promo/variants.ts`
- **Archivos editados**:
  - `src/App.tsx` (registrar ruta)
  - `src/pages/Auth.tsx` (form visible desde inicio cuando origen `/promo`)
  - `src/pages/SetupPage.tsx` (modo express condicional)
  - `src/pages/SetupCompletePage.tsx` (mensaje "primer valor" + tracking event `first_value_shown`)
  - `scripts/generate-sitemap.mjs` (excluir `/promo`)
- **Sin cambios**: home `/`, `/auth` para usuarios no-promo, `/checkout`, `/app/*`, blog, admin, DB, edge functions, supabase schema.

---

## 10. Checklist de QA antes de cerrar

- [ ] `/promo` carga, responsive 320–1920
- [ ] CTAs preservan UTMs (`?utm_source=google&...` se propaga a `/auth?mode=signup&utm_...`)
- [ ] Email signup visible desde el inicio cuando se llega desde `/promo`
- [ ] Google login intacto
- [ ] Sticky CTA mobile no tapa contenido y respeta safe-area
- [ ] Setup express muestra primer valor en ≤ 3 preguntas
- [ ] Home `/` sin cambios visuales ni funcionales
- [ ] `/auth` desde otras rutas mantiene comportamiento actual
- [ ] VISTACEO siempre en mayúsculas, voseo LATAM, sin claims falsos, sin contadores inventados
- [ ] Sin errores TS / build
- [ ] `/promo` excluida del sitemap, marcada `noindex,follow`
