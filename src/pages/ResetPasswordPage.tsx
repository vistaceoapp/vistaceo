import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Check, ArrowRight, Lock } from "lucide-react";
import { motion } from "framer-motion";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasRecoveryToken, setHasRecoveryToken] = useState(false);

  // Detect recovery token in URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setHasRecoveryToken(true);
    }

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setHasRecoveryToken(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(true);
      toast.success("¡Contraseña actualizada!");
      setTimeout(() => navigate("/auth?mode=login", { replace: true }), 2000);
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (!hasRecoveryToken && !success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          className="w-full max-w-md text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <VistaceoLogo size={80} variant="full" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Enlace inválido</h1>
            <p className="text-muted-foreground">
              Este enlace de recuperación no es válido o ya expiró.
            </p>
          </div>
          <Button onClick={() => navigate("/auth?mode=login")} className="w-full">
            Volver a iniciar sesión
          </Button>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          className="w-full max-w-md text-center space-y-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-success/20 flex items-center justify-center">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">¡Contraseña actualizada!</h1>
          <p className="text-muted-foreground">Redirigiendo al login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center">
          <VistaceoLogo size={80} variant="full" />
          <div className="w-16 h-16 mx-auto mt-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-4">Nueva contraseña</h1>
          <p className="text-muted-foreground mt-2">Ingresá tu nueva contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12"
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full h-12" disabled={loading}>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Actualizar contraseña
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
