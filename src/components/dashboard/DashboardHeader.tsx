import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
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
import { useNavigate } from "react-router-dom";
import { InsightNotificationBell } from "@/components/app/InsightNotificationBell";
import { CountrySelector } from "@/components/shared/CountrySelector";
import { useCountryDetection } from "@/hooks/use-country-detection";

interface DashboardHeaderProps {
  sidebarCollapsed: boolean;
}

export const DashboardHeader = ({ sidebarCollapsed }: DashboardHeaderProps) => {
  const { currentBusiness } = useBusiness();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const { country, setCountryOverride } = useCountryDetection();

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

  const getInitials = () => {
    if (fullName) {
      return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <header 
      className={cn(
        "fixed top-0 right-0 h-12 bg-background/90 backdrop-blur-xl border-b border-border/30 z-40",
        "flex items-center justify-end px-4 transition-all duration-300",
        sidebarCollapsed ? "left-[72px]" : "left-[240px]"
      )}
    >
      <div className="flex items-center gap-1.5">
        <CountrySelector
          value={country.code}
          onChange={setCountryOverride}
          variant="light"
        />
        <InsightNotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2 hover:bg-muted/50 rounded-xl h-9">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-[12px] font-medium text-foreground leading-tight">
                  {fullName || user?.email?.split("@")[0] || "Usuario"}
                </p>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-card border-border/60 rounded-xl">
            <DropdownMenuLabel className="pb-2">
              <p className="font-medium text-foreground text-sm">{fullName || "Usuario"}</p>
              <p className="text-[11px] text-muted-foreground">{user?.email}</p>
              {currentBusiness && (
                <p className="text-[11px] text-primary mt-0.5">{currentBusiness.name}</p>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/app/more")} className="cursor-pointer text-[13px] rounded-lg">
              Configuración
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/setup")} className="cursor-pointer text-[13px] rounded-lg">
              Editar negocio
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => signOut()}
              className="text-destructive focus:text-destructive cursor-pointer text-[13px] rounded-lg"
            >
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};