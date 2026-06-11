import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Target, Compass, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/contexts/BusinessContext";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useBrain } from "@/hooks/use-brain";
import { getHealthStyle } from "@/lib/health-score-utils";
import { useSanitizedContent } from "@/hooks/use-sanitized-content";
import { cn } from "@/lib/utils";
import { SectorSignatureStrip } from "./SectorSignatureStrip";

const DIMENSION_LABELS: Record<string, string> = {
  reputation: "reputación",
  profitability: "rentabilidad",
  finances: "finanzas",
  efficiency: "eficiencia operativa",
  traffic: "captación de clientes",
  team: "equipo",
  growth: "crecimiento",
};

const FOCUS_LABELS: Record<string, string> = {
  ventas: "aumentar ventas",
  marketing: "atraer más clientes",
  reputacion: "mejorar reputación",
  eficiencia: "optimizar operación",
  equipo: "fortalecer al equipo",
  producto: "potenciar producto",
  costos: "mejorar rentabilidad",
  expansion: "abrir nuevos canales",
};

interface DashboardHeroProps {
  isMobile?: boolean;
}

/**
 * Hero ejecutivo del Dashboard.
 * - Identidad visual actual (glass premium, gradient sutil)
 * - Chips clickeables con destinos reales
 * - CTAs: acción del día (Misiones) + oportunidades (Radar) + CEO/IA (Chat)
 */
export const DashboardHero = ({ isMobile = false }: DashboardHeroProps) => {
  const navigate = useNavigate();
  const { currentBusiness } = useBusiness();
  const { data } = useDashboardData();
  const { brain } = useBrain();

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  const score = data.snapshotScore;
  const healthStyle = getHealthStyle(score);
  const certainty = data.certaintyPct || 31;
  const delta = score !== null && data.previousScore !== null ? score - data.previousScore : null;

  // Texto humano: sin números crudos. Frases cortas, cálidas, con 1 emoji sutil.
  const visionLine = useMemo(() => {
    const name = currentBusiness?.name ?? "tu negocio";

    // Helpers de tono humano
    const stateToPhrase = (s: number): { level: string; verb: string } => {
      if (s >= 86) return { level: "excelente", verb: "está volando" };
      if (s >= 71) return { level: "sólida", verb: "viene firme" };
      if (s >= 51) return { level: "correcta", verb: "tiene margen para crecer" };
      if (s >= 31) return { level: "floja", verb: "necesita atención" };
      return { level: "muy baja", verb: "pide acción urgente" };
    };
    const dimToHuman = (key: string, score: number): string => {
      const noun = DIMENSION_LABELS[key] || key;
      const { level } = stateToPhrase(score);
      return `tu ${noun} está ${level}`;
    };

    // Dimensión más débil/fuerte
    const dims = Object.entries(data.subScores)
      .filter(([, v]) => typeof v === "number") as [string, number][];
    const sorted = [...dims].sort((a, b) => a[1] - b[1]);
    const weakest = sorted[0];
    const strongest = sorted[sorted.length - 1];

    const focusKey = brain?.current_focus || "";
    const focusLabel = FOCUS_LABELS[focusKey] || "";

    // CASO 1: sin datos todavía → directo y cálido
    if (score === null) {
      return `${name}, todavía no tengo diagnóstico tuyo 👋 Completá 3 datos clave y en 2 minutos te muestro dónde estás dejando plata sobre la mesa.`;
    }

    // CASO 2: certeza muy baja → pedir info concreta
    if (certainty < 35) {
      return `Aún te conozco poco, ${name} 🤝 Contame cómo vendés hoy, quién es tu cliente y qué te frena. Con eso te doy una jugada real para esta semana.`;
    }

    // CASO 3: hay palanca clara y débil → ir directo a ella sin números
    if (weakest && weakest[1] < 50) {
      const weakPhrase = dimToHuman(weakest[0], weakest[1]);
      const fortaleza = strongest && strongest[1] >= 65 && strongest[0] !== weakest[0]
        ? ` Tu ${DIMENSION_LABELS[strongest[0]] || strongest[0]} es la palanca para empujar.`
        : "";
      return `${name}, hoy ${weakPhrase} y es lo que más te frena ⚡ Si lo trabajamos esta semana, vas a sentir un salto real.${fortaleza}`;
    }

    // CASO 4: salud alta → empujar crecimiento
    if (score >= 70) {
      const next = focusLabel ? ` Próximo paso: ${focusLabel}.` : ` Es momento de escalar lo que ya funciona.`;
      return `${name} ${stateToPhrase(score).verb} 🚀 Acá no se trata de arreglar, se trata de crecer.${next}`;
    }

    // CASO 5: zona media → palanca + acción concreta
    const palanca = weakest
      ? `Hoy conviene atacar ${DIMENSION_LABELS[weakest[0]] || weakest[0]}`
      : focusLabel
      ? `Tu foco esta semana es ${focusLabel}`
      : `Falta empujar captación y conversión`;
    return `${name} ${stateToPhrase(score).verb} ✨ ${palanca} para mover la aguja rápido.`;
  }, [currentBusiness, score, data.subScores, brain, certainty]);

  const safeVisionLine = useSanitizedContent(visionLine, 'prose') || visionLine;


  const scrollToWidget = (id: string) => {
    const el = document.getElementById(`widget-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("ring-2", "ring-primary/40", "rounded-3xl");
      setTimeout(() => el.classList.remove("ring-2", "ring-primary/40", "rounded-3xl"), 2200);
    } else {
      // Si el widget no está visible, llevar a la página con hash para que TodayPage lo monte y haga scroll
      navigate(`/app#${id}`);
    }
  };

  const chips = [
    {
      key: "certainty",
      label: `Certeza ${certainty}%`,
      icon: Sparkles,
      onClick: () => scrollToWidget("brain"),
    },
    {
      key: "opps",
      label: "3 oportunidades iniciales",
      icon: Compass,
      onClick: () => navigate("/app/radar?tab=oportunidades"),
    },
    {
      key: "mission",
      label: "Misión recomendada",
      icon: Target,
      onClick: () => navigate("/app/missions"),
    },
    ...(score !== null
      ? [
          {
            key: "health",
            label: `Salud ${healthStyle.label.toLowerCase()}`,
            icon: Activity,
            onClick: () => navigate("/app/analytics?tab=diagnostico"),
          },
        ]
      : []),
  ];

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/40",
        "bg-gradient-to-br from-card via-card to-card/60",
        "shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.18)]",
        "animate-fade-in",
        isMobile ? "p-5" : "p-7"
      )}
    >
      {/* Orbs decorativos */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--gradient-primary, linear-gradient(135deg,#2692DC,#746CE6))" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-20 w-64 h-64 rounded-full opacity-15 blur-3xl bg-accent"
      />

      <div className="relative">
        {/* Saludo + Salud pill */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80 font-medium mb-1.5">
              Centro de inteligencia
            </p>
            <h1
              className={cn(
                "font-bold tracking-tight text-foreground leading-tight",
                isMobile ? "text-[26px]" : "text-4xl"
              )}
            >
              {greeting}
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {currentBusiness?.name ?? "tu negocio"}
              </span>
            </h1>
          </div>

          {score !== null && (
            <button
              type="button"
              onClick={() => navigate("/app/analytics?tab=diagnostico")}
              className={cn(
                "shrink-0 flex flex-col items-center justify-center rounded-2xl px-4 py-3 border transition-all hover:scale-[1.03] active:scale-95 min-w-[120px]",
                healthStyle.bgColor,
                healthStyle.borderColor
              )}
              aria-label="Ver salud del negocio en Analíticas"
            >
              <span className={cn("text-[10px] uppercase tracking-wider font-semibold mb-1 text-muted-foreground")}>
                Salud
              </span>
              <span className={cn("text-base font-semibold leading-none text-center", healthStyle.textColor)}>
                {healthStyle.label}
              </span>
              {delta !== null && delta !== 0 && (
                <span
                  className={cn(
                    "text-[10px] mt-1.5 font-medium",
                    delta > 0 ? "text-emerald-500" : "text-rose-500"
                  )}
                >
                  {delta > 0 ? "↑ mejorando" : "↓ bajando"}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Vision line */}
        <p
          className={cn(
            "text-foreground/85 leading-relaxed mb-4",
            isMobile ? "text-[15px]" : "text-lg"
          )}
        >
          {safeVisionLine}
        </p>

        {/* Contexto sectorial por daypart */}
        <SectorSignatureStrip className="mb-5" />


        {/* Chips clickeables — destinos reales */}
        <div
          className={cn(
            "flex gap-2 mb-6",
            isMobile ? "overflow-x-auto -mx-1 px-1 pb-1 [&::-webkit-scrollbar]:hidden" : "flex-wrap"
          )}
        >
          {chips.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.key}
                type="button"
                onClick={c.onClick}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 text-xs font-medium",
                  "px-3 py-1.5 rounded-full border border-border/60",
                  "bg-muted/40 hover:bg-primary/10 hover:border-primary/30 hover:text-primary",
                  "transition-all"
                )}
              >
                <Icon className="w-3 h-3" />
                {c.label}
              </button>
            );
          })}
        </div>

        {/* CTAs */}
        <div className={cn("flex gap-2.5", isMobile ? "flex-col" : "flex-row items-center")}>
          <Button
            size={isMobile ? "default" : "lg"}
            onClick={() => navigate("/app/missions")}
            className={cn(
              "group relative overflow-hidden",
              "bg-gradient-to-r from-primary to-accent text-primary-foreground",
              "hover:shadow-[0_10px_30px_-8px_hsl(var(--primary)/0.55)]",
              "transition-all duration-300",
              !isMobile && "min-w-[200px]"
            )}
          >
            <Target className="w-4 h-4 mr-2" />
            Ver acción de hoy
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700"
            />
          </Button>
          <Button
            size={isMobile ? "default" : "lg"}
            variant="outline"
            onClick={() => navigate("/app/radar?tab=oportunidades")}
            className="border-border/60 hover:bg-muted/50"
          >
            <Compass className="w-4 h-4 mr-1.5" />
            Ver oportunidades
          </Button>
        </div>
      </div>
    </section>
  );
};
