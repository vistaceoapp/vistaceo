import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BusinessProvider, useBusiness } from "@/contexts/BusinessContext";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import SetupPage from "./pages/SetupPage";
import SetupCompletePage from "./pages/SetupCompletePage";

// App Pages
import AppLayout from "./layouts/AppLayout";
import TodayPage from "./pages/app/TodayPage";
import ChatPage from "./pages/app/ChatPage";
import MissionsPage from "./pages/app/MissionsPage";
import RadarPage from "./pages/app/RadarPage";
import MorePage from "./pages/app/MorePage";
import AnalyticsPage from "./pages/app/AnalyticsPage";
import AuditPage from "./pages/app/AuditPage";
import DiagnosticPage from "./pages/app/DiagnosticPage";
import UpgradePage from "./pages/app/UpgradePage";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Setup gate - blocks access until setup is complete
const SetupGate = ({ children }: { children: React.ReactNode }) => {
  const { currentBusiness, loading } = useBusiness();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // No business or setup not complete - redirect to setup
  if (!currentBusiness || !currentBusiness.setup_completed) {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />

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
        <Route path="audit" element={<AuditPage />} />
        <Route path="more" element={<MorePage />} />
        <Route path="diagnostic" element={<DiagnosticPage />} />
        <Route path="upgrade" element={<UpgradePage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
