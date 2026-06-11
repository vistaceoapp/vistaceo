import { useState, useEffect } from 'react';
import {
  Sparkles, RefreshCw, ArrowRight, ChevronDown, ChevronUp,
  TrendingUp, Target, Eye, Crosshair, BarChart3, Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { buildContextPack } from '@/lib/context-pack-builder';
import { useBusiness } from '@/contexts/BusinessContext';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { invokeEdgeFunctionSafe } from '@/lib/edge-function-caller';

interface Signal {
  type: 'opportunity' | 'competitive' | 'prediction' | 'mission' | 'trend' | 'risk';
  label: string;
  title: string;
  description: string;
}

interface SummaryData {
  summary_text: string;
  headline: string;
  priorities: string[];
  mood: string;
  confidence_note: string;
  signals: Signal[];
}

const SIGNAL_STYLES: Record<Signal['type'], { icon: any; accent: string; iconBg: string }> = {
  opportunity: { icon: TrendingUp, accent: 'border-l-blue-500', iconBg: 'bg-blue-500/10 text-blue-600' },
  competitive: { icon: Crosshair, accent: 'border-l-violet-500', iconBg: 'bg-violet-500/10 text-violet-600' },
  prediction: { icon: Eye, accent: 'border-l-blue-500', iconBg: 'bg-blue-500/10 text-blue-600' },
  mission: { icon: Target, accent: 'border-l-blue-500', iconBg: 'bg-blue-500/10 text-blue-600' },
  trend: { icon: BarChart3, accent: 'border-l-blue-500', iconBg: 'bg-blue-500/10 text-blue-600' },
  risk: { icon: Shield, accent: 'border-l-red-500', iconBg: 'bg-red-500/10 text-red-600' },
};

export const AIDailySummary = () => {
  const { currentBusiness } = useBusiness();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [showVision, setShowVision] = useState(true);

  useEffect(() => {
    if (currentBusiness) fetchOrGenerate();
  }, [currentBusiness?.id]);

  const fetchOrGenerate = async () => {
    if (!currentBusiness) return;
    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: existing } = await supabase
        .from('business_daily_summaries')
        .select('*')
        .eq('business_id', currentBusiness.id)
        .eq('summary_date', today)
        .maybeSingle();

      if (existing) {
        const metrics = existing.key_metrics as Record<string, any> | null;
        const signals = Array.isArray(metrics?.signals) ? metrics!.signals : [];
        setSummary({
          summary_text: existing.summary_text,
          headline: metrics?.headline || '',
          priorities: Array.isArray(existing.priorities) ? (existing.priorities as string[]) : [],
          mood: existing.mood || 'neutral',
          confidence_note: metrics?.confidence_note || '',
          signals,
        });
        // No auto-regenerar: si no hay signals, el usuario puede tocar refresh.
        setLoading(false);
        return;
      }

      await generateSummary();
    } catch (err) {
      console.error('[daily-summary] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    if (!currentBusiness) return;
    setGenerating(true);

    try {
      const contextPack = await buildContextPack('dashboard', currentBusiness.id).catch(() => null);
      const { data, error } = await invokeEdgeFunctionSafe('generate-daily-summary', {
        body: { businessId: currentBusiness.id, module: 'dashboard', contextPack, outputContract: 'daily_summary_v1' }
      });

      if (error) throw error;

      if (data?.summary) {
        setSummary({
          summary_text: data.summary.summary_text || '',
          headline: data.summary.headline || '',
          priorities: data.summary.priorities || [],
          mood: data.summary.mood || 'neutral',
          confidence_note: data.summary.confidence_note || '',
          signals: Array.isArray(data.summary.signals) ? data.summary.signals : [],
        });
      }
    } catch (err) {
      console.error('[daily-summary] Generation error:', err);
      setSummary({
        summary_text: `Estamos analizando ${currentBusiness.name}. Cuanto más interactúes con el sistema, más preciso será tu diagnóstico.`,
        headline: 'Analizando tu negocio',
        priorities: ['Completá tu perfil en el chat', 'Explorá las misiones disponibles'],
        mood: 'neutral',
        confidence_note: 'Necesitamos más información para un análisis preciso.',
        signals: [],
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 animate-pulse" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 w-44 bg-muted/40 rounded animate-pulse" />
            <div className="h-3 w-28 bg-muted/30 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const signalCount = summary.signals?.length || 0;

  return (
    <div
      className="rounded-2xl border border-border/50 bg-card overflow-hidden animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-5 sm:p-6 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-[15px] font-semibold text-foreground leading-tight">
              Centro de inteligencia
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {signalCount > 0 ? `${signalCount} señales activas` : 'Visión estratégica'}
              {currentBusiness?.name && ` · ${currentBusiness.name}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            En vivo
          </span>
          <button
            onClick={() => { setSummary(null); generateSummary(); }}
            disabled={generating}
            className="text-muted-foreground/50 hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted/30"
            title="Regenerar análisis"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', generating && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Signals grid */}
      {signalCount > 0 ? (
        <div className="px-5 sm:px-6 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {summary.signals.map((signal, i) => {
              const style = SIGNAL_STYLES[signal.type] || SIGNAL_STYLES.opportunity;
              const Icon = style.icon;
              return (
                <div
                  key={i}
                  className={cn(
                    "rounded-xl border border-border/40 bg-background/50 p-3.5 border-l-[3px] hover:border-border/70 transition-colors",
                    style.accent
                  )}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={cn("w-5 h-5 rounded-md flex items-center justify-center shrink-0", style.iconBg)}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider text-foreground/60 uppercase">
                      {signal.label}
                    </span>
                  </div>
                  <p className="text-[13px] font-semibold text-foreground leading-snug mb-1">
                    {signal.title}
                  </p>
                  <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                    {signal.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="px-5 sm:px-6 pb-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: TrendingUp, label: 'Radar', title: 'Activá tu radar', desc: 'Detectá oportunidades reales de tu sector cada día.', accent: 'border-l-blue-500', iconBg: 'bg-blue-500/10 text-blue-600', to: '/app/radar' },
              { icon: Target, label: 'Misión', title: 'Empezá la primera misión', desc: 'Una acción concreta priorizada por la IA.', accent: 'border-l-violet-500', iconBg: 'bg-violet-500/10 text-violet-600', to: '/app/missions' },
              { icon: Eye, label: 'Predicción', title: 'Predicción semanal', desc: 'Qué puede pasar en tu negocio en los próximos 7 días.', accent: 'border-l-blue-500', iconBg: 'bg-blue-500/10 text-blue-600', to: '/app/predictions' },
              { icon: Crosshair, label: 'Competencia', title: 'Mapeá tu competencia', desc: 'Qué hacen distinto y dónde podés ganar terreno.', accent: 'border-l-violet-500', iconBg: 'bg-violet-500/10 text-violet-600', to: '/app/analytics' },
            ].map((s, i) => (
              <button
                key={i}
                onClick={() => navigate(s.to)}
                className={cn(
                  "text-left rounded-xl border border-border/40 bg-background/50 p-3.5 border-l-[3px] hover:border-border/70 hover:bg-background/80 transition-all",
                  s.accent
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={cn("w-5 h-5 rounded-md flex items-center justify-center shrink-0", s.iconBg)}>
                    <s.icon className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider text-foreground/60 uppercase">
                    {s.label}
                  </span>
                </div>
                <p className="text-[13px] font-semibold text-foreground leading-snug mb-1">
                  {s.title}
                </p>
                <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </button>
            ))}
          </div>
          <button
            onClick={() => { setSummary(null); generateSummary(); }}
            disabled={generating}
            className="mt-3 w-full text-[11px] font-medium text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1.5"
          >
            <RefreshCw className={cn('w-3 h-3', generating && 'animate-spin')} />
            {generating ? 'Analizando señales en vivo…' : 'Generar señales en vivo de tu negocio'}
          </button>
        </div>
      )}

      {/* Visión estratégica narrativa (colapsable) */}
      {summary.summary_text && (
        <div className="px-5 sm:px-6 pb-4 border-t border-border/40 pt-4">
          <button
            onClick={() => setShowVision(!showVision)}
            className="flex items-center justify-between w-full text-left group"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
              Visión estratégica narrativa
            </span>
            {showVision ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
          {showVision && (
            <div
              className="mt-3 animate-fade-in"
            >
              <p className="text-[13px] text-foreground/85 leading-relaxed">
                {summary.summary_text}
              </p>
              {summary.priorities.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    {expanded ? '−' : '+'} {summary.priorities.length} prioridades estratégicas
                  </button>
                  {expanded && (
                    <div className="space-y-1.5 pl-1 mt-2">
                      {summary.priorities.map((p, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="w-4 h-4 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{typeof p === 'string' ? p : String(p)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {summary.confidence_note && (
                <p className="text-[10px] text-muted-foreground/60 italic mt-3">
                  {summary.confidence_note}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer CTA */}
      <div className="px-5 sm:px-6 py-3 border-t border-border/40 bg-muted/10 flex items-center justify-between gap-3">
        <span className="text-[11px] text-muted-foreground truncate">
          Adaptado a <span className="font-medium text-foreground/70">tu negocio</span>
        </span>
        <button
          onClick={() => navigate('/app/chat?prompt=' + encodeURIComponent('Dame un análisis profundo y estratégico de mi negocio'))}
          className="flex items-center gap-1.5 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors shrink-0"
        >
          Profundizar con la IA
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
