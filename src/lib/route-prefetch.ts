// Centralized dynamic imports for app routes so we can prefetch them
// (hover, focus, idle) without duplicating import paths across the codebase.
// Each key mirrors the router path.
export const routeLoaders: Record<string, () => Promise<unknown>> = {
  "/app": () => import("@/pages/app/TodayPage"),
  "/app/chat": () => import("@/pages/app/ChatPage"),
  "/app/missions": () => import("@/pages/app/MissionsPage"),
  "/app/radar": () => import("@/pages/app/RadarPage"),
  "/app/analytics": () => import("@/pages/app/AnalyticsPage"),
  "/app/predictions": () => import("@/pages/app/PredictionsPage"),
  "/app/more": () => import("@/pages/app/MorePage"),
  "/app/memoria": () => import("@/pages/app/MemoryPage"),
  "/app/audit": () => import("@/pages/app/AuditPage"),
  "/app/upgrade": () => import("@/pages/app/UpgradePage"),

  "/checkout": () => import("@/pages/CheckoutPage"),
  "/auth": () => import("@/pages/Auth"),
};

const prefetched = new Set<string>();

export function prefetchRoute(path: string): void {
  if (prefetched.has(path)) return;
  const loader = routeLoaders[path];
  if (!loader) return;
  prefetched.add(path);
  loader().catch(() => prefetched.delete(path));
}

// Fire a batch of prefetches spread across idle callbacks so we never
// block interactivity.
export function prefetchRoutesIdle(paths: string[]): void {
  const idle: (cb: () => void) => void =
    (window as unknown as { requestIdleCallback?: (cb: () => void) => void })
      .requestIdleCallback ?? ((cb) => setTimeout(cb, 200));
  paths.forEach((p, i) => {
    setTimeout(() => idle(() => prefetchRoute(p)), i * 80);
  });
}
