import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { 
  ChevronUp, ChevronDown, Bookmark, Share2, 
  Check, Lightbulb, Target, AlertTriangle, HelpCircle,
  List, X, ArrowUp
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
  className?: string;
}

// Key sections that users care about most (Prompt Maestro structure)
const KEY_SECTION_PATTERNS: Array<{pattern: RegExp; icon: React.ReactNode; type: QuickNavSection['type']}> = [
  { pattern: /en 2 minutos/i, icon: <Target className="h-3.5 w-3.5" />, type: 'key' },
  { pattern: /por qu[eé].*importa/i, icon: <Lightbulb className="h-3.5 w-3.5" />, type: 'key' },
  { pattern: /c[oó]mo empezar/i, icon: <Target className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /checklist/i, icon: <Check className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /ejercicio/i, icon: <Target className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /errores? comunes?/i, icon: <AlertTriangle className="h-3.5 w-3.5" />, type: 'warning' },
  { pattern: /preguntas frecuentes|faq/i, icon: <HelpCircle className="h-3.5 w-3.5" />, type: 'faq' },
  { pattern: /autoevaluaci[oó]n/i, icon: <Check className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /plantilla/i, icon: <Bookmark className="h-3.5 w-3.5" />, type: 'action' },
  { pattern: /para qui[eé]n es/i, icon: <Target className="h-3.5 w-3.5" />, type: 'key' },
];

export function BlogReadingToolbar({ content, title, slug, className }: BlogReadingToolbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);

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
        
        // Check if this matches any key pattern
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

  // Track scroll position for visibility and progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      
      setReadingProgress(progress);
      setIsVisible(scrollTop > 400);
      
      // Find active section
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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
      setIsExpanded(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const shareArticle = async () => {
    const url = `https://blog.vistaceo.com/${slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copiado al portapapeles');
      }
    } catch {
      toast.error('No se pudo compartir');
    }
  };

  if (!isVisible || keySections.length < 2) return null;

  const typeColors: Record<QuickNavSection['type'], string> = {
    key: 'bg-primary/10 text-primary border-primary/20',
    action: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    faq: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  };

  return (
    <>
      {/* Progress bar at very top */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted/30">
        <div 
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Desktop floating toolbar - bottom center */}
      <div 
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-40",
          "hidden lg:block",
          "transition-all duration-300 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
          className
        )}
      >
        <div className="flex items-center gap-2 bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-full px-2 py-1.5">
          {/* Quick nav chips */}
          <div className="flex items-center gap-1.5 px-2">
            {keySections.slice(0, 5).map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  "border hover:scale-105",
                  typeColors[section.type],
                  activeSection === section.id && "ring-2 ring-primary/30 scale-105"
                )}
              >
                {section.icon}
                <span className="max-w-[100px] truncate">{section.text}</span>
              </button>
            ))}
            
            {keySections.length > 5 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <List className="h-3.5 w-3.5" />
                <span>+{keySections.length - 5}</span>
              </button>
            )}
          </div>

          <div className="w-px h-6 bg-border" />

          {/* Actions */}
          <div className="flex items-center gap-1 px-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full h-8 w-8 p-0"
              onClick={shareArticle}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full h-8 w-8 p-0"
              onClick={scrollToTop}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expanded panel */}
        {isExpanded && keySections.length > 5 && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-80 bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Todas las secciones</span>
              <button onClick={() => setIsExpanded(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {keySections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                    "hover:bg-muted",
                    activeSection === section.id && "bg-primary/10 text-primary"
                  )}
                >
                  {section.icon}
                  <span className="truncate">{section.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile floating toolbar - bottom */}
      <div 
        className={cn(
          "fixed bottom-4 left-4 right-4 z-40",
          "lg:hidden",
          "transition-all duration-300 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <div className="bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl overflow-hidden">
          {/* Collapsed state */}
          {!isExpanded && (
            <div className="flex items-center justify-between p-3">
              <button 
                onClick={() => setIsExpanded(true)}
                className="flex items-center gap-2 text-sm font-medium"
              >
                <List className="h-4 w-4 text-primary" />
                <span>Navegar secciones</span>
                <Badge variant="secondary" className="text-xs">{keySections.length}</Badge>
              </button>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={shareArticle}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={scrollToTop}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Expanded state */}
          {isExpanded && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">Ir a sección</span>
                <button onClick={() => setIsExpanded(false)} className="text-muted-foreground">
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {keySections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-xl text-xs text-left transition-all",
                      "border",
                      typeColors[section.type],
                      activeSection === section.id && "ring-2 ring-primary/30"
                    )}
                  >
                    {section.icon}
                    <span className="truncate flex-1">{section.text}</span>
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
