import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Home, MessageCircle, Target, Radar, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { OwlLogo } from "@/components/ui/OwlLogo";
import { useBusiness } from "@/contexts/BusinessContext";

const navItems = [
  { path: "/app", icon: Home, label: "Hoy" },
  { path: "/app/chat", icon: MessageCircle, label: "UCEO" },
  { path: "/app/missions", icon: Target, label: "Misiones" },
  { path: "/app/radar", icon: Radar, label: "Radar" },
  { path: "/app/more", icon: MoreHorizontal, label: "Más" },
];

const AppLayout = () => {
  const location = useLocation();
  const { currentBusiness } = useBusiness();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <OwlLogo size={32} />
            <div>
              <h1 className="text-sm font-semibold text-foreground">
                {currentBusiness?.name || "UCEO"}
              </h1>
              {currentBusiness && (
                <p className="text-xs text-muted-foreground capitalize">
                  {currentBusiness.category}
                </p>
              )}
            </div>
          </div>
          
          {/* Notification/Inbox badge could go here */}
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">1</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-inset-bottom">
        <div className="max-w-3xl mx-auto flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== "/app" && location.pathname.startsWith(item.path));
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-16 py-2 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-transform",
                  isActive && "scale-110"
                )} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
