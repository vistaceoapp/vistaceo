import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLayout from "./MobileLayout";
import { DashboardLayout } from "./DashboardLayout";
import { useDOMLeakScanner } from "@/hooks/useDOMLeakScanner";
import { WidgetConfigProvider } from "@/hooks/use-widget-config";

const AppLayout = () => {
  const isMobile = useIsMobile();
  useDOMLeakScanner();

  return (
    <WidgetConfigProvider>
      {isMobile ? <MobileLayout /> : <DashboardLayout />}
    </WidgetConfigProvider>
  );
};

export default AppLayout;
