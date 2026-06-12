import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLayout from "./MobileLayout";
import { DashboardLayout } from "./DashboardLayout";
import { useDOMLeakScanner } from "@/hooks/useDOMLeakScanner";
import { WidgetConfigProvider } from "@/hooks/use-widget-config";
import { useActivityTracker } from "@/hooks/use-activity-tracker";
import { useAppSensors } from "@/hooks/use-app-sensors";

const AppLayout = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { trackPageView } = useActivityTracker();
  const lastPathRef = useRef<string>("");
  useDOMLeakScanner();
  useAppSensors();

  // 🔥 Track page_view on every route change inside the app shell
  useEffect(() => {
    if (lastPathRef.current === location.pathname) return;
    lastPathRef.current = location.pathname;
    // Debounce a tick so auth/business contexts settle first
    const t = setTimeout(() => trackPageView(location.pathname), 250);
    return () => clearTimeout(t);
  }, [location.pathname, trackPageView]);

  return (
    <WidgetConfigProvider>
      {isMobile ? <MobileLayout /> : <DashboardLayout />}
    </WidgetConfigProvider>
  );
};

export default AppLayout;
