import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface BlogMarkdownRendererProps {
  content: string;
  className?: string;
}

export function BlogMarkdownRenderer({ content, className }: BlogMarkdownRendererProps) {
  // Pre-process content to add IDs to headings
  let headingIndex = 0;
  
  return (
    <article 
      className={cn(
        // Base prose styles - PATCH V4 ultra-readable
        "prose prose-lg prose-slate dark:prose-invert",
        // Max width for optimal reading (65-75 chars per line)
        "max-w-[720px]",
        // Typography - very generous line height
        "prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight",
        // H2 styling - HUGE spacing above for clear sections
        "prose-h2:text-[1.65rem] prose-h2:mt-20 prose-h2:mb-10 prose-h2:pb-4 prose-h2:border-b prose-h2:border-border/30",
        // H3 styling - generous spacing
        "prose-h3:text-[1.3rem] prose-h3:mt-14 prose-h3:mb-6 prose-h3:text-foreground/90",
        // Paragraph spacing - PATCH V4 (1.9 line-height, large margin)
        "prose-p:leading-[1.9] prose-p:mb-7 prose-p:text-foreground/80",
        // List styling - very generous breathing room
        "prose-li:my-3 prose-li:leading-[1.85]",
        "prose-ul:my-10 prose-ol:my-10 prose-ul:space-y-3 prose-ol:space-y-3",
        // Blockquote styling for examples - card-like appearance
        "prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-muted/50 prose-blockquote:py-5 prose-blockquote:px-7 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-blockquote:my-12 prose-blockquote:shadow-sm",
        // Strong/bold - less aggressive
        "prose-strong:text-foreground/95 prose-strong:font-medium",
        // Links
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium",
        // Code
        "prose-code:text-sm prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none",
        // Pre/code blocks
        "prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:my-10",
        // Tables
        "prose-table:border prose-table:border-border prose-th:bg-muted prose-th:px-4 prose-th:py-3 prose-td:px-4 prose-td:py-3 prose-td:border-t prose-td:border-border",
        // Images - generous spacing
        "prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-14",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children, ...props }) => {
            const text = String(children);
            const id = `heading-${headingIndex++}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
            return (
              <h2 id={id} {...props}>
                {children}
              </h2>
            );
          },
          h3: ({ children, ...props }) => {
            const text = String(children);
            const id = `heading-${headingIndex++}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
            return (
              <h3 id={id} {...props}>
                {children}
              </h3>
            );
          },
          // Don't render H1 - page already has it
          h1: () => null,
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              {...props}
            >
              {children}
            </a>
          ),
          img: ({ src, alt, ...props }) => (
            <figure className="my-12">
              <img
                src={src}
                alt={alt || ''}
                loading="lazy"
                className="w-full rounded-2xl shadow-xl"
                {...props}
              />
            </figure>
          ),
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-6 rounded-lg border border-border">
              <table className="w-full" {...props}>
                {children}
              </table>
            </div>
          ),
          pre: ({ children, ...props }) => (
            <pre className="rounded-lg p-4 overflow-x-auto my-6" {...props}>
              {children}
            </pre>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            return isInline ? (
              <code {...props}>
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          blockquote: ({ children, ...props }) => (
            <blockquote {...props}>
              {children}
            </blockquote>
          ),
          ul: ({ children, ...props }) => {
            // Check if it's a checklist
            const isChecklist = String(children).includes('[ ]') || String(children).includes('[x]');
            return (
              <ul className={cn("space-y-2", isChecklist && "list-none pl-0")} {...props}>
                {children}
              </ul>
            );
          },
          li: ({ children, ...props }) => {
            const text = String(children);
            // Handle checkbox items
            if (text.startsWith('[ ] ') || text.startsWith('[x] ')) {
              const isChecked = text.startsWith('[x]');
              const content = text.slice(4);
              return (
                <li className="flex items-start gap-2 list-none" {...props}>
                  <span className={cn(
                    "inline-flex items-center justify-center w-5 h-5 mt-0.5 rounded border",
                    isChecked ? "bg-primary border-primary text-primary-foreground" : "border-border"
                  )}>
                    {isChecked && '✓'}
                  </span>
                  <span>{content}</span>
                </li>
              );
            }
            return <li {...props}>{children}</li>;
          },
          ol: ({ children, ...props }) => (
            <ol className="space-y-2" {...props}>
              {children}
            </ol>
          ),
          // Horizontal rule for section breaks
          hr: () => (
            <hr className="my-10 border-t-2 border-border/50" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
