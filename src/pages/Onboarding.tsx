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
import { ArrowLeft, ArrowRight, Check, Store, MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type BusinessCategory = Database["public"]["Enums"]["business_category"];
type CountryCode = Database["public"]["Enums"]["country_code"];

const CATEGORIES: { value: BusinessCategory; label: string; emoji: string }[] = [
  { value: "restaurant", label: "Restaurante", emoji: "🍽️" },
  { value: "cafeteria", label: "Cafetería", emoji: "☕" },
  { value: "bar", label: "Bar", emoji: "🍺" },
  { value: "fast_casual", label: "Fast Casual", emoji: "🍔" },
  { value: "heladeria", label: "Heladería", emoji: "🍦" },
  { value: "panaderia", label: "Panadería", emoji: "🥐" },
  { value: "dark_kitchen", label: "Dark Kitchen", emoji: "👨‍🍳" },
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

const Onboarding = () => {
  const navigate = useNavigate();
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
      const { error } = await supabase.from("businesses").insert({
        name: formData.name.trim(),
        category: formData.category as BusinessCategory,
        country: formData.country as CountryCode,
        address: formData.address.trim() || null,
        phone: formData.phone.trim() || null,
        owner_id: user.id,
      });

      if (error) throw error;

      // Mark onboarding as completed
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);

      await refreshBusinesses();

      toast({
        title: "¡Negocio creado!",
        description: "Ya puedes empezar a usar UCEO",
      });

      navigate("/app/today");
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
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        {step === 1 && (
          <div className="space-y-6">
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
          <div className="space-y-6">
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
          <div className="space-y-6">
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
            className="w-full"
            size="lg"
          >
            Continuar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
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
