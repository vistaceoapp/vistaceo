import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLayout from "./MobileLayout";
import { DashboardLayout } from "./DashboardLayout";
import { useDOMLeakScanner } from "@/hooks/useDOMLeakScanner";

const AppLayout = () => {
  const isMobile = useIsMobile();
  
  // P0 Zero Leakage: DOM scanner activo en runtime
  useDOMLeakScanner();

  if (isMobile) {
    return <MobileLayout />;
  }

  return <DashboardLayout />;
};

export default AppLayout;
