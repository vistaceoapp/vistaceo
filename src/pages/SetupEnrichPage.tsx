import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { BrainLearningCard } from "@/components/setup/BrainLearningCard";
import { resolveVoice, applyVisibleVoice } from "@/lib/brain-core";
import { toast } from "sonner";

const SetupEnrichPage = () => {
  const navigate = useNavigate();
  const { currentBusiness } = useBusiness();
  const voice = useMemo(() => resolveVoice(currentBusiness?.country), [currentBusiness?.country]);
  const t = (s: string) => applyVisibleVoice(s, voice);

  const [about, setAbout] = useState("");
  const [goals, setGoals] = useState("");
  const [pains, setPains] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [learned, setLearned] = useState<{ summary: string; facts: any[] }>({ summary: "", facts: [] });

  // Precisión visual derivada de cuánto escribió
  const precision = useMemo(() => {
    const total = about.length + goals.length + pains.length;
    if (total < 20) return 8;
    if (learned.facts.length > 0) return Math.min(95, 35 + learned.facts.length * 8);
    return Math.min(60, 12 + Math.floor(total / 10));
  }, [about, goals, pains, learned.facts.length]);

  // Auto-aprender 1.2s después de dejar de escribir si hay >40 chars
  useEffect(() => {
    const total = about.trim() + goals.trim() + pains.trim();
    if (!currentBusiness?.id || total.length < 40) return;
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
    if (!currentBusiness?.id) { goNext(); return; }
    const total = about.trim() + goals.trim() + pains.trim();
    if (total.length < 20) { goNext(); return; }
    setLoading(true);
    try {
      // Asegurar última extracción
      await supabase.functions.invoke("enrich-brain-from-text", {
        body: {
          businessId: currentBusiness.id,
          source: "setup_enrich",
          about, goals, pains,
          countryCode: currentBusiness.country,
        },
      });
      toast.success(t("Listo, tu CEO ya tiene contexto extra"));
    } catch {
      // no bloqueamos
    } finally {
      setLoading(false);
      goNext();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <VistaceoLogo size={32} variant="wordmark" />
          <button
            type="button"
            onClick={goNext}
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition"
          >
            <SkipForward className="w-3.5 h-3.5" />
            {t("Saltar por ahora")}
          </button>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 sm:mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              {t("Hyper-personalización")}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-3 leading-tight">
            {t("Antes de armar tu dashboard, contanos un poco más")}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t(
              "Cuanto más nos cuentes, más precisas serán las misiones, el radar y las decisiones que te sugiera tu CEO. Si es un servicio, una profesión o un negocio físico, contanos cómo funciona y qué buscás. No hay respuestas correctas — todo suma.",
            )}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Form */}
          <div className="space-y-6">
            <FieldBlock
              label={t("¿Qué hacés exactamente?")}
              hint={t(
                "Contanos en tus palabras: qué vendés o ofrecés, cómo cobrás, quién es tu cliente típico. Si tenés varias líneas, mencionalas.",
              )}
              placeholder={t(
                "Ej: Tengo una consultoría de marketing digital para pymes gastronómicas en Buenos Aires. Cobro por proyecto, ticket promedio 800 USD. Mis clientes son dueños de restaurantes de barrio que quieren crecer en delivery.",
              )}
              value={about}
              onChange={setAbout}
            />
            <FieldBlock
              label={t("¿Qué querés lograr en los próximos 90 días?")}
              hint={t("Sé concreto: facturación, clientes, lanzamiento, contratación. Lo que sea importante para vos.")}
              placeholder={t(
                "Ej: Sumar 8 clientes nuevos y llegar a 12k USD de facturación mensual. Cerrar el contrato con una franquicia.",
              )}
              value={goals}
              onChange={setGoals}
            />
            <FieldBlock
              label={t("¿Qué te frena o te preocupa hoy?")}
              hint={t("El problema real, no el ideal. Si hay algo que no te deja dormir, contalo acá.")}
              placeholder={t(
                "Ej: No tengo un proceso de venta claro, dependo del boca a boca. Me cuesta cobrar más caro porque el mercado está peleando precio.",
              )}
              value={pains}
              onChange={setPains}
            />

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 h-14 text-base font-semibold gap-2 group"
              >
                {loading ? t("Aprendiendo…") : t("Listo, preparar mi dashboard")}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center sm:text-left">
              {t(
                "Todo lo que escribas se guarda solo para vos y mejora las decisiones de tu CEO. Podés sumar más contexto cuando quieras desde Ajustes.",
              )}
            </p>
          </div>

          {/* Sticky brain feedback */}
          <div className="lg:sticky lg:top-6 self-start">
            <BrainLearningCard
              isThinking={thinking}
              summary={learned.summary}
              facts={learned.facts}
              precision={precision}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function FieldBlock({
  label, hint, placeholder, value, onChange,
}: {
  label: string; hint: string; placeholder: string;
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      <p className="text-xs text-muted-foreground">{hint}</p>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="resize-y min-h-[110px] text-sm"
      />
      <div className="text-[11px] text-muted-foreground/70 text-right">
        {value.length} {value.length === 1 ? "carácter" : "caracteres"}
      </div>
    </div>
  );
}

export default SetupEnrichPage;
