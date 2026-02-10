import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BusinessProvider, useBusiness } from "@/contexts/BusinessContext";
import { UserLifecycleProvider } from "@/contexts/UserLifecycleContext";
import { lazy, Suspense } from "react";

// Critical path - loaded eagerly (landing + auth)
import LandingV3 from "./pages/LandingV3";
import Auth from "./pages/Auth";

// Blog redirect (tiny component)
import BlogRedirect from "./components/blog/BlogRedirect";

// Lazy-loaded pages - only loaded when navigated to
const Index = lazy(() => import("./pages/Index"));
const LandingV2 = lazy(() => import("./pages/LandingV2"));
const LandingUltra = lazy(() => import("./pages/LandingUltra"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SetupPage = lazy(() => import("./pages/SetupPage"));
const SetupCompletePage = lazy(() => import("./pages/SetupCompletePage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));

// Admin pages - lazy loaded
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const BlogAdminPage = lazy(() => import("./pages/admin/BlogAdminPage"));
const AdminCalendarPage = lazy(() => import("./pages/admin/AdminCalendarPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalyticsPage"));

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

const queryClient = new QueryClient();

// Minimal loading spinner
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
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

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingV3 />} />
        <Route path="/v2" element={<LandingV2 />} />
        <Route path="/ultra" element={<LandingUltra />} />
        <Route path="/v3" element={<LandingV3 />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* Blog routes - Redirect to subdomain blog.vistaceo.com */}
        <Route path="/blog" element={<BlogRedirect />} />
        <Route path="/blog/:slug" element={<BlogRedirect />} />
        <Route path="/blog/tema/:cluster" element={<BlogRedirect />} />
        
        {/* Legal routes */}
        <Route path="/politicas" element={<PrivacyPolicyPage />} />
        <Route path="/condiciones" element={<TermsOfServicePage />} />
        
        {/* Admin routes - Protected by AdminAuthGuard inside AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="blog" element={<BlogAdminPage />} />
          <Route path="calendario" element={<AdminCalendarPage />} />
          <Route path="usuarios" element={<AdminUsersPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="config" element={<div className="p-6"><h1 className="text-2xl font-bold">Configuración - Próximamente</h1></div>} />
        </Route>
        
        {/* Checkout - standalone payment page (requires auth but not setup) */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        {/* Back-compat redirect: onboarding was removed */}
        <Route path="/onboarding" element={<Navigate to="/setup" replace />} />

        {/* Setup - full screen mandatory wizard (includes business creation if needed) */}
        <Route
          path="/setup"
          element={
            <ProtectedRoute>
              <BusinessProvider>
                <SetupPage />
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
        <BrowserRouter>
          <AuthProvider>
            <UserLifecycleProvider>
              <AppRoutes />
            </UserLifecycleProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
