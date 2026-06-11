import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MapPin, Star, RefreshCw, TrendingUp, TrendingDown,
  Building2, Sparkles, AlertTriangle, Target, Loader2,
  Plus, Trash2, Edit3, Check, X, ArrowRight, MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { buildContextPack } from "@/lib/context-pack-builder";
import { useBusiness } from "@/contexts/BusinessContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Competitor {
  id: string;
  name: string;
  address: string | null;
  rating: number | null;
  review_count: number | null;
  distance_km: number | null;
  price_level: number | null;
  google_place_id: string | null;
  metadata: Record<string, unknown> | null;
}

interface CompetitorAnalysis {
  marketPosition: "leader" | "competitive" | "lagging" | "unknown";
  avgMarketRating: number;
  avgReviewCount: number;
  ratingDiff: number;
  nearestCompetitor: Competitor | null;
  strongestCompetitor: Competitor | null;
  insights: string[];
}

export const CompetitorInsightsPanel = () => {
  const navigate = useNavigate();
  const { currentBusiness } = useBusiness();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const fetchCompetitors = useCallback(async () => {
    if (!currentBusiness) return;
    try {
      const { data, error } = await supabase
        .from("business_competitors")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .order("distance_km", { ascending: true })
        .limit(15);
      if (error) throw error;
      const comps = (data || []) as Competitor[];
      setCompetitors(comps);
      if (comps.length > 0) analyzeCompetition(comps);
    } catch (error) {
      console.error("Error fetching competitors:", error);
    } finally { setLoading(false); }
  }, [currentBusiness]);

  const analyzeCompetition = (comps: Competitor[]) => {
    const withRating = comps.filter(c => c.rating != null);
    const withReviews = comps.filter(c => c.review_count != null);
    const avgRating = withRating.length > 0 ? withRating.reduce((s, c) => s + (c.rating || 0), 0) / withRating.length : 0;
    const avgReviews = withReviews.length > 0 ? withReviews.reduce((s, c) => s + (c.review_count || 0), 0) / withReviews.length : 0;
    const myRating = currentBusiness?.avg_rating || 0;
    const ratingDiff = myRating - avgRating;
    const nearest = comps.reduce<Competitor | null>((best, c) => (!best || (c.distance_km || 999) < (best.distance_km || 999)) ? c : best, null);
    const strongest = withRating.reduce<Competitor | null>((best, c) => (!best || (c.rating || 0) > (best.rating || 0)) ? c : best, null);

    let position: CompetitorAnalysis["marketPosition"] = "unknown";
    if (myRating > 0 && avgRating > 0) {
      if (ratingDiff > 0.3) position = "leader";
      else if (ratingDiff > -0.2) position = "competitive";
      else position = "lagging";
    }

    const insights: string[] = [];
    if (position === "leader") insights.push(`Tu rating (${myRating.toFixed(1)}) supera la media de tu zona (${avgRating.toFixed(1)}). ¡Estás liderando!`);
    else if (position === "lagging") insights.push(`Tu rating (${myRating.toFixed(1)}) está por debajo de la media (${avgRating.toFixed(1)}). Focalizá en mejorar la experiencia.`);
    else if (position === "competitive") insights.push(`Tu rating (${myRating.toFixed(1)}) es competitivo con la media (${avgRating.toFixed(1)}).`);
    if (strongest?.rating && myRating > 0 && strongest.rating > myRating) insights.push(`${strongest.name} lidera con ${strongest.rating.toFixed(1)}⭐. Estudiá qué los diferencia.`);
    if (nearest?.distance_km) insights.push(`Competidor más cercano: ${nearest.name} a ${nearest.distance_km.toFixed(1)} km.`);
    if (comps.length >= 5) insights.push(`${comps.length} competidores en tu zona. Mercado ${comps.length > 8 ? "muy competitivo" : "moderado"}.`);

    setAnalysis({ marketPosition: position, avgMarketRating: avgRating, avgReviewCount: avgReviews, ratingDiff, nearestCompetitor: nearest, strongestCompetitor: strongest, insights });
  };

  const scanCompetitors = async () => {
    if (!currentBusiness) return;
    setScanning(true);
    try {
      const cp = await buildContextPack('analytics', currentBusiness.id).catch(() => null);
      const { data, error } = await supabase.functions.invoke("scan-competitors", {
        body: { businessId: currentBusiness.id, module: 'analytics', contextPack: cp, outputContract: 'competitors_v1' }
      });
      if (error) throw error;
      toast({ title: "Escaneo completado", description: `Se encontraron ${data?.competitorsFound || 0} competidores` });
      await fetchCompetitors();
    } catch (error) {
      console.error("Error scanning:", error);
      toast({ title: "Error", description: "No se pudo escanear. Verificá que tu negocio tenga ubicación.", variant: "destructive" });
    } finally { setScanning(false); }
  };

  const addManualCompetitor = async () => {
    if (!currentBusiness || !newName.trim()) return;
    setAdding(true);
    try {
      const { error } = await supabase.from("business_competitors").insert({
        business_id: currentBusiness.id,
        name: newName.trim(),
        address: newAddress.trim() || null,
      });
      if (error) throw error;
      toast({ title: "Competidor agregado" });
      setNewName(""); setNewAddress(""); setShowAddForm(false);
      await fetchCompetitors();
    } catch (e) {
      console.error("Error adding:", e);
      toast({ title: "Error", description: "No se pudo agregar", variant: "destructive" });
    } finally { setAdding(false); }
  };

  const removeCompetitor = async (id: string) => {
    try {
      const { error } = await supabase.from("business_competitors").delete().eq("id", id);
      if (error) throw error;
      setCompetitors(prev => prev.filter(c => c.id !== id));
      toast({ title: "Competidor eliminado" });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    try {
      const { error } = await supabase.from("business_competitors").update({ name: editName.trim() }).eq("id", id);
      if (error) throw error;
      setCompetitors(prev => prev.map(c => c.id === id ? { ...c, name: editName.trim() } : c));
      setEditingId(null);
      toast({ title: "Actualizado" });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  useEffect(() => { fetchCompetitors(); }, [fetchCompetitors]);

  const getPositionConfig = (p: CompetitorAnalysis["marketPosition"]) => {
    switch (p) {
      case "leader": return { label: "Líder", color: "text-success", border: "border-success/20", bg: "bg-success/5" };
      case "competitive": return { label: "Competitivo", color: "text-primary", border: "border-primary/20", bg: "bg-primary/5" };
      case "lagging": return { label: "Por mejorar", color: "text-warning", border: "border-warning/20", bg: "bg-warning/5" };
      default: return { label: "Sin datos", color: "text-muted-foreground", border: "border-border/40", bg: "bg-muted/20" };
    }
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="h-48 bg-muted/20 rounded-2xl animate-pulse" />
      <div className="h-32 bg-muted/20 rounded-2xl animate-pulse" />
    </div>
  );

  // Empty state
  if (competitors.length === 0) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border-2 border-dashed border-border/50 p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Análisis de Competencia</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Descubrí quiénes son tus competidores, comparalos y encontrá oportunidades.
          </p>

          {(!currentBusiness?.google_place_id && !currentBusiness?.address) ? (
            <div className="p-4 rounded-xl bg-warning/5 border border-warning/10 mb-4 max-w-md mx-auto">
              <div className="flex items-center gap-2 text-warning text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Vinculá tu negocio con Google Maps para detección automática.</span>
              </div>
            </div>
          ) : (
            <Button onClick={scanCompetitors} disabled={scanning} className="gap-2 mb-4">
              {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {scanning ? "Escaneando zona..." : "Detectar automáticamente"}
            </Button>
          )}

          <div className="border-t border-border/30 pt-4 mt-4">
            <p className="text-xs text-muted-foreground mb-3">O agregá competidores manualmente</p>
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)} className="gap-1.5 text-xs">
              <Plus className="w-3 h-3" /> Agregar competidor
            </Button>
          </div>
        </div>

        {showAddForm && (
          <ManualAddForm
            newName={newName} setNewName={setNewName}
            newAddress={newAddress} setNewAddress={setNewAddress}
            adding={adding} onAdd={addManualCompetitor}
            onCancel={() => { setShowAddForm(false); setNewName(""); setNewAddress(""); }}
          />
        )}
      </div>
    );
  }

  const posConfig = analysis ? getPositionConfig(analysis.marketPosition) : null;

  return (
    <div className="space-y-5">
      {/* Market Position Header */}
      {analysis && (
        <div className="rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Posición Competitiva</h2>
            <Button variant="outline" size="sm" onClick={scanCompetitors} disabled={scanning} className="gap-1.5 text-xs rounded-xl h-8">
              <RefreshCw className={cn("w-3 h-3", scanning && "animate-spin")} />
              Actualizar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className={cn("p-4 rounded-xl border", posConfig?.bg, posConfig?.border)}>
              <div className="flex items-center gap-2 mb-1">
                {analysis.marketPosition === "leader" ? <TrendingUp className="w-4 h-4 text-success" /> :
                 analysis.marketPosition === "lagging" ? <TrendingDown className="w-4 h-4 text-warning" /> :
                 <Target className="w-4 h-4 text-primary" />}
                <span className={cn("text-sm font-semibold", posConfig?.color)}>{posConfig?.label}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {analysis.marketPosition === "leader" ? "Mejor valoración que la competencia" :
                 analysis.marketPosition === "competitive" ? "A la par con el mercado" :
                 analysis.marketPosition === "lagging" ? "Margen de mejora vs competencia" :
                 "Vinculá Google Maps para compararte"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-3.5 h-3.5 text-warning" />
                <span className="text-xs font-medium text-foreground">Rating del Mercado</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {analysis.avgMarketRating > 0 ? analysis.avgMarketRating.toFixed(1) : "—"}
                </span>
                {analysis.ratingDiff !== 0 && currentBusiness?.avg_rating && (
                  <span className={cn("text-[11px] font-medium", analysis.ratingDiff > 0 ? "text-success" : "text-destructive")}>
                    {analysis.ratingDiff > 0 ? "+" : ""}{analysis.ratingDiff.toFixed(1)} vs tuyo
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">Densidad</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">{competitors.length}</span>
                <span className="text-[11px] text-muted-foreground">en tu zona</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      {analysis && analysis.insights.length > 0 && (
        <div className="rounded-2xl border border-border/40 bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Insights</h3>
          </div>
          <div className="space-y-1.5">
            {analysis.insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/20 border border-border/30">
                <Target className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-foreground leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitors List */}
      <div className="rounded-2xl border border-border/40 bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Competidores</h3>
            <Badge variant="secondary" className="text-[10px]">{competitors.length}</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)} className="gap-1.5 text-xs rounded-xl h-7">
            <Plus className="w-3 h-3" /> Agregar
          </Button>
        </div>

        {showAddForm && (
          <ManualAddForm
            newName={newName} setNewName={setNewName}
            newAddress={newAddress} setNewAddress={setNewAddress}
            adding={adding} onAdd={addManualCompetitor}
            onCancel={() => { setShowAddForm(false); setNewName(""); setNewAddress(""); }}
            className="mb-4"
          />
        )}

        <div className="space-y-2">
          {competitors.map((comp) => (
            <div key={comp.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/10 border border-border/30 hover:border-primary/20 transition-colors group">
              <div className="w-9 h-9 rounded-xl bg-muted/30 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                {editingId === comp.id ? (
                  <div className="flex items-center gap-2">
                    <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-7 text-xs" autoFocus onKeyDown={e => e.key === 'Enter' && saveEdit(comp.id)} />
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => saveEdit(comp.id)}><Check className="w-3 h-3 text-success" /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingId(null)}><X className="w-3 h-3" /></Button>
                  </div>
                ) : (
                  <>
                    <h4 className="font-semibold text-foreground text-xs truncate">{comp.name}</h4>
                    {comp.address && (
                      <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 flex-shrink-0" />{comp.address}
                      </p>
                    )}
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {comp.rating != null && (
                  <div className="text-right">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-warning fill-warning" />
                      <span className="text-xs font-bold text-foreground">{comp.rating.toFixed(1)}</span>
                    </div>
                    {comp.review_count != null && (
                      <span className="text-[9px] text-muted-foreground">{comp.review_count} reseñas</span>
                    )}
                  </div>
                )}
                {comp.distance_km != null && (
                  <Badge variant="secondary" className="text-[9px] px-1.5">{comp.distance_km.toFixed(1)} km</Badge>
                )}
                {/* Edit/Delete - show on hover */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingId(comp.id); setEditName(comp.name); }}>
                    <Edit3 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeCompetitor(comp.id)}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-border/40 bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">¿Cómo diferenciarte?</h3>
            <p className="text-xs text-muted-foreground">Preguntale al asistente estrategias vs tu competencia</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/app/chat?prompt=" + encodeURIComponent("Cómo puedo diferenciarme de mi competencia?"))} className="gap-1.5 text-xs rounded-xl flex-shrink-0">
            Consultar <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const ManualAddForm = ({ newName, setNewName, newAddress, setNewAddress, adding, onAdd, onCancel, className }: {
  newName: string; setNewName: (v: string) => void;
  newAddress: string; setNewAddress: (v: string) => void;
  adding: boolean; onAdd: () => void; onCancel: () => void;
  className?: string;
}) => (
  <div className={cn("p-4 rounded-xl bg-muted/20 border border-border/40 space-y-3", className)}>
    <Input placeholder="Nombre del competidor" value={newName} onChange={e => setNewName(e.target.value)} className="h-9 text-sm" autoFocus />
    <Input placeholder="Dirección (opcional)" value={newAddress} onChange={e => setNewAddress(e.target.value)} className="h-9 text-sm" />
    <div className="flex gap-2">
      <Button onClick={onAdd} disabled={adding || !newName.trim()} size="sm" className="gap-1.5 text-xs flex-1">
        {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
        {adding ? "Agregando..." : "Agregar"}
      </Button>
      <Button variant="outline" size="sm" onClick={onCancel} className="text-xs">Cancelar</Button>
    </div>
  </div>
);

export default CompetitorInsightsPanel;
