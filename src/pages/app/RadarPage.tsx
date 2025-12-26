import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Radar as RadarIcon, TrendingUp, X, Zap, Eye, Sparkles, Target, 
  BarChart3, Filter, Bookmark, BookmarkCheck, ThumbsDown, CheckCircle2,
  ArrowUpDown, Info, Lightbulb, Globe, Building2, ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/app/GlassCard";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Types
interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  evidence: unknown;
  impact_score: number;
  effort_score: number;
  is_converted: boolean;
  created_at: string;
}

interface LearningItem {
  id: string;
  title: string;
  content: string | null;
  item_type: string;
  source: string | null;
  action_steps: unknown;
  is_read: boolean;
  is_saved: boolean;
  created_at: string;
}

// Constants
const AREA_CATEGORIES = [
  { value: "all", label: "Todas las áreas" },
  { value: "ventas", label: "Ventas" },
  { value: "marketing", label: "Marketing/Social" },
  { value: "reputacion", label: "Reputación" },
  { value: "operaciones", label: "Operaciones" },
  { value: "finanzas", label: "Finanzas" },
  { value: "producto", label: "Producto/Servicio" },
  { value: "equipo", label: "Equipo" },
  { value: "trafico", label: "Tráfico/Web" },
  { value: "retencion", label: "Retención" },
  { value: "local", label: "Local/Maps" },
];

const SORT_OPTIONS = [
  { value: "balance", label: "Mejor balance" },
  { value: "impact", label: "Más impacto" },
  { value: "effort", label: "Menos esfuerzo" },
  { value: "recent", label: "Más recientes" },
];

const ID_NATURES = [
  "Tendencia", "Benchmark", "Cambio de plataforma", "Estrategia", 
  "Nueva táctica", "Estacionalidad", "Insight de audiencia", "Movimiento de competidores"
];

const RadarPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { currentBusiness } = useBusiness();
  
  // Opportunities (INTERNO)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  
  // Learning/I+D (EXTERNO)
  const [learningItems, setLearningItems] = useState<LearningItem[]>([]);
  const [selectedLearning, setSelectedLearning] = useState<LearningItem | null>(null);
  
  // Saved items
  const [savedItems, setSavedItems] = useState<{opportunities: string[], learning: string[]}>({
    opportunities: [],
    learning: []
  });
  
  // Filters
  const [areaFilter, setAreaFilter] = useState("all");
  const [sortBy, setSortBy] = useState("balance");
  const [showHighlighted, setShowHighlighted] = useState(false);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch data
  useEffect(() => {
    if (currentBusiness) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [currentBusiness]);

  const fetchData = async () => {
    if (!currentBusiness) return;
    setLoading(true);

    try {
      const [oppsRes, learningRes] = await Promise.all([
        supabase
          .from("opportunities")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .is("dismissed_at", null)
          .eq("is_converted", false)
          .order("created_at", { ascending: false }),
        supabase
          .from("learning_items")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .order("created_at", { ascending: false })
      ]);

      if (oppsRes.error) throw oppsRes.error;
      if (learningRes.error) throw learningRes.error;

      setOpportunities(oppsRes.data || []);
      setLearningItems(learningRes.data || []);
      
      // Load saved items
      const saved = learningRes.data?.filter(i => i.is_saved).map(i => i.id) || [];
      setSavedItems(prev => ({ ...prev, learning: saved }));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort opportunities
  const getFilteredOpportunities = () => {
    let filtered = [...opportunities];
    
    // Area filter
    if (areaFilter !== "all") {
      filtered = filtered.filter(o => 
        o.source?.toLowerCase().includes(areaFilter) || 
        o.description?.toLowerCase().includes(areaFilter)
      );
    }
    
    // Highlighted filter (high impact, low effort)
    if (showHighlighted) {
      filtered = filtered.filter(o => o.impact_score >= 7 && o.effort_score <= 4);
    }
    
    // Sort
    switch (sortBy) {
      case "impact":
        filtered.sort((a, b) => b.impact_score - a.impact_score);
        break;
      case "effort":
        filtered.sort((a, b) => a.effort_score - b.effort_score);
        break;
      case "recent":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "balance":
      default:
        filtered.sort((a, b) => (b.impact_score - b.effort_score) - (a.impact_score - a.effort_score));
        break;
    }
    
    return filtered;
  };

  // Actions
  const dismissOpportunity = async (id: string) => {
    try {
      const { error } = await supabase
        .from("opportunities")
        .update({ dismissed_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({ 
        title: "Entendido", 
        description: "Voy a ajustar futuras sugerencias." 
      });
      setSelectedOpportunity(null);
      fetchData();
    } catch (error) {
      console.error("Error dismissing opportunity:", error);
    }
  };

  const convertToMission = async (opportunity: Opportunity) => {
    if (!currentBusiness) return;
    setActionLoading(true);

    try {
      const { data: missionData, error: missionError } = await supabase
        .from("missions")
        .insert({
          business_id: currentBusiness.id,
          title: opportunity.title,
          description: opportunity.description,
          area: opportunity.source || "general",
          impact_score: opportunity.impact_score,
          effort_score: opportunity.effort_score,
          status: "active",
          steps: [
            { text: "Analizar el problema en detalle", done: false },
            { text: "Definir plan de acción", done: false },
            { text: "Implementar la solución", done: false },
            { text: "Medir resultados", done: false },
          ],
        })
        .select()
        .single();

      if (missionError) throw missionError;

      await supabase
        .from("opportunities")
        .update({ 
          is_converted: true,
          converted_to_mission_id: missionData.id,
        })
        .eq("id", opportunity.id);

      toast({
        title: "¡Misión creada!",
        description: "La oportunidad se convirtió en una misión activa.",
      });

      setSelectedOpportunity(null);
      navigate("/app/missions");
    } catch (error) {
      console.error("Error converting to mission:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la misión",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSaveLearning = async (id: string) => {
    const item = learningItems.find(i => i.id === id);
    if (!item) return;
    
    try {
      const { error } = await supabase
        .from("learning_items")
        .update({ is_saved: !item.is_saved })
        .eq("id", id);

      if (error) throw error;
      
      toast({ 
        title: item.is_saved ? "Removido de guardados" : "Guardado",
        description: item.is_saved ? "" : "Lo encontrarás en tu backlog"
      });
      fetchData();
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  const dismissLearning = async (id: string) => {
    try {
      await supabase
        .from("learning_items")
        .delete()
        .eq("id", id);

      toast({ 
        title: "Entendido", 
        description: "Voy a ajustar futuras sugerencias." 
      });
      setSelectedLearning(null);
      fetchData();
    } catch (error) {
      console.error("Error dismissing learning:", error);
    }
  };

  const generateAnalysis = async () => {
    if (!currentBusiness) return;
    setActionLoading(true);

    try {
      const { error } = await supabase.functions.invoke("analyze-patterns", {
        body: { businessId: currentBusiness.id }
      });

      if (error) throw error;

      toast({
        title: "Análisis completado",
        description: "Se detectaron nuevas oportunidades e insights",
      });

      fetchData();
    } catch (error) {
      console.error("Error analyzing:", error);
      toast({
        title: "Error",
        description: "No se pudo analizar el negocio",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Helper functions
  const getSourceIcon = (source: string | null) => {
    switch (source) {
      case "reviews": return "⭐";
      case "sales": return "💰";
      case "social": return "📱";
      case "operations": return "⚙️";
      case "ai": return "🤖";
      default: return "💡";
    }
  };

  const getConfidenceLabel = (impact: number, hasData: boolean) => {
    if (!hasData) return { label: "Baja", color: "text-muted-foreground", note: "Faltan integraciones" };
    if (impact >= 8) return { label: "Alta", color: "text-success", note: "Basado en tu historial" };
    if (impact >= 5) return { label: "Media", color: "text-warning", note: "Estimación razonable" };
    return { label: "Baja", color: "text-muted-foreground", note: "Datos limitados" };
  };

  const filteredOpportunities = getFilteredOpportunities();
  const highImpactCount = opportunities.filter(o => o.impact_score >= 7).length;
  const quickWinsCount = opportunities.filter(o => o.impact_score >= 7 && o.effort_score <= 4).length;

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-card rounded-xl animate-pulse w-1/2" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 bg-card rounded-xl animate-pulse" />
          <div className="h-24 bg-card rounded-xl animate-pulse" />
          <div className="h-24 bg-card rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  // No business state
  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="relative mb-6">
          <div className="absolute inset-0 blur-3xl bg-accent/30 rounded-full animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl gradient-accent flex items-center justify-center shadow-lg shadow-accent/30">
            <RadarIcon className="w-10 h-10 text-accent-foreground" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Radar de Oportunidades
        </h2>
        <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
          Configura tu negocio para descubrir oportunidades ocultas con IA.
        </p>
        <Button variant="hero" size="lg" onClick={() => navigate("/onboarding")}>
          <Sparkles className="w-5 h-5 mr-2" />
          Configurar negocio
        </Button>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <RadarIcon className="w-6 h-6 text-accent" />
              Radar
            </h1>
            <p className="text-muted-foreground text-sm">Oportunidades e I+D</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={generateAnalysis}
            disabled={actionLoading}
          >
            <Sparkles className={cn("w-4 h-4 mr-2", actionLoading && "animate-spin")} />
            Escanear
          </Button>
        </div>

        <Tabs defaultValue="oportunidades" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="oportunidades" className="text-xs">
              Oportunidades de mejora
            </TabsTrigger>
            <TabsTrigger value="id" className="text-xs">
              I+D
            </TabsTrigger>
          </TabsList>

          <TabsContent value="oportunidades" className="space-y-4">
            {filteredOpportunities.length === 0 ? (
              <GlassCard className="p-6 text-center">
                <Sparkles className="w-8 h-8 text-primary mx-auto mb-3 animate-pulse" />
                <p className="text-muted-foreground">Escaneando oportunidades...</p>
              </GlassCard>
            ) : (
              filteredOpportunities.map((opp) => (
                <GlassCard
                  key={opp.id}
                  interactive
                  className="p-4"
                  onClick={() => setSelectedOpportunity(opp)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getSourceIcon(opp.source)}</span>
                    <div className="flex-1 min-w-0">
                      <Badge variant="outline" className="mb-2 text-[10px] bg-primary/5 border-primary/20">
                        <Building2 className="w-3 h-3 mr-1" />
                        INTERNO
                      </Badge>
                      <h3 className="font-semibold text-foreground text-sm">{opp.title}</h3>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span className="text-success">↑{opp.impact_score}</span>
                        <span>•</span>
                        <span>⚡{opp.effort_score}</span>
                      </div>
                    </div>
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </div>
                </GlassCard>
              ))
            )}
          </TabsContent>

          <TabsContent value="id" className="space-y-4">
            {learningItems.length === 0 ? (
              <GlassCard className="p-6 text-center">
                <Globe className="w-8 h-8 text-accent mx-auto mb-3" />
                <p className="text-muted-foreground">Buscando tendencias...</p>
              </GlassCard>
            ) : (
              learningItems.filter(i => !i.is_saved).slice(0, 6).map((item) => (
                <GlassCard
                  key={item.id}
                  interactive
                  className="p-4"
                  onClick={() => setSelectedLearning(item)}
                >
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-accent" />
                    <div className="flex-1 min-w-0">
                      <Badge variant="outline" className="mb-2 text-[10px] bg-accent/5 border-accent/20">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        EXTERNO
                      </Badge>
                      <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                      <p className="text-xs text-muted-foreground capitalize mt-1">{item.item_type}</p>
                    </div>
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </div>
                </GlassCard>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Opportunity Preview Dialog */}
        <Dialog open={!!selectedOpportunity} onOpenChange={() => setSelectedOpportunity(null)}>
          <DialogContent className="max-w-lg">
            {selectedOpportunity && (
              <OpportunityPreview 
                opportunity={selectedOpportunity}
                onDismiss={() => dismissOpportunity(selectedOpportunity.id)}
                onAccept={() => convertToMission(selectedOpportunity)}
                actionLoading={actionLoading}
                getConfidenceLabel={getConfidenceLabel}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Learning Preview Dialog */}
        <Dialog open={!!selectedLearning} onOpenChange={() => setSelectedLearning(null)}>
          <DialogContent className="max-w-lg">
            {selectedLearning && (
              <LearningPreview 
                item={selectedLearning}
                onDismiss={() => dismissLearning(selectedLearning.id)}
                onSave={() => toggleSaveLearning(selectedLearning.id)}
                onClose={() => setSelectedLearning(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <RadarIcon className="w-6 h-6 text-accent" />
            Radar
          </h1>
          <p className="text-muted-foreground">Oportunidades e investigación para tu negocio</p>
        </div>
        <Button 
          onClick={generateAnalysis}
          disabled={actionLoading}
          className="gradient-primary shadow-lg shadow-primary/20"
        >
          <Sparkles className={cn("w-4 h-4 mr-2", actionLoading && "animate-spin")} />
          {actionLoading ? "Analizando..." : "Escanear con IA"}
        </Button>
      </div>

      {/* Tabs - Only 2 tabs: Oportunidades and I+D */}
      <Tabs defaultValue="oportunidades" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="oportunidades">Oportunidades de mejora</TabsTrigger>
          <TabsTrigger value="id">Investigación + Desarrollo (I+D)</TabsTrigger>
        </TabsList>

        {/* Tab: Oportunidades de mejora (INTERNO) */}
        <TabsContent value="oportunidades" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="dashboard-stat">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <Badge variant="outline" className="text-[10px] bg-primary/5">
                  <Building2 className="w-3 h-3 mr-1" />
                  INTERNO
                </Badge>
              </div>
              <div className="text-3xl font-bold text-foreground">{opportunities.length}</div>
              <div className="text-sm text-muted-foreground">detectadas</div>
            </div>
            
            <div className="dashboard-stat">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div className="text-3xl font-bold text-foreground">{highImpactCount}</div>
              <div className="text-sm text-muted-foreground">alto impacto</div>
            </div>
            
            <div className="dashboard-stat">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-warning" />
              </div>
              <div className="text-3xl font-bold text-foreground">{quickWinsCount}</div>
              <div className="text-sm text-muted-foreground">quick wins</div>
            </div>
            
            <div className="dashboard-stat">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-accent" />
              </div>
              <div className="text-3xl font-bold text-foreground">-</div>
              <div className="text-sm text-muted-foreground">convertidas</div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="dashboard-card p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Filtros:</span>
              </div>
              
              <Select value={areaFilter} onValueChange={setAreaFilter}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Área" />
                </SelectTrigger>
                <SelectContent>
                  {AREA_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Switch
                  id="highlighted"
                  checked={showHighlighted}
                  onCheckedChange={setShowHighlighted}
                />
                <Label htmlFor="highlighted" className="text-sm cursor-pointer">
                  Destacadas
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-[200px]">
                        Destacadas = alto impacto y bajo esfuerzo (las más recomendadas para empezar)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px] h-9">
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Opportunities Table */}
          {filteredOpportunities.length === 0 ? (
            <div className="dashboard-card p-12 text-center">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                {showHighlighted ? "No hay oportunidades destacadas" : "Escaneando oportunidades..."}
              </h2>
              <p className="text-muted-foreground">
                {showHighlighted ? "Prueba quitando el filtro" : "El sistema está analizando tu negocio"}
              </p>
            </div>
          ) : (
            <div className="dashboard-card overflow-hidden">
              <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Oportunidades detectadas</h3>
                <span className="text-sm text-muted-foreground">{filteredOpportunities.length} resultados</span>
              </div>
              
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-secondary/20 text-sm font-medium text-muted-foreground">
                <div className="col-span-1">Tipo</div>
                <div className="col-span-5">Oportunidad</div>
                <div className="col-span-2 text-center">Impacto</div>
                <div className="col-span-2 text-center">Esfuerzo</div>
                <div className="col-span-2 text-right">Acciones</div>
              </div>
              
              {/* Table Rows */}
              <div className="divide-y divide-border">
                {filteredOpportunities.map((opportunity) => (
                  <div 
                    key={opportunity.id}
                    className="grid grid-cols-12 gap-4 p-4 hover:bg-secondary/30 transition-colors items-center cursor-pointer"
                    onClick={() => setSelectedOpportunity(opportunity)}
                  >
                    <div className="col-span-1">
                      <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20 whitespace-nowrap">
                        INTERNO
                      </Badge>
                    </div>
                    
                    <div className="col-span-5">
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{getSourceIcon(opportunity.source)}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">
                            {opportunity.title}
                          </h4>
                          {opportunity.description && (
                            <p className="text-sm text-muted-foreground truncate mt-0.5">
                              {opportunity.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-2 text-center">
                      <ImpactDots score={opportunity.impact_score} type="impact" />
                    </div>
                    
                    <div className="col-span-2 text-center">
                      <ImpactDots score={opportunity.effort_score} type="effort" />
                    </div>
                    
                    <div className="col-span-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); setSelectedOpportunity(opportunity); }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); dismissOpportunity(opportunity.id); }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); convertToMission(opportunity); }}
                          disabled={actionLoading}
                        >
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab: I+D (EXTERNO) */}
        <TabsContent value="id" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="dashboard-stat">
              <div className="flex items-center justify-between mb-2">
                <Globe className="w-5 h-5 text-accent" />
                <Badge variant="outline" className="text-[10px] bg-accent/5">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  EXTERNO
                </Badge>
              </div>
              <div className="text-3xl font-bold text-foreground">{learningItems.filter(i => !i.is_saved).length}</div>
              <div className="text-sm text-muted-foreground">nuevos insights</div>
            </div>
            
            <div className="dashboard-stat">
              <div className="flex items-center justify-between mb-2">
                <Lightbulb className="w-5 h-5 text-warning" />
              </div>
              <div className="text-3xl font-bold text-foreground">
                {learningItems.filter(i => i.item_type === "trend").length}
              </div>
              <div className="text-sm text-muted-foreground">tendencias</div>
            </div>
            
            <div className="dashboard-stat">
              <div className="flex items-center justify-between mb-2">
                <BookmarkCheck className="w-5 h-5 text-success" />
              </div>
              <div className="text-3xl font-bold text-foreground">
                {learningItems.filter(i => i.is_saved).length}
              </div>
              <div className="text-sm text-muted-foreground">guardados</div>
            </div>
            
            <div className="dashboard-stat">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">
                {learningItems.filter(i => i.item_type === "opportunity").length}
              </div>
              <div className="text-sm text-muted-foreground">oportunidades</div>
            </div>
          </div>

          {/* I+D Items Grid */}
          {learningItems.filter(i => !i.is_saved).length === 0 ? (
            <div className="dashboard-card p-12 text-center">
              <Globe className="w-12 h-12 text-accent mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                Buscando tendencias y oportunidades externas...
              </h2>
              <p className="text-muted-foreground">
                El sistema está analizando el mercado para tu tipo de negocio
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {learningItems.filter(i => !i.is_saved).map((item) => (
                <div 
                  key={item.id}
                  className="dashboard-card p-5 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => setSelectedLearning(item)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] bg-accent/5 border-accent/20">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        EXTERNO
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        I+D | {item.item_type === "trend" ? "Investigación" : "Desarrollo"}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); toggleSaveLearning(item.id); }}
                    >
                      {item.is_saved ? (
                        <BookmarkCheck className="w-4 h-4 text-primary" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  
                  {item.content && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {item.content}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {ID_NATURES[Math.floor(Math.random() * ID_NATURES.length)]}
                    </Badge>
                    <Button size="sm" variant="ghost" className="text-xs">
                      Ver más <Eye className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Saved/Backlog Section */}
          {learningItems.filter(i => i.is_saved).length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-primary" />
                Guardados / Backlog
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {learningItems.filter(i => i.is_saved).map((item) => (
                  <div 
                    key={item.id}
                    className="dashboard-card p-4 border-dashed"
                    onClick={() => setSelectedLearning(item)}
                  >
                    <div className="flex items-start gap-3">
                      <BookmarkCheck className="w-4 h-4 text-primary mt-1" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm truncate">{item.title}</h4>
                        <p className="text-xs text-muted-foreground capitalize mt-1">{item.item_type}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Opportunity Preview Dialog */}
      <Dialog open={!!selectedOpportunity} onOpenChange={() => setSelectedOpportunity(null)}>
        <DialogContent className="max-w-lg">
          {selectedOpportunity && (
            <OpportunityPreview 
              opportunity={selectedOpportunity}
              onDismiss={() => dismissOpportunity(selectedOpportunity.id)}
              onAccept={() => convertToMission(selectedOpportunity)}
              actionLoading={actionLoading}
              getConfidenceLabel={getConfidenceLabel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Learning Preview Dialog */}
      <Dialog open={!!selectedLearning} onOpenChange={() => setSelectedLearning(null)}>
        <DialogContent className="max-w-lg">
          {selectedLearning && (
            <LearningPreview 
              item={selectedLearning}
              onDismiss={() => dismissLearning(selectedLearning.id)}
              onSave={() => toggleSaveLearning(selectedLearning.id)}
              onClose={() => setSelectedLearning(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper Components
const ImpactDots = ({ score, type }: { score: number; type: "impact" | "effort" }) => (
  <div className="inline-flex items-center gap-1">
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div 
          key={i} 
          className={cn(
            "w-2 h-2 rounded-full",
            i < Math.ceil(score / 2)
              ? type === "impact" ? "bg-success" : "bg-warning"
              : "bg-muted"
          )}
        />
      ))}
    </div>
    <span className="text-sm text-muted-foreground ml-1">
      {score}/10
    </span>
  </div>
);

const OpportunityPreview = ({ 
  opportunity, 
  onDismiss, 
  onAccept, 
  actionLoading,
  getConfidenceLabel 
}: { 
  opportunity: Opportunity;
  onDismiss: () => void;
  onAccept: () => void;
  actionLoading: boolean;
  getConfidenceLabel: (impact: number, hasData: boolean) => { label: string; color: string; note: string };
}) => {
  const hasIntegrations = true; // TODO: Check actual integrations
  const confidence = getConfidenceLabel(opportunity.impact_score, hasIntegrations);
  
  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20">
            <Building2 className="w-3 h-3 mr-1" />
            INTERNO
          </Badge>
        </div>
        <DialogTitle className="text-xl">{opportunity.title}</DialogTitle>
        <DialogDescription>
          Basado en tus datos e integraciones
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        {/* What it provides */}
        <div className="p-4 rounded-xl bg-success/5 border border-success/20">
          <h4 className="font-semibold text-success mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Qué te brinda esta oportunidad
          </h4>
          <p className="text-sm text-foreground">
            {opportunity.description || "Mejora potencial en el área detectada para tu negocio."}
          </p>
        </div>

        {/* Why it appeared */}
        <div className="p-4 rounded-xl bg-secondary/50">
          <h4 className="font-semibold text-foreground mb-2">Por qué apareció</h4>
          <p className="text-sm text-muted-foreground">
            Detectada a partir del análisis de tu diagnóstico y datos disponibles.
          </p>
        </div>

        {/* Suggested steps */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">Pasos sugeridos</h4>
          <div className="space-y-2">
            {["Analizar la situación actual", "Definir objetivos concretos", "Implementar cambios", "Medir resultados"].map((step, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                  {idx + 1}
                </div>
                <span className="text-sm text-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Impact estimation */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-success/5 border border-success/20 text-center">
            <div className="text-3xl font-bold text-success">{opportunity.impact_score}/10</div>
            <div className="text-xs text-muted-foreground mt-1">Impacto estimado</div>
          </div>
          <div className="p-4 rounded-xl bg-warning/5 border border-warning/20 text-center">
            <div className="text-3xl font-bold text-warning">{opportunity.effort_score}/10</div>
            <div className="text-xs text-muted-foreground mt-1">Esfuerzo requerido</div>
          </div>
        </div>

        {/* Confidence note */}
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <p className={cn("text-sm font-medium", confidence.color)}>
            Confianza: {confidence.label}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {confidence.note}. Con más integraciones/datos, será más precisa.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onDismiss}>
            <ThumbsDown className="w-4 h-4 mr-1" />
            No me interesa
          </Button>
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Ya lo sé
          </Button>
          <Button size="sm" className="flex-1 gradient-primary" onClick={onAccept} disabled={actionLoading}>
            <Target className="w-4 h-4 mr-1" />
            Aplicar
          </Button>
        </div>
      </div>
    </>
  );
};

const LearningPreview = ({ 
  item, 
  onDismiss, 
  onSave,
  onClose
}: { 
  item: LearningItem;
  onDismiss: () => void;
  onSave: () => void;
  onClose: () => void;
}) => {
  const steps = item.action_steps as string[] || [];
  
  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-[10px] bg-accent/5 border-accent/20">
            <ExternalLink className="w-3 h-3 mr-1" />
            EXTERNO
          </Badge>
          <Badge variant="secondary" className="text-[10px] capitalize">
            I+D | {item.item_type === "trend" ? "Investigación" : "Desarrollo"}
          </Badge>
        </div>
        <DialogTitle className="text-xl">{item.title}</DialogTitle>
        <DialogDescription>
          Basado en tendencias y señales del mercado
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        {/* Why we suggest it */}
        <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
          <h4 className="font-semibold text-accent mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Por qué te lo sugiero
          </h4>
          <p className="text-sm text-foreground">
            {item.content || "Tendencia detectada en tu industria que podría beneficiar a tu negocio."}
          </p>
        </div>

        {/* Action steps */}
        {steps.length > 0 && (
          <div>
            <h4 className="font-semibold text-foreground mb-3">Acción concreta</h4>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-medium">
                    {idx + 1}
                  </div>
                  <span className="text-sm text-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confidence */}
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Confianza:</span>
            <Badge variant="outline" className="text-success">Alta</Badge>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Basado en: Tendencia de mercado
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onDismiss}>
            <ThumbsDown className="w-4 h-4 mr-1" />
            No me interesa
          </Button>
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Ya lo sé
          </Button>
          <Button variant="outline" size="sm" onClick={onSave}>
            {item.is_saved ? (
              <>
                <BookmarkCheck className="w-4 h-4 mr-1" />
                Guardado
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 mr-1" />
                Guardar
              </>
            )}
          </Button>
          <Button size="sm" className="flex-1" onClick={onClose}>
            <Sparkles className="w-4 h-4 mr-1" />
            Probar
          </Button>
        </div>
      </div>
    </>
  );
};

export default RadarPage;
