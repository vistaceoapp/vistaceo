"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";

interface MarkdownContentProps {
  content: string;
}

// Clean markdown content before rendering - remove broken HTML and artifacts
function cleanMarkdownContent(content: string): string {
  let cleaned = content;
  
  // Remove raw HTML img tags that appear as text (malformed markdown)
  cleaned = cleaned.replace(/<img\s+[^>]*>/gi, '');
  cleaned = cleaned.replace(/<img[^>]*\/>/gi, '');
  
  // Remove broken image references that show as text
  cleaned = cleaned.replace(/nlewrgmcawzcdazhfiyy\.supabase\.co\/[^\s"<>]*/g, '');
  
  // Remove partial HTML attributes that appear as text
  cleaned = cleaned.replace(/\s*alt="[^"]*"/g, '');
  cleaned = cleaned.replace(/\s*loading="[^"]*"/g, '');
  cleaned = cleaned.replace(/\s*class="[^"]*"/g, '');
  cleaned = cleaned.replace(/\s*src="[^"]*"/g, '');
  cleaned = cleaned.replace(/\s*width="[^"]*"/g, '');
  cleaned = cleaned.replace(/\s*height="[^"]*"/g, '');
  
  // Clean up stray closing brackets
  cleaned = cleaned.replace(/^\s*>\s*$/gm, '');
  
  // Remove lines that only contain URL fragments
  cleaned = cleaned.replace(/^https?:\/\/[^\s]+\s*$/gm, '');
  
  // Remove multiple blank lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Trim each line
  cleaned = cleaned.split('\n').map(line => {
    // If line is just broken HTML attributes, skip it
    if (/^[\s]*[a-z]+="[^"]*"[\s]*$/.test(line)) {
      return '';
    }
    return line;
  }).join('\n');
  
  return cleaned.trim();
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  const cleanedContent = cleanMarkdownContent(content);
  
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="prose prose-lg max-w-none"
      components={{
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-bold mt-8 mb-4 scroll-mt-20">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
        ),
        p: ({ children }) => {
          // Check if children contains broken content
          const childText = String(children || '');
          if (
            childText.includes('supabase.co') ||
            childText.includes('alt="') ||
            childText.includes('loading="') ||
            childText.includes('class="') ||
            childText.includes('content-image') ||
            /^[a-z]+="[^"]*"$/.test(childText.trim())
          ) {
            return null;
          }
          return (
            <p className="text-foreground/90 leading-relaxed mb-4">{children}</p>
          );
        },
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-primary hover:underline"
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {children}
          </a>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-2 mb-4 ml-4">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-2 mb-4 ml-4">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-foreground/90">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6">
            {children}
          </blockquote>
        ),
        code: ({ className, children }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="bg-secondary px-1.5 py-0.5 rounded text-primary text-sm">
                {children}
              </code>
            );
          }
          return (
            <code className="block bg-secondary p-4 rounded-lg overflow-x-auto text-sm">
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="bg-secondary rounded-lg overflow-x-auto my-4">
            {children}
          </pre>
        ),
        hr: () => <hr className="border-border my-8" />,
        img: ({ src, alt }) => {
          // Skip broken or invalid images
          if (!src || src.includes('undefined') || src.startsWith('data:') || !src.startsWith('http')) {
            return null;
          }
          return (
            <figure className="my-6">
              <Image
                src={src}
                alt={alt || "Imagen del artículo"}
                width={800}
                height={450}
                className="rounded-lg w-full h-auto"
                unoptimized // Allow external images
              />
              {alt && alt !== "Imagen del artículo" && (
                <figcaption className="text-center text-sm text-muted-foreground mt-2 italic">
                  {alt}
                </figcaption>
              )}
            </figure>
          );
        },
        table: ({ children }) => (
          <div className="overflow-x-auto my-6">
            <table className="min-w-full border border-border rounded-lg">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="bg-secondary px-4 py-2 text-left font-semibold border-b border-border">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 border-b border-border">{children}</td>
        ),
      }}
    >
      {cleanedContent}
    </ReactMarkdown>
  );
}
