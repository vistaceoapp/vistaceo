import { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { 
  Bookmark, Share2, 
  Check, Lightbulb, Target, AlertTriangle, HelpCircle,
  List, ArrowUp, Type, Minus, Plus, BookOpen, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface QuickNavSection {
  id: string;
  text: string;
  icon: React.ReactNode;
  type: 'key' | 'action' | 'warning' | 'faq';
}

interface BlogReadingToolbarProps {
  content: string;
  title: string;
  slug: string;
  readingTime?: number;
  className?: string;
}

const KEY_SECTION_PATTERNS: Array<{pattern: RegExp; icon: React.ReactNode; type: QuickNavSection['type']}> = [
  { pattern: /en\s*\d+\s*(segundos?|minutos?)/i, icon: <Target className="h-3.5 w-3.5" />, type: 'key' },
  { pattern: /veredicto/i, icon: <Lightbulb className="h-3.5 w-3.5" />, type: 'key' },
  { pattern: /por\s*qu[eé]\s*(esto\s*)?(importa|matters)/i, icon: <Lightbulb className="h-3.5 w-3.5" />, type: 'key' },
  { pattern: /para\s*qui[eé]n\s*(s[ií]|no)/i, icon: <Target className="h-3.5 w-3.5" />, type: 'key' },
  { pattern: /se[ñn]ales?\s*(de\s*alerta|concretas?)/i, icon: <AlertTriangle className="h-3.5 w-3.5" />, type: 'warning' },
  { pattern: /c[oó]mo\s*empezar/i, icon: <Target className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /paso\s*a\s*paso/i, icon: <List className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /checklist|lista\s*de\s*verificaci[oó]n/i, icon: <Check className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /herramienta\s*pr[aá]ctica/i, icon: <Target className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /ejercicio|pr[aá]ctica|reto\s*pr[aá]ctico/i, icon: <Target className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /errores?\s*(comunes?|t[ií]picos?)/i, icon: <AlertTriangle className="h-3.5 w-3.5" />, type: 'warning' },
  { pattern: /\d+\s*usos?\s*reales?/i, icon: <Lightbulb className="h-3.5 w-3.5" />, type: 'key' },
  { pattern: /costos?\s*(visibles?|invisibles?)/i, icon: <AlertTriangle className="h-3.5 w-3.5" />, type: 'warning' },
  { pattern: /prueba\s*m[ií]nima/i, icon: <Check className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /alternativas?/i, icon: <Target className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /preguntas?\s*frecuentes?|faq/i, icon: <HelpCircle className="h-3.5 w-3.5" />, type: 'faq' },
  { pattern: /autoevaluaci[oó]n|auditor[ií]a\s*r[aá]pida/i, icon: <Check className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /plantilla|template/i, icon: <Bookmark className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /pr[oó]ximos?\s*(\d+\s*)?pasos?/i, icon: <Target className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /para\s*profundizar/i, icon: <Lightbulb className="h-3.5 w-3.5" />, type: 'key' },
  { pattern: /lo\s*que\s*prometen\s*vs/i, icon: <AlertTriangle className="h-3.5 w-3.5" />, type: 'warning' },
  { pattern: /dificultad\s*real/i, icon: <Target className="h-3.5 w-3.5" />, type: 'key' },
  { pattern: /conclusi[oó]n|resumen|cierre/i, icon: <Lightbulb className="h-3.5 w-3.5" />, type: 'key' },
  { pattern: /ejemplo|caso\s*real/i, icon: <BookOpen className="h-3.5 w-3.5" />, type: 'key' },
  { pattern: /estrategia|t[aá]ctica/i, icon: <Target className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /diagn[oó]stico/i, icon: <Target className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /gu[ií]a|tutorial/i, icon: <BookOpen className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /ventajas?\s*y\s*desventajas?|pros?\s*y\s*contras?/i, icon: <AlertTriangle className="h-3.5 w-3.5" />, type: 'warning' },
];

const FONT_SIZES = ['text-base', 'text-lg', 'text-xl'] as const;

export function BlogReadingToolbar({ content, title, slug, readingTime, className }: BlogReadingToolbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [fontSizeIdx, setFontSizeIdx] = useState(0);

  // Parse key sections from content
  const keySections = useMemo(() => {
    const lines = content.split('\n');
    const sections: QuickNavSection[] = [];
    let headingIndex = 0;

    lines.forEach((line) => {
      const match = line.match(/^(#{2,3})\s+(.+)$/);
      if (match) {
        const text = match[2].trim();
        const id = `heading-${headingIndex++}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
        
        for (const { pattern, icon, type } of KEY_SECTION_PATTERNS) {
          if (pattern.test(text)) {
            sections.push({ id, text, icon, type });
            break;
          }
        }
      }
    });

    return sections;
  }, [content]);

  // Estimate remaining time
  const estimatedTotalTime = readingTime || Math.ceil(content.split(/\s+/).length / 220);
  const remainingTime = Math.max(1, Math.ceil(estimatedTotalTime * (1 - readingProgress / 100)));

  // Track scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      
      setReadingProgress(progress);
      setIsVisible(scrollTop > 400);
      
      for (const section of keySections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom > 0) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [keySections]);

  // Font size control
  const changeFontSize = useCallback((delta: number) => {
    setFontSizeIdx(prev => {
      const next = Math.max(0, Math.min(FONT_SIZES.length - 1, prev + delta));
      // Apply to article element
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

  if (!isVisible || keySections.length < 1) return null;

  const typeColors: Record<QuickNavSection['type'], string> = {
    key: 'bg-primary/10 text-primary border-primary/20',
    action: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    faq: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  };

  return (
    <>
      {/* Progress bar at top */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent">
        <div 
          className="h-full bg-primary/80 transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Desktop sidebar toolbar - RIGHT side */}
      <div 
        className={cn(
          "fixed right-4 xl:right-6 top-1/2 -translate-y-1/2 z-40",
          "hidden lg:block",
          "transition-all duration-500 ease-out",
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8 pointer-events-none",
          className
        )}
      >
        <div className="bg-background/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl p-3 w-52 xl:w-56">
          {/* Header with remaining time */}
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] xl:text-xs text-muted-foreground font-medium">
                {readingProgress >= 95 ? '¡Completado!' : `~${remainingTime} min restante`}
              </span>
            </div>
            <span className="text-[10px] xl:text-xs font-semibold text-primary tabular-nums">
              {Math.round(readingProgress)}%
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="h-1 bg-muted rounded-full mb-3 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-150 ease-out rounded-full"
              style={{ width: `${readingProgress}%` }}
            />
          </div>

          {/* Section chips */}
          <div className="space-y-1 max-h-[40vh] overflow-y-auto pr-1 scrollbar-thin">
            {keySections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] xl:text-xs font-medium transition-all text-left",
                  "border hover:scale-[1.01]",
                  typeColors[section.type],
                  activeSection === section.id && "ring-2 ring-primary/30 scale-[1.01] shadow-sm"
                )}
              >
                {section.icon}
                <span className="truncate flex-1">{section.text}</span>
              </button>
            ))}
          </div>

          <div className="h-px bg-border my-2.5" />

          {/* Font size + actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              <Button 
                variant="ghost" size="sm" 
                className="rounded-full h-7 w-7 p-0"
                onClick={() => changeFontSize(-1)}
                disabled={fontSizeIdx === 0}
                title="Texto más pequeño"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Type className="h-3.5 w-3.5 text-muted-foreground mx-0.5" />
              <Button 
                variant="ghost" size="sm" 
                className="rounded-full h-7 w-7 p-0"
                onClick={() => changeFontSize(1)}
                disabled={fontSizeIdx === FONT_SIZES.length - 1}
                title="Texto más grande"
              >
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
                className="flex items-center gap-2 text-xs sm:text-sm font-medium"
              >
                <List className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">Secciones</span>
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{keySections.length}</Badge>
              </button>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{readingProgress >= 95 ? '✓' : `${remainingTime}m`}</span>
                </div>
                <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${readingProgress}%` }} />
                </div>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={shareArticle}>
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={scrollToTop}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm font-semibold">Ir a sección</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{Math.round(readingProgress)}%</span>
                  <button onClick={() => setIsExpanded(false)} className="text-muted-foreground p-1">
                    <ArrowUp className="h-4 w-4 rotate-180" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                {keySections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "flex items-center gap-1.5 p-2 rounded-lg text-[10px] sm:text-xs text-left transition-all border",
                      typeColors[section.type],
                      activeSection === section.id && "ring-2 ring-primary/30"
                    )}
                  >
                    {section.icon}
                    <span className="truncate flex-1 leading-tight">{section.text}</span>
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
