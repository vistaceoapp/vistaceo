import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OwlLogo } from "@/components/ui/OwlLogo";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, Sparkles, TrendingUp, Target, Chrome } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Check if user already logged in and redirect
  useEffect(() => {
    if (user) {
      checkUserAndRedirect();
    }
  }, [user]);

  const checkUserAndRedirect = async () => {
    if (!user) return;
    
    // Check if user has a business
    const { data: businesses } = await supabase
      .from("businesses")
      .select("id, setup_completed")
      .eq("owner_id", user.id)
      .limit(1);

    if (businesses && businesses.length > 0) {
      // Has business - go to app (setup wizard will show if needed)
      navigate("/app");
    } else {
      // No business - go to onboarding
      navigate("/onboarding");
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message);
      }
      // OAuth will redirect automatically
    } catch (err) {
      toast.error("Error al conectar con Google");
    } finally {
      setGoogleLoading(false);
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
        toast.success("¡Cuenta creada! Bienvenido");
        navigate("/onboarding");
      }
    } catch (err) {
      toast.error("Algo salió mal. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: Target, text: "1 acción diaria enfocada en resultados" },
    { icon: TrendingUp, text: "Análisis inteligente de tu negocio" },
    { icon: Sparkles, text: "Recomendaciones personalizadas con IA" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Logo */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center justify-center mb-8 group">
              <div className="transition-transform duration-300 group-hover:scale-105">
                <OwlLogo size={120} />
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">
              {isLogin ? "Bienvenido de vuelta" : "Crea tu cuenta"}
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              {isLogin 
                ? "Ingresa a tu CEO digital" 
                : "Empieza a mejorar tu negocio hoy"
              }
            </p>
          </div>

          {/* Google Sign In - PRIMARY */}
          <div className="space-y-4">
            <Button 
              variant="outline" 
              size="lg"
              className="w-full h-14 text-base font-medium hover:bg-secondary transition-colors border-2 hover:border-primary/50"
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

            <p className="text-xs text-center text-muted-foreground">
              Recomendado • Crea tu cuenta en segundos
            </p>
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
              <div className="space-y-2 animate-fade-in">
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
              size="lg" 
              className="w-full h-12 text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Ingresar" : "Crear cuenta"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin 
                ? "¿No tienes cuenta? " 
                : "¿Ya tienes cuenta? "
              }
              <span className="font-semibold text-primary">
                {isLogin ? "Regístrate gratis" : "Inicia sesión"}
              </span>
            </button>
          </div>
        </div>
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
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
          
          <div className="relative z-10 max-w-lg px-12">
            {/* Main content */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
                <OwlLogo size={48} />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Tu CEO digital personal
              </h2>
              <p className="text-lg text-muted-foreground">
                Analizo tu negocio gastronómico y te guío con acciones simples y efectivas cada día.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              {benefits.map((benefit, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-foreground font-medium">{benefit.text}</p>
                  <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto flex-shrink-0" />
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground mb-3">Usado por +500 negocios en LATAM</p>
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">4.9/5 en satisfacción</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;