import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OwlLogo } from "@/components/ui/OwlLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check, Store, MapPin, Phone, Sparkles, Building2, Globe, ChevronRight, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { Database } from "@/integrations/supabase/types";

type BusinessCategory = Database["public"]["Enums"]["business_category"];
type CountryCode = Database["public"]["Enums"]["country_code"];

const CATEGORIES: { value: BusinessCategory; label: string; emoji: string; description: string }[] = [
  { value: "restaurant", label: "Restaurante", emoji: "🍽️", description: "Servicio de comidas completo" },
  { value: "cafeteria", label: "Cafetería", emoji: "☕", description: "Café, bebidas y snacks" },
  { value: "bar", label: "Bar", emoji: "🍺", description: "Bebidas y entretenimiento" },
  { value: "fast_casual", label: "Fast Casual", emoji: "🍔", description: "Comida rápida de calidad" },
  { value: "heladeria", label: "Heladería", emoji: "🍦", description: "Helados y postres fríos" },
  { value: "panaderia", label: "Panadería", emoji: "🥐", description: "Pan, pasteles y bollería" },
  { value: "dark_kitchen", label: "Dark Kitchen", emoji: "👨‍🍳", description: "Solo delivery" },
];

const COUNTRIES: { value: CountryCode; label: string; flag: string }[] = [
  { value: "AR", label: "Argentina", flag: "🇦🇷" },
  { value: "MX", label: "México", flag: "🇲🇽" },
  { value: "CL", label: "Chile", flag: "🇨🇱" },
  { value: "CO", label: "Colombia", flag: "🇨🇴" },
  { value: "BR", label: "Brasil", flag: "🇧🇷" },
  { value: "UY", label: "Uruguay", flag: "🇺🇾" },
  { value: "CR", label: "Costa Rica", flag: "🇨🇷" },
  { value: "PA", label: "Panamá", flag: "🇵🇦" },
  { value: "US", label: "Estados Unidos", flag: "🇺🇸" },
];

const STEPS = [
  { id: 1, title: "Tu Negocio", description: "Nombre y categoría", icon: Store },
  { id: 2, title: "Ubicación", description: "País de operación", icon: Globe },
  { id: 3, title: "Detalles", description: "Información adicional", icon: Building2 },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { refreshBusinesses } = useBusiness();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "" as BusinessCategory | "",
    country: "" as CountryCode | "",
    address: "",
    phone: "",
  });

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name.trim().length >= 2 && formData.category !== "";
      case 2:
        return formData.country !== "";
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Create business
      const { data: businessData, error } = await supabase.from("businesses").insert({
        name: formData.name.trim(),
        category: formData.category as BusinessCategory,
        country: formData.country as CountryCode,
        address: formData.address.trim() || null,
        phone: formData.phone.trim() || null,
        owner_id: user.id,
        setup_completed: false, // Require full setup
      }).select().single();

      if (error) throw error;

      // Create initial setup progress
      if (businessData) {
        await supabase.from("business_setup_progress").insert({
          business_id: businessData.id,
          current_step: 'S00',
          setup_data: {
            countryCode: formData.country,
            address: formData.address.trim(),
            city: '',
            primaryType: formData.category,
            started: true,
          },
          precision_score: 15, // Base score from basic info
        });
      }

      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);

      await refreshBusinesses();

      toast({
        title: "🚀 Negocio creado",
        description: "Ahora completemos tu Setup Inteligente para un dashboard personalizado.",
      });

      // Navigate to app - the setup wizard will show automatically
      navigate("/app");
    } catch (error) {
      console.error("Error creating business:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el negocio. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Desktop Layout - Professional Wizard
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-background flex">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-[480px] bg-card border-r border-border flex-col">
          {/* Logo */}
          <div className="p-8">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 blur-xl bg-primary/30 rounded-full" />
                <OwlLogo size={80} className="relative z-10" />
              </div>
            </div>
          </div>

          {/* Steps Navigation */}
          <div className="flex-1 px-8 py-12">
            <div className="space-y-2">
              {STEPS.map((s, idx) => {
                const isActive = s.id === step;
                const isCompleted = s.id < step;
                const Icon = s.icon;

                return (
                  <button
                    key={s.id}
                    onClick={() => s.id < step && setStep(s.id)}
                    disabled={s.id > step}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left",
                      isActive && "bg-primary/10 border border-primary/30",
                      isCompleted && "hover:bg-secondary cursor-pointer",
                      !isActive && !isCompleted && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                      isActive && "gradient-primary shadow-lg shadow-primary/30",
                      isCompleted && "bg-success text-white",
                      !isActive && !isCompleted && "bg-secondary text-muted-foreground"
                    )}>
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        "font-semibold",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {s.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{s.description}</p>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-5 h-5 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Info Card */}
            <div className="mt-12 p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/10">
              <Sparkles className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                ¿Por qué estos datos?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Utilizo la información de tu negocio para darte consejos personalizados, 
                detectar oportunidades en tu mercado local y crear acciones específicas para tu tipo de negocio.
              </p>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="p-8 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cambiar tema</span>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 flex flex-col">
          {/* Mobile/Tablet Header */}
          <div className="lg:hidden p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <OwlLogo size={36} variant="round" />
            </div>
            <ThemeToggle />
          </div>

          {/* Progress bar mobile */}
          <div className="lg:hidden p-4">
            <div className="flex gap-2">
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    "flex-1 h-1.5 rounded-full transition-colors",
                    s.id <= step ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-xl">
              {step === 1 && (
                <div className="animate-fade-in">
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                      <Store className="w-4 h-4" />
                      Paso 1 de 3
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-3">
                      Cuéntame sobre tu negocio
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      Esta información me ayuda a personalizar tu experiencia
                    </p>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <Label htmlFor="name" className="text-base font-medium mb-3 block">
                        ¿Cómo se llama tu negocio?
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Ej: Café Central, La Trattoria, etc."
                        className="h-14 text-lg bg-card border-border"
                      />
                    </div>

                    <div>
                      <Label className="text-base font-medium mb-4 block">
                        ¿Qué tipo de negocio es?
                      </Label>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.value}
                            onClick={() =>
                              setFormData({ ...formData, category: cat.value })
                            }
                            className={cn(
                              "group p-4 rounded-xl border text-left transition-all hover:shadow-md",
                              formData.category === cat.value
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-lg shadow-primary/10"
                                : "border-border bg-card hover:border-primary/30 hover:bg-secondary/50"
                            )}
                          >
                            <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">
                              {cat.emoji}
                            </span>
                            <p className="font-semibold text-foreground">{cat.label}</p>
                            <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-fade-in">
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                      <Globe className="w-4 h-4" />
                      Paso 2 de 3
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-3">
                      ¿Dónde está ubicado?
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      Personalizamos la experiencia según tu mercado local
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {COUNTRIES.map((country) => (
                      <button
                        key={country.value}
                        onClick={() =>
                          setFormData({ ...formData, country: country.value })
                        }
                        className={cn(
                          "group p-5 rounded-xl border text-center transition-all hover:shadow-md",
                          formData.country === country.value
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-lg shadow-primary/10"
                            : "border-border bg-card hover:border-primary/30 hover:bg-secondary/50"
                        )}
                      >
                        <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform">
                          {country.flag}
                        </span>
                        <p className="font-semibold text-foreground">{country.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="animate-fade-in">
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium mb-6">
                      <Rocket className="w-4 h-4" />
                      Último paso
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-3">
                      Datos adicionales
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      Opcional, pero útil para UCEO
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="address" className="text-base font-medium flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-primary" />
                        Dirección del negocio
                      </Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        placeholder="Ej: Av. Principal 123, Ciudad"
                        className="h-14 text-lg bg-card border-border"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-base font-medium flex items-center gap-2 mb-3">
                        <Phone className="w-4 h-4 text-primary" />
                        Teléfono de contacto
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="Ej: +54 11 1234-5678"
                        className="h-14 text-lg bg-card border-border"
                      />
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="mt-10 p-6 bg-gradient-to-br from-success/5 to-primary/5 rounded-2xl border border-success/20">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-lg mb-1">
                          ¡Todo listo para comenzar!
                        </p>
                        <p className="text-muted-foreground">
                          Estás creando <span className="font-medium text-foreground">{formData.name}</span> 
                          {formData.category && ` como ${CATEGORIES.find(c => c.value === formData.category)?.label.toLowerCase()}`}
                          {formData.country && ` en ${COUNTRIES.find(c => c.value === formData.country)?.label}`}.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-8 border-t border-border bg-card/50">
            <div className="max-w-xl mx-auto flex items-center gap-4">
              {step > 1 && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleBack}
                  className="px-8"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Atrás
                </Button>
              )}
              
              <div className="flex-1" />
              
              {step < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  size="lg"
                  className="px-12 gradient-primary shadow-lg shadow-primary/20 hover:shadow-primary/40"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  size="lg"
                  className="px-12 gradient-primary shadow-lg shadow-primary/20 hover:shadow-primary/40"
                >
                  {loading ? (
                    "Creando..."
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 mr-2" />
                      Crear negocio
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Layout
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        {step > 1 ? (
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        ) : (
          <div className="w-10" />
        )}
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 w-8 rounded-full transition-colors",
                i < step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <OwlLogo size={48} className="mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground">
                Cuéntame sobre tu negocio
              </h1>
              <p className="text-muted-foreground mt-2">
                Esto me ayudará a darte mejores consejos
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                  <Store className="w-4 h-4" />
                  Nombre del negocio
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ej: Café Central"
                  className="bg-card"
                />
              </div>

              <div>
                <Label className="mb-3 block">Tipo de negocio</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() =>
                        setFormData({ ...formData, category: cat.value })
                      }
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all",
                        formData.category === cat.value
                          ? "border-primary bg-primary/10 ring-1 ring-primary"
                          : "border-border bg-card hover:border-primary/30"
                      )}
                    >
                      <span className="text-xl">{cat.emoji}</span>
                      <p className="text-sm font-medium mt-1">{cat.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground">
                ¿Dónde está ubicado?
              </h1>
              <p className="text-muted-foreground mt-2">
                Selecciona tu país para personalizar la experiencia
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {COUNTRIES.map((country) => (
                <button
                  key={country.value}
                  onClick={() =>
                    setFormData({ ...formData, country: country.value })
                  }
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    formData.country === country.value
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <span className="text-2xl">{country.flag}</span>
                  <p className="text-sm font-medium mt-1">{country.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground">
                Datos adicionales
              </h1>
              <p className="text-muted-foreground mt-2">
                Opcional, pero útil para UCEO
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="address" className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4" />
                  Dirección
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Ej: Av. Principal 123"
                  className="bg-card"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4" />
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Ej: +54 11 1234-5678"
                  className="bg-card"
                />
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-6">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">¡Casi listo!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Podrás agregar más detalles después desde Configuración.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 pb-8">
        {step < totalSteps ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="w-full gradient-primary"
            size="lg"
          >
            Continuar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full gradient-primary"
            size="lg"
          >
            {loading ? "Creando..." : "Crear negocio"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
