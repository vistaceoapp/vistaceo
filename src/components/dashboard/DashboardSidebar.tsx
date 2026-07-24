import { NavLink, useLocation } from "react-router-dom";
import React from "react";
import { 
  Home, 
  MessageCircle, 
  Target, 
  Radar, 
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Crown,
  Orbit
} from "lucide-react";
import { cn } from "@/lib/utils";
import { prefetchRoute } from "@/lib/route-prefetch";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PlanStatusCard } from "@/components/app/PlanStatusCard";
import { useSubscription } from "@/hooks/use-subscription";

const navItems = [
  { path: "/app", icon: Home, label: "Inicio", subtitle: "Dashboard principal", badge: null, isPro: false },
  { path: "/app/chat", icon: MessageCircle, label: "Chat CEO", subtitle: "Tu mentor estratégico", badge: "Pro", isPro: true },
  { path: "/app/missions", icon: Target, label: "Misiones", subtitle: "Planes de acción", badge: null, isPro: false },
  { path: "/app/radar", icon: Radar, label: "Radar", subtitle: "Oportunidades del mercado", badge: null, isPro: false },
  { path: "/app/analytics", icon: BarChart3, label: "Analíticas", subtitle: "Métricas y evolución", badge: "Pro", isPro: true },
  { path: "/app/predictions", icon: Orbit, label: "Predicciones", subtitle: "Simulá escenarios", badge: "Pro", isPro: true },
];

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const DashboardSidebar = ({ collapsed, onToggle }: DashboardSidebarProps) => {
  const location = useLocation();
  const { isPro } = useSubscription();

  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-card border-r border-border/60 z-50",
          "flex flex-col transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-[240px]"
        )}
      >
        {/* Header */}
        <div className={cn(
          "h-16 flex items-center px-4",
          collapsed ? "justify-center" : "justify-between"
        )}>
          <VistaceoLogo size={collapsed ? 26 : 32} variant={collapsed ? "icon" : "full"} />
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="mx-auto mt-2 h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.path === "/app" 
              ? location.pathname === "/app"
              : location.pathname.startsWith(item.path);
            
            const NavItem = (
              <NavLink
                key={item.path}
                to={item.path}
                onMouseEnter={() => prefetchRoute(item.path)}
                onFocus={() => prefetchRoute(item.path)}
                onTouchStart={() => prefetchRoute(item.path)}
                className={cn(
                  "group flex items-center gap-3 px-3 rounded-xl transition-all duration-200",
                  collapsed ? "justify-center py-2" : "justify-start py-2.5",
                  isActive 
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className={cn(
                  "h-[18px] w-[18px] flex-shrink-0 transition-transform",
                  isActive ? "scale-105" : "group-hover:scale-105"
                )} />
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px]">{item.label}</span>
                      {item.badge && (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[9px] h-4 px-1.5 rounded-md flex-shrink-0",
                            item.isPro && !isPro
                              ? "border-warning/30 text-warning bg-warning/5"
                              : "border-primary/20 text-primary/70"
                          )}
                        >
                          {item.isPro && !isPro && <Crown className="w-2 h-2 mr-0.5" />}
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground/70 block leading-tight mt-0.5">
                      {item.subtitle}
                    </span>
                  </div>
                )}
              </NavLink>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <div>{NavItem}</div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="space-y-0.5">
                    <p className="font-medium text-xs">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.subtitle}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }
            return NavItem;
          })}
        </nav>

        {/* Plan Status (only expanded + free) */}
        {!collapsed && !isPro && (
          <div className="mx-2 mb-2">
            <PlanStatusCard variant="sidebar" />
          </div>
        )}

        {/* Bottom */}
        <div className="border-t border-border/40 p-2 space-y-0.5">
          <div className={cn(
            "flex items-center gap-3 px-3 py-2",
            collapsed ? "justify-center" : "justify-start"
          )}>
            <ThemeToggle />
            {!collapsed && <span className="text-[12px] text-muted-foreground">Tema</span>}
          </div>
          
          {(() => {
            const isActive = location.pathname.startsWith("/app/more");
            const SettingsItem = (
              <NavLink
                to="/app/more"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200",
                  collapsed ? "justify-center" : "justify-start",
                  isActive 
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Settings className="h-[18px] w-[18px] flex-shrink-0" />
                {!collapsed && <span className="text-[13px] font-medium">Configuración</span>}
              </NavLink>
            );

            if (collapsed) {
              return (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>{SettingsItem}</div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="font-medium text-xs">Configuración</p>
                  </TooltipContent>
                </Tooltip>
              );
            }
            return SettingsItem;
          })()}
        </div>
      </aside>
    </TooltipProvider>
  );
};
