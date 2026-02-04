export function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + '...';
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-LA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function extractHeadings(markdown: string): { level: number; text: string; id: string }[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: { level: number; text: string; id: string }[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].trim(),
      id: slugify(match[2])
    });
  }

  return headings;
}

/**
 * Add IDs to headings in HTML/Markdown content for anchor navigation
 */
export function addHeadingIds(content: string): string {
  // Handle both Markdown headings (## Title) and HTML headings (<h2>Title</h2>)
  
  // Markdown: ## Title -> <h2 id="title">Title</h2>
  let processed = content.replace(/^(#{2,6})\s+(.+)$/gm, (_, hashes, text) => {
    const level = hashes.length;
    const id = slugify(text);
    return `<h${level} id="${id}">${text}</h${level}>`;
  });
  
  // HTML headings without ID: <h2>Title</h2> -> <h2 id="title">Title</h2>
  processed = processed.replace(/<h([2-6])>([^<]+)<\/h\1>/gi, (_, level, text) => {
    const id = slugify(text);
    return `<h${level} id="${id}">${text}</h${level}>`;
  });
  
  return processed;
}
