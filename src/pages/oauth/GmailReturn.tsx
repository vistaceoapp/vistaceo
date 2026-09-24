import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function GmailReturn() {
  const [message, setMessage] = useState("Terminando la conexión…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const notify = (type: "appUserConnectorOAuthComplete" | "appUserConnectorOAuthFailed", reason?: string) => {
      window.opener?.postMessage({ type, connectorId: "google_mail", reason }, window.location.origin);
    };
    if (params.get("success") !== "true") {
      setMessage("La conexión no se completó.");
      notify("appUserConnectorOAuthFailed");
      window.close();
      return;
    }
    const code = params.get("code");
    if (!code) {
      const reason = "La conexión no se puede usar todavía: falta habilitar el acceso sin conexión en la configuración de Gmail.";
      setMessage(reason);
      notify("appUserConnectorOAuthFailed", reason);
      return;
    }
    supabase.functions.invoke("gmail-connector", { body: { action: "complete", code } }).then(({ error }) => {
      if (error) {
        setMessage("No se pudo terminar la conexión.");
        notify("appUserConnectorOAuthFailed");
      } else {
        notify("appUserConnectorOAuthComplete");
      }
      window.close();
    });
  }, []);

  return <div className="min-h-screen flex items-center justify-center p-6 text-sm text-muted-foreground">{message}</div>;
}
