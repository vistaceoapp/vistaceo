import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { SiteHead } from "@/components/seo/SiteHead";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, Sparkles, TrendingUp, Target, Crown, Zap, Shield, Users, Star, Clock, Brain } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

// Dynamic review count: starts at 2961 on 2026-02-06, +3 per week
const useReviewCount = () => {
  return useMemo(() => {
    const startDate = new Date('2026-02-06');
    const now = new Date();
    const weeksDiff = Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return 2961 + Math.max(0, weeksDiff * 3);
  }, []);
};

// Dashboard route constant
const DASHBOARD_ROUTE = "/app";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const reviewCount = useReviewCount();
  const isMobile = useIsMobile();

  // Capture mode intent from URL (login or signup)
  const modeParam = searchParams.get("mode");
  
  // Determine if returning user based on signals (no flicker - check sync)
  const hasLoggedInBefore = useMemo(() => {
    return localStorage.getItem("has_logged_in") === "true";
  }, []);

  // isLogin based on mode param or returning user signal
  const isLogin = useMemo(() => {
    if (modeParam === "signup") return false;
    if (modeParam === "login") return true;
    // Default: if returning user show login, else signup
    return hasLoggedInBefore;
  }, [modeParam, hasLoggedInBefore]);

  // Welcome message: intelligent detection without flicker
  const welcomeMessage = useMemo(() => {
    // Priority 1: URL mode param
    if (modeParam === "login") return "Bienvenido de vuelta";
    if (modeParam === "signup") return "Bienvenido";
    // Priority 2: localStorage signal
    if (hasLoggedInBefore) return "Bienvenido de vuelta";
    // Default for new users
    return "Bienvenido";
  }, [modeParam, hasLoggedInBefore]);

  // Capture plan intent from URL
  const planParam = searchParams.get("plan"); // pro_monthly or pro_yearly
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
    
    // Mark that user has logged in for "Bienvenido de vuelta" logic
    localStorage.setItem("has_logged_in", "true");
    
    // Check if user has a business
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
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Este email ya está registrado");
          } else {
            toast.error(error.message);
          }
          return;
        }
        await sendWelcomeEmail(email, fullName, 'email');
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

  const benefits = [
    { icon: Brain, text: "IA que aprende de tu negocio", highlight: "24/7" },
    { icon: Target, text: "1 misión diaria con resultados", highlight: "Simple" },
    { icon: TrendingUp, text: "Radar predictivo de oportunidades", highlight: "Pro" },
    { icon: Sparkles, text: "Consejos personalizados para vos", highlight: "Único" },
  ];

  const stats = [
    { value: "2,847", label: "negocios" },
    { value: "+32%", label: "crecimiento" },
    { value: "4.9★", label: "rating" },
    { value: "9", label: "países" },
  ];

  const testimonial = {
    quote: "Pasamos de 12 a 28 reservas diarias. Cada mañana sé exactamente qué hacer.",
    author: "Luciana M.",
    role: "Dueña de café en Buenos Aires",
    rating: 5,
  };

  return (
    <>
      <SiteHead 
        title={isLogin ? "Iniciar Sesión | VISTACEO" : "Crear Cuenta Gratis | VISTACEO"}
        description={`Accede a tu CEO digital con IA. Analiza tu negocio, detecta oportunidades y recibe acciones personalizadas cada día. Usado por +${reviewCount.toLocaleString()} negocios en LATAM.`}
        path="/auth"
        noindex={true}
      />
      
      <div className="min-h-screen bg-background flex">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <motion.div 
            className="w-full max-w-md space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Logo */}
            <div className="text-center">
              <Link to="/" className="inline-flex items-center justify-center mb-6 group">
                <div className="transition-transform duration-300 group-hover:scale-105">
                  <VistaceoLogo size={isMobile ? 80 : 100} variant="full" />
                </div>
              </Link>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {welcomeMessage}
              </h1>
              <p className="text-muted-foreground mt-2 text-base sm:text-lg">
                Tu CEO digital te está esperando
              </p>
              
              {/* Plan badge if coming from pricing */}
              {pendingPlan && (
                <motion.div 
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-500">
                    Plan: {pendingPlan === "pro_yearly" ? "Pro Anual (-30%)" : "Pro Mensual"}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Google Sign In - PRIMARY */}
            <div className="space-y-3">
              <Button 
                variant="outline" 
                size="lg"
                className="w-full h-14 text-base font-medium hover:bg-secondary transition-all border-2 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
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
                    Continuar con Google
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Seguro
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Instantáneo
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  2 min
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground">o con email</span>
              </div>
            </div>

            {/* Email Form - Secondary */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Label htmlFor="fullName" className="text-sm font-medium">Nombre completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Tu nombre"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 bg-secondary/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required={!isLogin}
                  />
                </motion.div>
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
                size="lg" 
                className="w-full h-12 text-base font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Ingresar" : "Crear cuenta gratis"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Toggle */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate(isLogin ? "/auth?mode=signup" : "/auth?mode=login", { replace: true })}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin 
                  ? "¿No tienes cuenta? " 
                  : "¿Ya tienes cuenta? "
                }
                <span className="font-semibold text-primary">
                  {isLogin ? "Empezá gratis" : "Inicia sesión"}
                </span>
              </button>
            </div>

            {/* Terms acceptance */}
            <p className="text-xs text-muted-foreground text-center">
              Al crear una cuenta, aceptás las{" "}
              <Link to="/condiciones" className="text-primary hover:underline">
                Condiciones del Servicio
              </Link>{" "}
              y la{" "}
              <Link to="/politicas" className="text-primary hover:underline">
                Política de Privacidad
              </Link>
              .
            </p>

            {/* Mobile social proof */}
            {isMobile && (
              <motion.div 
                className="pt-4 border-t border-border"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">+{reviewCount.toLocaleString()} negocios</span> confían en VistaCEO
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Right side - Decorative (Desktop only) */}
        {!isMobile && (
          <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
            {/* Decorative elements */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />
            
            <div className="relative z-10 max-w-lg px-12">
              {/* Main content */}
              <motion.div 
                className="text-center mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-6 shadow-lg shadow-primary/20">
                  <VistaceoLogo size={48} variant="icon" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-3">
                  Tu CEO digital con IA
                </h2>
                <p className="text-lg text-muted-foreground">
                  Analizo tu negocio 24/7 y te digo exactamente qué hacer para crecer.
                </p>
              </motion.div>

              {/* Benefits */}
              <div className="space-y-2.5 mb-8">
                {benefits.map((benefit, idx) => (
                  <motion.div 
                    key={idx}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <benefit.icon className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-foreground font-medium flex-1 text-sm whitespace-nowrap">{benefit.text}</p>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary flex-shrink-0">
                      {benefit.highlight}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Testimonial */}
              <motion.div 
                className="p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex gap-0.5 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-foreground italic text-sm mb-3 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div 
                className="grid grid-cols-4 gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                {stats.map((stat, idx) => (
                  <div key={idx} className="text-center p-2 rounded-lg bg-card/30">
                    <p className="text-base font-bold text-foreground">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Auth;
