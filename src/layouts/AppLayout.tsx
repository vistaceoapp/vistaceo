import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLayout from "./MobileLayout";
import { DashboardLayout } from "./DashboardLayout";

const AppLayout = () => {
  const isMobile = useIsMobile();

  // For mobile, use the mobile-optimized layout
  // For desktop, use the professional dashboard layout
  if (isMobile) {
    return <MobileLayout />;
  }

  return <DashboardLayout />;
};

export default AppLayout;
