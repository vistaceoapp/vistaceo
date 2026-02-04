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
        // Base prose styles - PATCH V5 ultra-readable + ultra-human
        "prose prose-lg prose-slate dark:prose-invert",
        // Max width for optimal reading (65-75 chars per line)
        "max-w-[740px]",
        // Typography - very generous line height
        "prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight",
        // H2 styling - HUGE spacing above with visual separator
        "prose-h2:text-[1.6rem] prose-h2:mt-20 prose-h2:mb-8 prose-h2:pt-10 prose-h2:border-t-2 prose-h2:border-border/40",
        // H3 styling - MASSIVE spacing for clear subsections
        "prose-h3:text-[1.2rem] prose-h3:mt-14 prose-h3:mb-5 prose-h3:text-foreground prose-h3:font-semibold",
        // Paragraph spacing - ultra generous for readability
        "prose-p:leading-[1.9] prose-p:mb-7 prose-p:text-foreground/85",
        // List styling - very generous breathing room
        "prose-li:my-4 prose-li:leading-[1.85]",
        "prose-ul:my-10 prose-ol:my-10 prose-ul:space-y-3 prose-ol:space-y-3",
        // Blockquote styling for examples - distinct card-like appearance
        "prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-muted/50 prose-blockquote:py-6 prose-blockquote:px-7 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:my-12 prose-blockquote:text-foreground/80 prose-blockquote:shadow-sm",
        // Strong/bold - subtle emphasis
        "prose-strong:text-foreground prose-strong:font-semibold",
        // Links
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium",
        // Code - inline
        "prose-code:text-sm prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-code:font-normal",
        // Pre/code blocks - generous spacing
        "prose-pre:bg-muted/80 prose-pre:border prose-pre:border-border prose-pre:my-12 prose-pre:shadow-sm",
        // Tables
        "prose-table:border prose-table:border-border prose-th:bg-muted prose-th:px-4 prose-th:py-3 prose-td:px-4 prose-td:py-3 prose-td:border-t prose-td:border-border",
        // Images - generous spacing
        "prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-16",
        // Horizontal rules - section separators
        "prose-hr:my-16 prose-hr:border-t-2 prose-hr:border-border/60",
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
              <h3 
                id={id} 
                className="!mt-14 !pt-8 !mb-6 text-[1.2rem] font-semibold text-foreground border-t border-border/20"
                {...props}
              >
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
            <div className="overflow-x-auto my-8 rounded-xl border border-border bg-card shadow-sm">
              <table className="w-full border-collapse text-sm" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-muted border-b-2 border-border" {...props}>
              {children}
            </thead>
          ),
          th: ({ children, ...props }) => (
            <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => {
            // Handle empty cells with placeholder
            const isEmpty = !children || (Array.isArray(children) && children.length === 0) || children === '';
            return (
              <td className="px-4 py-3 border-t border-border align-top" {...props}>
                {isEmpty ? <span className="text-muted-foreground/50">—</span> : children}
              </td>
            );
          },
          tr: ({ children, ...props }) => (
            <tr className="hover:bg-muted/50 transition-colors" {...props}>
              {children}
            </tr>
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
