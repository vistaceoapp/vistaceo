import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { cn } from "@/lib/utils";
import { useAutoSync } from "@/hooks/use-auto-sync";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";

const DashboardLayoutContent = () => {
  const { collapsed, toggleCollapsed } = useSidebar();
  
  useAutoSync();

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar 
        collapsed={collapsed} 
        onToggle={toggleCollapsed} 
      />

      <DashboardHeader sidebarCollapsed={collapsed} />

      <main 
        className={cn(
          "pt-14 min-h-screen transition-all duration-300",
          collapsed ? "pl-[72px]" : "pl-[240px]"
        )}
      >
        <div className="p-5 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <DashboardLayoutContent />
    </SidebarProvider>
  );
};
