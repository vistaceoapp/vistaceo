import { useEffect, useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { List } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface BlogTableOfContentsProps {
  content: string;
  className?: string;
}

export const BlogTableOfContents = forwardRef<HTMLElement, BlogTableOfContentsProps>(
  function BlogTableOfContents({ content, className }, ref) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

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

  return (
    <nav className={cn("space-y-2", className)} aria-label="Tabla de contenidos">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
        <List className="h-4 w-4" />
        <span>En este artículo</span>
      </div>
      <ul className="space-y-1 text-sm border-l-2 border-border pl-3">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "block py-1.5 text-muted-foreground hover:text-foreground transition-colors leading-snug",
                heading.level === 3 && "pl-3 text-xs",
                activeId === heading.id && "text-primary font-medium border-l-2 border-primary -ml-[calc(0.75rem+2px)] pl-[calc(0.75rem)]"
              )}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(heading.id);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  // Update URL hash without jumping
                  window.history.replaceState(null, '', `#${heading.id}`);
                  setActiveId(heading.id);
                }
              }}
            >
              {heading.text.length > 50 ? heading.text.slice(0, 47) + '...' : heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
});
