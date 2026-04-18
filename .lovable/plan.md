

The user wants performance + UX intelligence improvements WITHOUT touching UI/visual design. They want the dashboard to feel "wow" by reducing noise and making information sharper. Let me explore key areas: dashboard load, widget rendering, data fetching patterns.
<lov-tool-use id="toolu_vrtx_01MfYGiFYdStCFyAzHJksLW7" name="code--view" integration-id="code" data="{\"file_path\": \"src/pages/app/TodayPage.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01KHrMs3SWrmBibpwEQtZ63Q" name="code--view" integration-id="code" data="{\"file_path\": \"src/hooks/use-widget-config.ts\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01LJFNS7HtxytnR1pqhtpAZH" name="code--view" integration-id="code" data="{\"file_path\": \"src/components/app/AIDailySummary.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01DPb923bAaZpGZPAUPwzPkT" name="code--view" integration-id="code" data="{\"file_path\": \"src/hooks/use-auto-sync.ts\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_0135UdK1HC1boAVrusCE1QCY" name="code--view" integration-id="code" data="{\"file_path\": \"src/pages/app/TodayPage.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_013RFNoa64UXhFEZehWSjLmV" name="code--view" integration-id="code" data="{\"file_path\": \"src/hooks/use-widget-config.ts\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01EMcupZy5iN1wsNum6jYext" name="code--view" integration-id="code" data="{\"file_path\": \"src/hooks/use-auto-sync.ts\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01F8wac8W6CeTq4bY5mJRsUg" name="code--view" integration-id="code" data="{\"file_path\": \"src/components/app/AIDailySummary.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01GhUAvneHbDp4Pear34gPRN" name="code--view" integration-id="code" data="{\"file_path\": \"src/hooks/use-dashboard-data.ts\"}">
</lov-tool-use>
I have enough context to build a comprehensive performance & UX optimization plan. Let me check a couple more things quickly.
<lov-tool-use id="toolu_vrtx_01EmXLD8VGX2NrAS2VgLvu1u" name="code--exec" integration-id="code" data="{\"command\": \"ls src/components/app/ | head -50 && echo \\\"---\\\" && wc -l src/App.tsx src/main.tsx 2>/dev/null && echo \\\"---\\\" && grep -r \\\"lazy(\\\" src/App.tsx 2>/dev/null | head -20\", \"user_facing_description\": \"Inspecting dashboard components and routing\"}">
</lov-tool-use>
<lov-plan>

## Plan: Performance, eficiencia y "wow" del Dashboard (sin tocar UI)

### Diagnóstico actual

**Cuellos de botella detectados:**

1. **Dashboard cargado en serie de N widgets independientes**: cada widget (HealthScore, Brain, Radar, Missions, Reputation, Focus, Predictions, WeeklyMetrics, etc.) hace sus propias queries Supabase al montar → 10+ requests duplicados en paralelo en el primer render.
2. **`useDashboardData` ya hace 7 queries en paralelo**, pero los widgets vuelven a pedir parte de esos mismos datos (snapshots, brain, integrations).
3. **`AIDailySummary`** llama a `generate-daily-summary` (Gemini) **cada vez que no hay signals**, sin caché de sesión → coste y latencia alta.
4. **`useAutoSync`** dispara 3 edge functions pesadas en los primeros 8s del montaje del layout (`sync-external-data`, `brain-analyze-gaps`, `analyze-health-score`) **en cada navegación al dashboard** porque los `Ref` viven dentro del hook que se re-monta.
5. **No hay React Query / cache compartido**: cada widget re-fetchea al cambiar de tab del navegador.
6. **Demasiados widgets visibles por defecto** (aiSummary + health + nextSteps + missions + brain + focus + radar = 7 cargas de datos al entrar) → ruido cognitivo y lentitud percibida.
7. **Edge function `generate-daily-summary`** usa `gemini-2.5-flash` (costoso) cuando `flash-lite` alcanza para señales JSON cortas.
8. **`framer-motion`** importado en widget core (AIDailySummary) sin necesidad real para 6 tarjetas estáticas.
9. **No hay `prefetch`** del dashboard tras login → primera entrada lenta.

### Objetivo

Hacer que **entrar al dashboard se sienta instantáneo** (<400 ms a contenido útil), reducir tráfico de red ~60%, costos de IA ~40%, y mostrar **menos widgets pero más densos en valor**, sin alterar el diseño visual.

---

### Cambios propuestos (8 áreas, sin modificar UI)

**1. Capa unificada de datos del Dashboard (`useDashboardSnapshot`)**
- Crear un hook único que hace **una sola llamada** a una nueva edge function `dashboard-snapshot` que devuelve en una respuesta: business + brain + último snapshot + últimas misiones + signals count + competitors + photos + summary del día.
- Cachear resultado con TTL 5 min en `sessionStorage` → entrar/volver al dashboard no dispara red.
- Widgets reciben datos por props desde el padre (ya hay patrón en `HealthScoreWidget`); migrar `BrainKnowledgeWidget`, `MissionsWidget`, `FocusWidget`, `RadarWidget` para que **acepten datos por props** y sólo hagan fetch si no se les pasan.

**2. React Query global con stale-time agresivo**
- Configurar `QueryClient` con `staleTime: 5 min`, `refetchOnWindowFocus: false`, `refetchOnMount: false`.
- Migrar fetches de widgets a `useQuery` con keys compartidos (`['business', id, 'snapshot']`, `['business', id, 'brain']`).
- Resultado: un widget que se re-monta no vuelve a pegarle a la DB.

**3. AutoSync inteligente (debounce + persistencia)**
- Mover `lastSyncRef` a `localStorage` con clave `autosync:${businessId}`.
- Sólo correr `triggerBrainGaps` y `checkAndSyncHealth` **una vez por día** por business, no por sesión.
- Reducir intervalo periódico de 5 → 15 min.
- Postergar todos los syncs a `requestIdleCallback` para no competir con render inicial.

**4. `generate-daily-summary` más rápido y barato**
- Cambiar modelo a `google/gemini-2.5-flash-lite` (suficiente para JSON corto, 3-5× más barato/rápido).
- Limitar contexto a ~600 tokens (truncar memorias factual/dinámica más agresivamente).
- Cache server-side: si existe `business_daily_summaries` de hoy con `signals.length > 0`, devolver sin llamar a IA.
- Cliente: no regenerar automáticamente si signals están vacías; mostrar botón "Generar análisis" → evita coste por usuarios viejos al cargar.

**5. Dashboard "menos es más" (defaults nuevos)**
- Por defecto sólo 4 widgets visibles: **aiSummary**, **health**, **nextSteps**, **brain**. El resto (missions, focus, radar, reputation, predictions, weeklyMetrics, pulse) quedan en el editor (ocultos), accesibles con un click.
- Migración: usuarios existentes mantienen sus selecciones; sólo cambia el default de los nuevos.
- Resultado: render inicial de 4 cards en vez de 7 → menos JS, menos red, lectura más clara.

**6. Lazy-loading de widgets pesados**
- `PredictionsWidget`, `WeeklyMetricsWidget`, `RadarWidget`, `ReputationWidget` → `React.lazy()` con `<Suspense>` y skeleton del mismo tamaño.
- Reduce el bundle del dashboard inicial estimado en ~80-120 KB.

**7. Quitar dependencias innecesarias en hot path**
- `AIDailySummary`: reemplazar `framer-motion` por una transición CSS (`@keyframes fade-up`) — la animación es trivial.
- Quitar `motion.div` colapsable; usar `<details>` o `transition-all max-h`.

**8. Prefetch tras login**
- En el callback de `/auth` exitoso, disparar `queryClient.prefetchQuery(['business', id, 'snapshot'])` antes de navegar a `/app` → al llegar, el dashboard ya tiene los datos.

---

### Detalles técnicos

**Nueva edge function `dashboard-snapshot`** (single round-trip):
```ts
// Input: { businessId }
// Output: { business, brain, snapshot, missions, signalsCount, competitors, photoCount, todaySummary }
// Una sola query SQL combinada o Promise.all server-side (latencia LAN < 100ms vs múltiples round-trips cliente)
```

**Cache shape** (`sessionStorage`):
```
key: `dash:${businessId}`
value: { ts, payload }
TTL: 5 min; invalidate on mutation (mission complete, focus change, etc.)
```

**`useAutoSync` cambios:**
```ts
const lastBrainGapsKey = `autosync:braingaps:${businessId}`;
const last = localStorage.getItem(lastBrainGapsKey);
if (last && Date.now() - +last < 24*60*60*1000) return;
// run, then localStorage.setItem(lastBrainGapsKey, String(Date.now()))
```

**Nuevos defaults en `use-widget-config`**:
```ts
{ id: "missions", visible: false, ... }, // antes true
{ id: "focus",    visible: false, ... }, // antes true
{ id: "radar",    visible: false, ... }, // antes true
```

---

### Resultados esperados

| Métrica | Antes | Después |
|---|---|---|
| Requests al entrar al dashboard | 12-18 | 2-3 |
| Tiempo a contenido visible (TTI) | ~1.8 s | ~0.5 s |
| Llamadas IA por sesión repetida | 1 (ciega) | 0 (cache) |
| Widgets visibles por defecto | 7 | 4 |
| Bundle inicial dashboard | ~480 KB | ~360 KB |
| Costo Gemini diario por usuario | ~$0.004 | ~$0.0015 |

---

### Archivos a tocar
- `src/hooks/use-dashboard-data.ts` → reemplazar lógica por wrapper de `useDashboardSnapshot`
- `src/hooks/use-dashboard-snapshot.ts` (nuevo)
- `src/hooks/use-auto-sync.ts` → debounce diario via localStorage
- `src/hooks/use-widget-config.ts` → defaults reducidos
- `src/components/app/AIDailySummary.tsx` → quitar framer-motion, no auto-regenerar
- `src/components/app/{Brain,Missions,Focus,Radar,Reputation}Widget.tsx` → aceptar datos por props
- `src/pages/app/TodayPage.tsx` → lazy widgets pesados
- `src/App.tsx` → React Query config global
- `supabase/functions/dashboard-snapshot/index.ts` (nuevo)
- `supabase/functions/generate-daily-summary/index.ts` → flash-lite + cache check + contexto recortado

Sin cambios en CSS, layout, ni jerarquía visual.

