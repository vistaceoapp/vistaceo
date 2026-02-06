import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { SiteHead } from "@/components/seo/SiteHead";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Loader2, ChevronDown, ChevronUp, Shield, Zap, Clock, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// Constants - Dashboard route real del sistema
const DASHBOARD_ROUTE = "/app";
const HAS_LOGGED_IN_KEY = "vistaceo_has_logged_in";

// Dynamic review count: starts at 2961 on 2026-02-06, +3 per week
const useReviewCount = () => {
  return useMemo(() => {
    const startDate = new Date('2026-02-06');
    const now = new Date();
    const weeksDiff = Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return 2961 + Math.max(0, weeksDiff * 3);
  }, []);
};

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const reviewCount = useReviewCount();
  const isMobile = useIsMobile();

  // Mode from URL: login or signup
  const modeParam = searchParams.get("mode");
  
  // Determine if returning user based on: mode param OR localStorage flag
  const isReturningUser = useMemo(() => {
    // Priority 1: Explicit mode param
    if (modeParam === "login") return true;
    if (modeParam === "signup") return false;
    
    // Priority 2: localStorage flag (only set after successful login)
    if (typeof window !== "undefined") {
      return localStorage.getItem(HAS_LOGGED_IN_KEY) === "true";
    }
    
    return false;
  }, [modeParam]);

  // Capture plan intent from URL
  const planParam = searchParams.get("plan");
  const pendingPlan = planParam === "pro_monthly" || planParam === "pro_yearly" ? planParam : null;

  // Store pending plan in localStorage
  useEffect(() => {
    if (pendingPlan) {
      localStorage.setItem("pendingPlan", pendingPlan);
      localStorage.setItem("pendingPlanTimestamp", Date.now().toString());
    }
  }, [pendingPlan]);

  // Check if user already logged in and redirect
  useEffect(() => {
    if (user) {
      // If pending plan, go directly to checkout
      if (pendingPlan) {
        navigate("/checkout", { replace: true });
        return;
      }
      checkUserAndRedirect();
    }
  }, [user, pendingPlan]);

  const checkUserAndRedirect = async () => {
    if (!user) return;
    
    // Check if user has a business with setup completed
    const { data: businesses } = await supabase
      .from("businesses")
      .select("id, setup_completed")
      .eq("owner_id", user.id)
      .limit(1);

    if (businesses && businesses.length > 0 && businesses[0].setup_completed) {
      navigate(DASHBOARD_ROUTE, { replace: true });
    } else {
      navigate("/setup", { replace: true });
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message);
      } else {
        // Mark as has logged in for future visits
        localStorage.setItem(HAS_LOGGED_IN_KEY, "true");
      }
    } catch (err) {
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
      // Determine if login or signup based on form state
      const isLoginAttempt = isReturningUser || showEmailForm;
      
      // Try login first if it looks like returning user
      if (isLoginAttempt && !fullName) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email o contraseña incorrectos");
          } else {
            toast.error(error.message);
          }
          return;
        }
        // Mark as has logged in
        localStorage.setItem(HAS_LOGGED_IN_KEY, "true");
        toast.success("¡Bienvenido de vuelta!");
      } else {
        // Signup flow
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Este email ya está registrado. Intenta iniciar sesión.");
            setShowEmailForm(true);
          } else {
            toast.error(error.message);
          }
          return;
        }
        await sendWelcomeEmail(email, fullName, 'email');
        // Mark as has logged in
        localStorage.setItem(HAS_LOGGED_IN_KEY, "true");
        toast.success("¡Cuenta creada! Bienvenido");
        
        const storedPlan = localStorage.getItem("pendingPlan");
        if (storedPlan === "pro_monthly" || storedPlan === "pro_yearly") {
          navigate("/checkout", { replace: true });
        } else {
          navigate("/setup", { replace: true });
        }
      }
    } catch (err) {
      toast.error("Algo salió mal. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SiteHead 
        title="Acceder | VISTACEO - Tu CEO Digital"
        description={`Accede a tu CEO digital con IA. Analiza tu negocio, detecta oportunidades y recibe acciones personalizadas cada día. Usado por +${reviewCount.toLocaleString()} negocios en LATAM.`}
        path="/auth"
        noindex={true}
      />
      
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
        {/* Subtle background gradient */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
        </div>

        <motion.div 
          className="relative w-full max-w-[560px] mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Main Card - Ultra Premium */}
          <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-[22px] shadow-2xl shadow-primary/5 p-6 sm:p-10">
            {/* Logo */}
            <div className="text-center mb-6">
              <Link to="/" className="inline-flex items-center justify-center mb-5 group">
                <div className="transition-transform duration-300 group-hover:scale-105">
                  <VistaceoLogo size={isMobile ? 80 : 100} variant="full" />
                </div>
              </Link>
              
              {/* Header - Copy intocable */}
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {isReturningUser ? "Bienvenido de vuelta" : "Bienvenido"}
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg">
                Tu CEO digital te está esperando
              </p>
            </div>

            {/* Google CTA - HERO (Protagonista absoluto) */}
            <div className="mb-6">
              <Button 
                variant="outline"
                size="lg"
                className="w-full h-14 text-base font-medium border-2 hover:border-primary/50 hover:bg-secondary transition-all"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Crear cuenta con Google
                  </>
                )}
              </Button>

              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mt-3">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Seguro
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  1 clic
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  2 min
                </span>
              </div>
            </div>

            {/* Email option - Colapsado y muy secundario */}
            <Collapsible open={showEmailForm} onOpenChange={setShowEmailForm}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="h-px w-8 bg-border" />
                  <span className="flex items-center gap-1.5">
                    {showEmailForm ? "Ocultar email" : "Usar email y contraseña"}
                    {showEmailForm ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                  <span className="h-px w-8 bg-border" />
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="pt-4"
                  >
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Name field - only for new users */}
                      {!isReturningUser && (
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-sm font-medium">Nombre completo</Label>
                          <Input
                            id="fullName"
                            type="text"
                            placeholder="Tu nombre"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="h-12 bg-secondary/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 bg-secondary/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12 bg-secondary/50 border-border pr-12 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        variant="secondary"
                        size="lg" 
                        className="w-full h-12 text-base font-medium"
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            {isReturningUser ? "Ingresar" : "Crear cuenta"}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>

                      {/* Toggle between login/signup for email */}
                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newMode = isReturningUser ? "signup" : "login";
                            const newParams = new URLSearchParams(searchParams);
                            newParams.set("mode", newMode);
                            navigate(`/auth?${newParams.toString()}`, { replace: true });
                          }}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {isReturningUser 
                            ? "¿No tienes cuenta? " 
                            : "¿Ya tienes cuenta? "
                          }
                          <span className="font-semibold text-primary">
                            {isReturningUser ? "Crear cuenta" : "Iniciar sesión"}
                          </span>
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </AnimatePresence>
              </CollapsibleContent>
            </Collapsible>

            {/* Terms - Always visible */}
            <p className="text-xs text-muted-foreground text-center mt-6">
              Al continuar, aceptás las{" "}
              <Link to="/condiciones" className="text-primary hover:underline">
                Condiciones
              </Link>{" "}
              y la{" "}
              <Link to="/politicas" className="text-primary hover:underline">
                Política de Privacidad
              </Link>
            </p>
          </div>

          {/* Social proof - Below card */}
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-warning fill-warning" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">+{reviewCount.toLocaleString()} negocios</span> confían en VistaCEO
            </p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default Auth;
