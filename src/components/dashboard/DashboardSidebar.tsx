import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  MessageCircle, 
  Target, 
  Radar, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Zap,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OwlLogo } from "@/components/ui/OwlLogo";
import { useBusiness } from "@/contexts/BusinessContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { path: "/app", icon: Home, label: "Hoy", description: "Vista general del día", badge: null },
  { path: "/app/chat", icon: MessageCircle, label: "UCEO", description: "Asistente IA", badge: "IA" },
  { path: "/app/missions", icon: Target, label: "Misiones", description: "Proyectos activos", badge: null },
  { path: "/app/radar", icon: Radar, label: "Radar", description: "Oportunidades", badge: "3" },
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
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 blur-xl bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <OwlLogo size={collapsed ? 28 : 32} className="relative z-10 transition-transform group-hover:scale-110" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden animate-fade-in">
                <h1 className="font-bold text-foreground text-lg tracking-tight">UCEO</h1>
                <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                  {currentBusiness?.name || "Tu CEO digital"}
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
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn(
                  "relative flex-shrink-0",
                  isActive && "animate-pulse"
                )}>
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
                          isActive ? "text-primary-foreground/70" : "text-muted-foreground"
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
                          isActive ? "bg-primary-foreground/20 text-primary-foreground border-0" : "border-primary/30 text-primary"
                        )}
                      >
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

        {/* Stats Card (only when expanded) */}
        {!collapsed && (
          <div className="mx-3 mb-4 p-4 rounded-xl bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Progreso semanal</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Acciones completadas</span>
                <span className="font-medium text-foreground">7/10</span>
              </div>
              <Progress value={70} className="h-1.5" />
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-primary">
              <Sparkles className="w-3 h-3" />
              <span>¡Vas muy bien esta semana!</span>
            </div>
          </div>
        )}

        {/* Upgrade Card (only when expanded) */}
        {!collapsed && (
          <div className="mx-3 mb-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Plan Free</p>
                <p className="text-xs text-muted-foreground">Actualiza a Pro</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
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
