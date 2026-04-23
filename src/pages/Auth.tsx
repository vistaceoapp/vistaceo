import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { SiteHead } from "@/components/seo/SiteHead";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Loader2, Crown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { safeLocalStorage } from "@/lib/safe-storage";
import iconBrand from "@/assets/brand/icon-vistaceo-new.webp";

// Dashboard route constant
const DASHBOARD_ROUTE = "/app";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const modeParam = searchParams.get("mode");

  const hasLoggedInBefore = useMemo(() => {
    return safeLocalStorage.getItem("has_logged_in") === "true";
  }, []);

  const isLogin = useMemo(() => {
    if (modeParam === "signup") return false;
    if (modeParam === "login") return true;
    return hasLoggedInBefore;
  }, [modeParam, hasLoggedInBefore]);

  const welcomeMessage = useMemo(() => {
    if (modeParam === "login") return "Bienvenido de nuevo";
    if (modeParam === "signup") return "Crea tu cuenta";
    if (hasLoggedInBefore) return "Bienvenido de nuevo";
    return "Crea tu cuenta";
  }, [modeParam, hasLoggedInBefore]);

  const subtitle = useMemo(() => {
    return isLogin
      ? "Tu CEO digital te está esperando."
      : "Tu CEO digital con IA, listo en minutos.";
  }, [isLogin]);

  // Testimonios reales — sector · ciudad · país (sin nombres de marca)
  const testimonials = useMemo(
    () => [
      {
        quote:
          "En tres semanas pasé de decidir por intuición a saber exactamente qué mover cada día.",
        name: "Lucía F.",
        role: "Cafetería · Buenos Aires, Argentina",
      },
      {
        quote:
          "Detectó una fuga de margen en delivery que no veía hace meses. Lo arreglamos en una semana.",
        name: "Martín R.",
        role: "Restaurante · Córdoba, Argentina",
      },
      {
        quote:
          "Es como tener un director de operaciones disponible a cualquier hora. Claro, breve y al punto.",
        name: "Camila O.",
        role: "Estudio de diseño · Montevideo, Uruguay",
      },
      {
        quote:
          "Subimos el ticket promedio 14% siguiendo dos misiones puntuales. Sin contratar a nadie.",
        name: "Diego P.",
        role: "Heladería · Santiago, Chile",
      },
      {
        quote:
          "Por fin entiendo mis números sin perderme entre planillas. Decisiones más rápidas y mejores.",
        name: "Sofía M.",
        role: "Boutique de ropa · Ciudad de México, México",
      },
    ],
    []
  );

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setActiveTestimonial((i) => (i + 1) % testimonials.length),
      6000
    );
    return () => clearInterval(id);
  }, [testimonials.length]);

  const planParam = searchParams.get("plan");
  const pendingPlan = planParam === "pro_monthly" || planParam === "pro_yearly" ? planParam : null;

  useEffect(() => {
    if (pendingPlan) {
      safeLocalStorage.setItem("pendingPlan", pendingPlan);
      safeLocalStorage.setItem("pendingPlanTimestamp", Date.now().toString());
    }
  }, [pendingPlan]);

  useEffect(() => {
    if (user) {
      if (pendingPlan) {
        navigate("/checkout", { replace: true });
        return;
      }
      checkUserAndRedirect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pendingPlan]);

  const checkUserAndRedirect = async () => {
    if (!user) return;
    safeLocalStorage.setItem("has_logged_in", "true");
    try {
      const { data: businesses, error } = await supabase
        .from("businesses")
        .select("id, setup_completed, created_at")
        .eq("owner_id", user.id)
        .order("setup_completed", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      const hasCompletedBusiness = (businesses || []).some((b) => b.setup_completed === true);
      navigate(hasCompletedBusiness ? DASHBOARD_ROUTE : "/setup", { replace: true });
    } catch (error) {
      console.error("[Auth] Error resolving redirect:", error);
      navigate("/setup", { replace: true });
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) toast.error(error.message);
    } catch {
      toast.error("Error al conectar con Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const sendWelcomeEmail = async (email: string, fullName: string, authMethod: 'email' | 'google') => {
    try {
      await supabase.functions.invoke('send-welcome-email', {
        body: {
          email,
          fullName: fullName || email.split('@')[0],
          authMethod,
          locale: 'es',
          continueUrl: `${window.location.origin}/setup`,
        },
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          const msg = (error.message || "").toLowerCase();
          if (msg.includes("invalid login credentials")) {
            // Puede ser: contraseña incorrecta O usuario no existe.
            // Damos un mensaje claro y ofrecemos crear cuenta automáticamente.
            toast.error("Email o contraseña incorrectos. Si no tienes cuenta, crea una nueva.", {
              action: {
                label: "Crear cuenta",
                onClick: () => navigate("/auth?mode=signup", { replace: true }),
              },
              duration: 6000,
            });
          } else if (msg.includes("email not confirmed")) {
            toast.error("Confirma tu email antes de iniciar sesión.");
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success("¡Bienvenido de nuevo!");
      } else {
        const { error, requiresEmailConfirmation } = await signUp(email, password, fullName);
        if (error) {
          const msg = (error.message || "").toLowerCase();
          if (msg.includes("already registered") || msg.includes("user already")) {
            // Email ya existe → cambiamos a login automáticamente y avisamos.
            toast.info("Este email ya tiene cuenta. Inicia sesión con tu contraseña.", {
              duration: 5000,
            });
            navigate("/auth?mode=login", { replace: true });
            return;
          }
          if (msg.includes("password") && msg.includes("weak")) {
            toast.error("Tu contraseña es muy débil. Usa al menos 6 caracteres.");
          } else {
            toast.error(error.message);
          }
          return;
        }
        await sendWelcomeEmail(email, fullName, 'email');
        if (requiresEmailConfirmation) {
          toast.success("¡Cuenta creada! Revisa tu email para confirmarla e ingresar.");
          navigate("/auth?mode=login", { replace: true });
          return;
        }
        toast.success("¡Cuenta creada!");
        const storedPlan = safeLocalStorage.getItem("pendingPlan");
        if (storedPlan === "pro_monthly" || storedPlan === "pro_yearly") {
          navigate("/checkout", { replace: true });
        } else {
          navigate("/setup", { replace: true });
        }
      }
    } catch {
      toast.error("Algo salió mal. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SiteHead
        title={isLogin ? "Iniciar Sesión | VISTACEO" : "Crear Cuenta Gratis | VISTACEO"}
        description="Accede a tu CEO digital con IA. Analiza tu negocio, detecta oportunidades y recibe acciones personalizadas cada día."
        path="/auth"
        noindex={true}
      />

      <div className="min-h-screen w-full bg-white text-[#0a0a0a] flex flex-col lg:grid lg:grid-cols-[minmax(0,40fr)_minmax(0,60fr)] xl:grid-cols-[minmax(0,38fr)_minmax(0,62fr)]">
        {/* ============ LEFT — Brand panel (premium · soporte secundario) ============ */}
        <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden text-white p-8 xl:p-10">
          {/* Background — mismo lenguaje visual de la app (azul → violeta marca) */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(140deg, #1a4fa8 0%, #2692DC 35%, #5a5ed8 70%, #746CE6 100%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 50% at 10% 0%, rgba(255,255,255,0.18), transparent 60%), radial-gradient(60% 50% at 100% 100%, rgba(10,16,40,0.35), transparent 60%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />

          {/* Top — logo */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center group">
              <div className="brightness-0 invert">
                <VistaceoLogo size={52} variant="full" />
              </div>
            </Link>
          </div>

          {/* Middle — testimonio rotativo */}
          <div className="relative z-10 max-w-[400px]">
            <div className="flex items-center gap-1 mb-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <svg key={i} viewBox="0 0 20 20" className="w-3 h-3 fill-amber-300">
                  <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78L1.58 7.62l5.82-.85L10 1.5z" />
                </svg>
              ))}
              <span className="ml-2 text-[11.5px] text-white/75">4.9 · +1.200 dueños activos</span>
            </div>

            <blockquote
              key={activeTestimonial}
              className="text-[18px] xl:text-[20px] leading-[1.45] font-medium tracking-[-0.01em] text-white transition-opacity duration-500"
            >
              "{testimonials[activeTestimonial].quote}"
            </blockquote>
            <div className="mt-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold text-[#1a4fa8] bg-white/95">
                {testimonials[activeTestimonial].name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <div className="text-[13.5px] font-medium text-white">
                  {testimonials[activeTestimonial].name}
                </div>
                <div className="text-[12px] text-white/70">
                  {testimonials[activeTestimonial].role}
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="mt-6 flex items-center gap-1.5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Testimonio ${i + 1}`}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-1 rounded-full transition-all ${
                    i === activeTestimonial ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Bottom — capacidades */}
          <div className="relative z-10 grid grid-cols-2 gap-3 max-w-[480px]">
            {[
              { t: "Radar diario", d: "Oportunidades reales con evidencia." },
              { t: "Misiones claras", d: "Qué hacer hoy y cómo medirlo." },
              { t: "Salud del negocio", d: "7 dimensiones, una mirada." },
              { t: "Chat ejecutivo", d: "Decisiones en segundos." },
            ].map((c) => (
              <div
                key={c.t}
                className="rounded-xl border border-white/15 bg-white/[0.08] backdrop-blur-sm p-3.5"
              >
                <div className="text-[13px] font-semibold text-white">{c.t}</div>
                <div className="text-[11.5px] text-white/75 mt-0.5 leading-snug">
                  {c.d}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ============ RIGHT — Form panel ============ */}
        <section className="relative flex flex-col min-h-screen">
          {/* Subtle ambient gradient on right */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 0%, rgba(38,146,220,0.04), transparent 60%)",
            }}
          />

          {/* Top bar (mobile shows logo, desktop shows back link) */}
          <header className="relative z-10 w-full px-6 sm:px-8 py-5 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center group lg:hidden">
              <VistaceoLogo size={isMobile ? 52 : 60} variant="full" />
            </Link>
            <div className="hidden lg:block" />
            <Link
              to="/"
              className="text-[13px] text-[#666] hover:text-[#0a0a0a] transition-colors"
            >
              ← Volver al inicio
            </Link>
          </header>

          {/* Centered form */}
          <main className="relative z-10 flex-1 flex items-center justify-center px-5 sm:px-6 pb-10 pt-4 sm:pt-6">
            <div className="w-full max-w-[420px] mx-auto">
              {/* Heading — protagonismo, jerárquico, sin voseo */}
              <div className="mb-8 sm:mb-9 text-center">
                <div className="flex justify-center mb-7">
                  <img
                    src={iconBrand}
                    alt="VISTACEO"
                    width={110}
                    height={110}
                    className="w-[110px] h-[110px] object-contain drop-shadow-[0_10px_28px_rgba(38,146,220,0.3)]"
                  />
                </div>
                <h1 className="text-[clamp(2.15rem,5vw,2.95rem)] font-semibold tracking-[-0.028em] text-[#0a0a0a] leading-[1.05]">
                  {welcomeMessage}
                </h1>
                <p className="mt-4 text-[16px] sm:text-[17px] text-[#5e5e5e] leading-relaxed max-w-[360px] mx-auto">
                  {subtitle}
                </p>

                {pendingPlan && (
                  <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200">
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-[12px] font-medium text-amber-700">
                      {pendingPlan === "pro_yearly" ? "Pro Anual · 51% off" : "Pro Mensual"}
                    </span>
                  </div>
                )}
              </div>

              {/* Google */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-[50px] rounded-[12px] border-[#e3e3e3] bg-white hover:bg-[#fafafa] hover:border-[#d4d4d4] text-[#0a0a0a] text-[15px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <svg className="w-[19px] h-[19px] mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continuar con Google
                  </>
                )}
              </Button>

              {/* Divider — clickable */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#eee]" />
                </div>
                <div className="relative flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowEmailForm((v) => !v)}
                    className="px-3 bg-white text-[12px] text-[#888] hover:text-[#0a0a0a] transition-colors"
                  >
                    {showEmailForm ? "Ocultar email" : "O continuar con email"}
                  </button>
                </div>
              </div>

              {/* Email form */}
              {showEmailForm && (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {!isLogin && (
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-[12.5px] font-medium text-[#444]">
                        Nombre
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Tu nombre"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-11 rounded-[10px] bg-white border-[#e5e5e5] focus-visible:ring-1 focus-visible:ring-[#2692DC]/30 focus-visible:border-[#2692DC]/50 text-[14px]"
                        required={!isLogin}
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[12.5px] font-medium text-[#444]">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 rounded-[10px] bg-white border-[#e5e5e5] focus-visible:ring-1 focus-visible:ring-[#2692DC]/30 focus-visible:border-[#2692DC]/50 text-[14px]"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-[12.5px] font-medium text-[#444]">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 rounded-[10px] bg-white border-[#e5e5e5] pr-11 focus-visible:ring-1 focus-visible:ring-[#2692DC]/30 focus-visible:border-[#2692DC]/50 text-[14px]"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#333] transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-[12px] text-white text-[14.5px] font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(38,146,220,0.2)] hover:-translate-y-[1px] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                    style={{ background: "linear-gradient(135deg, #2692DC, #746CE6)" }}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {isLogin ? "Ingresar" : "Crear cuenta gratis"}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {isLogin && (
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!email) {
                            toast.error("Ingresa tu email primero");
                            return;
                          }
                          try {
                            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                              redirectTo: `${window.location.origin}/reset-password`,
                            });
                            if (error) throw error;
                            toast.success("Te enviamos un email para restablecer tu contraseña");
                          } catch {
                            toast.error("Error al enviar el email de recuperación");
                          }
                        }}
                        className="text-[12.5px] text-[#888] hover:text-[#0a0a0a] transition-colors"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                  )}
                </form>
              )}

              {/* Toggle login/signup */}
              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => navigate(isLogin ? "/auth?mode=signup" : "/auth?mode=login", { replace: true })}
                  className="text-[13px] text-[#777] hover:text-[#0a0a0a] transition-colors"
                >
                  {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
                  <span className="font-medium text-[#0a0a0a]">
                    {isLogin ? "Crear cuenta gratis" : "Iniciar sesión"}
                  </span>
                </button>
              </div>

              {/* Terms */}
              <p className="mt-8 text-[11.5px] text-[#aaa] text-center leading-relaxed">
                Al continuar aceptas nuestras{" "}
                <Link to="/condiciones" className="text-[#666] hover:text-[#0a0a0a] underline underline-offset-2">
                  Condiciones
                </Link>{" "}
                y la{" "}
                <Link to="/politicas" className="text-[#666] hover:text-[#0a0a0a] underline underline-offset-2">
                  Política de Privacidad
                </Link>
                .
              </p>
            </div>
          </main>
        </section>
      </div>
    </>
  );
};

export default Auth;
