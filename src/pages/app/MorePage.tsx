import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Building2, 
  Bell, 
  CreditCard, 
  LogOut,
  ChevronRight,
  Shield,
  Check,
  Settings,
  Crown,
  Calendar,
  Brain,
  Target,
  Lock,
  Globe,
  FileText,
  DollarSign,
  AlertTriangle,
  Sparkles,
  Image as ImageIcon,
  Zap,
  Star
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlassCard } from "@/components/app/GlassCard";
import { AutopilotModeSelector } from "@/components/app/AutopilotModeSelector";
import { BrainStatusWidget } from "@/components/app/BrainStatusWidget";
import { FocusSelector } from "@/components/app/FocusSelector";
import { GoogleBusinessProfileSection } from "@/components/app/GoogleBusinessProfileSection";
import { useSubscription } from "@/hooks/use-subscription";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const MorePage = () => {
  const { user, signOut } = useAuth();
  const { currentBusiness, refreshBusinesses } = useBusiness();
  const { isPro, planId, daysRemaining, expiresAt, isExpiringSoon, paymentProvider } = useSubscription();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [profileDialog, setProfileDialog] = useState(false);
  const [businessDialog, setBusinessDialog] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [autopilotDialog, setAutopilotDialog] = useState(false);
  const [subscriptionInfoDialog, setSubscriptionInfoDialog] = useState(false);
  const [paymentHistoryDialog, setPaymentHistoryDialog] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [userMode, setUserMode] = useState<"nano" | "standard" | "proactive" | "sos">("standard");

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
        .select("full_name, user_mode")
        .eq("id", user.id)
        .single();
      if (data) {
        if (data.full_name) setFullName(data.full_name);
        if (data.user_mode) setUserMode(data.user_mode as typeof userMode);
      }
    };
    fetchProfile();
  }, [user]);

  // Handle Google OAuth callback
  useEffect(() => {
    const oauthStatus = searchParams.get("oauth");
    const provider = searchParams.get("provider");
    if (oauthStatus && provider === "google") {
      if (oauthStatus === "success_gbp") {
        toast({
          title: "✅ Google Business Profile conectado",
          description: searchParams.get("select_location") === "true" 
            ? "Ahora seleccioná tu negocio de Google."
            : "Las reseñas se están sincronizando.",
        });
      } else if (oauthStatus === "error") {
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar Google Business Profile. Intentá de nuevo.",
          variant: "destructive",
        });
      }
      searchParams.delete("oauth");
      searchParams.delete("provider");
      searchParams.delete("select_location");
      searchParams.delete("error");
      searchParams.delete("reason");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

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

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Contraseña actualizada" });
      setPasswordDialog(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast({ title: "Error", description: "No se pudo cambiar la contraseña", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleNotifications = async (enabled: boolean) => {
    if (!user) return;
    setNotificationsEnabled(enabled);
    // Note: notifications_enabled would need to be added to profiles table
    // For now, just update local state
    toast({ title: enabled ? "Notificaciones activadas" : "Notificaciones desactivadas" });
  };

  const getModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      nano: "Nano - Mínimo",
      standard: "Estándar",
      proactive: "Proactivo",
      sos: "SOS - Crisis"
    };
    return labels[mode] || "Estándar";
  };

  const planLabel = planId === "pro_yearly" ? "Pro Anual" : planId === "pro_monthly" ? "Pro Mensual" : "Free";

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
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "gap-1",
                          isPro ? "bg-primary/20 text-primary" : "bg-secondary"
                        )}
                      >
                        <Crown className="w-3 h-3" />
                        {planLabel}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                  <Button variant="outline" onClick={() => setProfileDialog(true)}>
                    Editar perfil
                  </Button>
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
                {currentBusiness && (
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
                          <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Categoría</p>
                          <p className="font-medium text-foreground capitalize">{currentBusiness.category || "No especificada"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">País / Moneda</p>
                          <p className="font-medium text-foreground">{currentBusiness.country || "—"} · {currentBusiness.currency || "USD"}</p>
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
                )}
              </CardContent>
            </Card>

            {/* Focus Selector */}
            <FocusSelector variant="card" />

            {/* Brain Status */}
            <BrainStatusWidget variant="full" />

            {/* Google Business Profile */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="w-4 h-4 text-warning" />
                  Google Business Profile
                </CardTitle>
                <CardDescription>Conectá tu perfil para leer reseñas y alimentar el Cerebro</CardDescription>
              </CardHeader>
              <CardContent>
                <GoogleBusinessProfileSection />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account Settings */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Cuenta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <button
                    onClick={() => setProfileDialog(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">Perfil</p>
                      <p className="text-xs text-muted-foreground">Nombre y datos personales</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                  
                  <button
                    onClick={() => setPasswordDialog(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">Cambiar contraseña</p>
                      <p className="text-xs text-muted-foreground">Actualizar credenciales</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>

                  <div className="flex items-center gap-3 p-3 rounded-lg">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bell className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">Notificaciones</p>
                      <p className="text-xs text-muted-foreground">Alertas y recordatorios</p>
                    </div>
                    <Switch checked={notificationsEnabled} onCheckedChange={toggleNotifications} />
                  </div>
                </CardContent>
              </Card>

              {/* System Settings */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <button
                    onClick={() => setAutopilotDialog(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">Modo de operación</p>
                      <p className="text-xs text-muted-foreground">{getModeLabel(userMode)}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>

                  <button
                    onClick={() => navigate("/app/diagnostic")}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Target className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">Precisión del Brain</p>
                      <p className="text-xs text-muted-foreground">Completá tu perfil de negocio</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>

                  <button
                    onClick={() => navigate("/app/audit")}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">Auditoría Brain</p>
                      <p className="text-xs text-muted-foreground">Trazas y feedback del sistema</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Subscription & Quick Settings */}
          <div className="space-y-6">
            {/* Theme */}
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

            {/* Subscription Status */}
            <Card className="overflow-hidden">
              <div className={cn(
                "h-2",
                isPro ? "bg-gradient-to-r from-primary via-accent to-primary" : "bg-secondary"
              )} />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
                    isPro ? "bg-gradient-to-br from-primary to-accent" : "bg-secondary"
                  )}>
                    {isPro ? <Crown className="w-6 h-6 text-white" /> : <Zap className="w-6 h-6 text-muted-foreground" />}
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {planLabel}
                      {isPro && <Badge className="bg-success/20 text-success border-0">Activo</Badge>}
                    </CardTitle>
                    {isPro && expiresAt && (
                      <p className="text-sm text-muted-foreground">
                        Vence: {expiresAt.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isPro ? (
                  <>
                    {/* Days remaining */}
                    {daysRemaining !== null && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Días restantes</span>
                          <span className={cn("font-semibold", isExpiringSoon ? "text-warning" : "text-foreground")}>
                            {daysRemaining} días
                          </span>
                        </div>
                        <Progress value={Math.max(0, Math.min(100, (daysRemaining / (planId === "pro_yearly" ? 365 : 30)) * 100))} className="h-2" />
                      </div>
                    )}

                    {/* Payment method */}
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-xs">Método de pago</span>
                      </div>
                      <p className="font-medium text-foreground capitalize">
                        {paymentProvider === "mercadopago" ? "MercadoPago" : paymentProvider === "paypal" ? "PayPal" : "—"}
                      </p>
                    </div>

                    {isExpiringSoon && (
                      <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-warning" />
                          <p className="text-sm font-medium text-warning">Vence pronto</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Renová antes del {expiresAt?.toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    )}

                    <Button variant="outline" className="w-full" onClick={() => navigate("/checkout")}>
                      Gestionar suscripción
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-success" />
                        <span>Dashboard de Salud - Completo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-success" />
                        <span>Misiones - 3/mes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-success" />
                        <span>Chat IA - 3/mes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-success" />
                        <span>Radar de Oportunidades - 3/mes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-success" />
                        <span>Check-ins de Pulso - Diarios</span>
                      </div>
                    </div>

                    <Separator />

                    <Button className="w-full gradient-primary text-white" onClick={() => navigate("/checkout")}>
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade a Pro
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Legal */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Legal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <button
                  onClick={() => navigate("/privacy")}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                >
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Privacidad</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </button>
                <button
                  onClick={() => navigate("/terms")}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Términos de servicio</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </button>
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

            <p className="text-center text-xs text-muted-foreground">v1.0.0</p>
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

        <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cambiar contraseña</DialogTitle>
              <DialogDescription>Ingresa tu nueva contraseña</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Nueva contraseña</Label>
                <Input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className="mt-1" 
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <Label>Confirmar contraseña</Label>
                <Input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className="mt-1" 
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setPasswordDialog(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={changePassword} disabled={saving}>{saving ? "Guardando..." : "Cambiar"}</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={autopilotDialog} onOpenChange={setAutopilotDialog}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Modo de operación
              </DialogTitle>
              <DialogDescription>
                Elige cómo quieres que el asistente interactúe contigo
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {user && (
                <AutopilotModeSelector
                  currentMode={userMode}
                  userId={user.id}
                  onModeChange={(mode) => setUserMode(mode)}
                  isPro={isPro}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Mobile Layout - Simplified
  return (
    <div className="space-y-6 pb-6">
      {/* User Card */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-lg">
              {fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-background flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg text-foreground truncate">
              {fullName || user?.email}
            </h2>
            {currentBusiness && (
              <p className="text-sm text-muted-foreground truncate">{currentBusiness.name}</p>
            )}
            <Badge 
              variant="secondary" 
              className={cn("gap-1 text-xs mt-1", isPro ? "bg-primary/20 text-primary" : "")}
            >
              <Crown className="w-3 h-3" />
              {planLabel}
            </Badge>
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

      {/* Upgrade Banner - Only for Free */}
      {!isPro && (
        <GlassCard className="p-5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">Actualiza a Pro</h3>
              <p className="text-xs text-muted-foreground">Funciones ilimitadas</p>
            </div>
            <Button size="sm" onClick={() => navigate("/checkout")}>
              Ver
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Account Section */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Cuenta
        </h3>
        <GlassCard className="overflow-hidden">
          <button onClick={() => setProfileDialog(true)} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-secondary/50 border-b border-border/50">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">Perfil</p>
              <p className="text-xs text-muted-foreground">Información personal</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button onClick={() => setBusinessDialog(true)} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-secondary/50 border-b border-border/50">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">Mi negocio</p>
              <p className="text-xs text-muted-foreground">Datos del establecimiento</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button onClick={() => setPasswordDialog(true)} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-secondary/50 border-b border-border/50">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">Cambiar contraseña</p>
              <p className="text-xs text-muted-foreground">Actualizar credenciales</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-4 px-4 py-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">Notificaciones</p>
              <p className="text-xs text-muted-foreground">Alertas y recordatorios</p>
            </div>
            <Switch checked={notificationsEnabled} onCheckedChange={toggleNotifications} />
          </div>
        </GlassCard>
      </div>

      {/* Google Business Profile */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Google Business Profile
        </h3>
        <GoogleBusinessProfileSection />
      </div>

      {/* System Section */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Sistema
        </h3>
        <GlassCard className="overflow-hidden">
          <button onClick={() => setAutopilotDialog(true)} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-secondary/50 border-b border-border/50">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">Modo de operación</p>
              <p className="text-xs text-muted-foreground">{getModeLabel(userMode)}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button onClick={() => navigate("/app/analytics")} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-secondary/50">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">Analíticas y métricas</p>
              <p className="text-xs text-muted-foreground">Estadísticas del negocio</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </GlassCard>
      </div>

      {/* Subscription Section */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Suscripción
        </h3>
        <GlassCard className="overflow-hidden">
          <button 
            onClick={() => isPro ? setSubscriptionInfoDialog(true) : navigate("/checkout")} 
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-secondary/50 border-b border-border/50"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">Mi plan</p>
              <p className="text-xs text-muted-foreground">
                {isPro 
                  ? `${planLabel} · ${daysRemaining} días restantes` 
                  : "Plan Free"}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button 
            onClick={async () => {
              setPaymentHistoryDialog(true);
              setLoadingHistory(true);
              try {
                const { data } = await supabase
                  .from("subscriptions")
                  .select("*")
                  .eq("business_id", currentBusiness?.id || "")
                  .order("created_at", { ascending: false })
                  .limit(10);
                setPaymentHistory(data || []);
              } catch (e) {
                console.error("Error loading payment history:", e);
              } finally {
                setLoadingHistory(false);
              }
            }} 
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-secondary/50"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">Historial de pagos</p>
              <p className="text-xs text-muted-foreground">Facturas y recibos</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </GlassCard>
      </div>

      {/* Legal Section */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Legal
        </h3>
        <GlassCard className="overflow-hidden">
          <button onClick={() => navigate("/privacy")} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-secondary/50 border-b border-border/50">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Shield className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">Privacidad</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button onClick={() => navigate("/terms")} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-secondary/50">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">Términos de servicio</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </GlassCard>
      </div>

      {/* Sign Out */}
      <Button
        variant="outline"
        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
        onClick={handleSignOut}
      >
        <LogOut className="w-5 h-5 mr-3" />
        Cerrar sesión
      </Button>

      <p className="text-center text-xs text-muted-foreground">v1.0.0</p>

      {/* Dialogs */}
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

      <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
            <DialogDescription>Ingresa tu nueva contraseña</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Nueva contraseña</Label>
              <Input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                className="mt-1" 
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <Label>Confirmar contraseña</Label>
              <Input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="mt-1" 
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={() => setPasswordDialog(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={changePassword} disabled={saving}>{saving ? "Guardando..." : "Cambiar"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={autopilotDialog} onOpenChange={setAutopilotDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Modo de operación
            </DialogTitle>
            <DialogDescription>
              Elegí cómo querés que el asistente interactúe con vos
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {user && (
              <AutopilotModeSelector
                currentMode={userMode}
                userId={user.id}
                onModeChange={(mode) => {
                  setUserMode(mode);
                  setAutopilotDialog(false);
                }}
                isPro={isPro}
              />
            )}
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setAutopilotDialog(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subscription Info Dialog for Pro users */}
      <Dialog open={subscriptionInfoDialog} onOpenChange={setSubscriptionInfoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Tu suscripción Pro
            </DialogTitle>
            <DialogDescription>
              Información sobre tu plan actual
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">{planLabel}</p>
                  <p className="text-sm text-muted-foreground">Plan activo</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Días restantes</span>
                  <span className="font-semibold text-foreground">{daysRemaining} días</span>
                </div>
                {expiresAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Próxima renovación</span>
                    <span className="font-medium text-foreground">
                      {expiresAt.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
                {paymentProvider && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Método de pago</span>
                    <span className="font-medium text-foreground capitalize">
                      {paymentProvider === "mercadopago" ? "MercadoPago" : "PayPal"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                ¡Gracias por ser parte de VistaCEO Pro! 🚀
              </p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setSubscriptionInfoDialog(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment History Dialog */}
      <Dialog open={paymentHistoryDialog} onOpenChange={setPaymentHistoryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Historial de pagos
            </DialogTitle>
            <DialogDescription>
              Tus transacciones y suscripciones
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4 max-h-[400px] overflow-y-auto">
            {loadingHistory ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Cargando historial...</p>
              </div>
            ) : paymentHistory.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No hay pagos registrados</p>
                {!isPro && (
                  <Button size="sm" className="mt-3" onClick={() => navigate("/checkout")}>
                    Actualizar a Pro
                  </Button>
                )}
              </div>
            ) : (
              paymentHistory.map((payment, idx) => {
                const date = new Date(payment.created_at);
                const planName = payment.plan_id === "pro_yearly" ? "Pro Anual" : 
                                 payment.plan_id === "pro_monthly" ? "Pro Mensual" : "Plan";
                const provider = payment.payment_provider === "mercadopago" ? "MercadoPago" : 
                                 payment.payment_provider === "paypal" ? "PayPal" : "-";
                
                return (
                  <div key={payment.id || idx} className="p-4 rounded-xl bg-secondary/30 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-foreground">{planName}</span>
                      <Badge variant={payment.status === "active" ? "default" : "secondary"} className="text-xs">
                        {payment.status === "active" ? "Activo" : 
                         payment.status === "expired" ? "Expirado" : 
                         payment.status === "cancelled" ? "Cancelado" : payment.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fecha</span>
                        <span className="text-foreground">
                          {date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Método</span>
                        <span className="text-foreground">{provider}</span>
                      </div>
                      {payment.expires_at && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Válido hasta</span>
                          <span className="text-foreground">
                            {new Date(payment.expires_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setPaymentHistoryDialog(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MorePage;