import { MessageSquare, ArrowRight, Sparkles, Link } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface DataNeededStateProps {
  title?: string;
  description?: string;
  context?: "missions" | "opportunities" | "analytics";
  onAskQuestion?: () => void;
  className?: string;
}

export const DataNeededState = ({ 
  title = "Para darte un plan exacto, necesito conocerte mejor",
  description,
  context = "missions",
  onAskQuestion,
  className
}: DataNeededStateProps) => {
  const navigate = useNavigate();

  const getContextDescription = () => {
    switch (context) {
      case "missions":
        return "Cuanto más sepa de tu negocio, más precisas serán mis recomendaciones.";
      case "opportunities":
        return "Para detectar oportunidades reales, necesito entender tu situación actual.";
      case "analytics":
        return "Conecta fuentes de datos para ver métricas útiles.";
      default:
        return description;
    }
  };

  const dataNeeds = [
    {
      icon: Link,
      title: "Conectar integraciones",
      description: "Google Reviews, redes sociales, ventas",
      action: () => navigate("/app/more"),
      cta: "Conectar"
    },
    {
      icon: MessageSquare,
      title: "Contarme sobre tu negocio",
      description: "Responde algunas preguntas rápidas",
      action: onAskQuestion || (() => navigate("/app/chat")),
      cta: "Responder"
    },
  ];

  return (
    <div className={cn(
      "rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-6",
      className
    )}>
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground max-w-md leading-relaxed">
          {getContextDescription()}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground mb-3">Para empezar, puedes:</p>
        {dataNeeds.map((need, idx) => {
          const Icon = need.icon;
          return (
            <button
              key={idx}
              onClick={need.action}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 hover:border-primary/30 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{need.title}</p>
                <p className="text-sm text-muted-foreground">{need.description}</p>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <span className="text-sm font-medium">{need.cta}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Reassurance */}
      <p className="text-xs text-muted-foreground text-center mt-6">
        💡 Cuanto más me cuentes, más precisas y útiles van a ser mis recomendaciones
      </p>
    </div>
  );
};