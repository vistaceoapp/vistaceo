import { useEffect, useRef, useState, memo } from "react";
import { TrendingUp, Star, AlertTriangle, Users, Activity, Sparkles, Target } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   HeroOrb — Executive Glass Orb
   Premium "object" hero scene. Single RAF loop, IO-paused.
   ═══════════════════════════════════════════════════════════════ */

type Signal = {
  id: string;
  angle: number;       // initial angle in radians
  speed: number;       // radians per ms
  rx: number;          // ellipse x radius (% of container)
  ry: number;          // ellipse y radius (% of container)
  tilt: number;        // ellipse tilt in radians
  size: number;        // px
  tint: string;        // rgba accent
  icon: React.ComponentType<{ className?: string }>;
};

const SIGNALS: Signal[] = [
  { id: "ventas",      angle: 0.0, speed: 0.00018, rx: 38, ry: 16, tilt: -0.18, size: 12, tint: "rgba(38,146,220,0.85)",  icon: TrendingUp },
  { id: "reseña",      angle: 1.1, speed: 0.00022, rx: 34, ry: 22, tilt:  0.10, size: 11, tint: "rgba(255,176,32,0.85)",  icon: Star },
  { id: "riesgo",      angle: 2.4, speed: 0.00016, rx: 41, ry: 14, tilt:  0.22, size: 12, tint: "rgba(232,90,90,0.80)",   icon: AlertTriangle },
  { id: "competencia", angle: 3.6, speed: 0.00020, rx: 36, ry: 20, tilt: -0.08, size: 11, tint: "rgba(116,108,230,0.85)", icon: Users },
  { id: "tendencia",   angle: 4.8, speed: 0.00019, rx: 39, ry: 17, tilt:  0.32, size: 12, tint: "rgba(40,200,140,0.80)",  icon: Activity },
  { id: "oportunidad", angle: 5.7, speed: 0.00024, rx: 33, ry: 23, tilt: -0.28, size: 11, tint: "rgba(38,146,220,0.85)",  icon: Sparkles },
];

const OUTPUT_CARDS = [
  {
    label: "Oportunidad",
    title: "Pico de demanda · jueves 20–22h",
    detail: "Activá promo flash en delivery",
    accent: "#2692DC",
    icon: Sparkles,
  },
  {
    label: "Insight nuevo",
    title: "Reseñas mencionan postres",
    detail: "Destacalos en tu menú",
    accent: "#746CE6",
    icon: Star,
  },
  {
    label: "Predicción",
    title: "+12% facturación · 7 días",
    detail: "Si mantenés el ritmo actual",
    accent: "#2692DC",
    icon: Target,
  },
];

const HeroOrb = memo(() => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const orbitRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>();
  const startRef = useRef<number>(performance.now());
  const visibleRef = useRef<boolean>(true);
  const reducedMotion = useRef<boolean>(false);
  const [activeCard, setActiveCard] = useState(0);

  // Detect reduced motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = mq.matches;
    const onChange = () => { reducedMotion.current = mq.matches; };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // IntersectionObserver — pause when offscreen
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
    }, { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Single RAF loop — orbit positions
  useEffect(() => {
    const tick = (now: number) => {
      if (visibleRef.current && !reducedMotion.current) {
        const t = now - startRef.current;
        for (let i = 0; i < SIGNALS.length; i++) {
          const s = SIGNALS[i];
          const a = s.angle + s.speed * t;
          // Ellipse with tilt
          const x = s.rx * Math.cos(a);
          const y = s.ry * Math.sin(a);
          const cosT = Math.cos(s.tilt), sinT = Math.sin(s.tilt);
          const px = x * cosT - y * sinT;
          const py = x * sinT + y * cosT;
          // Depth illusion: nearer to viewer when sin > 0
          const depth = (Math.sin(a) + 1) / 2; // 0..1
          const scale = 0.78 + depth * 0.5;
          const opacity = 0.45 + depth * 0.55;
          const node = orbitRefs.current[i];
          if (node) {
            node.style.transform = `translate3d(calc(${px}% - 50%), calc(${py}% - 50%), 0) scale(${scale.toFixed(3)})`;
            node.style.opacity = opacity.toFixed(3);
            node.style.zIndex = depth > 0.5 ? "5" : "1";
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Rotate output cards every 4.5s
  useEffect(() => {
    const id = setInterval(() => {
      setActiveCard((c) => (c + 1) % OUTPUT_CARDS.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const card = OUTPUT_CARDS[activeCard];
  const CardIcon = card.icon;

  return (
    <div
      ref={wrapRef}
      className="relative w-full h-full min-h-[360px] lg:min-h-[520px] flex items-center justify-center select-none"
      aria-hidden="true"
    >
      {/* Ambient halo — soft radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 48%, rgba(116,108,230,0.16) 0%, rgba(38,146,220,0.10) 28%, transparent 62%)",
        }}
      />

      {/* Contact shadow under the orb */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-[18%] w-[55%] h-[36px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(20,30,80,0.18) 0%, rgba(20,30,80,0.06) 40%, transparent 75%)",
          filter: "blur(8px)",
        }}
      />

      {/* Orbit container (the % refs) */}
      <div className="relative w-[78%] aspect-square max-w-[460px]">
        {/* Soft outer glow ring */}
        <div
          className="absolute inset-[-14%] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0) 55%, rgba(38,146,220,0.10) 68%, rgba(116,108,230,0.10) 78%, transparent 90%)",
          }}
        />

        {/* Iridescent slow-rotating ring — conic + radial mask */}
        <div
          className="absolute inset-[6%] rounded-full pointer-events-none orb-ring"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(38,146,220,0.0) 0%, rgba(38,146,220,0.45) 18%, rgba(116,108,230,0.55) 38%, rgba(255,255,255,0.85) 50%, rgba(116,108,230,0.55) 62%, rgba(38,146,220,0.45) 82%, rgba(38,146,220,0.0) 100%)",
            WebkitMask:
              "radial-gradient(circle, transparent 62%, #000 64%, #000 70%, transparent 73%)",
            mask:
              "radial-gradient(circle, transparent 62%, #000 64%, #000 70%, transparent 73%)",
            opacity: 0.55,
          }}
        />

        {/* Glass core */}
        <div className="absolute inset-[14%] rounded-full orb-core">
          {/* Base glass sphere */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 32% 30%, #ffffff 0%, #f6f8ff 28%, #e9ecf7 62%, #d8def0 100%)",
              boxShadow:
                "inset 0 -22px 40px rgba(80,90,160,0.18), inset 0 18px 30px rgba(255,255,255,0.95), 0 30px 60px -20px rgba(80,90,160,0.35), 0 8px 16px -8px rgba(80,90,160,0.25)",
            }}
          />
          {/* Specular highlight */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: "8%",
              left: "16%",
              width: "44%",
              height: "30%",
              background:
                "radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 40%, transparent 70%)",
              filter: "blur(2px)",
            }}
          />
          {/* Subtle bottom rim light */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 70% 85%, rgba(116,108,230,0.35) 0%, transparent 35%)",
            }}
          />
          {/* Core mark — V monogram */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/favicon.png"
              alt=""
              className="w-[34%] h-[34%] object-contain opacity-90"
              style={{ filter: "drop-shadow(0 2px 6px rgba(80,90,160,0.25))" }}
            />
          </div>
        </div>

        {/* Orbiting signals */}
        {SIGNALS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              ref={(el) => (orbitRefs.current[i] = el)}
              className="absolute left-1/2 top-1/2 hidden lg:flex items-center justify-center rounded-full will-change-transform"
              style={{
                width: s.size,
                height: s.size,
                background: s.tint,
                boxShadow: `0 0 0 3px rgba(255,255,255,0.7), 0 0 14px ${s.tint}, 0 4px 10px rgba(40,50,100,0.18)`,
              }}
            >
              <Icon className="w-[7px] h-[7px] text-white/90" strokeWidth={2.6} />
            </div>
          );
        })}

        {/* Mobile: only 3 signals, visible/static positions */}
        {SIGNALS.slice(0, 3).map((s, i) => {
          const positions = [
            { left: "8%",  top: "18%" },
            { left: "82%", top: "32%" },
            { left: "20%", top: "78%" },
          ];
          return (
            <div
              key={`m-${s.id}`}
              className="absolute lg:hidden flex items-center justify-center rounded-full"
              style={{
                ...positions[i],
                width: s.size,
                height: s.size,
                background: s.tint,
                boxShadow: `0 0 0 3px rgba(255,255,255,0.7), 0 0 12px ${s.tint}`,
              }}
            />
          );
        })}
      </div>

      {/* Output micro-cards — rotating */}
      <div className="absolute top-[10%] right-[2%] lg:right-[4%] w-[210px] lg:w-[230px] pointer-events-none">
        <div key={activeCard} className="orb-card-enter">
          <GlassCard accent={card.accent} icon={<CardIcon className="w-3.5 h-3.5" />} label={card.label} title={card.title} detail={card.detail} />
        </div>
      </div>

      {/* Secondary card on desktop only */}
      <div className="hidden lg:block absolute bottom-[14%] left-[2%] w-[220px] pointer-events-none">
        <div key={`b-${activeCard}`} className="orb-card-enter" style={{ animationDelay: "350ms" }}>
          <GlassCard
            accent={OUTPUT_CARDS[(activeCard + 1) % OUTPUT_CARDS.length].accent}
            icon={(() => {
              const Ic = OUTPUT_CARDS[(activeCard + 1) % OUTPUT_CARDS.length].icon;
              return <Ic className="w-3.5 h-3.5" />;
            })()}
            label={OUTPUT_CARDS[(activeCard + 1) % OUTPUT_CARDS.length].label}
            title={OUTPUT_CARDS[(activeCard + 1) % OUTPUT_CARDS.length].title}
            detail={OUTPUT_CARDS[(activeCard + 1) % OUTPUT_CARDS.length].detail}
          />
        </div>
      </div>

      {/* Local styles */}
      <style>{`
        .orb-core { animation: orbBreath 6s ease-in-out infinite; }
        .orb-ring { animation: orbSpin 40s linear infinite; }
        @keyframes orbBreath {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.022); }
        }
        @keyframes orbSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .orb-card-enter {
          animation: cardIn 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes cardIn {
          0%   { opacity: 0; transform: translateY(8px) scale(0.98); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0)   scale(1);    filter: blur(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .orb-core, .orb-ring { animation: none; }
        }
      `}</style>
    </div>
  );
});

HeroOrb.displayName = "HeroOrb";

/* ── Glass micro-card ── */
const GlassCard = ({
  accent, icon, label, title, detail,
}: { accent: string; icon: React.ReactNode; label: string; title: string; detail: string }) => (
  <div
    className="rounded-2xl p-3.5 border"
    style={{
      background: "rgba(255,255,255,0.72)",
      backdropFilter: "blur(20px) saturate(140%)",
      WebkitBackdropFilter: "blur(20px) saturate(140%)",
      borderColor: "rgba(255,255,255,0.85)",
      boxShadow:
        "0 1px 0 rgba(255,255,255,0.9) inset, 0 0 0 1px rgba(20,30,80,0.04), 0 18px 40px -16px rgba(40,50,100,0.28), 0 6px 14px -8px rgba(40,50,100,0.18)",
    }}
  >
    <div className="flex items-start gap-2.5">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}14`, color: accent }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: accent }}>
          {label}
        </span>
        <p className="text-[12px] font-semibold text-[#1a1a1a] leading-snug mt-0.5">{title}</p>
        <p className="text-[10.5px] text-[#7a7a7a] leading-[1.45] mt-0.5">{detail}</p>
      </div>
    </div>
  </div>
);

export default HeroOrb;
