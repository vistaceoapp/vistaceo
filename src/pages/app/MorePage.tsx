import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Building2, 
  Bell, 
  Globe, 
  CreditCard, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Link as LinkIcon,
  Shield,
  Check,
  Settings,
  Sparkles,
  Crown,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BarChart3,
  Zap
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GlassCard } from "@/components/app/GlassCard";

const MorePage = () => {
  const { user, signOut } = useAuth();
  const { currentBusiness, refreshBusinesses } = useBusiness();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [profileDialog, setProfileDialog] = useState(false);
  const [businessDialog, setBusinessDialog] = useState(false);
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentBusiness) {
      setBusinessName(currentBusiness.name);
    }
  }, [currentBusiness]);

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

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Sesión cerrada" });
    navigate("/");
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);
      if (error) throw error;
      toast({ title: "Perfil actualizado" });
      setProfileDialog(false);
    } catch {
      toast({ title: "Error", description: "No se pudo guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const saveBusiness = async () => {
    if (!currentBusiness) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("businesses")
        .update({ name: businessName })
        .eq("id", currentBusiness.id);
      if (error) throw error;
      await refreshBusinesses();
      toast({ title: "Negocio actualizado" });
      setBusinessDialog(false);
    } catch {
      toast({ title: "Error", description: "No se pudo guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const menuSections = [
    {
      title: "Cuenta",
      items: [
        { icon: User, label: "Perfil", description: "Información personal", action: () => setProfileDialog(true) },
        { icon: Building2, label: "Mi negocio", description: "Datos del establecimiento", action: () => setBusinessDialog(true) },
        { icon: Bell, label: "Notificaciones", description: "Preferencias de alertas", action: () => toast({ title: "Próximamente" }) },
      ],
    },
    {
      title: "Integraciones",
      items: [
        { icon: LinkIcon, label: "Conectar servicios", description: "Google, Instagram, POS", action: () => toast({ title: "Próximamente" }) },
        { icon: Globe, label: "País e idioma", description: "Configuración regional", action: () => toast({ title: "Próximamente" }) },
      ],
    },
    {
      title: "Suscripción",
      items: [
        { icon: CreditCard, label: "Plan y facturación", description: "Gestiona tu suscripción", action: () => toast({ title: "Próximamente" }) },
      ],
    },
    {
      title: "Ayuda",
      items: [
        { icon: HelpCircle, label: "Centro de ayuda", description: "Guías y tutoriales", action: () => toast({ title: "Próximamente" }) },
        { icon: Shield, label: "Privacidad", description: "Términos y políticas", action: () => toast({ title: "Próximamente" }) },
      ],
    },
  ];

  // Desktop Layout
  if (!isMobile) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground mt-1">Gestiona tu cuenta, negocio y preferencias</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Business */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <Card className="overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
              <CardContent className="relative pt-0">
                <div className="flex items-end gap-6 -mt-12">
                  <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                    <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
                      {fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-foreground">
                        {fullName || "Sin nombre"}
                      </h2>
                      <Badge variant="secondary" className="gap-1">
                        <Crown className="w-3 h-3" />
                        Plan Free
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                  <Button variant="outline" onClick={() => setProfileDialog(true)}>
                    Editar perfil
                  </Button>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-xl bg-secondary/50">
                    <div className="text-2xl font-bold text-foreground">28</div>
                    <div className="text-sm text-muted-foreground">Días activo</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-secondary/50">
                    <div className="text-2xl font-bold text-foreground">156</div>
                    <div className="text-sm text-muted-foreground">Acciones</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-secondary/50">
                    <div className="text-2xl font-bold text-foreground">12</div>
                    <div className="text-sm text-muted-foreground">Misiones</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-secondary/50">
                    <div className="text-2xl font-bold text-foreground">89%</div>
                    <div className="text-sm text-muted-foreground">Efectividad</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Mi Negocio
                  </CardTitle>
                  <CardDescription>Información de tu establecimiento</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setBusinessDialog(true)}>
                  Editar
                </Button>
              </CardHeader>
              <CardContent>
                {currentBusiness ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Nombre</p>
                          <p className="font-medium text-foreground">{currentBusiness.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Categoría</p>
                          <p className="font-medium text-foreground capitalize">{currentBusiness.category || "No especificada"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">País</p>
                          <p className="font-medium text-foreground">{currentBusiness.country || "No especificado"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Ticket promedio</p>
                          <p className="font-medium text-foreground">
                            {currentBusiness.avg_ticket ? `$${currentBusiness.avg_ticket}` : "No especificado"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Rating</p>
                          <p className="font-medium text-foreground">
                            {currentBusiness.avg_rating ? `${currentBusiness.avg_rating} ⭐` : "Sin calificaciones"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Miembro desde</p>
                          <p className="font-medium text-foreground">
                            {currentBusiness.created_at 
                              ? new Date(currentBusiness.created_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay negocio configurado</p>
                )}
              </CardContent>
            </Card>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuSections.map((section) => (
                <Card key={section.title}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {section.items.map((item) => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </button>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Column - Quick Settings & Plan */}
          <div className="space-y-6">
            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Apariencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Tema</p>
                    <p className="text-sm text-muted-foreground">Claro u oscuro</p>
                  </div>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>

            {/* Upgrade Card */}
            <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">Actualiza a Pro</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Desbloquea análisis avanzados, más integraciones y soporte prioritario
                    </p>
                  </div>
                  <Button className="w-full" onClick={() => toast({ title: "Próximamente" })}>
                    <Crown className="w-4 h-4 mr-2" />
                    Ver planes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Uso este mes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Consultas con UCEO</span>
                    <span className="font-medium text-foreground">45/100</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Análisis de radar</span>
                    <span className="font-medium text-foreground">8/20</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sign Out */}
            <Button
              variant="outline"
              className="w-full justify-center text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Button>

            <p className="text-center text-xs text-muted-foreground">UCEO v1.0.0</p>
          </div>
        </div>

        {/* Dialogs */}
        <Dialog open={profileDialog} onOpenChange={setProfileDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar perfil</DialogTitle>
              <DialogDescription>Actualiza tu información personal</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Nombre completo</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled className="mt-1 bg-muted" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setProfileDialog(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={saveProfile} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={businessDialog} onOpenChange={setBusinessDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar negocio</DialogTitle>
              <DialogDescription>Actualiza la información de tu negocio</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Nombre del negocio</Label>
                <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="mt-1" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setBusinessDialog(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={saveBusiness} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Mobile Layout
  return (
    <div className="space-y-6 pb-6">
      {/* User Card - Premium Mobile */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-18 h-18 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-lg">
              {fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg text-foreground truncate">
              {fullName || user?.email}
            </h2>
            {currentBusiness && (
              <p className="text-sm text-muted-foreground truncate">
                {currentBusiness.name}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="gap-1 text-xs">
                <Crown className="w-3 h-3" />
                Plan Free
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border/50">
          <div className="text-center">
            <div className="text-xl font-bold text-foreground">28</div>
            <div className="text-xs text-muted-foreground">Días</div>
          </div>
          <div className="text-center border-x border-border/50">
            <div className="text-xl font-bold text-foreground">156</div>
            <div className="text-xs text-muted-foreground">Acciones</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-foreground">89%</div>
            <div className="text-xs text-muted-foreground">Efectividad</div>
          </div>
        </div>
      </GlassCard>

      {/* Theme Toggle */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Tema</p>
              <p className="text-xs text-muted-foreground">Claro / Oscuro</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </GlassCard>

      {/* Menu Sections */}
      {menuSections.map((section, sIdx) => (
        <div key={section.title} className="animate-fade-in" style={{ animationDelay: `${sIdx * 50}ms` }}>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            {section.title}
          </h3>
          <GlassCard className="overflow-hidden">
            {section.items.map((item, idx) => (
              <button
                key={item.label}
                onClick={item.action}
                className={`w-full flex items-center gap-4 px-4 py-4 hover:bg-secondary/50 active:bg-secondary transition-colors ${
                  idx < section.items.length - 1 ? "border-b border-border/50" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </GlassCard>
        </div>
      ))}

      {/* Upgrade Banner */}
      <GlassCard className="p-5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">Actualiza a Pro</h3>
            <p className="text-xs text-muted-foreground">Más análisis e integraciones</p>
          </div>
          <Button size="sm" onClick={() => toast({ title: "Próximamente" })}>
            Ver
          </Button>
        </div>
      </GlassCard>

      {/* Sign Out */}
      <Button
        variant="outline"
        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
        onClick={handleSignOut}
      >
        <LogOut className="w-5 h-5 mr-3" />
        Cerrar sesión
      </Button>

      <p className="text-center text-xs text-muted-foreground">UCEO v1.0.0</p>

      {/* Profile Dialog */}
      <Dialog open={profileDialog} onOpenChange={setProfileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
            <DialogDescription>Actualiza tu información personal</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Nombre completo</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="mt-1 bg-muted" />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={() => setProfileDialog(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={saveProfile} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Business Dialog */}
      <Dialog open={businessDialog} onOpenChange={setBusinessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar negocio</DialogTitle>
            <DialogDescription>Actualiza la información de tu negocio</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Nombre del negocio</Label>
              <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={() => setBusinessDialog(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={saveBusiness} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MorePage;
