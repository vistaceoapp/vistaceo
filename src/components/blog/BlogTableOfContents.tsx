import { useEffect, useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { List, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface BlogTableOfContentsProps {
  content: string;
  className?: string;
  variant?: 'sidebar' | 'mobile';
}

export const BlogTableOfContents = forwardRef<HTMLElement, BlogTableOfContentsProps>(
  function BlogTableOfContents({ content, className, variant = 'sidebar' }, ref) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Parse headings from markdown content (only H2 and H3)
    const lines = content.split('\n');
    const parsed: TOCItem[] = [];
    let headingIndex = 0;
    
    lines.forEach((line) => {
      const match = line.match(/^(#{2,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        
        // Skip very short or utility headings
        if (text.length < 3) return;
        
        // Generate same ID as the renderer
        const id = `heading-${headingIndex++}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
        parsed.push({ id, text, level });
      }
    });

    setHeadings(parsed);
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible heading
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Get the topmost visible heading
          const topmost = visibleEntries.reduce((prev, curr) => {
            const prevRect = prev.target.getBoundingClientRect();
            const currRect = curr.target.getBoundingClientRect();
            return prevRect.top < currRect.top ? prev : curr;
          });
          setActiveId(topmost.target.id);
        }
      },
      { 
        rootMargin: '-80px 0px -70% 0px',
        threshold: [0, 0.5, 1]
      }
    );

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      headings.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 100);

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  // Mobile collapsed version
  if (variant === 'mobile') {
    const visibleHeadings = isExpanded ? headings : headings.slice(0, 5);
    
    return (
      <nav className={cn("space-y-2", className)} aria-label="Tabla de contenidos">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <List className="h-4 w-4" />
            <span>CONTENIDO</span>
          </div>
          {headings.length > 5 && (
            isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
          )}
        </button>
        
        <ul className="space-y-0.5 text-sm mt-3">
          {visibleHeadings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={cn(
                  "block py-1.5 text-muted-foreground hover:text-primary transition-colors leading-snug",
                  heading.level === 3 && "pl-4 text-xs",
                  activeId === heading.id && "text-primary font-medium"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(heading.id);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    window.history.replaceState(null, '', `#${heading.id}`);
                    setActiveId(heading.id);
                  }
                }}
              >
                {heading.text.length > 45 ? heading.text.slice(0, 42) + '...' : heading.text}
              </a>
            </li>
          ))}
        </ul>
        
        {!isExpanded && headings.length > 5 && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-xs text-primary hover:underline mt-2"
          >
            Ver todo ({headings.length} secciones)
          </button>
        )}
      </nav>
    );
  }

  // Desktop sidebar version - sticky with scroll
  return (
    <nav 
      className={cn(
        "space-y-2",
        className
      )} 
      aria-label="Tabla de contenidos"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
        <List className="h-4 w-4" />
        <span>CONTENIDO</span>
      </div>
      
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent pr-2">
        <ul className="space-y-0.5 text-sm border-l border-border/50">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={cn(
                  "block py-1.5 pl-4 -ml-px border-l-2 border-transparent text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all leading-snug",
                  heading.level === 3 && "pl-6 text-xs",
                  activeId === heading.id && "text-primary font-medium border-primary bg-primary/5"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(heading.id);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    window.history.replaceState(null, '', `#${heading.id}`);
                    setActiveId(heading.id);
                  }
                }}
              >
                {heading.text.length > 40 ? heading.text.slice(0, 37) + '...' : heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
});
