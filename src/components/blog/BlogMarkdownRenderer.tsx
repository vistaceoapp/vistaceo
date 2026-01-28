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
        // Base prose styles with improved readability - PATCH V3 spacing
        "prose prose-lg prose-slate dark:prose-invert",
        // Max width for optimal reading
        "max-w-[780px]",
        // Typography improvements - generous line height
        "prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight",
        // H2 styling - MUCH more spacing above
        "prose-h2:text-2xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:pb-3 prose-h2:border-b prose-h2:border-border/40",
        // H3 styling - more spacing
        "prose-h3:text-xl prose-h3:mt-12 prose-h3:mb-6",
        // Paragraph spacing and line height - PATCH V3 (1.8 line-height, more margin)
        "prose-p:leading-[1.8] prose-p:mb-6 prose-p:text-foreground/85",
        // List styling - more breathing room
        "prose-li:my-2 prose-li:leading-[1.75]",
        "prose-ul:my-8 prose-ol:my-8 prose-ul:space-y-2 prose-ol:space-y-2",
        // Blockquote styling for examples - stand out more
        "prose-blockquote:border-l-4 prose-blockquote:border-primary/60 prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:my-10",
        // Strong/bold
        "prose-strong:text-foreground prose-strong:font-semibold",
        // Links
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium",
        // Code
        "prose-code:text-sm prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none",
        // Pre/code blocks
        "prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:my-8",
        // Tables
        "prose-table:border prose-table:border-border prose-th:bg-muted prose-th:px-4 prose-th:py-3 prose-td:px-4 prose-td:py-3 prose-td:border-t prose-td:border-border",
        // Images - more spacing
        "prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-12",
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
            <figure className="my-8">
              <img
                src={src}
                alt={alt || ''}
                loading="lazy"
                className="w-full rounded-xl shadow-lg"
                {...props}
              />
              {alt && (
                <figcaption className="text-center text-sm text-muted-foreground mt-3">
                  {alt}
                </figcaption>
              )}
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
