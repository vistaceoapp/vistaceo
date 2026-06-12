---
name: Centro de Salud Operativa
description: /admin/salud + tabla ops_incidents + sensores frontend + edge function report-incident para observabilidad y auto-healing
type: feature
---

Sistema de observabilidad + auto-healing para detectar y resolver:
- Errores JS (window.onerror, unhandledrejection, ErrorBoundary)
- Fallos de red (fetch ≥500, timeouts)
- Demoras (LCP > 4s, longtask > 250ms vía PerformanceObserver)
- Problemas de blog (futuro: hero con texto, TOC faltante, SEO incompleto)
- Auto-fixes con registro de estrategia y resultado

## Componentes

- **Tabla**: `ops_incidents` (RLS admin-only para SELECT/UPDATE/DELETE, INSERT autenticado)
- **Edge function**: `report-incident` — deduplica por fingerprint, incrementa `occurrences`
- **Hook**: `useAppSensors` montado en `AppLayout`
- **Página**: `/admin/salud` con tabs En vivo / Resueltos + métricas + realtime

## Fases pendientes

- Fase 2: edge function `blog-health-scan` (cron 6h) — OCR de hero, validación SEO, link checking
- Fase 3: edge functions `blog-autoheal` y `app-autoheal` + alertas Resend cuando manual_required
