import { Bell, Search, User, Command, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  sidebarCollapsed: boolean;
}

export const DashboardHeader = ({ sidebarCollapsed }: DashboardHeaderProps) => {
  const { currentBusiness } = useBusiness();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (data?.full_name) setFullName(data.full_name);
    };
    fetchProfile();
  }, [user]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getInitials = () => {
    if (fullName) {
      return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border z-40",
          "flex items-center justify-between px-6 transition-all duration-300",
          sidebarCollapsed ? "left-[72px]" : "left-[260px]"
        )}
      >
        {/* Left side - Greeting & Search */}
        <div className="flex items-center gap-6 flex-1">
          {/* Greeting */}
          <div className="hidden lg:block">
            <p className="text-sm text-muted-foreground">{getGreeting()},</p>
            <h2 className="text-lg font-semibold text-foreground -mt-0.5">
              {fullName || user?.email?.split("@")[0] || "Usuario"}
            </h2>
          </div>

          {/* Search */}
          <button 
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-3 h-10 px-4 w-full max-w-md bg-secondary/50 hover:bg-secondary border border-border/50 rounded-xl text-left transition-colors group"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground flex-1">Buscar acciones, misiones...</span>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground bg-background border border-border rounded">
              <Command className="h-3 w-3" />
              K
            </kbd>
          </button>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Add */}
          <Button variant="outline" size="sm" className="hidden md:flex gap-2 border-dashed border-primary/50 text-primary hover:bg-primary/10 hover:border-primary">
            <Plus className="h-4 w-4" />
            Nueva acción
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-secondary">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full animate-pulse" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-card border-border">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notificaciones
                <Badge variant="secondary" className="text-xs">3 nuevas</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                {[
                  { title: "Nueva oportunidad detectada", desc: "El radar encontró una tendencia en tu sector", time: "Hace 5 min" },
                  { title: "Misión completada", desc: "Felicidades por completar 'Mejorar reseñas'", time: "Hace 1 hora" },
                  { title: "Recordatorio", desc: "Tienes 2 acciones pendientes para hoy", time: "Hace 3 horas" },
                ].map((notif, i) => (
                  <DropdownMenuItem key={i} className="flex flex-col items-start gap-1 cursor-pointer p-3">
                    <p className="text-sm font-medium text-foreground">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">{notif.desc}</p>
                    <p className="text-xs text-primary mt-1">{notif.time}</p>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary cursor-pointer">
                Ver todas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2 hover:bg-secondary">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-foreground leading-tight">
                    {fullName || user?.email?.split("@")[0] || "Usuario"}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {currentBusiness?.name || "Sin negocio"}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border">
              <DropdownMenuLabel>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{fullName || "Usuario"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/app/more")} className="cursor-pointer">
                Configuración
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/onboarding")} className="cursor-pointer">
                Editar negocio
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => signOut()}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="sr-only">Buscar</DialogTitle>
            <DialogDescription className="sr-only">Busca acciones, misiones y más</DialogDescription>
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Buscar acciones, misiones, oportunidades..." 
                className="border-0 focus-visible:ring-0 text-base px-0 h-auto"
                autoFocus
              />
            </div>
          </DialogHeader>
          <div className="border-t border-border">
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase">Acceso rápido</p>
              {[
                { label: "Ir a Hoy", path: "/app" },
                { label: "Hablar con el CEO", path: "/app/chat" },
                { label: "Ver Misiones", path: "/app/missions" },
                { label: "Explorar Radar", path: "/app/radar" },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSearchOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
                >
                  <span className="text-sm text-foreground">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
