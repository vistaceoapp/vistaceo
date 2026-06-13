import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BusinessProvider, useBusiness } from "@/contexts/BusinessContext";
import { UserLifecycleProvider } from "@/contexts/UserLifecycleContext";
import { lazy, Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { toast } from "sonner";

// Critical path - loaded eagerly (landing + auth + paid-traffic landing)
import LandingMinimalista from "./pages/LandingMinimalista";
import Auth from "./pages/Auth";
import PromoLanding from "./pages/PromoLanding";

// Blog redirect (tiny component)
import BlogRedirect from "./components/blog/BlogRedirect";
import { BrainLearningPulse } from "./components/feedback/BrainLearningPulse";

// Lazy-loaded pages - only loaded when navigated to
const Index = lazy(() => import("./pages/Index"));
const LandingV2 = lazy(() => import("./pages/LandingV2"));
const LandingUltra = lazy(() => import("./pages/LandingUltra"));
const LandingV3 = lazy(() => import("./pages/LandingV3"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SetupPage = lazy(() => import("./pages/SetupPage"));
const SetupCompletePage = lazy(() => import("./pages/SetupCompletePage"));
const PreparingDashboardPage = lazy(() => import("./pages/app/PreparingDashboardPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const UnsubscribePage = lazy(() => import("./pages/UnsubscribePage"));
const ProWelcomePage = lazy(() => import("./pages/ProWelcomePage"));

// Admin pages - lazy loaded
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalyticsPage"));
const CentroControlPage = lazy(() => import("./pages/admin/CentroControlPage"));
const AdminEmailsPage = lazy(() => import("./pages/admin/AdminEmailsPage"));
const AdminUserTimelinePage = lazy(() => import("./pages/admin/AdminUserTimelinePage"));
const AdminSaludPage = lazy(() => import("./pages/admin/AdminSaludPage"));

// App pages - lazy loaded
const AppLayout = lazy(() => import("./layouts/AppLayout"));
const TodayPage = lazy(() => import("./pages/app/TodayPage"));
const ChatPage = lazy(() => import("./pages/app/ChatPage"));
const MissionsPage = lazy(() => import("./pages/app/MissionsPage"));
const RadarPage = lazy(() => import("./pages/app/RadarPage"));
const MorePage = lazy(() => import("./pages/app/MorePage"));
const AnalyticsPage = lazy(() => import("./pages/app/AnalyticsPage"));
const AuditPage = lazy(() => import("./pages/app/AuditPage"));
const DiagnosticPage = lazy(() => import("./pages/app/DiagnosticPage"));
const UpgradePage = lazy(() => import("./pages/app/UpgradePage"));
const PredictionsPage = lazy(() => import("./pages/app/PredictionsPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min — evita refetch al re-montar widgets
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
      networkMode: "online",
    },
  },
});

// Idle-time prefetch: warm up the most likely next routes once the landing has painted.
// This makes the first navigation feel instant — no PageLoader flash.
const prefetchRoutes = () => {
  const idle = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 200));
  idle(() => {
    // Critical post-landing destinations
    import("./pages/Auth").catch(() => {});
    import("./pages/CheckoutPage").catch(() => {});
  });
  idle(() => {
    import("./layouts/AppLayout").catch(() => {});
    import("./pages/app/TodayPage").catch(() => {});
  });
  // Warm up el resto de las rutas internas en background — al entrar a la app
  // el primer paso por Misiones/Radar/Chat se siente instantáneo.
  idle(() => {
    import("./pages/app/MissionsPage").catch(() => {});
    import("./pages/app/RadarPage").catch(() => {});
    import("./pages/app/ChatPage").catch(() => {});
  });

};
if (typeof window !== "undefined") {
  // Defer until after first paint
  if (document.readyState === "complete") prefetchRoutes();
  else window.addEventListener("load", prefetchRoutes, { once: true });
}

// Loading skeleton with branding — eliminates blank screen during lazy load
const PageLoader = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
    <p className="text-sm text-muted-foreground animate-pulse">Cargando...</p>
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => setTimedOut(true), 10000);
    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading && !timedOut) return <PageLoader />;
  if (loading && timedOut) {
    // Force reload if auth is stuck
    console.error('[ProtectedRoute] Auth loading timed out');
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-muted-foreground">La carga está tardando más de lo normal.</p>
        <button onClick={() => window.location.reload()} className="text-primary underline">
          Reintentar
        </button>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

// Setup gate - blocks access until setup is complete
const SetupGate = ({ children }: { children: React.ReactNode }) => {
  const { currentBusiness, loading } = useBusiness();

  if (loading) return <PageLoader />;
  if (!currentBusiness || !currentBusiness.setup_completed) {
    return <Navigate to="/setup" replace />;
  }
  return <>{children}</>;
};

// Global unhandled promise rejection catcher
const GlobalErrorCatcher = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Capturar primer touch (UTM, referrer, landing) lo antes posible para tracking de origen
    import("@/lib/signup-tracking").then(({ captureFirstTouchIfMissing }) => {
      try { captureFirstTouchIfMissing(); } catch (e) { console.error(e); }
    });

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("[GlobalErrorCatcher] Unhandled rejection:", event.reason);
      toast.error("Ocurrió un error inesperado. Intentá de nuevo.");
      event.preventDefault(); // Prevent default browser behavior (white screen)
    };

    const handleError = (event: ErrorEvent) => {
      console.error("[GlobalErrorCatcher] Uncaught error:", event.error);
      // Don't show toast for every error, ErrorBoundary handles rendering
    };

    window.addEventListener("unhandledrejection", handleRejection);
    window.addEventListener("error", handleError);
    return () => {
      window.removeEventListener("unhandledrejection", handleRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingMinimalista />} />
        <Route path="/v2" element={<LandingV2 />} />
        <Route path="/ultra" element={<LandingUltra />} />
        <Route path="/v3" element={<Suspense fallback={<PageLoader />}><LandingV3 /></Suspense>} />
        <Route path="/minimalista" element={<Navigate to="/" replace />} />
        <Route path="/promo" element={<PromoLanding />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* Blog routes - Redirect to subdomain blog.vistaceo.com */}
        <Route path="/blog" element={<BlogRedirect />} />
        <Route path="/blog/:slug" element={<BlogRedirect />} />
        <Route path="/blog/tema/:cluster" element={<BlogRedirect />} />
        
        {/* Legal routes */}
        <Route path="/politicas" element={<PrivacyPolicyPage />} />
        <Route path="/condiciones" element={<TermsOfServicePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/unsubscribe" element={<UnsubscribePage />} />
        <Route path="/bienvenido-pro" element={<ProWelcomePage />} />
        <Route path="/welcome-pro" element={<Navigate to="/bienvenido-pro" replace />} />
        
        {/* Admin routes - Protected by AdminAuthGuard inside AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="usuarios" element={<AdminUsersPage />} />
          <Route path="usuarios/:userId/timeline" element={<AdminUserTimelinePage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="centro-control" element={<CentroControlPage />} />
          <Route path="emails" element={<AdminEmailsPage />} />
          <Route path="salud" element={<AdminSaludPage />} />
        </Route>
        
        {/* Checkout - standalone payment page (public; handles auth inline if needed) */}
        <Route
          path="/checkout"
          element={<CheckoutPage />}
        />

        {/* Back-compat redirect: onboarding was removed */}
        <Route path="/onboarding" element={<Navigate to="/setup" replace />} />

        {/* Setup - full screen mandatory wizard (includes business creation if needed) */}
        <Route
          path="/setup"
          element={
            <ProtectedRoute>
              <BusinessProvider>
                <ErrorBoundary fallbackRoute="/setup">
                  <SetupPage />
                </ErrorBoundary>
              </BusinessProvider>
            </ProtectedRoute>
          }
        />

        {/* Setup complete celebration page */}
        <Route
          path="/setup-complete"
          element={
            <ProtectedRoute>
              <BusinessProvider>
                <SetupCompletePage />
              </BusinessProvider>
            </ProtectedRoute>
          }
        />

        {/* Preparing dashboard (post-setup splash that triggers seeding) */}
        <Route
          path="/app/preparing"
          element={
            <ProtectedRoute>
              <BusinessProvider>
                <PreparingDashboardPage />
              </BusinessProvider>
            </ProtectedRoute>
          }
        />

        {/* Protected app routes - requires completed setup */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <BusinessProvider>
                <SetupGate>
                  <AppLayout />
                </SetupGate>
              </BusinessProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<TodayPage />} />
          {/* Back-compat: /app/dashboard → /app */}
          <Route path="dashboard" element={<Navigate to="/app" replace />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="missions" element={<MissionsPage />} />
          <Route path="radar" element={<RadarPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="predictions" element={<PredictionsPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="more" element={<MorePage />} />
          <Route path="diagnostic" element={<DiagnosticPage />} />
          <Route path="upgrade" element={<UpgradePage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrainLearningPulse />
        <BrowserRouter>
          <ErrorBoundary>
            <AuthProvider>
              <UserLifecycleProvider>
                <GlobalErrorCatcher>
                  <AppRoutes />
                </GlobalErrorCatcher>
              </UserLifecycleProvider>
            </AuthProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
