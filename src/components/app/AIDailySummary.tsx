import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, ArrowRight, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface DailySummaryData {
  summary_text: string;
  priorities: string[];
  mood: string;
}

export const AIDailySummary = () => {
  const { currentBusiness } = useBusiness();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DailySummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

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
        setSummary({
          summary_text: existing.summary_text,
          priorities: Array.isArray(existing.priorities) ? (existing.priorities as string[]) : [],
          mood: existing.mood || 'neutral',
        });
        setLoading(false);
        return;
      }

      // Generate new summary
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
          summary_text: data.summary.summary_text || data.summary,
          priorities: data.summary.priorities || [],
          mood: data.summary.mood || 'neutral',
        });
      }
    } catch (err) {
      console.error('[daily-summary] Generation error:', err);
      // Fallback summary
      setSummary({
        summary_text: `Hoy es un buen día para enfocarte en lo que más importa para ${currentBusiness.name}. Revisá tus misiones activas y el radar de oportunidades.`,
        priorities: ['Revisar misiones pendientes', 'Explorar oportunidades del radar'],
        mood: 'neutral',
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-muted/50" />
          <div className="h-4 w-32 bg-muted/50 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-muted/30 rounded" />
          <div className="h-3 w-3/4 bg-muted/30 rounded" />
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const moodEmoji = summary.mood === 'positive' ? '🟢' : summary.mood === 'negative' ? '🔴' : '🔵';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/50 bg-card overflow-hidden"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">
                Resumen del día
              </h3>
            </div>
          </div>
          <button
            onClick={() => { setSummary(null); generateSummary(); }}
            disabled={generating}
            className="text-muted-foreground/60 hover:text-foreground transition-colors p-1"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', generating && 'animate-spin')} />
          </button>
        </div>

        {/* Summary text */}
        <p className="text-sm text-foreground/90 leading-relaxed mb-3">
          {moodEmoji} {summary.summary_text}
        </p>

        {/* Priorities */}
        {summary.priorities.length > 0 && (
          <div className="space-y-1.5 mb-4">
            {summary.priorities.slice(0, 3).map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                <span>{typeof p === 'string' ? p : String(p)}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-8 text-[11px] gap-1.5 text-primary hover:text-primary rounded-xl"
            onClick={() => navigate('/app/chat?prompt=' + encodeURIComponent('Dame un análisis detallado de cómo está mi negocio hoy y qué debería priorizar'))}
          >
            <MessageCircle className="w-3 h-3" />
            Profundizar con IA
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-8 text-[11px] gap-1.5 rounded-xl"
            onClick={() => navigate('/app/missions')}
          >
            Ver misiones
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
