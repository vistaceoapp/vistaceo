// Setup Step: AI-First Identity Detection
// Textarea → 3 smart options → profile selection
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Loader2, Check, Wand2, ChevronRight, RotateCcw, List, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface ProfileOption {
  title: string;
  catalog_id: string | null;
  sector_id: string;
  sector_label: string;
  subtype: string;
  tags: string[];
  reason: string;
  origin: 'catalogo' | 'a_medida';
  confidence: 'alta' | 'media' | 'baja';
  precision_percent: number;
  universal_profile: {
    display_name: string;
    activity_type: string;
    parent_sector: string;
    subtype: string;
    keywords: string[];
    offerings: string[];
    customer_type: string;
    channels: string[];
    business_model: string;
    success_metrics: string[];
    primary_pains: string[];
    opportunity_angles: string[];
    tone_and_context: string;
  };
}

interface SuggestResponse {
  options: ProfileOption[];
  needs_clarification: boolean;
  confidence_top: string;
}

interface SetupStepIdentityAIProps {
  onSelect: (option: ProfileOption, rawText: string) => void;
  onManualFallback: () => void;
}

const EXAMPLE_CHIPS = [
  { text: 'Tengo una pizzería en Buenos Aires', emoji: '🍕' },
  { text: 'Soy abogado penalista', emoji: '⚖️' },
  { text: 'Vendo cursos online de edición de video', emoji: '🎬' },
  { text: 'Tengo un taller mecánico', emoji: '🔧' },
  { text: 'Hago instalaciones solares', emoji: '☀️' },
  { text: 'Coaching de negocios y consultoría', emoji: '💼' },
];

type UIState = 'writing' | 'thinking' | 'results' | 'error';

export const SetupStepIdentityAI = ({ onSelect, onManualFallback }: SetupStepIdentityAIProps) => {
  const [text, setText] = useState('');
  const [state, setState] = useState<UIState>('writing');
  const [options, setOptions] = useState<ProfileOption[]>([]);
  const [thinkingProgress, setThinkingProgress] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSubmit = async () => {
    if (text.trim().length < 3) return;
    setState('thinking');
    setThinkingProgress(0);

    // Simulated progress
    const progressInterval = setInterval(() => {
      setThinkingProgress(prev => Math.min(prev + Math.random() * 15, 85));
    }, 400);

    try {
      const { data, error } = await supabase.functions.invoke('suggest-profiles', {
        body: { raw_text: text.trim(), locale: 'es' },
      });

      clearInterval(progressInterval);

      if (error || !data?.options || data.options.length !== 3) {
        console.error('suggest-profiles error:', error, data);
        setState('error');
        return;
      }

      // Auto-select if the AI is 100% confident on option 1
      if (data.auto_select === true && data.options[0]?.confidence === 'alta') {
        setThinkingProgress(100);
        setTimeout(() => {
          onSelect(data.options[0], text.trim());
        }, 600);
        return;
      }

      setThinkingProgress(100);
      setTimeout(() => {
        setOptions(data.options);
        setState('results');
      }, 300);
    } catch (err) {
      clearInterval(progressInterval);
      console.error('suggest-profiles exception:', err);
      setState('error');
    }
  };

  const handleReset = () => {
    setState('writing');
    setOptions([]);
    setThinkingProgress(0);
  };

  const handleChipClick = (chipText: string) => {
    setText(chipText);
    // Auto-submit after short delay
    setTimeout(() => {
      if (textareaRef.current) textareaRef.current.focus();
    }, 100);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-4"
        >
          <Brain className="w-4 h-4" />
          <span>Identidad IA</span>
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          ¿A qué te dedicás?
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Negocio, servicio o profesión. Escribilo como te salga. VistaCEO lo entiende y arma tu perfil.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* STATE: WRITING */}
        {state === 'writing' && (
          <motion.div
            key="writing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-5"
          >
            {/* Textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                placeholder="Ej: Tengo una pizzería en Bogotá, vendo por delivery y local..."
                className={cn(
                  "w-full min-h-[100px] max-h-[200px] resize-none rounded-2xl",
                  "border-2 border-border bg-card px-5 py-4 text-base",
                  "placeholder:text-muted-foreground/60",
                  "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                  "transition-all duration-200"
                )}
                rows={3}
              />
              {text.length > 0 && (
                <button
                  onClick={() => setText('')}
                  className="absolute top-3 right-3 text-muted-foreground/50 hover:text-muted-foreground p-1 rounded-full hover:bg-secondary transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Example chips */}
            <div className="flex flex-wrap gap-2 justify-center">
              {EXAMPLE_CHIPS.map((chip) => (
                <button
                  key={chip.text}
                  onClick={() => handleChipClick(chip.text)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs",
                    "bg-secondary/60 text-muted-foreground border border-border/50",
                    "hover:bg-primary/10 hover:text-primary hover:border-primary/30",
                    "transition-all duration-200"
                  )}
                >
                  <span>{chip.emoji}</span>
                  <span className="max-w-[180px] truncate">{chip.text}</span>
                </button>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 items-center pt-2">
              <Button
                onClick={handleSubmit}
                disabled={text.trim().length < 3}
                size="lg"
                className="w-full max-w-sm gap-2 text-base"
              >
                <Wand2 className="w-5 h-5" />
                Sugerirme 3 opciones
              </Button>

              <button
                onClick={onManualFallback}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <List className="w-4 h-4" />
                Elegir manualmente
              </button>
            </div>
          </motion.div>
        )}

        {/* STATE: THINKING */}
        {state === 'thinking' && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center space-y-6 py-8"
          >
            {/* Animated brain */}
            <div className="relative mx-auto w-20 h-20">
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20"
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <Brain className="w-10 h-10 text-primary-foreground" />
                </motion.div>
              </div>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-primary"
                  style={{ top: '50%', left: '50%' }}
                  animate={{
                    x: [0, 35 * Math.cos((i * 120 * Math.PI) / 180), 0],
                    y: [0, 35 * Math.sin((i * 120 * Math.PI) / 180), 0],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Analizando tu actividad...</h3>
              <p className="text-sm text-muted-foreground">"{text.slice(0, 60)}{text.length > 60 ? '...' : ''}"</p>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-xs mx-auto">
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  animate={{ width: `${thinkingProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Entendiendo...</span>
                <span>{Math.round(thinkingProgress)}%</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* STATE: RESULTS - 3 Cards Premium */}
        {state === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-5"
          >
            {/* Header */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Elegí la opción que mejor te describe
              </h3>
              <p className="text-sm text-muted-foreground">
                Con esto personalizamos tu cuenta desde ahora
              </p>
            </div>

            {/* 3 Cards - sorted by precision, highest first */}
            <div className="grid gap-3">
              {[...options]
                .map((option, originalIndex) => ({ option, originalIndex }))
                .sort((a, b) => (b.option.precision_percent ?? 0) - (a.option.precision_percent ?? 0))
                .map(({ option, originalIndex }, displayIndex) => {
                  const isTop = displayIndex === 0;
                  return (
                    <motion.button
                      key={originalIndex}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: displayIndex * 0.12 }}
                      onClick={() => onSelect(option, text.trim())}
                      className={cn(
                        "w-full text-left rounded-2xl border-2 transition-all duration-300 group relative overflow-hidden",
                        "p-4 md:p-5 pr-10 md:pr-12",
                        "hover:shadow-lg hover:scale-[1.005]",
                        isTop
                          ? 'border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 hover:border-primary hover:shadow-primary/20 ring-1 ring-primary/20'
                          : 'border-border bg-card hover:border-primary/30'
                      )}
                    >
                      {/* Labels row */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        {isTop && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                            <Check className="w-3 h-3" />
                            Recomendado
                          </span>
                        )}
                        {option.origin === 'a_medida' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent/10 text-accent-foreground text-[11px] font-semibold">
                            <Sparkles className="w-3 h-3" />
                            A medida
                          </span>
                        )}
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold",
                          (option.precision_percent ?? 0) >= 80
                            ? 'bg-primary/10 text-primary'
                            : (option.precision_percent ?? 0) >= 60
                              ? 'bg-secondary text-foreground'
                              : 'bg-secondary text-muted-foreground'
                        )}>
                          {option.precision_percent ?? 0}% precisión
                        </span>
                      </div>

                      {/* Title - wraps naturally */}
                      <h4 className="text-sm md:text-base font-semibold text-foreground leading-snug mb-1">
                        {option.title}
                      </h4>

                      {/* Sector + subtype */}
                      <p className="text-xs md:text-sm text-muted-foreground mb-2">
                        {option.sector_label} · {option.subtype}
                      </p>

                      {/* Reason - wraps, no truncate */}
                      <p className="text-xs text-muted-foreground/70 italic leading-relaxed mb-2">
                        {option.reason}
                      </p>

                      {/* Tags */}
                      {option.tags && option.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {option.tags.slice(0, 3).map((tag, ti) => (
                            <span key={ti} className="px-2 py-0.5 rounded-md bg-secondary text-[10px] text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Arrow */}
                      <ChevronRight className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/20 group-hover:text-primary transition-colors" />
                    </motion.button>
                  );
                })}
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4 pt-2">
              <button
                onClick={handleReset}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Reescribir
              </button>
              <button
                onClick={onManualFallback}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <List className="w-4 h-4" />
                Elegir manualmente
              </button>
            </div>
          </motion.div>
        )}

        {/* STATE: ERROR */}
        {state === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-5 py-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No pude analizarlo ahora</h3>
              <p className="text-sm text-muted-foreground">Elegí manualmente y seguimos.</p>
            </div>
            <div className="flex flex-col gap-3 items-center">
              <Button onClick={onManualFallback} className="gap-2">
                <List className="w-4 h-4" />
                Elegir manualmente
              </Button>
              <button
                onClick={handleReset}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Intentar de nuevo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
