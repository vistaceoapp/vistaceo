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
  Shield
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const MorePage = () => {
  const { user, signOut } = useAuth();
  const { currentBusiness } = useBusiness();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  const menuSections = [
    {
      title: "Cuenta",
      items: [
        { icon: User, label: "Perfil", href: "/app/settings/profile" },
        { icon: Building2, label: "Mi negocio", href: "/app/settings/business" },
        { icon: Bell, label: "Notificaciones", href: "/app/settings/notifications" },
      ],
    },
    {
      title: "Integraciones",
      items: [
        { icon: LinkIcon, label: "Conectar servicios", href: "/app/settings/integrations" },
        { icon: Globe, label: "País e idioma", href: "/app/settings/locale" },
      ],
    },
    {
      title: "Suscripción",
      items: [
        { icon: CreditCard, label: "Plan y facturación", href: "/app/settings/billing" },
      ],
    },
    {
      title: "Ayuda",
      items: [
        { icon: HelpCircle, label: "Centro de ayuda", href: "/app/settings/help" },
        { icon: Shield, label: "Privacidad y términos", href: "/app/settings/privacy" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* User Card */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">
              {user?.email}
            </h2>
            {currentBusiness && (
              <p className="text-sm text-muted-foreground truncate">
                {currentBusiness.name}
              </p>
            )}
            <span className="inline-block mt-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
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
                onClick={() => toast.info("Esta sección estará disponible pronto")}
                className={`w-full flex items-center gap-4 px-4 py-3 hover:bg-secondary/50 transition-colors ${
                  idx < section.items.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <item.icon className="w-5 h-5 text-muted-foreground" />
                <span className="flex-1 text-left text-foreground">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Sign Out */}
      <Button
        variant="outline"
        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleSignOut}
      >
        <LogOut className="w-5 h-5 mr-3" />
        Cerrar sesión
      </Button>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground">
        UCEO v1.0.0
      </p>
    </div>
  );
};

export default MorePage;
