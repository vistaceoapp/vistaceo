import { forwardRef } from "react";
import { MapPin, Star, Shield, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessKey } from "./MockupProDashboard";

interface Props { business?: BusinessKey; }

const competitorData: Record<BusinessKey, {
  summary: string;
  competitors: Array<{ name: string; rating: number; reviews: number; distance: string; priceLevel: string; threat: 'high' | 'medium' | 'low' }>;
  yourAdvantage: string;
}> = {
  argentina: {
    summary: "4 competidores directos en radio de 1.5 km",
    competitors: [
      { name: "La Cabaña del Tío", rating: 4.3, reviews: 287, distance: "0.4 km", priceLevel: "$$", threat: "high" },
      { name: "El Fogón Criollo", rating: 4.1, reviews: 156, distance: "0.8 km", priceLevel: "$$", threat: "medium" },
      { name: "Parrilla Sur", rating: 3.9, reviews: 98, distance: "1.2 km", priceLevel: "$", threat: "low" },
    ],
    yourAdvantage: "Tu rating (4.5) es el más alto de la zona. Ventaja clara en reputación.",
  },
  odontologia: {
    summary: "6 clínicas dentales en radio de 2 km",
    competitors: [
      { name: "Dental Premium", rating: 4.6, reviews: 342, distance: "0.3 km", priceLevel: "$$$", threat: "high" },
      { name: "Sonrisa Perfect", rating: 4.2, reviews: 189, distance: "0.9 km", priceLevel: "$$", threat: "medium" },
      { name: "OdontoCenter", rating: 4.0, reviews: 124, distance: "1.5 km", priceLevel: "$$", threat: "low" },
    ],
    yourAdvantage: "Mejor precio-calidad de la zona. Oportunidad en estética dental.",
  },
  mexico: {
    summary: "8 boutiques en Polanco en radio de 1 km",
    competitors: [
      { name: "Moda Urbana MX", rating: 4.4, reviews: 215, distance: "0.2 km", priceLevel: "$$$", threat: "high" },
      { name: "Estilo Polanco", rating: 4.1, reviews: 167, distance: "0.5 km", priceLevel: "$$", threat: "medium" },
      { name: "Fashion House", rating: 3.8, reviews: 89, distance: "0.7 km", priceLevel: "$$", threat: "low" },
    ],
    yourAdvantage: "Mayor engagement en Instagram vs. competencia directa.",
  },
  marketing: {
    summary: "12 agencias digitales en Providencia",
    competitors: [
      { name: "Digital Boost", rating: 4.5, reviews: 78, distance: "0.6 km", priceLevel: "$$$", threat: "high" },
      { name: "WebPro Agency", rating: 4.2, reviews: 134, distance: "1.1 km", priceLevel: "$$", threat: "medium" },
      { name: "Social Masters", rating: 3.9, reviews: 56, distance: "1.8 km", priceLevel: "$$", threat: "low" },
    ],
    yourAdvantage: "Especialización en performance marketing te diferencia.",
  },
};

const threatColors = {
  high: "text-destructive bg-destructive/10 border-destructive/20",
  medium: "text-warning bg-warning/10 border-warning/20",
  low: "text-success bg-success/10 border-success/20",
};

const threatLabels = { high: "Alta", medium: "Media", low: "Baja" };

export const MockupProCompetitors = forwardRef<HTMLDivElement, Props>(({ business = "argentina" }, ref) => {
  const data = competitorData[business];

  return (
    <div ref={ref} className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden w-full">
      <div className="h-1.5 bg-gradient-to-r from-warning to-destructive" />
      <div className="p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
            <Eye className="w-4 h-4 text-warning" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Radar Competitivo</h3>
            <p className="text-[10px] text-muted-foreground">{data.summary}</p>
          </div>
        </div>

        <div className="space-y-2">
          {data.competitors.map((comp, i) => (
            <div key={i} className="p-3 rounded-xl border border-border bg-secondary/30 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{comp.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <Star className="w-3 h-3 text-warning fill-warning" /> {comp.rating}
                  </span>
                  <span className="text-[10px] text-muted-foreground">({comp.reviews})</span>
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <MapPin className="w-2.5 h-2.5" /> {comp.distance}
                  </span>
                </div>
              </div>
              <div className={cn("px-2 py-0.5 rounded-full text-[9px] font-semibold border", threatColors[comp.threat])}>
                {threatLabels[comp.threat]}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 p-3 rounded-xl bg-success/5 border border-success/20">
          <div className="flex items-center gap-1.5 mb-1">
            <Shield className="w-3.5 h-3.5 text-success" />
            <span className="text-[10px] font-semibold text-success">Tu ventaja competitiva</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{data.yourAdvantage}</p>
        </div>
      </div>
    </div>
  );
});

MockupProCompetitors.displayName = "MockupProCompetitors";
