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
    if (modeParam === "login") return "Bienvenido de vuelta";
    if (modeParam === "signup") return "Empezá ahora";
    if (hasLoggedInBefore) return "Bienvenido de vuelta";
    return "Empezá ahora";
  }, [modeParam, hasLoggedInBefore]);

  const subtitle = useMemo(() => {
    return isLogin
      ? "Ingresá para continuar."
      : "Tu CEO digital con IA, en minutos.";
  }, [isLogin]);

  // Testimonios reales (rotación)
  const testimonials = useMemo(
    () => [
      {
        quote:
          "En tres semanas pasé de tomar decisiones por intuición a entender exactamente qué mover cada día.",
        name: "Lucía Fernández",
        role: "Dueña, Café Almacén · Buenos Aires",
      },
      {
        quote:
          "Detectó una fuga de margen en delivery que no veía hacía meses. Lo arreglamos en una semana.",
        name: "Martín Rivas",
        role: "Socio, Restaurante Roble · Córdoba",
      },
      {
        quote:
          "Es como tener un director de operaciones disponible a cualquier hora. Claro, breve y al punto.",
        name: "Camila Ortega",
        role: "Fundadora, Estudio Norte · Montevideo",
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
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email o contraseña incorrectos");
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success("¡Bienvenido de vuelta!");
      } else {
        const { error, requiresEmailConfirmation } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Este email ya está registrado");
          } else {
            toast.error(error.message);
          }
          return;
        }
        await sendWelcomeEmail(email, fullName, 'email');
        if (requiresEmailConfirmation) {
          toast.success("¡Cuenta creada! Revisá tu email para confirmarla e ingresar.");
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
      toast.error("Algo salió mal. Intentá de nuevo.");
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

      <div className="min-h-screen w-full bg-white text-[#0a0a0a] flex flex-col">
        {/* Subtle ambient gradient */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, rgba(38,146,220,0.05), transparent 60%), radial-gradient(40% 40% at 100% 100%, rgba(116,108,230,0.04), transparent 70%)",
          }}
        />

        {/* Top bar */}
        <header className="relative z-10 w-full px-6 sm:px-8 py-5 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center group">
            <VistaceoLogo size={isMobile ? 96 : 110} variant="full" />
          </Link>
          <Link
            to="/"
            className="text-[13px] text-[#666] hover:text-[#0a0a0a] transition-colors"
          >
            ← Volver al inicio
          </Link>
        </header>

        {/* Centered card */}
        <main className="relative z-10 flex-1 flex items-center justify-center px-5 sm:px-6 pb-16">
          <div className="w-full max-w-[420px]">
            {/* Heading */}
            <div className="text-center mb-8">
              <h1 className="text-[clamp(1.75rem,4vw,2.25rem)] font-semibold tracking-[-0.02em] text-[#0a0a0a] leading-[1.15]">
                {welcomeMessage}
              </h1>
              <p className="mt-3 text-[15px] text-[#777] leading-relaxed">
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
              className="w-full h-12 rounded-[12px] border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-[14.5px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-[18px] h-[18px] mr-2.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {isLogin ? "Continuar con Google" : "Continuar con Google"}
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
                  {showEmailForm ? "ocultar email" : "o continuar con email"}
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
                          toast.error("Ingresá tu email primero");
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
                {isLogin ? "¿No tenés cuenta? " : "¿Ya tenés cuenta? "}
                <span className="font-medium text-[#0a0a0a]">
                  {isLogin ? "Empezá gratis" : "Iniciar sesión"}
                </span>
              </button>
            </div>

            {/* Terms */}
            <p className="mt-8 text-[11.5px] text-[#aaa] text-center leading-relaxed">
              Al continuar aceptás nuestras{" "}
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
      </div>
    </>
  );
};

export default Auth;
