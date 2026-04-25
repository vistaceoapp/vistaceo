import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type State =
  | { kind: "loading" }
  | { kind: "valid" }
  | { kind: "already" }
  | { kind: "invalid"; message: string }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function UnsubscribePage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ kind: "invalid", message: "Falta el token de cancelación." });
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON } }
        );
        const data = await res.json();
        if (data.valid) setState({ kind: "valid" });
        else if (data.reason === "already_unsubscribed") setState({ kind: "already" });
        else setState({ kind: "invalid", message: data.error || "Token inválido." });
      } catch (e: any) {
        setState({ kind: "invalid", message: e?.message || "Error de red." });
      }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState({ kind: "submitting" });
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/handle-email-unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.success) setState({ kind: "success" });
      else if (data.reason === "already_unsubscribed") setState({ kind: "already" });
      else setState({ kind: "error", message: data.error || "No se pudo procesar." });
    } catch (e: any) {
      setState({ kind: "error", message: e?.message || "Error de red." });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Helmet>
        <title>Cancelar suscripción · VistaCEO</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Cancelar suscripción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.kind === "loading" && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Verificando...
            </div>
          )}
          {state.kind === "valid" && (
            <>
              <p className="text-muted-foreground">
                ¿Confirmás que querés dejar de recibir nuestros emails?
              </p>
              <Button onClick={confirm} className="w-full">
                Confirmar cancelación
              </Button>
            </>
          )}
          {state.kind === "submitting" && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
            </div>
          )}
          {state.kind === "success" && (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Listo, cancelaste la suscripción.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  No vas a recibir más emails de esta dirección.
                </p>
              </div>
            </div>
          )}
          {state.kind === "already" && (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-muted-foreground mt-0.5" />
              <p>Ya cancelaste la suscripción anteriormente.</p>
            </div>
          )}
          {(state.kind === "invalid" || state.kind === "error") && (
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium">No se pudo procesar.</p>
                <p className="text-sm text-muted-foreground mt-1">{state.message}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
