import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { safeLocalStorage } from "@/lib/safe-storage";
import { buildAgentProfile } from "@/lib/agent-profile";
import { BriefcaseBusiness, MapPin, MessagesSquare, Pencil, ShieldCheck, Sparkles, Check } from "lucide-react";

/**
 * Ficha de Contratación del Empleado Digital.
 * El sistema propone rol, tono y habilidades según sector + país.
 * La persona solo elige (o cambia) el nombre y lo pone a trabajar.
 */
const AgentHiringPage = () => {
  const navigate = useNavigate();
  const { currentBusiness, refreshBusinesses } = useBusiness();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const setupHint = useMemo(() => {
    try {
      const raw = safeLocalStorage.getItem("setupProgress");
      if (!raw) return { label: "", city: "" };
      const parsed = JSON.parse(raw);
      return {
        label: parsed?.data?.businessTypeLabel || "",
        city: parsed?.data?.city || "",
      };
    } catch {
      return { label: "", city: "" };
    }
  }, []);

  const profile = useMemo(
    () =>
      buildAgentProfile({
        category: currentBusiness?.category,
        country: currentBusiness?.country,
        businessTypeLabel: setupHint.label,
        city: setupHint.city,
      }),
    [currentBusiness?.category, currentBusiness?.country, setupHint.label, setupHint.city],
  );

  useEffect(() => {
    const settings = (currentBusiness?.settings as Record<string, unknown> | null) ?? {};
    const saved = (settings.agent as { name?: string } | undefined)?.name;
    setName(saved || profile.suggestedNames[0]);
  }, [currentBusiness?.settings, profile.suggestedNames]);

  const handleHire = async () => {
    const finalName = (name || profile.suggestedNames[0]).trim().slice(0, 24);
    setSaving(true);
    try {
      if (currentBusiness?.id) {
        const settings = (currentBusiness.settings as Record<string, unknown> | null) ?? {};
        await supabase
          .from("businesses")
          .update({
            settings: {
              ...settings,
              agent: {
                name: finalName,
                role: profile.role,
                mission: profile.mission,
                tone: profile.tone,
                hired_at: new Date().toISOString(),
              },
            },
          })
          .eq("id", currentBusiness.id);
        await refreshBusinesses();
      }
      safeLocalStorage.setItem("vc_agent_name", finalName);
    } catch {
      /* si falla el guardado, igual seguimos: el nombre queda local */
    } finally {
      setSaving(false);
      navigate("/setup/enrich", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[520px] h-[520px] bg-primary/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[420px] h-[420px] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="flex justify-center mb-6">
          <VistaceoLogo className="h-7" />
        </div>

        <div className="rounded-2xl border border-border bg-card/90 backdrop-blur-xl shadow-xl overflow-hidden">
          <div className="px-6 sm:px-8 py-6 border-b border-border">
            <Badge variant="secondary" className="mb-3 gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Ficha de contratación
            </Badge>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
              Tu empleado digital ya está listo para empezar
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Preparado a medida de tu actividad y de tu mercado. Ponele el nombre que quieras.
            </p>
          </div>

          {/* Nombre */}
          <div className="px-6 sm:px-8 py-6 border-b border-border">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Nombre</p>
            {editing ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  autoFocus
                  value={name}
                  maxLength={24}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Escribí el nombre"
                  className="text-lg font-semibold"
                />
                <Button variant="secondary" onClick={() => setEditing(false)}>
                  <Check className="w-4 h-4 mr-1.5" /> Listo
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="group flex items-center gap-2 text-2xl font-semibold tracking-tight"
              >
                {name || profile.suggestedNames[0]}
                <Pencil className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              {profile.suggestedNames.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setName(n)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    name === n
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Rol / lugar / tono */}
          <div className="px-6 sm:px-8 py-6 border-b border-border grid gap-4 sm:grid-cols-3">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1">
                <BriefcaseBusiness className="w-3.5 h-3.5" /> Puesto
              </div>
              <p className="text-sm font-medium leading-snug">{profile.role}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1">
                <MapPin className="w-3.5 h-3.5" /> Trabaja para
              </div>
              <p className="text-sm font-medium leading-snug">{profile.locationLine}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1">
                <MessagesSquare className="w-3.5 h-3.5" /> Trato
              </div>
              <p className="text-sm font-medium leading-snug">{profile.tone}</p>
            </div>
          </div>

          {/* Habilidades */}
          <div className="px-6 sm:px-8 py-6">
            <p className="text-sm font-medium mb-1">De qué se va a ocupar</p>
            <p className="text-xs text-muted-foreground mb-4">{profile.mission}</p>
            <ul className="space-y-3">
              {profile.skills.map((s, i) => (
                <motion.li
                  key={s.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i }}
                  className="flex gap-3"
                >
                  <div className="mt-0.5 shrink-0 w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[11px] font-semibold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-snug">{s.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{s.detail}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="px-6 sm:px-8 py-5 border-t border-border bg-muted/30">
            <div className="flex items-start gap-2 text-xs text-muted-foreground mb-4">
              <ShieldCheck className="w-4 h-4 shrink-0 text-primary mt-0.5" />
              <span>
                Nunca gasta tu dinero por su cuenta: primero busca la opción gratuita y, si algo tiene costo, te lo
                pregunta antes.
              </span>
            </div>
            <Button size="lg" className="w-full" onClick={handleHire} disabled={saving}>
              {saving ? "Preparando…" : `Contratar a ${(name || profile.suggestedNames[0]).trim()} y ponerlo a trabajar`}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AgentHiringPage;
