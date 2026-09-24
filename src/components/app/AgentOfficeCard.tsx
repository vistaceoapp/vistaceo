import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, Briefcase, Mail, MessageSquare, Target } from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { GlassCard } from "@/components/app/GlassCard";
import { safeLocalStorage } from "@/lib/safe-storage";

interface AgentSettings {
  name?: string;
  role?: string;
  mission?: string;
}

const QUICK_ORDERS = [
  { icon: Mail, label: "Redactá un correo para recuperar clientes" },
  { icon: MessageSquare, label: "Preparame un mensaje de WhatsApp para vender más esta semana" },
  { icon: Target, label: "¿Qué es lo más rentable que podés hacer hoy por mi negocio?" },
];

/** Oficina del Empleado Digital: cabecera + orden directa. Sin costo de IA al renderizar. */
export const AgentOfficeCard = () => {
  const { currentBusiness } = useBusiness();
  const navigate = useNavigate();
  const [order, setOrder] = useState("");

  const agent = useMemo<AgentSettings>(() => {
    const s = (currentBusiness?.settings as Record<string, unknown> | null) ?? {};
    const a = (s.agent as AgentSettings | undefined) ?? {};
    return { ...a, name: a.name || safeLocalStorage.getItem("vc_agent_name") || "Tu empleado" };
  }, [currentBusiness?.settings]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    navigate(`/app/chat?prompt=${encodeURIComponent(t)}`);
  };

  if (!currentBusiness) return null;

  return (
    <GlassCard className="p-5 sm:p-6 border-primary/20">
      <div className="flex items-center gap-3">
        <div className="relative w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
          <Briefcase className="w-5 h-5 text-primary-foreground" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground leading-tight truncate">
            {agent.name}
            <span className="ml-2 text-xs font-medium text-primary">· Disponible</span>
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {agent.role || "Empleado digital"} en {currentBusiness.name}
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
        Pedime lo que necesites: preparo el trabajo y vos aprobás. No envío nada a terceros sin tu aprobación.
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); send(order); }}
        className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-background/60 pl-4 pr-1.5 py-1.5 focus-within:border-primary/50"
      >
        <input
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          placeholder={`¿Qué necesitás que resuelva hoy?`}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
          maxLength={500}
        />
        <button
          type="submit"
          aria-label="Enviar pedido"
          disabled={!order.trim()}
          className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center disabled:opacity-40"
        >
          <ArrowUp className="w-4 h-4 text-primary-foreground" />
        </button>
      </form>

      <button
        onClick={() => navigate("/app/trabajo")}
        className="mt-3 text-xs font-semibold text-primary hover:underline"
      >
        Ver bandeja de trabajo →
      </button>

      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_ORDERS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            onClick={() => send(label)}
            className="inline-flex items-center gap-1.5 text-xs text-foreground/80 hover:text-foreground px-3 py-1.5 rounded-full border border-border hover:border-primary/40 bg-background/40 transition-colors text-left"
          >
            <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
            {label}
          </button>
        ))}
      </div>
    </GlassCard>
  );
};

export default AgentOfficeCard;
