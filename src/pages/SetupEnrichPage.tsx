import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, SkipForward, Plus, ShieldCheck, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { BrainLearningCard } from "@/components/setup/BrainLearningCard";
import { resolveVoice, applyVisibleVoice } from "@/lib/brain-core";
import { toast } from "sonner";

/**
 * Builds a hyper-personalized opening question based on the business profile.
 * Adapted to category and country tone (voseo/tuteo handled later by applyVisibleVoice).
 */
function buildPersonalQuestion(b?: { name?: string; category?: string; country?: string } | null) {
  const name = (b?.name || "").trim();
  const cat = (b?.category || "").toLowerCase();
  const greeting = name && name.toLowerCase() !== "mi negocio" ? name : "tu negocio";

  // Category-aware framing
  if (/gastro|restaur|bar|cafe|pizza|food/.test(cat))
    return `Contanos un poco más sobre ${greeting}: ¿qué tipo de cocina, qué hace única tu propuesta y quién es tu cliente fiel?`;
  if (/inmob|real ?estate|propiedad|remax/.test(cat))
    return `¿En qué zona opera ${greeting}, qué tipo de propiedades manejás y cuál es tu cliente ideal hoy?`;
  if (/consult|agencia|marketing|servicio|profesion/.test(cat))
    return `¿Qué servicio ofrecés exactamente en ${greeting}, cómo cobrás y qué tipo de cliente buscás atraer?`;
  if (/retail|tienda|comercio|shop|venta/.test(cat))
    return `¿Qué vendés en ${greeting}, por qué canales (local, online, marketplace) y quién es tu comprador típico?`;
  if (/salud|clinica|consult|psicol|nutric|medic/.test(cat))
    return `Contanos sobre ${greeting}: ¿qué especialidad, cómo trabajás (presencial/online) y qué paciente buscás?`;
  if (/gym|fitness|deport|entren/.test(cat))
    return `¿Qué tipo de entrenamiento ofrecés en ${greeting}, qué planes manejás y a qué tipo de alumno apuntás?`;
  if (/educacion|escuela|curso|academ/.test(cat))
    return `¿Qué enseñás en ${greeting}, cuál es la modalidad y qué resultado buscan tus alumnos?`;
  if (/tech|software|saas|app|dev/.test(cat))
    return `¿Qué resuelve ${greeting}, a qué tipo de empresa apuntás y cómo monetizás hoy?`;

  return `Contanos un poco más sobre ${greeting}: a qué te dedicás exactamente, cómo cobrás y quién es tu cliente ideal.`;
}

const SetupEnrichPage = () => {
  const navigate = useNavigate();
  const { currentBusiness } = useBusiness();
  const voice = useMemo(() => resolveVoice(currentBusiness?.country), [currentBusiness?.country]);
  const t = (s: string) => applyVisibleVoice(s, voice);

  const heroQuestion = useMemo(() => t(buildPersonalQuestion(currentBusiness)), [currentBusiness, voice]);

  const [about, setAbout] = useState("");
  const [goals, setGoals] = useState("");
  const [pains, setPains] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [learned, setLearned] = useState<{ summary: string; facts: any[] }>({ summary: "", facts: [] });

  const totalChars = about.length + goals.length + pains.length;

  // Precision: base 25% (setup completed). Each field adds up to ~25%, capped 95%.
  const precision = useMemo(() => {
    const base = 25;
    const aboutBoost = Math.min(25, Math.floor(about.length / 8));
    const goalsBoost = Math.min(20, Math.floor(goals.length / 8));
    const painsBoost = Math.min(20, Math.floor(pains.length / 8));
    const factsBoost = Math.min(15, learned.facts.length * 3);
    return Math.min(95, base + aboutBoost + goalsBoost + painsBoost + factsBoost);
  }, [about, goals, pains, learned.facts.length]);

  const precisionDelta = Math.max(0, precision - 25);

  // Auto-learn after pause
  useEffect(() => {
    if (!currentBusiness?.id || totalChars < 40) return;
    const timer = setTimeout(async () => {
      setThinking(true);
      try {
        const { data, error } = await supabase.functions.invoke("enrich-brain-from-text", {
          body: {
            businessId: currentBusiness.id,
            source: "setup_enrich",
            about, goals, pains,
            countryCode: currentBusiness.country,
          },
        });
        if (!error && data?.ok) {
          setLearned({ summary: data.summary || "", facts: data.learned || [] });
        }
      } finally {
        setThinking(false);
      }
    }, 1400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [about, goals, pains, currentBusiness?.id]);

  const goNext = () => navigate("/app/preparing", { replace: true });

  const handleSubmit = async () => {
    if (!currentBusiness?.id || totalChars < 20) { goNext(); return; }
    setLoading(true);
    try {
      await supabase.functions.invoke("enrich-brain-from-text", {
        body: {
          businessId: currentBusiness.id,
          source: "setup_enrich",
          about, goals, pains,
          countryCode: currentBusiness.country,
        },
      });
      toast.success(t("Listo, tu CEO ya tiene contexto extra"));
    } catch { /* no bloqueamos */ }
    finally {
      setLoading(false);
      goNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/[0.03]">
      {/* Top bar */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/70 border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <VistaceoLogo size={28} variant="full" />
          <button
            type="button"
            onClick={goNext}
            className="text-xs sm:text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition px-3 py-1.5 rounded-full hover:bg-muted/60"
          >
            <SkipForward className="w-3.5 h-3.5" />
            {t("Saltar por ahora")}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-32 sm:pb-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
              {t("Un paso más, opcional")}
            </span>
          </div>
          <h1 className="text-[26px] sm:text-4xl font-bold text-foreground mb-3 leading-[1.15] tracking-tight">
            {t("¿Querés contarnos algo más sobre tu negocio?")}
          </h1>
          <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
            {t(
              "Cuanto más sepa tu CEO desde el inicio, más certeras serán las primeras misiones y el radar. No te preocupes si te quedan cosas: iremos aprendiendo juntos día a día hasta que el brain conozca tu negocio a fondo.",
            )}
          </p>
        </motion.div>

        {/* Precision meter — protagonista */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] to-accent/[0.04] p-4 sm:p-5 mb-6"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{t("Certeza inicial de tu CEO")}</p>
                <p className="text-[11px] text-muted-foreground">
                  {precisionDelta > 0
                    ? t(`+${precisionDelta}% gracias a lo que ya escribiste`)
                    : t("Sumá contexto para subir la certeza")}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary leading-none tabular-nums">{Math.round(precision)}%</div>
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${precision}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Hero question */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border/60 bg-card p-4 sm:p-6 shadow-sm mb-4"
        >
          <Label className="text-[15px] sm:text-base font-semibold text-foreground leading-snug block mb-1">
            {heroQuestion}
          </Label>
          <p className="text-xs text-muted-foreground mb-3">
            {t("Escribilo como se lo contarías a un socio. Cuanto más natural, mejor.")}
          </p>
          <Textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder={t("Empezá acá… cualquier detalle suma (ubicación, ticket promedio, qué te hace distinto).")}
            rows={5}
            className="resize-y min-h-[130px] text-[15px] leading-relaxed border-border/60 focus-visible:ring-primary/40"
            autoFocus
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-muted-foreground/70 inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {t("Privado. Solo lo usa tu CEO.")}
            </span>
            <span className="text-[11px] text-muted-foreground/70 tabular-nums">{about.length}</span>
          </div>
        </motion.div>

        {/* Live brain feedback (mobile + desktop, inline) */}
        <AnimatePresence>
          {(thinking || learned.summary || learned.facts.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 overflow-hidden"
            >
              <BrainLearningCard
                isThinking={thinking}
                summary={learned.summary}
                facts={learned.facts}
                precision={precision}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Optional expansion */}
        {!showMore ? (
          <button
            type="button"
            onClick={() => setShowMore(true)}
            className="w-full text-sm text-primary font-medium inline-flex items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed border-primary/30 hover:bg-primary/[0.04] transition mb-4"
          >
            <Plus className="w-4 h-4" />
            {t("Sumar objetivo a 90 días y qué te frena (opcional, +30% certeza)")}
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mb-4"
          >
            <SecondaryField
              label={t("¿Qué querés lograr en los próximos 90 días?")}
              placeholder={t("Ej: sumar 8 clientes y llegar a 12k USD/mes.")}
              value={goals}
              onChange={setGoals}
            />
            <SecondaryField
              label={t("¿Qué te frena hoy?")}
              placeholder={t("Ej: dependo del boca a boca y me cuesta cobrar más caro.")}
              value={pains}
              onChange={setPains}
            />
          </motion.div>
        )}

        {/* Reassurance */}
        <p className="text-xs text-muted-foreground text-center leading-relaxed mt-2 mb-6 px-2">
          {t(
            "Tranqui, no necesitás contarlo todo ahora. Tu CEO va a seguir preguntando y aprendiendo en cada misión, chat y radar — hasta entender tu negocio mejor que nadie.",
          )}
        </p>
      </main>

      {/* Sticky CTA mobile + desktop */}
      <div className="fixed bottom-0 inset-x-0 z-20 border-t border-border/40 bg-background/85 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={goNext}
            className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground px-3 py-2"
          >
            {t("Saltar")}
          </button>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 h-12 sm:h-13 text-[15px] font-semibold gap-2 group"
          >
            {loading
              ? t("Aprendiendo…")
              : totalChars < 20
                ? t("Preparar mi dashboard")
                : t("Listo, preparar mi dashboard")}
            <ArrowRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

function SecondaryField({
  label, placeholder, value, onChange,
}: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <Label className="text-sm font-semibold text-foreground block mb-2">{label}</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="resize-y min-h-[88px] text-sm border-border/60 focus-visible:ring-primary/40"
      />
    </div>
  );
}

export default SetupEnrichPage;
