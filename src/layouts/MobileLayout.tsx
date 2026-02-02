import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Home, MessageCircle, Target, Radar, Orbit, MoreHorizontal, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { useBusiness } from "@/contexts/BusinessContext";
import { useBrain } from "@/hooks/use-brain";
import { PulsingDot } from "@/components/app/PulsingDot";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { BrainStatusWidget } from "@/components/app/BrainStatusWidget";
import { useAutoSync } from "@/hooks/use-auto-sync";
import { useSubscription } from "@/hooks/use-subscription";

const navItems = [
  { path: "/app", icon: Home, label: "Inicio", isPro: false },
  { path: "/app/chat", icon: MessageCircle, label: "Chat", hasNotification: true, isPro: true },
  { path: "/app/missions", icon: Target, label: "Misiones", isPro: false },
  { path: "/app/radar", icon: Radar, label: "Radar", isPro: false },
  { path: "/app/predictions", icon: Orbit, label: "Futuro", isPro: true },
  { path: "/app/more", icon: MoreHorizontal, label: "Más", isPro: false },
];

const MobileLayout = () => {
  const location = useLocation();
  const { currentBusiness } = useBusiness();
  const { brain, confidenceLevel, focusLabel, loading: brainLoading } = useBrain();
  const { isPro } = useSubscription();
  
  // Auto-sync external data in background
  useAutoSync();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Ambient background effects - only in dark mode */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden dark:block hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-card/80 dark:bg-card/60 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <VistaceoLogo size={32} variant="icon" />
            {currentBusiness && (
              <div>
                <h1 className="text-sm font-semibold text-foreground">
                  {currentBusiness.name}
                </h1>
                <p className="text-xs text-muted-foreground capitalize">
                  {currentBusiness.category?.replace("_", " ")}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* Brain Status Mini */}
            <BrainStatusWidget variant="minimal" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 relative z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 dark:bg-card/80 backdrop-blur-xl border-t border-border safe-area-inset-bottom">
        <div className="max-w-3xl mx-auto flex items-center justify-around h-16 px-1">
          {navItems.map((item) => {
            const isActive = item.path === "/app" 
              ? location.pathname === "/app"
              : location.pathname.startsWith(item.path);
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 w-14 py-2 rounded-xl transition-all duration-300",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-primary/10 dark:blur-sm" />
                )}
                
                <div className="relative">
                  <item.icon className={cn(
                    "w-5 h-5 transition-all duration-300 relative z-10",
                    isActive && "scale-110"
                  )} />
                  
                  {item.hasNotification && !isActive && (
                    <span className="absolute -top-1 -right-1">
                      <PulsingDot variant="primary" size="sm" />
                    </span>
                  )}
                  
                  {/* Pro badge indicator */}
                  {item.isPro && !isPro && !isActive && (
                    <span className="absolute -top-1 -right-1.5">
                      <Crown className="w-2.5 h-2.5 text-warning" />
                    </span>
                  )}
                </div>
                
                <span className={cn(
                  "text-[9px] font-medium relative z-10 transition-colors",
                  isActive && "font-semibold"
                )}>
                  {item.label}
                </span>
                
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full gradient-primary" />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;
