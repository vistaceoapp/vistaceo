import { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { 
  Share2, Lightbulb, Target, AlertTriangle, HelpCircle,
  ArrowUp, Type, Minus, Plus, Clock, BookOpen,
  CheckSquare, Zap, BarChart3, ListChecks, Crosshair,
  Compass, Shield, Layers, Flame, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SmartSection {
  id: string;
  label: string;
  fullText: string;
  icon: React.ReactNode;
  score: number;
  type: 'insight' | 'action' | 'warning' | 'example' | 'conclusion' | 'comparison';
}

interface BlogReadingToolbarProps {
  content: string;
  title: string;
  slug: string;
  readingTime?: number;
  className?: string;
}

// Semantic scoring rules - higher score = more valuable to show
const SECTION_SIGNALS: Array<{
  pattern: RegExp;
  score: number;
  icon: React.ReactNode;
  type: SmartSection['type'];
  shortLabel?: string;
}> = [
  // MUST-HAVE: FAQ always appears if present
  { pattern: /preguntas?\s*frecuentes?|faq|faqs|dudas?\s*(comunes?|frecuentes?)/i, score: 99, icon: <HelpCircle className="h-3.5 w-3.5" />, type: 'insight', shortLabel: 'FAQ' },
  
  // HIGH VALUE - Actionable
  { pattern: /checklist|lista\s*de\s*verificaci[oó]n/i, score: 95, icon: <CheckSquare className="h-3.5 w-3.5" />, type: 'action', shortLabel: 'Checklist' },
  { pattern: /paso\s*a\s*paso|pasos?\s*(para|concretos?)/i, score: 93, icon: <ListChecks className="h-3.5 w-3.5" />, type: 'action', shortLabel: 'Pasos' },
  { pattern: /veredicto|conclusi[oó]n\s*(final)?/i, score: 92, icon: <Star className="h-3.5 w-3.5" />, type: 'conclusion', shortLabel: 'Veredicto' },
  { pattern: /errores?\s*(comunes?|t[ií]picos?|graves?|cr[ií]ticos?|que\s*evitar)/i, score: 91, icon: <AlertTriangle className="h-3.5 w-3.5" />, type: 'warning', shortLabel: 'Errores' },
  { pattern: /c[oó]mo\s+(empezar|implementar|aplicar|usar|hacer|medir|crear|lograr)/i, score: 90, icon: <Compass className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /implementaci[oó]n|puesta\s*en\s*marcha|ejecuci[oó]n/i, score: 89, icon: <Zap className="h-3.5 w-3.5" />, type: 'action', shortLabel: 'Implementación' },
  
  // HIGH VALUE - Insights
  { pattern: /ejemplo|caso\s*(real|pr[aá]ctico)|historia/i, score: 88, icon: <BookOpen className="h-3.5 w-3.5" />, type: 'example', shortLabel: 'Ejemplo' },
  { pattern: /ventajas?\s*y\s*desventajas?|pros?\s*y\s*contras?/i, score: 87, icon: <BarChart3 className="h-3.5 w-3.5" />, type: 'comparison' },
  { pattern: /vs\.?|versus|comparativa|comparaci[oó]n/i, score: 86, icon: <BarChart3 className="h-3.5 w-3.5" />, type: 'comparison' },
  { pattern: /por\s*qu[eé]\s*(importa|funciona|es\s*(clave|importante|cr[ií]tico))/i, score: 85, icon: <Lightbulb className="h-3.5 w-3.5" />, type: 'insight' },
  { pattern: /se[ñn]ales?\s*(de\s*alerta|clave|concretas?)|red\s*flags?/i, score: 84, icon: <AlertTriangle className="h-3.5 w-3.5" />, type: 'warning', shortLabel: 'Alertas' },
  
  // MEDIUM VALUE
  { pattern: /herramienta|recurso|plataforma|software/i, score: 82, icon: <Layers className="h-3.5 w-3.5" />, type: 'action', shortLabel: 'Herramientas' },
  { pattern: /estrategia|t[aá]ctica|m[eé]todo|framework/i, score: 80, icon: <Crosshair className="h-3.5 w-3.5" />, type: 'insight', shortLabel: 'Estrategia' },
  { pattern: /resultado|impacto|beneficio|roi|retorno/i, score: 78, icon: <Zap className="h-3.5 w-3.5" />, type: 'insight' },
  { pattern: /diagn[oó]stico|evaluaci[oó]n|auditor[ií]a|an[aá]lisis/i, score: 77, icon: <Target className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /riesgo|peligro|cuidado|atenci[oó]n/i, score: 76, icon: <Shield className="h-3.5 w-3.5" />, type: 'warning' },
  { pattern: /tendencia|futuro|proyecci[oó]n|predicci[oó]n/i, score: 75, icon: <Flame className="h-3.5 w-3.5" />, type: 'insight' },
  { pattern: /gu[ií]a|tutorial|manual/i, score: 74, icon: <BookOpen className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /plantilla|template|modelo/i, score: 73, icon: <Layers className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /clave|esencial|fundamental|cr[ií]tico/i, score: 70, icon: <Lightbulb className="h-3.5 w-3.5" />, type: 'insight' },
  { pattern: /pregunta|duda/i, score: 68, icon: <HelpCircle className="h-3.5 w-3.5" />, type: 'insight' },
  { pattern: /resumen|s[ií]ntesis|cierre/i, score: 65, icon: <Star className="h-3.5 w-3.5" />, type: 'conclusion' },
  { pattern: /pr[oó]ximos?\s*pasos?|siguiente|acci[oó]n/i, score: 64, icon: <Compass className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /m[eé]tricas?|kpi|indicador/i, score: 72, icon: <BarChart3 className="h-3.5 w-3.5" />, type: 'insight', shortLabel: 'Métricas' },
  { pattern: /automatiza|automat[ií]z/i, score: 71, icon: <Zap className="h-3.5 w-3.5" />, type: 'action', shortLabel: 'Automatización' },
];

const TYPE_COLORS: Record<SmartSection['type'], string> = {
  insight: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15',
  action: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/15',
  example: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 hover:bg-violet-500/15',
  conclusion: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/15',
  comparison: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 hover:bg-sky-500/15',
};

const FONT_SIZES = ['text-base', 'text-lg', 'text-xl'] as const;

function truncateLabel(text: string, max: number = 32): string {
  // Remove markdown formatting
  const clean = text.replace(/[*_`#]/g, '').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trim() + '…';
}

function scoreAndClassify(text: string, position: number, totalH2s: number): Omit<SmartSection, 'id' | 'fullText'> | null {
  let bestMatch: { score: number; icon: React.ReactNode; type: SmartSection['type']; shortLabel?: string } | null = null;

  for (const signal of SECTION_SIGNALS) {
    if (signal.pattern.test(text)) {
      if (!bestMatch || signal.score > bestMatch.score) {
        bestMatch = signal;
      }
    }
  }

  // Position bonus: first and last H2s get bonus
  const positionBonus = position === 0 ? 5 : position >= totalH2s - 2 ? 3 : 0;

  if (bestMatch) {
    return {
      label: bestMatch.shortLabel || truncateLabel(text),
      icon: bestMatch.icon,
      score: bestMatch.score + positionBonus,
      type: bestMatch.type,
    };
  }

  // Fallback: assign generic but still useful classification
  // Words with business/action intent get higher scores
  const hasActionWords = /implementar|aplicar|mejorar|optimizar|resolver|crear|construir|lograr|medir|calcular/i.test(text);
  const hasQuestionMark = text.includes('?');
  
  const fallbackScore = 50 + positionBonus + (hasActionWords ? 10 : 0) + (hasQuestionMark ? 5 : 0);
  
  return {
    label: truncateLabel(text),
    icon: hasQuestionMark ? <HelpCircle className="h-3.5 w-3.5" /> : 
          hasActionWords ? <Target className="h-3.5 w-3.5" /> : 
          <Lightbulb className="h-3.5 w-3.5" />,
    score: fallbackScore,
    type: hasActionWords ? 'action' : 'insight',
  };
}

export function BlogReadingToolbar({ content, title, slug, readingTime, className }: BlogReadingToolbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [fontSizeIdx, setFontSizeIdx] = useState(0);

  // Smart section extraction: picks the 4-6 most valuable sections with distribution
  const smartSections = useMemo(() => {
    const lines = content.split('\n');
    const totalLines = lines.length;
    
    // Score all H2s with position tracking
    const scored: (SmartSection & { linePos: number })[] = [];
    let hIdx = 0;
    let lineNumber = 0;
    
    lines.forEach((line) => {
      lineNumber++;
      const match = line.match(/^(#{2,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        if (text.length < 4) { hIdx++; return; }
        const id = `heading-${hIdx}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
        
        if (level === 2) {
          const allH2Count = scored.length;
          const result = scoreAndClassify(text, allH2Count, 10);
          if (result) {
            scored.push({ ...result, id, fullText: text, linePos: lineNumber });
          }
        }
        hIdx++;
      }
    });

    const MIN_SECTIONS = 5;
    const MAX_SECTIONS = 7;

    // Sort by score
    const sorted = [...scored].sort((a, b) => b.score - a.score);

    // Ensure FAQ is always included if present
    const faqSection = sorted.find(s => s.label === 'FAQ');

    // Take top N with type diversity + spatial distribution
    const selected: (SmartSection & { linePos: number })[] = [];
    const typeCounts: Record<string, number> = {};

    // Add FAQ first if exists
    if (faqSection) {
      selected.push(faqSection);
      typeCounts[faqSection.type] = 1;
    }

    // Ensure at least 1 actionable section
    const hasAction = faqSection?.type === 'action';
    if (!hasAction) {
      const actionSection = sorted.find(s => s.type === 'action' && !selected.find(sel => sel.id === s.id));
      if (actionSection) {
        selected.push(actionSection);
        typeCounts['action'] = (typeCounts['action'] || 0) + 1;
      }
    }

    // Spatial distribution: divide doc in 3 zones (start/middle/end) and try to pick from each
    const zoneOf = (linePos: number): 'start' | 'middle' | 'end' => {
      const ratio = linePos / Math.max(1, totalLines);
      if (ratio < 0.33) return 'start';
      if (ratio < 0.66) return 'middle';
      return 'end';
    };
    const zoneCounts: Record<string, number> = { start: 0, middle: 0, end: 0 };
    selected.forEach(s => { zoneCounts[zoneOf(s.linePos)]++; });

    // Pass 1: prioritize covering empty zones with the highest-scoring candidate per zone
    for (const zone of ['start', 'middle', 'end'] as const) {
      if (zoneCounts[zone] > 0) continue;
      const candidate = sorted.find(s =>
        zoneOf(s.linePos) === zone && !selected.find(sel => sel.id === s.id)
      );
      if (candidate) {
        selected.push(candidate);
        typeCounts[candidate.type] = (typeCounts[candidate.type] || 0) + 1;
        zoneCounts[zone]++;
      }
    }

    // Pass 2: fill remaining slots by score, with light type/spacing constraints
    for (const section of sorted) {
      if (selected.length >= MAX_SECTIONS) break;
      if (selected.find(s => s.id === section.id)) continue;

      const typeCount = typeCounts[section.type] || 0;
      // Allow up to 2 of same type until we hit MIN, then up to 3
      const typeLimit = selected.length < MIN_SECTIONS ? 3 : 2;
      if (typeCount >= typeLimit) continue;

      // Spatial spacing: avoid clustering only after MIN is satisfied
      if (selected.length >= MIN_SECTIONS) {
        const tooClose = selected.some(s => Math.abs(s.linePos - section.linePos) < totalLines * 0.05);
        if (tooClose) continue;
      }

      selected.push(section);
      typeCounts[section.type] = typeCount + 1;
      zoneCounts[zoneOf(section.linePos)]++;
    }

    // Pass 3: hard guarantee of MIN_SECTIONS — add any remaining H2 by document order
    if (selected.length < MIN_SECTIONS) {
      for (const section of scored) {
        if (selected.length >= MIN_SECTIONS) break;
        if (!selected.find(s => s.id === section.id)) {
          selected.push(section);
        }
      }
    }

    // Re-sort by document order so the toolbar reads top→bottom
    selected.sort((a, b) => a.linePos - b.linePos);

    // Log quality issues for admin review
    if (selected.length < MIN_SECTIONS && typeof console !== 'undefined') {
      console.warn(`[BlogToolbar] Nota con menos de ${MIN_SECTIONS} secciones válidas (${selected.length}). Slug puede necesitar revisión.`);
    }
    if (faqSection && !selected.find(s => s.label === 'FAQ')) {
      console.warn(`[BlogToolbar] FAQ detectada pero no incluida en toolbar.`);
    }

    return selected;
  }, [content]);

  const estimatedTotalTime = readingTime || Math.ceil(content.split(/\s+/).length / 220);
  const remainingTime = Math.max(1, Math.ceil(estimatedTotalTime * (1 - readingProgress / 100)));

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      
      setReadingProgress(progress);
      setIsVisible(scrollTop > 400);
      
      // Find active section
      let found = false;
      for (let i = smartSections.length - 1; i >= 0; i--) {
        const el = document.getElementById(smartSections[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(smartSections[i].id);
            found = true;
            break;
          }
        }
      }
      if (!found && smartSections.length > 0) {
        setActiveSection(null);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [smartSections]);

  const changeFontSize = useCallback((delta: number) => {
    setFontSizeIdx(prev => {
      const next = Math.max(0, Math.min(FONT_SIZES.length - 1, prev + delta));
      const article = document.querySelector('article.prose');
      if (article) {
        FONT_SIZES.forEach(cls => article.classList.remove(cls));
        article.classList.add(FONT_SIZES[next]);
      }
      return next;
    });
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
      setIsExpanded(false);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const shareArticle = async () => {
    const url = `https://www.vistaceo.com/blog/${slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url, text: `Leé este artículo: ${title}` });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copiado al portapapeles');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(url);
          toast.success('Link copiado al portapapeles');
        } catch {
          toast.error('No se pudo compartir');
        }
      }
    }
  };

  if (!isVisible || smartSections.length < 3) return null;

  return (
    <>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent">
        <div 
          className="h-full bg-primary/80 transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Desktop sidebar - RIGHT */}
      <div 
        className={cn(
          "fixed right-4 xl:right-6 top-1/2 -translate-y-1/2 z-40",
          "hidden lg:block",
          "transition-all duration-500 ease-out",
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8 pointer-events-none",
          className
        )}
      >
        <div className="bg-background/95 backdrop-blur-xl border border-border/60 shadow-lg rounded-2xl p-3 w-56 xl:w-60">
          {/* Header */}
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-semibold text-foreground tracking-wide uppercase">
                Navegá la nota
              </span>
            </div>
            <span className="text-[10px] font-semibold text-primary tabular-nums">
              {Math.round(readingProgress)}%
            </span>
          </div>
          
          {/* Progress */}
          <div className="h-1 bg-muted rounded-full mb-3 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-150 ease-out rounded-full"
              style={{ width: `${readingProgress}%` }}
            />
          </div>

          {/* Smart sections */}
          <div className="space-y-1.5 max-h-[45vh] overflow-y-auto pr-1 scrollbar-thin">
            {smartSections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[11px] xl:text-xs font-medium transition-all text-left",
                  "border",
                  TYPE_COLORS[section.type],
                  activeSection === section.id && "ring-2 ring-primary/30 scale-[1.01] shadow-sm font-semibold"
                )}
                title={section.fullText}
              >
                <span className="shrink-0">{section.icon}</span>
                <span className="truncate flex-1 leading-tight">{section.label}</span>
              </button>
            ))}
          </div>

          <div className="h-px bg-border/50 my-2.5" />

          {/* Time remaining */}
          <div className="flex items-center gap-1.5 px-1 mb-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              {readingProgress >= 95 ? '¡Lectura completada!' : `~${remainingTime} min restante`}
            </span>
          </div>

          {/* Font + actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="sm" className="rounded-full h-7 w-7 p-0" onClick={() => changeFontSize(-1)} disabled={fontSizeIdx === 0} title="Texto más pequeño">
                <Minus className="h-3 w-3" />
              </Button>
              <Type className="h-3.5 w-3.5 text-muted-foreground mx-0.5" />
              <Button variant="ghost" size="sm" className="rounded-full h-7 w-7 p-0" onClick={() => changeFontSize(1)} disabled={fontSizeIdx === FONT_SIZES.length - 1} title="Texto más grande">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="rounded-full h-7 w-7 p-0" onClick={shareArticle} title="Compartir">
                <Share2 className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full h-7 w-7 p-0" onClick={scrollToTop} title="Ir arriba">
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile floating toolbar */}
      <div 
        className={cn(
          "fixed bottom-3 left-2 right-2 sm:left-4 sm:right-4 z-40",
          "lg:hidden",
          "transition-all duration-300 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <div className="bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl overflow-hidden">
          {!isExpanded ? (
            <div className="flex items-center justify-between p-2.5 sm:p-3">
              <button 
                onClick={() => setIsExpanded(true)}
                className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground"
              >
                <Compass className="h-4 w-4 text-primary" />
                <span>Navegá la nota</span>
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{smartSections.length}</span>
              </button>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{readingProgress >= 95 ? '✓' : `${remainingTime}m`}</span>
                </div>
                <div className="w-14 h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${readingProgress}%` }} />
                </div>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={shareArticle}>
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-primary" />
                  <span className="text-xs sm:text-sm font-semibold">Secciones clave</span>
                </div>
                <button onClick={() => setIsExpanded(false)} className="text-muted-foreground p-1 hover:text-foreground">
                  <ArrowUp className="h-4 w-4 rotate-180" />
                </button>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {smartSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-2 p-2.5 rounded-xl text-xs text-left transition-all border",
                      TYPE_COLORS[section.type],
                      activeSection === section.id && "ring-2 ring-primary/30 font-semibold"
                    )}
                  >
                    <span className="shrink-0">{section.icon}</span>
                    <span className="truncate flex-1 leading-tight">{section.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
