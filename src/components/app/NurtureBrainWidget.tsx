import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Plus, Sparkles, Loader2, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { resolveVoice, applyVisibleVoice } from "@/lib/brain-core";
import { toast } from "sonner";

interface Props {
  source?: "nurture_widget" | "settings";
  defaultOpen?: boolean;
  className?: string;
  compact?: boolean;
}

const SUGGESTIONS = [
  "Cerré un cliente nuevo esta semana, te cuento cómo fue",
  "Cambió algo en mi negocio que deberías saber",
  "Vi una novedad del mercado que me parece importante",
  "Hay un cliente difícil que me está costando",
];

export function NurtureBrainWidget({
  source = "nurture_widget",
  defaultOpen = false,
  className = "",
  compact = false,
}: Props) {
  const { currentBusiness } = useBusiness();
  const voice = useMemo(() => resolveVoice(currentBusiness?.country), [currentBusiness?.country]);
  const t = (s: string) => applyVisibleVoice(s, voice);

  const [open, setOpen] = useState(defaultOpen);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSummary, setLastSummary] = useState<string>("");

  const handleSubmit = async () => {
    if (!currentBusiness?.id || text.trim().length < 10) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("enrich-brain-from-text", {
        body: {
          businessId: currentBusiness.id,
          source,
          freeform: text.trim(),
          countryCode: currentBusiness.country,
        },
      });
      if (error) throw error;
      const summary = (data?.summary || "").trim();
      setLastSummary(summary || t("Tu CEO aprendió algo nuevo"));
      setText("");
      toast.success(t("CEO actualizado"), {
        description: summary ? summary : t("Tu contexto fue agregado al cerebro"),
      });
    } catch (e: any) {
      toast.error(t("No pudimos guardar ahora"), { description: e?.message?.slice(0, 100) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-muted/30 transition"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{t("Nutrí a tu CEO")}</p>
            <p className="text-xs text-muted-foreground truncate">
              {compact
                ? t("Sumá contexto y mejorá las recomendaciones")
                : t("Contale algo nuevo del negocio para que sus decisiones sean más precisas")}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-3">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t(
                  "Ej: Esta semana empezamos a vender por WhatsApp Business y bajó el ticket promedio. Quiero entender si conviene.",
                )}
                rows={3}
                className="resize-y min-h-[90px] text-sm"
              />

              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setText((prev) => (prev ? prev + " " : "") + t(s))}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted hover:bg-muted/70 text-[11px] text-muted-foreground transition"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    {t(s)}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <p className="text-[11px] text-muted-foreground">
                  {text.length < 10
                    ? t("Mínimo 10 caracteres")
                    : t("Tu CEO va a extraer hechos clave de este texto")}
                </p>
                <Button size="sm" onClick={handleSubmit} disabled={loading || text.trim().length < 10} className="gap-1.5">
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {loading ? t("Aprendiendo…") : t("Enseñar a mi CEO")}
                </Button>
              </div>

              {lastSummary && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20"
                >
                  <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-foreground leading-relaxed">{lastSummary}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
