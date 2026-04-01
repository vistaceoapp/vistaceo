import { forwardRef } from "react";
import { Lightbulb, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessKey } from "./MockupProDashboard";

interface Props { business?: BusinessKey; }

const insightsData: Record<BusinessKey, {
  headline: string;
  insights: Array<{ type: 'opportunity' | 'risk' | 'trend'; title: string; detail: string; metric?: string }>;
}> = {
  argentina: {
    headline: "3 oportunidades detectadas esta semana",
    insights: [
      { type: 'opportunity', title: "Menú ejecutivo mediodía", detail: "El tráfico de oficinistas a 200m creció 18%. Un menú rápido $8.500 captaría ese segmento.", metric: "+18%" },
      { type: 'risk', title: "Costo de carne vacuna", detail: "El precio del asado subió 12% este mes. Evaluar proveedores alternativos o ajuste de carta.", metric: "+12%" },
      { type: 'trend', title: "Delivery crece en tu zona", detail: "Los pedidos delivery en Palermo subieron 25% vs. mes anterior. Optimizar menú delivery.", metric: "+25%" },
    ],
  },
  odontologia: {
    headline: "2 oportunidades y 1 alerta",
    insights: [
      { type: 'opportunity', title: "Blanqueamiento dental", detail: "La demanda de estética dental creció 30% en Santiago. Campaña en redes con antes/después.", metric: "+30%" },
      { type: 'risk', title: "Cancelaciones frecuentes", detail: "22% de citas se cancelan sin aviso. Implementar confirmación automática por WhatsApp.", metric: "22%" },
      { type: 'trend', title: "Ortodoncia invisible", detail: "Búsquedas de alineadores crecieron 40% en Chile. Evaluar oferta de ortodoncia invisible.", metric: "+40%" },
    ],
  },
  mexico: {
    headline: "Temporada alta se acerca",
    insights: [
      { type: 'opportunity', title: "Colección primavera", detail: "Las búsquedas de moda primavera crecieron 35%. Adelantar lanzamiento 2 semanas.", metric: "+35%" },
      { type: 'risk', title: "Inventario excedente", detail: "15 SKUs sin movimiento en 60 días. Activar liquidación selectiva con descuento 30%.", metric: "15 SKUs" },
      { type: 'trend', title: "Compra por Instagram", detail: "68% de tu tráfico viene de IG. Optimizar catálogo de Instagram Shopping.", metric: "68%" },
    ],
  },
  marketing: {
    headline: "Oportunidades de crecimiento detectadas",
    insights: [
      { type: 'opportunity', title: "Automatización de reportes", detail: "Estás dedicando 12 hrs/mes a reportes manuales. Automatizar liberaría capacidad para 1 cliente más.", metric: "12 hrs" },
      { type: 'risk', title: "Concentración de ingresos", detail: "45% de facturación viene de 1 cliente. Diversificar con estrategia de captación B2B.", metric: "45%" },
      { type: 'trend', title: "IA en marketing", detail: "Agencias que ofrecen servicios IA cobran 40% más. Integrar IA generativa en tu oferta.", metric: "+40%" },
    ],
  },
  juridico: {
    headline: "Alertas críticas para el estudio",
    insights: [
      { type: 'risk', title: "Baja conversión de consultas", detail: "Solo el 40% de consultas iniciales se convierten en casos. Implementar seguimiento post-consulta.", metric: "40%" },
      { type: 'opportunity', title: "Compliance empresarial", detail: "Las búsquedas de compliance en Ecuador crecieron 60%. Posicionarte como referente.", metric: "+60%" },
      { type: 'trend', title: "Arbitraje comercial en auge", detail: "Nueva ley de arbitraje genera demanda. Capacitar al equipo para captar estos casos.", metric: "+45%" },
    ],
  },
};

const typeConfig = {
  opportunity: { icon: Lightbulb, color: "text-success", bg: "bg-success/10 border-success/20", label: "Oportunidad" },
  risk: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10 border-warning/20", label: "Alerta" },
  trend: { icon: TrendingUp, color: "text-primary", bg: "bg-primary/10 border-primary/20", label: "Tendencia" },
};

export const MockupProInsights = forwardRef<HTMLDivElement, Props>(({ business = "argentina" }, ref) => {
  const data = insightsData[business];

  return (
    <div ref={ref} className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden w-full">
      <div className="h-1.5 bg-gradient-to-r from-primary to-accent" />
      <div className="p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Insights IA</h3>
            <p className="text-[10px] text-muted-foreground">{data.headline}</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {data.insights.map((insight, i) => {
            const config = typeConfig[insight.type];
            const Icon = config.icon;
            return (
              <div key={i} className={cn("p-3 rounded-xl border", config.bg)}>
                <div className="flex items-start gap-2.5">
                  <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", config.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground">{insight.title}</p>
                      {insight.metric && (
                        <span className={cn("text-xs font-bold flex-shrink-0", config.color)}>{insight.metric}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{insight.detail}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

MockupProInsights.displayName = "MockupProInsights";