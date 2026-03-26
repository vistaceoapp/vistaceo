import { useState, useEffect, useRef, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, Menu, X, Check, Target, Sparkles, Shield, Brain, Lock, Clock, Users, CheckCircle2, Globe, Mail, Search, BarChart3, Eye, Radar as RadarIcon, Heart, MessageCircle } from "lucide-react";
import { SiteHead } from "@/components/seo/SiteHead";
import { cn } from "@/lib/utils";
import { useRealtimeCounter } from "@/hooks/use-realtime-counter";
import { motion, AnimatePresence } from "framer-motion";

// Real product screenshots
import dashboardImg from "@/assets/screenshots/dashboard-hero.png";
import missionsImg from "@/assets/screenshots/missions-hero.png";
import radarImg from "@/assets/screenshots/radar-hero.png";

/* ═══════════════════════════════════════════════════════════════
   VISTACEO Landing — Ultra-Premium v4 (Real Screenshots)
   ═══════════════════════════════════════════════════════════════ */

const ACCENT_GRADIENT = "linear-gradient(135deg, #2692DC, #746CE6)";
const ACCENT_GRADIENT_SUBTLE = "linear-gradient(135deg, rgba(38,146,220,0.08), rgba(116,108,230,0.08))";

/* ── Scroll Reveal ── */
const Reveal = memo(({ children, className, delay = 0, distance = 40 }: { 
  children: React.ReactNode; className?: string; delay?: number; distance?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { 
      if (e.isIntersecting) { setTimeout(() => setVisible(true), delay); obs.disconnect(); } 
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={cn("transition-all ease-out", className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${distance}px)`,
        transitionDuration: "800ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >{children}</div>
  );
});
Reveal.displayName = "Reveal";

const AccentLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10.5px] uppercase tracking-[0.22em] font-semibold"
    style={{ backgroundImage: ACCENT_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
    {children}
  </span>
);

/* ═══════════ 1. Header ═══════════ */
const NAV_LINKS = [
  { label: "Producto", href: "#producto" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Precios", href: "#precios" },
  { label: "Blog", href: "https://blog.vistaceo.com", external: true },
  { label: "Preguntas frecuentes", href: "#faq" },
];

const Header = memo(() => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("http")) { window.open(href, "_blank"); return; }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      scrolled ? "bg-white/92 backdrop-blur-2xl shadow-[0_1px_0_rgba(0,0,0,0.04)]" : "bg-transparent"
    )}>
      <div className="max-w-[1200px] mx-auto px-6 h-[68px] flex items-center">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <img src="/favicon.png" alt="" className="w-7 h-7 object-contain" />
          <span className="text-[15px] font-semibold tracking-[0.14em] text-[#111]">VISTACEO</span>
        </div>
        <div className="hidden md:block w-px h-5 bg-[#e5e5e5] ml-5" />

        <nav className="hidden md:flex items-center gap-10 ml-10">
          {NAV_LINKS.map(link => (
            <button key={link.label} onClick={() => scrollTo(link.href)}
              className="text-[13.5px] text-[#888] hover:text-[#111] transition-colors duration-300 relative group bg-transparent border-none cursor-pointer">
              {link.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#111] transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2.5 ml-auto">
          <button onClick={() => navigate("/auth")}
            className="text-[13.5px] text-[#666] hover:text-[#111] transition-colors duration-300 px-4 py-2 rounded-lg hover:bg-[#f8f8f8]">
            Ingresar
          </button>
          <button onClick={() => navigate("/auth?mode=signup")}
            className="text-[13.5px] text-white px-5 py-2.5 rounded-[10px] font-medium transition-all duration-300 flex items-center gap-1.5 hover:shadow-[0_4px_12px_rgba(38,146,220,0.25)] active:scale-[0.98]"
            style={{ background: ACCENT_GRADIENT }}>
            Empezar gratis <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <button className="md:hidden ml-auto p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className={cn("md:hidden overflow-hidden transition-all duration-500 bg-white/98 backdrop-blur-2xl border-t border-[#f5f5f5]",
        mobileOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-6 py-5 space-y-1">
          {NAV_LINKS.map(item => (
            <button key={item.label} onClick={() => scrollTo(item.href)} className="block w-full text-left text-[15px] text-[#444] py-3 border-b border-[#f5f5f5] last:border-0 bg-transparent">
              {item.label}
            </button>
          ))}
          <div className="pt-4 flex flex-col gap-2.5">
            <button onClick={() => { navigate("/auth"); setMobileOpen(false); }} className="text-[15px] text-[#666] py-2.5 text-left bg-transparent">Ingresar</button>
            <button onClick={() => { navigate("/auth?mode=signup"); setMobileOpen(false); }} 
              className="text-[15px] text-white px-5 py-3.5 rounded-xl font-medium w-full"
              style={{ background: ACCENT_GRADIENT }}>
              Empezar gratis
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});
Header.displayName = "Header";

/* ═══════════ 2. Hero — Visual-first, minimal text ═══════════ */
const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-28 pb-6 lg:pt-36 lg:pb-16 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(165deg, rgba(38,146,220,0.03) 0%, rgba(255,255,255,1) 50%, rgba(116,108,230,0.02) 100%)"
      }} />

      <div className="relative z-10 max-w-[1100px] mx-auto text-center">
        <Reveal distance={25}>
          <AccentLabel>INTELIGENCIA EJECUTIVA</AccentLabel>
        </Reveal>

        <Reveal delay={60} distance={25}>
          <h1 className="text-[clamp(2.4rem,5.5vw,3.8rem)] font-semibold text-[#0a0a0a] leading-[1.06] tracking-[-0.035em] mt-6 max-w-[720px] mx-auto">
            Decidí mejor cada día con{" "}
            <span style={{ backgroundImage: ACCENT_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              inteligencia real.
            </span>
          </h1>
        </Reveal>

        <Reveal delay={120} distance={20}>
          <p className="text-[16px] text-[#999] mt-6 max-w-[440px] mx-auto leading-[1.7]">
            VISTACEO analiza tu negocio, detecta prioridades y genera acciones concretas.
          </p>
        </Reveal>

        <Reveal delay={180} distance={15}>
          <div className="flex items-center justify-center gap-3 mt-8">
            <button onClick={() => navigate("/auth?mode=signup")}
              className="text-white px-8 py-3.5 rounded-[12px] text-[14px] font-medium transition-all duration-300 flex items-center gap-2 hover:shadow-[0_8px_24px_rgba(38,146,220,0.2)] active:scale-[0.98] hover:-translate-y-0.5"
              style={{ background: ACCENT_GRADIENT }}>
              Empezar gratis <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[12px] text-[#ccc] mt-4 flex items-center justify-center gap-3">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Sin tarjeta</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Activo en minutos</span>
          </p>
        </Reveal>

        {/* REAL dashboard screenshot */}
        <Reveal delay={250} distance={50}>
          <div className="mt-14 max-w-[960px] mx-auto">
            <img
              src={dashboardImg}
              alt="Dashboard principal de VISTACEO — vista real de la plataforma"
              className="w-full rounded-2xl shadow-[0_32px_80px_-16px_rgba(0,0,0,0.12)]"
              loading="eager"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ═══════════ 3. Trust Strip ═══════════ */
const TrustStrip = () => {
  const counter = useRealtimeCounter();
  return (
    <section className="py-12 px-6 bg-white border-y border-[#f5f5f5]">
      <div className="max-w-[900px] mx-auto">
        <Reveal>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
            <div className="flex items-center gap-2 text-[13px] text-[#999]">
              <Users className="w-4 h-4" style={{ color: "#2692DC" }} />
              <span><span className="font-bold text-[#111] text-[15px] tabular-nums">{counter}</span> negocios activos</span>
            </div>
            <div className="hidden sm:block w-px h-5 bg-[#eee]" />
            <div className="flex items-center gap-2 text-[13px] text-[#999]">
              <Globe className="w-4 h-4" style={{ color: "#746CE6" }} />
              <span>LATAM y España</span>
            </div>
            <div className="hidden sm:block w-px h-5 bg-[#eee]" />
            <div className="flex items-center gap-2 text-[13px] text-[#999]">
              <Shield className="w-4 h-4" style={{ color: "#2692DC" }} />
              <span>Datos encriptados</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ═══════════ 4. Smart Finder con IA ═══════════ */
const SUPPORTED_COUNTRIES = [
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "DO", name: "Rep. Dominicana", flag: "🇩🇴" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "ES", name: "España", flag: "🇪🇸" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "HN", name: "Honduras", flag: "🇭🇳" },
  { code: "MX", name: "México", flag: "🇲🇽" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮" },
  { code: "PA", name: "Panamá", flag: "🇵🇦" },
  { code: "PE", name: "Perú", flag: "🇵🇪" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
];

const QUICK_CHIPS = ["Restaurante", "Clínica", "Agencia", "Freelancer", "E-commerce", "Consultorio", "Gimnasio", "Startup"];

const SmartFinder = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("AR");
  const [countryOpen, setCountryOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    businessType: string;
    suggestions: string[];
    insight: string;
    metric: string;
    metricLabel: string;
  } | null>(null);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const data = await res.json();
          const cc = data.country_code;
          if (cc && SUPPORTED_COUNTRIES.some(c => c.code === cc)) setCountry(cc);
        }
      } catch { /* fallback AR */ }
    })();
  }, []);

  const fetchInsight = useCallback(async (q: string, cc: string) => {
    if (!q.trim() || q.trim().length < 2) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/landing-insight`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ query: q.trim(), country: cc }),
      });
      if (res.status === 429) { setError("Demasiadas consultas. Intentá en unos segundos."); return; }
      if (!res.ok) throw new Error();
      setResult(await res.json());
    } catch { setError("No pudimos procesar tu consulta."); }
    finally { setLoading(false); }
  }, []);

  const handleSubmit = (q?: string) => {
    const input = q || query;
    if (input.trim().length >= 2) fetchInsight(input, country);
  };

  const handleInput = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length >= 3) debounceRef.current = setTimeout(() => fetchInsight(val, country), 800);
  };

  const selectedCountry = SUPPORTED_COUNTRIES.find(c => c.code === country)!;

  return (
    <section id="finder" className="py-20 lg:py-24 px-6 bg-[#fafafa]">
      <div className="max-w-[640px] mx-auto">
        <Reveal>
          <div className="text-center mb-8">
            <AccentLabel>PROBALO AHORA</AccentLabel>
            <h2 className="text-[clamp(1.5rem,3.2vw,2.2rem)] font-semibold text-[#0a0a0a] tracking-[-0.03em] mt-5">
              ¿Qué tipo de negocio tenés?
            </h2>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div className="flex gap-2 mb-5">
            <div className="relative">
              <button onClick={() => setCountryOpen(!countryOpen)}
                className="flex items-center gap-1.5 px-3 py-3.5 rounded-xl border border-[#e5e5e5] bg-white text-[13px] hover:border-[#ddd] transition-all min-w-[72px] justify-center">
                <span className="text-base">{selectedCountry.flag}</span>
                <ChevronDown className={cn("w-3 h-3 text-[#ccc] transition-transform", countryOpen && "rotate-180")} />
              </button>
              {countryOpen && (
                <div className="absolute top-full mt-1 left-0 bg-white border border-[#eee] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.1)] z-50 max-h-[280px] overflow-y-auto w-[200px]">
                  {SUPPORTED_COUNTRIES.map(c => (
                    <button key={c.code} onClick={() => { setCountry(c.code); setCountryOpen(false); if (result) fetchInsight(query, c.code); }}
                      className={cn("flex items-center gap-2.5 w-full px-3 py-2.5 text-[12.5px] text-left hover:bg-[#f8f8f8]",
                        country === c.code ? "bg-[#f5f5f5] font-medium text-[#111]" : "text-[#666]")}>
                      <span>{c.flag}</span> {c.name}
                      {country === c.code && <Check className="w-3 h-3 ml-auto" style={{ color: "#2692DC" }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ccc]" />
              <input type="text" value={query}
                onChange={(e) => handleInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Ej: panadería, estudio contable, barbería..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#e5e5e5] bg-white text-[14px] text-[#222] placeholder:text-[#ccc] focus:outline-none focus:border-[#2692DC] focus:shadow-[0_0_0_3px_rgba(38,146,220,0.08)] transition-all" />
            </div>
            <button onClick={() => handleSubmit()} disabled={loading || query.trim().length < 2}
              className="px-5 py-3.5 rounded-xl text-white text-[13px] font-medium transition-all disabled:opacity-40 hover:shadow-[0_4px_12px_rgba(38,146,220,0.2)] active:scale-[0.97] flex-shrink-0"
              style={{ background: ACCENT_GRADIENT }}>
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {QUICK_CHIPS.map(p => (
              <button key={p} onClick={() => { setQuery(p); handleSubmit(p); }}
                className="px-3.5 py-1.5 rounded-full text-[12px] font-medium border bg-white text-[#888] border-[#eee] hover:border-[#ddd] hover:text-[#555] transition-all">
                {p}
              </button>
            ))}
          </div>
        </Reveal>

        {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-[13px] text-red-400 mb-4">{error}</motion.p>}

        {loading && !result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-[#eee] bg-white p-8 text-center">
            <div className="w-8 h-8 border-2 border-[#eee] border-t-[#2692DC] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[13px] text-[#aaa]">Analizando tu sector...</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {result && result.suggestions && result.suggestions.length > 0 && (
            <motion.div key="sug" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl border border-[#eee] bg-white p-6 mb-4">
              <p className="text-[13px] text-[#999] mb-3">¿Te referís a alguno de estos?</p>
              <div className="flex flex-wrap gap-2">
                {result.suggestions.map((s: string) => (
                  <button key={s} onClick={() => { setQuery(s); fetchInsight(s, country); }}
                    className="px-4 py-2 rounded-lg border border-[#eee] text-[13px] text-[#555] hover:border-[#2692DC] hover:text-[#2692DC] transition-all bg-[#fafafa]">
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {result && result.insight && (
            <motion.div key={result.businessType} initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
              <div className="rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_16px_48px_-12px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="px-6 py-5 border-b border-[#f2f2f2]" style={{ background: ACCENT_GRADIENT_SUBTLE }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: ACCENT_GRADIENT }}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#111]">VISTACEO para {result.businessType}</p>
                      <p className="text-[11.5px] text-[#aaa]">{selectedCountry.flag} {selectedCountry.name}</p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0 md:w-[130px] text-center md:text-left">
                      <p className="text-[32px] font-bold tracking-tight"
                        style={{ backgroundImage: ACCENT_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        {result.metric}
                      </p>
                      <p className="text-[11.5px] text-[#bbb] mt-1 leading-snug">{result.metricLabel}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[14.5px] text-[#444] leading-[1.75]">{result.insight}</p>
                      <button onClick={() => navigate("/auth?mode=signup")}
                        className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-[13px] font-medium transition-all hover:shadow-[0_4px_12px_rgba(38,146,220,0.2)] active:scale-[0.98]"
                        style={{ background: ACCENT_GRADIENT }}>
                        Empezar gratis <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

/* ═══════════ 5. Producto — Screenshots reales ═══════════ */
const productScreens = [
  { key: "dashboard", label: "Dashboard", icon: Heart, img: dashboardImg, desc: "Salud integral de tu negocio en un vistazo." },
  { key: "misiones", label: "Misiones", icon: Target, img: missionsImg, desc: "Acciones concretas con pasos y deadlines." },
  { key: "radar", label: "Radar", icon: RadarIcon, img: radarImg, desc: "Oportunidades y riesgos detectados por IA." },
] as const;

const ProductShowcase = () => {
  const [active, setActive] = useState(0);

  return (
    <section id="producto" className="py-24 lg:py-32 px-6 bg-white">
      <div className="max-w-[1000px] mx-auto">
        <Reveal>
          <div className="text-center mb-12">
            <AccentLabel>PRODUCTO</AccentLabel>
            <h2 className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-semibold text-[#0a0a0a] tracking-[-0.025em] mt-5">
              Todo lo que necesitás, en un solo lugar
            </h2>
          </div>
        </Reveal>

        {/* Tabs */}
        <Reveal delay={80}>
          <div className="flex items-center justify-center gap-2 mb-10">
            {productScreens.map((s, i) => {
              const Icon = s.icon;
              return (
                <button key={s.key} onClick={() => setActive(i)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300",
                    active === i ? "text-white shadow-[0_4px_12px_rgba(38,146,220,0.2)]" : "bg-[#f5f5f5] text-[#888] hover:bg-[#eee]"
                  )}
                  style={active === i ? { background: ACCENT_GRADIENT } : undefined}>
                  <Icon className="w-4 h-4" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Screenshot */}
        <Reveal delay={120}>
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <img
                src={productScreens[active].img}
                alt={`VISTACEO ${productScreens[active].label}`}
                className="w-full max-w-[900px] mx-auto rounded-2xl shadow-[0_24px_64px_-16px_rgba(0,0,0,0.1)]"
              />
              <p className="text-[14px] text-[#999] mt-6">{productScreens[active].desc}</p>
            </motion.div>
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
};

/* ═══════════ 6. Cómo funciona ═══════════ */
const HowItWorks = () => {
  const steps = [
    { num: "01", title: "Contale tu negocio", icon: Brain },
    { num: "02", title: "Detectamos prioridades", icon: RadarIcon },
    { num: "03", title: "Accionás con claridad", icon: Target },
  ];

  return (
    <section id="como-funciona" className="py-24 lg:py-28 px-6 bg-[#fafafa]">
      <div className="max-w-[800px] mx-auto">
        <Reveal>
          <div className="text-center mb-14">
            <AccentLabel>CÓMO FUNCIONA</AccentLabel>
            <h2 className="text-[clamp(1.5rem,3.2vw,2.2rem)] font-semibold text-[#0a0a0a] tracking-[-0.025em] mt-5">
              Tres pasos. Sin fricción.
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <Reveal key={s.num} delay={i * 80}>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-5"
                  style={{ background: ACCENT_GRADIENT_SUBTLE }}>
                  <s.icon className="w-6 h-6" style={{ color: "#2692DC" }} />
                </div>
                <p className="text-[11px] font-bold tracking-[0.15em] mb-2"
                  style={{ backgroundImage: ACCENT_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {s.num}
                </p>
                <h3 className="text-[15px] font-semibold text-[#111]">{s.title}</h3>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════ 7. Funcionalidades — grid compacto ═══════════ */
const FeaturesGrid = () => {
  const features = [
    { icon: Sparkles, title: "Briefing diario", color: "#2692DC" },
    { icon: Target, title: "Misiones accionables", color: "#746CE6" },
    { icon: RadarIcon, title: "Radar de oportunidades", color: "#2692DC" },
    { icon: BarChart3, title: "Analíticas inteligentes", color: "#746CE6" },
    { icon: Brain, title: "Predicciones", color: "#2692DC" },
    { icon: Shield, title: "Seguridad empresarial", color: "#746CE6" },
  ];

  return (
    <section className="py-24 lg:py-28 px-6 bg-white">
      <div className="max-w-[900px] mx-auto">
        <Reveal>
          <div className="text-center mb-14">
            <AccentLabel>FUNCIONALIDADES</AccentLabel>
            <h2 className="text-[clamp(1.5rem,3.2vw,2.2rem)] font-semibold text-[#0a0a0a] tracking-[-0.025em] mt-5">
              Cada día sabés qué importa
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 50}>
              <div className="rounded-2xl border border-[#eee] bg-[#fafafa] p-6 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-400 text-center group cursor-default">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${f.color}10` }}>
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="text-[13.5px] font-semibold text-[#111]">{f.title}</h3>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════ 8. Diferenciación ═══════════ */
const Differentiation = () => {
  const items = [
    { vs: "IA genérica", fix: "VISTACEO aprende tu operación y contexto real." },
    { vs: "Herramientas dispersas", fix: "Todo centralizado: métricas, acciones y resultados." },
    { vs: "Intuición pura", fix: "Análisis continuo con recomendaciones respaldadas." },
  ];

  return (
    <section className="py-24 lg:py-28 px-6 bg-[#fafafa]">
      <div className="max-w-[760px] mx-auto">
        <Reveal>
          <div className="text-center mb-12">
            <AccentLabel>POR QUÉ VISTACEO</AccentLabel>
            <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-semibold text-[#0a0a0a] tracking-[-0.02em] mt-5">
              No es un chatbot. No es un dashboard genérico.
            </h2>
          </div>
        </Reveal>

        <div className="space-y-3">
          {items.map((c, i) => (
            <Reveal key={c.vs} delay={i * 60}>
              <div className="rounded-xl border border-[#eee] bg-white p-6 flex items-start gap-4">
                <p className="text-[11px] font-bold text-[#ccc] uppercase tracking-[0.08em] w-[100px] flex-shrink-0 pt-0.5">vs. {c.vs}</p>
                <div className="flex gap-2.5 items-start">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#2692DC" }} />
                  <p className="text-[13.5px] text-[#333] leading-[1.6] font-medium">{c.fix}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════ 9. Comparativa ═══════════ */
const CompetitorSection = () => {
  const rows = [
    { feature: "Análisis por industria", vistaceo: true, generic: false, sheets: false, consultant: "partial" as const },
    { feature: "Misiones diarias", vistaceo: true, generic: false, sheets: false, consultant: false },
    { feature: "Radar de oportunidades", vistaceo: true, generic: false, sheets: false, consultant: "partial" as const },
    { feature: "Predicciones", vistaceo: true, generic: false, sheets: false, consultant: false },
    { feature: "Briefing ejecutivo", vistaceo: true, generic: false, sheets: false, consultant: false },
    { feature: "Aprende en tiempo real", vistaceo: true, generic: false, sheets: false, consultant: "partial" as const },
    { feature: "Costo accesible", vistaceo: true, generic: true, sheets: true, consultant: false },
    { feature: "Disponible 24/7", vistaceo: true, generic: true, sheets: true, consultant: false },
  ];

  const renderCell = (val: boolean | "partial") => {
    if (val === true) return <Check className="w-4 h-4 mx-auto" style={{ color: "#2692DC" }} />;
    if (val === "partial") return <span className="text-[10px] text-[#ccc] block text-center">Parcial</span>;
    return <X className="w-3.5 h-3.5 mx-auto text-[#e0e0e0]" />;
  };

  return (
    <section id="comparativa" className="py-24 lg:py-28 px-6 bg-white">
      <div className="max-w-[860px] mx-auto">
        <Reveal>
          <div className="text-center mb-12">
            <AccentLabel>COMPARATIVA</AccentLabel>
            <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-semibold text-[#0a0a0a] tracking-[-0.02em] mt-5">
              VISTACEO vs. las alternativas
            </h2>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div className="rounded-2xl border border-[#eee] overflow-hidden bg-[#fafafa]">
            <div className="grid grid-cols-5 gap-0 border-b border-[#eee] bg-white">
              <div className="col-span-1 p-4" />
              <div className="p-4 text-center border-l border-[#f0f0f0]">
                <div className="w-5 h-5 rounded-md mx-auto mb-1 flex items-center justify-center" style={{ background: ACCENT_GRADIENT }}>
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <p className="text-[11px] font-bold" style={{ backgroundImage: ACCENT_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>VISTACEO</p>
              </div>
              <div className="p-4 text-center border-l border-[#f0f0f0]"><p className="text-[11px] text-[#bbb]">IA genérica</p></div>
              <div className="p-4 text-center border-l border-[#f0f0f0]"><p className="text-[11px] text-[#bbb]">Planillas</p></div>
              <div className="p-4 text-center border-l border-[#f0f0f0]"><p className="text-[11px] text-[#bbb]">Consultor</p></div>
            </div>
            {rows.map((row, i) => (
              <div key={i} className={cn("grid grid-cols-5 gap-0 border-b border-[#f0f0f0] last:border-0", i % 2 === 0 ? "bg-white" : "bg-[#fafafa]")}>
                <div className="p-3.5"><p className="text-[12px] text-[#555]">{row.feature}</p></div>
                <div className="p-3.5 flex items-center justify-center border-l border-[#f0f0f0]">{renderCell(row.vistaceo)}</div>
                <div className="p-3.5 flex items-center justify-center border-l border-[#f0f0f0]">{renderCell(row.generic)}</div>
                <div className="p-3.5 flex items-center justify-center border-l border-[#f0f0f0]">{renderCell(row.sheets)}</div>
                <div className="p-3.5 flex items-center justify-center border-l border-[#f0f0f0]">{renderCell(row.consultant)}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ═══════════ 10. Precios ═══════════ */
const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section id="precios" className="py-28 lg:py-32 px-6 bg-[#fafafa]">
      <div className="max-w-[780px] mx-auto">
        <Reveal>
          <div className="text-center mb-12">
            <AccentLabel>PRECIOS</AccentLabel>
            <h2 className="text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-[#0a0a0a] tracking-[-0.025em] mt-5">
              Empezá gratis. Crecé cuando quieras.
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Reveal>
            <div className="rounded-2xl border border-[#eee] bg-white p-8 h-full flex flex-col">
              <p className="text-[12px] font-semibold text-[#999] uppercase tracking-[0.12em]">Gratis</p>
              <div className="mt-3 mb-6">
                <span className="text-[36px] font-bold text-[#111]">$0</span>
                <span className="text-[14px] text-[#999] ml-1">/ siempre</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {["Dashboard de salud", "Briefing diario", "Misiones básicas", "Radar de oportunidades"].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-[#666]">
                    <Check className="w-4 h-4 text-[#28c840] flex-shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("/auth?mode=signup")}
                className="w-full py-3.5 rounded-xl text-[14px] font-medium border border-[#ddd] text-[#333] hover:bg-[#f5f5f5] transition-all">
                Empezar gratis
              </button>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="rounded-2xl border-2 p-8 h-full flex flex-col relative overflow-hidden"
              style={{ borderImage: `${ACCENT_GRADIENT} 1` }}>
              <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-[10px] font-bold text-white tracking-wider"
                style={{ background: ACCENT_GRADIENT }}>RECOMENDADO</div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em]"
                style={{ backgroundImage: ACCENT_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Pro</p>
              <div className="mt-3 mb-6">
                <span className="text-[36px] font-bold text-[#111]">$29</span>
                <span className="text-[14px] text-[#999] ml-1">USD / mes</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {["Todo del plan Gratis", "Chat ejecutivo ilimitado", "Misiones avanzadas", "Predicciones a 30 días", "Analíticas profundas", "Soporte prioritario"].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-[#666]">
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#2692DC" }} /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("/auth?mode=signup&plan=pro_monthly")}
                className="w-full py-3.5 rounded-xl text-[14px] font-medium text-white transition-all hover:shadow-[0_8px_24px_rgba(38,146,220,0.25)] active:scale-[0.98]"
                style={{ background: ACCENT_GRADIENT }}>
                Iniciar con Pro
              </button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <p className="text-center text-[12px] text-[#bbb] mt-8">
            Sin compromisos. Cancelá cuando quieras.
          </p>
        </Reveal>
      </div>
    </section>
  );
};

/* ═══════════ 11. Seguridad ═══════════ */
const SecuritySection = () => (
  <section className="py-16 lg:py-20 px-6 bg-white">
    <div className="max-w-[700px] mx-auto">
      <Reveal>
        <div className="rounded-2xl border border-[#eee] bg-[#fafafa] p-8 flex items-start gap-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: ACCENT_GRADIENT_SUBTLE }}>
            <Lock className="w-5 h-5" style={{ color: "#2692DC" }} />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-[#111] mb-2">Seguridad empresarial</h3>
            <p className="text-[13px] text-[#888] leading-[1.7]">
              Encriptación AES-256. Datos aislados por negocio. Sin venta a terceros. Cumplimiento RGPD.
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ═══════════ 12. FAQ ═══════════ */
const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "¿Para qué tipo de negocios sirve?", a: "Para cualquier negocio o servicio profesional. Restaurantes, clínicas, agencias, comercios, freelancers, startups y más." },
    { q: "¿Cómo aprende de mi negocio?", a: "Mediante preguntas inteligentes sobre tu operación. Cuanto más interactuás, más preciso se vuelve." },
    { q: "¿Puedo empezar gratis?", a: "Sí. Sin tarjeta de crédito, sin vencimiento." },
    { q: "¿Puedo cancelar cuando quiera?", a: "Sí. Sin contratos ni permanencia mínima." },
    { q: "¿Mis datos están seguros?", a: "Encriptación de nivel empresarial. Tus datos nunca se comparten con terceros." },
    { q: "¿Qué diferencia a VISTACEO?", a: "Aprende tu negocio, detecta prioridades y genera acciones adaptadas a tu contexto real. No es un chatbot genérico." },
  ];

  return (
    <section id="faq" className="py-24 lg:py-28 px-6 bg-[#fafafa]">
      <div className="max-w-[580px] mx-auto">
        <Reveal>
          <div className="text-center mb-10">
            <AccentLabel>PREGUNTAS FRECUENTES</AccentLabel>
          </div>
        </Reveal>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={i * 30}>
              <div className="rounded-xl border border-[#eee] bg-white overflow-hidden">
                <button onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left bg-transparent hover:bg-[#f8f8f8] transition-colors">
                  <span className="text-[13.5px] font-medium text-[#222] pr-4">{faq.q}</span>
                  <ChevronDown className={cn("w-4 h-4 text-[#ccc] flex-shrink-0 transition-transform duration-300", open === i && "rotate-180")} />
                </button>
                <div className="overflow-hidden transition-all duration-400"
                  style={{ maxHeight: open === i ? "150px" : "0px" }}>
                  <p className="px-5 pb-4 text-[13px] text-[#888] leading-[1.7]">{faq.a}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════ 13. CTA final ═══════════ */
const FinalCTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-28 lg:py-32 px-6 bg-white relative overflow-hidden">
      <Reveal>
        <div className="text-center max-w-[480px] mx-auto">
          <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-semibold text-[#0a0a0a] tracking-[-0.02em] mb-5">
            Tu negocio merece más claridad
          </h2>
          <button onClick={() => navigate("/auth?mode=signup")}
            className="text-white px-10 py-4 rounded-xl text-[14.5px] font-medium transition-all inline-flex items-center gap-2.5 hover:shadow-[0_12px_32px_rgba(38,146,220,0.2)] active:scale-[0.98]"
            style={{ background: ACCENT_GRADIENT }}>
            Empezar gratis <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[12px] text-[#ccc] mt-5 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Sin tarjeta</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Activo en minutos</span>
          </p>
        </div>
      </Reveal>
    </section>
  );
};

/* ═══════════ 14. Footer ═══════════ */
const PremiumFooter = memo(() => {
  const scrollTo = (href: string) => {
    if (href.startsWith("http")) { window.open(href, "_blank"); return; }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer className="border-t border-[#f0f0f0] py-14 px-6 bg-white">
      <div className="max-w-[1000px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/favicon.png" alt="" className="w-5 h-5" />
              <span className="text-[13px] font-semibold tracking-[0.12em] text-[#111]">VISTACEO</span>
            </div>
            <p className="text-[12px] text-[#bbb] leading-[1.7] max-w-[200px]">
              Inteligencia ejecutiva para tu negocio.
            </p>
          </div>
          {[
            { title: "Producto", links: [{ l: "Cómo funciona", h: "#como-funciona" }, { l: "Precios", h: "#precios" }, { l: "Comparativa", h: "#comparativa" }] },
            { title: "Recursos", links: [{ l: "Blog", h: "https://blog.vistaceo.com" }, { l: "Preguntas frecuentes", h: "#faq" }] },
            { title: "Legal", links: [{ l: "Términos", h: "/condiciones" }, { l: "Privacidad", h: "/politicas" }, { l: "Contacto", h: "mailto:info@vistaceo.com" }] },
          ].map(col => (
            <div key={col.title}>
              <p className="text-[11px] font-semibold text-[#999] uppercase tracking-[0.1em] mb-3">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l.l}>
                    {l.h.startsWith("http") || l.h.startsWith("mailto") ? (
                      <a href={l.h} target={l.h.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-[12px] text-[#bbb] hover:text-[#666] transition-colors">{l.l}</a>
                    ) : l.h.startsWith("/") ? (
                      <a href={l.h} className="text-[12px] text-[#bbb] hover:text-[#666] transition-colors">{l.l}</a>
                    ) : (
                      <button onClick={() => scrollTo(l.h)} className="text-[12px] text-[#bbb] hover:text-[#666] transition-colors bg-transparent">{l.l}</button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-[#f5f5f5] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-[#ddd]">© 2025 VISTACEO</span>
          <a href="mailto:info@vistaceo.com" className="text-[11px] text-[#ddd] hover:text-[#999] transition-colors flex items-center gap-1">
            <Mail className="w-3 h-3" /> info@vistaceo.com
          </a>
        </div>
      </div>
    </footer>
  );
});
PremiumFooter.displayName = "PremiumFooter";

/* ═══════════ Main Page ═══════════ */
export default function LandingMinimalista() {
  return (
    <>
      <SiteHead
        title="VISTACEO — Inteligencia ejecutiva para tu negocio"
        description="Centralizá la información de tu negocio, detectá prioridades y recibí acciones concretas cada día. Empezá gratis."
        path="/"
      />
      <div className="min-h-screen bg-white text-[#1a1a1a] antialiased" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>
        <Header />
        <HeroSection />
        <TrustStrip />
        <SmartFinder />
        <ProductShowcase />
        <HowItWorks />
        <FeaturesGrid />
        <Differentiation />
        <CompetitorSection />
        <PricingSection />
        <SecuritySection />
        <FAQSection />
        <FinalCTA />
        <PremiumFooter />
      </div>
    </>
  );
}
