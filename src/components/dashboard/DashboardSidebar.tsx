import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  MessageCircle, 
  Target, 
  Radar, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  HelpCircle,
  BarChart3,
  Crown,
  Orbit
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { useBusiness } from "@/contexts/BusinessContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PlanStatusCard } from "@/components/app/PlanStatusCard";
import { useSubscription } from "@/hooks/use-subscription";

const navItems = [
  { path: "/app", icon: Home, label: "Inicio", description: "Dashboard principal", badge: null, isPro: false },
  { path: "/app/chat", icon: MessageCircle, label: "Chat CEO", description: "Hablá con tu CEO", badge: "Pro", isPro: true },
  { path: "/app/missions", icon: Target, label: "Misiones", description: "Planes de acción", badge: null, isPro: false },
  { path: "/app/radar", icon: Radar, label: "Radar", description: "Oportunidades", badge: null, isPro: false },
  { path: "/app/analytics", icon: BarChart3, label: "Analytics", description: "Métricas y tendencias", badge: "Pro", isPro: true },
  { path: "/app/predictions", icon: Orbit, label: "Predicciones", description: "Anticipá el futuro", badge: "Pro", isPro: true },
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
  const { isPro } = useSubscription();

  return (
    <TooltipProvider delayDuration={0}>
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
            <VistaceoLogo size={collapsed ? 28 : 36} variant={collapsed ? "icon" : "full"} className="transition-transform hover:scale-105" />
            {!collapsed && currentBusiness && (
              <div className="overflow-hidden animate-fade-in">
                <p className="text-sm font-medium text-foreground truncate max-w-[140px]">
                  {currentBusiness.name}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {currentBusiness.category?.replace("_", " ") || "Tu negocio"}
                </p>
              </div>
            )}
          </div>
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
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
            className="mx-auto mt-3 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {!collapsed && (
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
              Principal
            </p>
          )}
          
          {navItems.map((item, index) => {
            const isActive = item.path === "/app" 
              ? location.pathname === "/app"
              : location.pathname.startsWith(item.path);
            
            const NavItem = (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  collapsed ? "justify-center" : "justify-start",
                  isActive 
                    ? "gradient-primary text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative flex-shrink-0">
                  <item.icon className={cn(
                    "h-5 w-5 transition-transform",
                    isActive ? "scale-110" : "group-hover:scale-105"
                  )} />
                </div>
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        "text-sm",
                        isActive ? "font-semibold" : "font-medium"
                      )}>
                        {item.label}
                      </span>
                      {item.description && (
                        <p className={cn(
                          "text-xs truncate",
                          isActive ? "text-white/70" : "text-muted-foreground"
                        )}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    {item.badge && (
                      <Badge 
                        variant={isActive ? "secondary" : "outline"} 
                        className={cn(
                          "text-[10px] h-5 px-1.5",
                          isActive 
                            ? "bg-white/20 text-white border-0" 
                            : item.isPro && !isPro
                              ? "border-warning/30 text-warning bg-warning/10"
                              : "border-primary/30 text-primary"
                        )}
                      >
                        {item.isPro && !isPro && <Crown className="w-2.5 h-2.5 mr-0.5" />}
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </NavLink>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    {NavItem}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover border-border">
                    <p className="font-medium">{item.label}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return NavItem;
          })}
        </nav>


        {/* Plan Status Card (only when expanded) */}
        {!collapsed && (
          <div className="mx-3 mb-3">
            <PlanStatusCard variant="sidebar" />
          </div>
        )}

        {/* Bottom Section */}
        <div className="border-t border-border p-3 space-y-1">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            
            const BottomItem = (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  collapsed ? "justify-center" : "justify-start",
                  isActive 
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </NavLink>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    {BottomItem}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover border-border">
                    <p className="font-medium">{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return BottomItem;
          })}

          {/* Help */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex items-center justify-center px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all w-full">
                  <HelpCircle className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-popover border-border">
                <p className="font-medium">Ayuda</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all w-full">
              <HelpCircle className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium text-sm">Ayuda</span>
            </button>
          )}

          {/* Theme Toggle */}
          <div className={cn(
            "flex items-center gap-3 px-3 py-2",
            collapsed ? "justify-center" : "justify-start"
          )}>
            <ThemeToggle />
            {!collapsed && (
              <span className="text-sm text-muted-foreground">Cambiar tema</span>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
};
