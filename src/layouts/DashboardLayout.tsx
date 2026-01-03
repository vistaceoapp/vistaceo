import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { cn } from "@/lib/utils";
import { useAutoSync } from "@/hooks/use-auto-sync";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";

const DashboardLayoutContent = () => {
  const { collapsed, toggleCollapsed } = useSidebar();
  
  // Auto-sync external data in background
  useAutoSync();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar 
        collapsed={collapsed} 
        onToggle={toggleCollapsed} 
      />

      {/* Header */}
      <DashboardHeader sidebarCollapsed={collapsed} />

      {/* Main Content */}
      <main 
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          collapsed ? "pl-[72px]" : "pl-[260px]"
        )}
      >
        <div className="p-6 max-w-7xl mx-auto">
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
