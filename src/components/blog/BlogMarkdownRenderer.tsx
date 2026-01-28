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
    <article className={cn("prose prose-slate dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children, ...props }) => {
            const text = String(children);
            const id = `heading-${headingIndex++}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            return (
              <h2 id={id} className="scroll-mt-24" {...props}>
                {children}
              </h2>
            );
          },
          h3: ({ children, ...props }) => {
            const text = String(children);
            const id = `heading-${headingIndex++}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            return (
              <h3 id={id} className="scroll-mt-24" {...props}>
                {children}
              </h3>
            );
          },
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="text-primary hover:underline"
              {...props}
            >
              {children}
            </a>
          ),
          img: ({ src, alt, ...props }) => (
            <img
              src={src}
              alt={alt || ''}
              loading="lazy"
              className="rounded-lg"
              {...props}
            />
          ),
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto">
              <table className="w-full" {...props}>
                {children}
              </table>
            </div>
          ),
          pre: ({ children, ...props }) => (
            <pre className="bg-muted rounded-lg p-4 overflow-x-auto" {...props}>
              {children}
            </pre>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-primary/50 pl-4 italic" {...props}>
              {children}
            </blockquote>
          ),
          ul: ({ children, ...props }) => (
            <ul className="list-disc pl-6 space-y-2" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal pl-6 space-y-2" {...props}>
              {children}
            </ol>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
