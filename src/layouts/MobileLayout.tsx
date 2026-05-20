import { useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, MessageCircle, Target, Radar, BarChart3, Orbit, Settings, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { useBusiness } from "@/contexts/BusinessContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { BrainStatusWidget } from "@/components/app/BrainStatusWidget";
import { useAutoSync } from "@/hooks/use-auto-sync";
import { useSubscription } from "@/hooks/use-subscription";

const navItems = [
  { path: "/app", icon: Home, label: "Inicio", isPro: false },
  { path: "/app/chat", icon: MessageCircle, label: "Chat", isPro: true },
  { path: "/app/missions", icon: Target, label: "Misiones", isPro: false },
  { path: "/app/radar", icon: Radar, label: "Radar", isPro: false },
  { path: "/app/analytics", icon: BarChart3, label: "Analíticas", isPro: true },
  { path: "/app/predictions", icon: Orbit, label: "Futuro", isPro: true },
];

const MobileLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentBusiness } = useBusiness();
  const { isPro } = useSubscription();
  
  useAutoSync();

  // Título de pestaña dinámico
  useEffect(() => {
    const name = currentBusiness?.name?.trim();
    document.title = name ? `${name} · VISTACEO` : "VISTACEO · Inteligencia ejecutiva";
  }, [currentBusiness?.name]);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Top Header — clean, minimal */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/40 px-4 py-2.5">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-2.5">
            <VistaceoLogo size={28} variant="icon" />
            {currentBusiness && (
              <div className="min-w-0">
                <h1 className="text-[13px] font-semibold text-foreground truncate">
                  {currentBusiness.name}
                </h1>
              </div>
            )}
          </div>
          
          <button
            onClick={() => navigate('/app/more')}
            className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 relative z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation — clean, well-spaced */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/40">
        <div className="max-w-3xl mx-auto flex items-center justify-between h-[56px] px-1" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          {navItems.map((item) => {
            const isActive = item.path === "/app" 
              ? location.pathname === "/app"
              : location.pathname.startsWith(item.path);
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-lg transition-all duration-200",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
              >
                <div className="relative">
                  <item.icon className={cn(
                    "w-[20px] h-[20px] transition-all",
                    isActive && "scale-110"
                  )} />
                  
                  {item.isPro && !isPro && !isActive && (
                    <Crown className="absolute -top-1 -right-1.5 w-2.5 h-2.5 text-warning" />
                  )}
                </div>
                
                <span className={cn(
                  "text-[10px] leading-tight",
                  isActive ? "font-semibold" : "font-medium"
                )}>
                  {item.label}
                </span>
                
                {isActive && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-primary" />
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
