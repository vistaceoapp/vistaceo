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
  Moon,
  Sun,
  Check
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

const MorePage = () => {
  const { user, signOut } = useAuth();
  const { currentBusiness, refreshBusinesses } = useBusiness();
  const navigate = useNavigate();
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
        { icon: User, label: "Perfil", action: () => setProfileDialog(true) },
        { icon: Building2, label: "Mi negocio", action: () => setBusinessDialog(true) },
        { icon: Bell, label: "Notificaciones", action: () => toast({ title: "Próximamente" }) },
      ],
    },
    {
      title: "Integraciones",
      items: [
        { icon: LinkIcon, label: "Conectar servicios", action: () => toast({ title: "Próximamente" }) },
        { icon: Globe, label: "País e idioma", action: () => toast({ title: "Próximamente" }) },
      ],
    },
    {
      title: "Suscripción",
      items: [
        { icon: CreditCard, label: "Plan y facturación", action: () => toast({ title: "Próximamente" }) },
      ],
    },
    {
      title: "Ayuda",
      items: [
        { icon: HelpCircle, label: "Centro de ayuda", action: () => toast({ title: "Próximamente" }) },
        { icon: Shield, label: "Privacidad", action: () => toast({ title: "Próximamente" }) },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* User Card */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-lg">
            {fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
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
            <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              <Check className="w-3 h-3" />
              Plan Free
            </span>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      {menuSections.map((section) => (
        <div key={section.title}>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            {section.title}
          </h3>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {section.items.map((item, idx) => (
              <button
                key={item.label}
                onClick={item.action}
                className={`w-full flex items-center gap-4 px-4 py-3.5 hover:bg-secondary/50 transition-colors ${
                  idx < section.items.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <item.icon className="w-5 h-5 text-muted-foreground" />
                <span className="flex-1 text-left text-foreground font-medium">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      ))}

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
