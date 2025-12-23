import { Outlet } from "react-router-dom";
import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { cn } from "@/lib/utils";
import { useAutoSync } from "@/hooks/use-auto-sync";

export const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Auto-sync external data in background
  useAutoSync();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Header */}
      <DashboardHeader sidebarCollapsed={sidebarCollapsed} />

      {/* Main Content */}
      <main 
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          sidebarCollapsed ? "pl-[72px]" : "pl-[260px]"
        )}
      >
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
