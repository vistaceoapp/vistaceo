import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Sparkles, MessageSquare, Radar, Layers, Target, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Etiquetas humanas para las claves de memoria factual del Brain.
const FACT_LABELS: Record<string, string> = {
  offer: "Oferta principal",
  offers: "Ofertas",
  customer: "Cliente objetivo",
  customer_segment: "Segmento de clientes",
  channel: "Canal principal",
  channels: "Canales",
  niche: "Nicho",
  business_model: "Modelo de ingresos",
  stage: "Etapa del negocio",
  city: "Ciudad",
  region: "Provincia / Región",
  geo_scope: "Alcance geográfico",
  value_prop: "Propuesta de valor",
  differentiator: "Diferencial",
  price_range: "Rango de precios",
  ticket_size: "Ticket promedio",
  sales_cycle: "Ciclo de venta",
  seasonality: "Estacionalidad",
  team_size: "Tamaño del equipo",
  main_friction: "Fricción principal",
  main_goal: "Objetivo principal",
  competitors: "Competidores",
  tools: "Herramientas que usa",
  schedule: "Horarios",
  suppliers: "Proveedores",
};

const humanizeKey = (key: string) =>
  FACT_LABELS[key] ??
  key
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());

const humanizeValue = (value: unknown): string | null => {
  if (value === null || value === undefined || value === "") return null;
  if (Array.isArray(value)) {
    const items = value.map((v) => humanizeValue(v)).filter(Boolean) as string[];
    return items.length ? items.join(", ") : null;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const inner = obj.value ?? obj.label ?? obj.text ?? obj.name;
    if (typeof inner === "string" || typeof inner === "number") return String(inner);
    return null;
  }
  if (typeof value === "boolean") return value ? "Sí" : "No";
  return String(value);
};

interface FactRow {
  key: string;
  label: string;
  value: string;
}

const ENTITY_LABELS: Record<string, string> = {
  issue: "Problema detectado",
  product: "Producto / servicio",
  competitor: "Competidor",
  channel: "Canal",
  customer: "Cliente",
  place: "Lugar",
  person: "Persona",
};

export default function MemoryPage() {
  const { currentBusiness } = useBusiness();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [brain, setBrain] = useState<Record<string, unknown> | null>(null);
  const [entities, setEntities] = useState<Array<Record<string, unknown>>>([]);
  const [learnings, setLearnings] = useState<Array<Record<string, unknown>>>([]);
  const [signals, setSignals] = useState<Array<Record<string, unknown>>>([]);
  const [prefs, setPrefs] = useState<Record<string, unknown> | null>(null);
  const [chatMemory, setChatMemory] = useState<{
    total: number;
    firstAt: string | null;
    openLoops: string[];
  }>({ total: 0, firstAt: null, openLoops: [] });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!currentBusiness?.id) return;
      setLoading(true);
      try {
        const [b, e, l, s, p, c] = await Promise.all([
          supabase.from("business_brains").select("*").eq("business_id", currentBusiness.id).maybeSingle(),
          supabase
            .from("canonical_entities")
            .select("entity_type, display_name, mention_count, last_seen_at")
            .eq("business_id", currentBusiness.id)
            .order("mention_count", { ascending: false })
            .limit(18),
          supabase
            .from("learning_items")
            .select("title, content, item_type, created_at")
            .eq("business_id", currentBusiness.id)
            .order("created_at", { ascending: false })
            .limit(8),
          supabase
            .from("signals")
            .select("raw_text, content, signal_type, source, created_at")
            .eq("business_id", currentBusiness.id)
            .order("created_at", { ascending: false })
            .limit(10),
          user
            ? supabase.from("user_chat_preferences").select("*").eq("user_id", user.id).maybeSingle()
            : Promise.resolve({ data: null } as never),
          supabase
            .from("chat_messages")
            .select("role, content, created_at")
            .eq("business_id", currentBusiness.id)
            .order("created_at", { ascending: false })
            .limit(300),
        ]);
        if (cancelled) return;
        setBrain((b.data as Record<string, unknown>) ?? null);
        setEntities((e.data as Array<Record<string, unknown>>) ?? []);
        setLearnings((l.data as Array<Record<string, unknown>>) ?? []);
        setSignals((s.data as Array<Record<string, unknown>>) ?? []);
        setPrefs(((p as { data?: Record<string, unknown> })?.data) ?? null);
        const rows = ((c as { data?: Array<{ role: string; content: string; created_at: string }> })?.data) ?? [];
        const loopRx =
          /(te (?:aviso|confirmo|paso|mando)|voy a (?:probar|hacer|implementar|lanzar|revisar)|quedamos en|pendiente de|todavía no (?:pude|hice|arranqué))/i;
        setChatMemory({
          total: rows.length,
          firstAt: rows.length ? rows[rows.length - 1].created_at : null,
          openLoops: rows
            .filter((r) => r.role === "user" && loopRx.test(String(r.content ?? "")))
            .slice(0, 4)
            .map((r) => String(r.content).slice(0, 160)),
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [currentBusiness?.id, user]);

  const facts: FactRow[] = useMemo(() => {
    const sources = [
      brain?.factual_memory,
      brain?.offer_profile,
      brain?.customer_profile,
      brain?.dynamic_memory,
    ].filter(Boolean) as Array<Record<string, unknown>>;
    const seen = new Set<string>();
    const rows: FactRow[] = [];
    for (const src of sources) {
      for (const [key, raw] of Object.entries(src)) {
        if (seen.has(key)) continue;
        const value = humanizeValue(raw);
        if (!value || value.length > 220) continue;
        seen.add(key);
        rows.push({ key, label: humanizeKey(key), value });
      }
    }
    return rows;
  }, [brain]);

  const confidence = Number(brain?.confidence_score ?? 0);
  const precision = Math.round(Number(brain?.mvc_completion_pct ?? 0));
  const totalSignals = Number(brain?.total_signals ?? 0);

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-4 max-w-5xl mx-auto">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isEmpty = facts.length === 0 && entities.length === 0 && learnings.length === 0;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">Lo que VISTACEO sabe de tu negocio</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Todo lo que el sistema aprendió del chat, del setup y de las señales que fue detectando. Esta memoria alimenta
          tus misiones, oportunidades, radar y predicciones.
        </p>
      </header>

      <Card>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Precisión del perfil</p>
            <Progress value={precision} className="h-2" />
            <p className="text-sm font-medium text-foreground">{precision}%</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Certeza del análisis</p>
            <Progress value={Math.round(confidence * (confidence <= 1 ? 100 : 1))} className="h-2" />
            <p className="text-sm font-medium text-foreground">
              {Math.round(confidence * (confidence <= 1 ? 100 : 1))}%
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Señales procesadas</p>
            <p className="text-2xl font-semibold text-foreground">{totalSignals}</p>
            <p className="text-xs text-muted-foreground">{facts.length} datos confirmados</p>
          </div>
        </CardContent>
      </Card>

      {isEmpty && (
        <Card>
          <CardContent className="py-10 text-center space-y-3">
            <Sparkles className="w-6 h-6 text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">
              Todavía no hay suficiente aprendizaje registrado. Contale algo de tu negocio en el chat y esta memoria
              empieza a construirse sola.
            </p>
            <Button onClick={() => navigate("/app/chat")}>Ir al chat</Button>
          </CardContent>
        </Card>
      )}

      {facts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="w-4 h-4 text-primary" />
              Datos confirmados de tu negocio
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {facts.map((f) => (
              <div key={f.key} className="rounded-lg border border-border/60 p-3">
                <p className="text-xs text-muted-foreground">{f.label}</p>
                <p className="text-sm text-foreground mt-0.5">{f.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {entities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-4 h-4 text-primary" />
              Temas y entidades que más aparecen
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {entities.map((e, i) => (
              <Badge key={i} variant="secondary" className="gap-1">
                {String(e.display_name ?? "")}
                <span className="text-muted-foreground">
                  · {ENTITY_LABELS[String(e.entity_type)] ?? String(e.entity_type)} ({Number(e.mention_count ?? 0)})
                </span>
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {learnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-4 h-4 text-primary" />
              Conclusiones que sacó el sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {learnings.map((l, i) => (
              <div key={i} className="rounded-lg border border-border/60 p-3">
                <p className="text-sm font-medium text-foreground">{String(l.title ?? "")}</p>
                {l.content && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{String(l.content)}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {signals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Radar className="w-4 h-4 text-primary" />
              Últimas señales captadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {signals.map((s, i) => {
              const text = String(s.raw_text ?? s.content ?? "").slice(0, 180);
              if (!text) return null;
              return (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <p className="text-muted-foreground">
                    {text}
                    <span className="text-xs text-muted-foreground/70"> · {String(s.source ?? s.signal_type ?? "")}</span>
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {prefs && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="w-4 h-4 text-primary" />
              Cómo aprendió a hablarte
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 text-sm">
            {[
              ["Tono", prefs.tone],
              ["Extensión", prefs.length_pref],
              ["Nivel de detalle", prefs.detail_level],
              ["Formalidad", prefs.formality],
              ["Temas de foco", Array.isArray(prefs.focus_areas) ? (prefs.focus_areas as string[]).join(", ") : null],
            ]
              .filter(([, v]) => v)
              .map(([label, v]) => (
                <Badge key={String(label)} variant="outline">
                  {String(label)}: {String(v)}
                </Badge>
              ))}
          </CardContent>
        </Card>
      )}

      <button
        onClick={() => navigate("/app/chat")}
        className="w-full flex items-center gap-3 p-4 rounded-xl border border-border/60 hover:bg-secondary/50 transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Brain className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm text-foreground">Enseñale algo nuevo</p>
          <p className="text-xs text-muted-foreground">Cada dato que sumás hace más precisas tus misiones y oportunidades</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}
