import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  MessageCircle, 
  Target, 
  Radar, 
  Settings, 
  BarChart3,
  User,
  Bell,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OwlLogo } from "@/components/ui/OwlLogo";
import { useBusiness } from "@/contexts/BusinessContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { path: "/app", icon: Home, label: "Hoy", description: "Vista general del día" },
  { path: "/app/chat", icon: MessageCircle, label: "UCEO", description: "Asistente IA" },
  { path: "/app/missions", icon: Target, label: "Misiones", description: "Proyectos de mejora" },
  { path: "/app/radar", icon: Radar, label: "Radar", description: "Oportunidades" },
];

const bottomNavItems = [
  { path: "/app/more", icon: Settings, label: "Configuración" },
];

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const DashboardSidebar = ({ collapsed, onToggle }: DashboardSidebarProps) => {
  const location = useLocation();
  const { currentBusiness } = useBusiness();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border z-50",
        "flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Header */}
      <div className={cn(
        "h-16 border-b border-border flex items-center px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="relative">
            <div className="absolute inset-0 blur-lg bg-primary/20 rounded-full" />
            <OwlLogo size={32} className="relative z-10" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-foreground text-lg">UCEO</h1>
              <p className="text-xs text-muted-foreground truncate">
                {currentBusiness?.name || "Dashboard"}
              </p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Collapse button when collapsed */}
      {collapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="mx-auto mt-2 h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-3">
            Principal
          </p>
        )}
        
        {navItems.map((item) => {
          const isActive = item.path === "/app" 
            ? location.pathname === "/app"
            : location.pathname.startsWith(item.path);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                collapsed ? "justify-center" : "justify-start",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-transform",
                isActive && "scale-110"
              )} />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <span className={cn(
                    "font-medium text-sm",
                    isActive && "font-semibold"
                  )}>
                    {item.label}
                  </span>
                  {item.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                  )}
                </div>
              )}
              {isActive && !collapsed && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border p-3 space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                collapsed ? "justify-center" : "justify-start",
                isActive 
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </NavLink>
          );
        })}

        {/* Theme Toggle */}
        <div className={cn(
          "flex items-center gap-3 px-3 py-2",
          collapsed ? "justify-center" : "justify-start"
        )}>
          <ThemeToggle />
          {!collapsed && (
            <span className="text-sm text-muted-foreground">Tema</span>
          )}
        </div>
      </div>
    </aside>
  );
};
