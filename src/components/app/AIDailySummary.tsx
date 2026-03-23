import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface SummaryData {
  summary_text: string;
  headline: string;
  priorities: string[];
  mood: string;
  confidence_note: string;
}

export const AIDailySummary = () => {
  const { currentBusiness } = useBusiness();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(false);

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
        setSummary({
          summary_text: existing.summary_text,
          headline: metrics?.headline || '',
          priorities: Array.isArray(existing.priorities) ? (existing.priorities as string[]) : [],
          mood: existing.mood || 'neutral',
          confidence_note: metrics?.confidence_note || '',
        });
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
      const { data, error } = await supabase.functions.invoke('generate-daily-summary', {
        body: { businessId: currentBusiness.id }
      });

      if (error) throw error;

      if (data?.summary) {
        setSummary({
          summary_text: data.summary.summary_text || '',
          headline: data.summary.headline || '',
          priorities: data.summary.priorities || [],
          mood: data.summary.mood || 'neutral',
          confidence_note: data.summary.confidence_note || '',
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
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 animate-pulse" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 w-40 bg-muted/40 rounded animate-pulse" />
            <div className="h-3 w-24 bg-muted/30 rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-muted/20 rounded animate-pulse" />
          <div className="h-3 w-4/5 bg-muted/20 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const moodConfig = {
    positive: { emoji: '🟢', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    negative: { emoji: '🔴', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    neutral: { emoji: '🔵', bg: 'bg-primary/10', border: 'border-primary/20' },
  };

  const mood = moodConfig[summary.mood as keyof typeof moodConfig] || moodConfig.neutral;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-2xl border bg-card overflow-hidden", mood.border)}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", mood.bg)}>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              {summary.headline && (
                <h3 className="text-sm font-semibold text-foreground leading-tight">
                  {mood.emoji} {summary.headline}
                </h3>
              )}
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Visión estratégica · {currentBusiness?.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => { setSummary(null); generateSummary(); }}
            disabled={generating}
            className="text-muted-foreground/50 hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted/30"
            title="Regenerar análisis"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', generating && 'animate-spin')} />
          </button>
        </div>

        {/* Summary */}
        <p className="text-[13px] text-foreground/85 leading-relaxed mb-4">
          {summary.summary_text}
        </p>

        {/* Expandable priorities */}
        {summary.priorities.length > 0 && (
          <div className="mb-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {summary.priorities.length} prioridades estratégicas
            </button>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="space-y-1.5 pl-1"
              >
                {summary.priorities.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="w-4 h-4 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{typeof p === 'string' ? p : String(p)}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Confidence note */}
        {summary.confidence_note && (
          <p className="text-[10px] text-muted-foreground/60 italic mb-3">
            {summary.confidence_note}
          </p>
        )}

        {/* CTA */}
        <button
          onClick={() => navigate('/app/chat?prompt=' + encodeURIComponent('Dame un análisis profundo y estratégico de mi negocio'))}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/8 hover:bg-primary/12 text-primary text-xs font-medium transition-colors"
        >
          Profundizar con la IA
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
