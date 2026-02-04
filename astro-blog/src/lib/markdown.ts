/**
 * Premium Markdown Parser for VistaCEO Blog
 * Converts markdown to beautiful, accessible HTML with proper styling hooks
 */

import { slugify } from './text';

/**
 * Parse markdown content to HTML with premium styling
 */
export function parseMarkdown(content: string): string {
  if (!content) return '';
  
  let html = content;
  
  // ===== PROTECT EXISTING HTML =====
  // Extract and protect any existing HTML links/elements
  const htmlProtected: string[] = [];
  html = html.replace(/<a\s[^>]*>.*?<\/a>/gi, (match) => {
    htmlProtected.push(match);
    return `__HTML_PROTECTED_${htmlProtected.length - 1}__`;
  });
  
  // ===== TABLES - Process before other block elements =====
  html = processTables(html);
  
  // ===== BLOCK ELEMENTS =====
  
  // Headings with IDs for navigation (process before other rules)
  html = html.replace(/^######\s+(.+)$/gm, (_, text) => {
    const id = slugify(text.replace(/\*\*/g, ''));
    return `<h6 id="${id}" class="content-h6">${parseInline(text)}</h6>`;
  });
  html = html.replace(/^#####\s+(.+)$/gm, (_, text) => {
    const id = slugify(text.replace(/\*\*/g, ''));
    return `<h5 id="${id}" class="content-h5">${parseInline(text)}</h5>`;
  });
  html = html.replace(/^####\s+(.+)$/gm, (_, text) => {
    const id = slugify(text.replace(/\*\*/g, ''));
    return `<h4 id="${id}" class="content-h4">${parseInline(text)}</h4>`;
  });
  html = html.replace(/^###\s+(.+)$/gm, (_, text) => {
    const id = slugify(text.replace(/\*\*/g, ''));
    return `<h3 id="${id}" class="content-h3">${parseInline(text)}</h3>`;
  });
  html = html.replace(/^##\s+(.+)$/gm, (_, text) => {
    const id = slugify(text.replace(/\*\*/g, ''));
    return `<h2 id="${id}" class="content-h2">${parseInline(text)}</h2>`;
  });
  
  // Horizontal rules - styled dividers
  html = html.replace(/^---+$/gm, '<hr class="content-divider">');
  html = html.replace(/^\*\*\*+$/gm, '<hr class="content-divider">');
  
  // Blockquotes with example detection
  html = processBlockquotes(html);
  
  // Code blocks (fenced)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const langClass = lang ? ` language-${lang}` : '';
    return `<pre class="content-pre${langClass}"><code>${escapeHtml(code.trim())}</code></pre>`;
  });
  
  // Checkboxes/Task lists - interactive style
  html = html.replace(/^-\s*\[\s*\]\s+(.+)$/gm, (_, text) => {
    return `<div class="checklist-item unchecked"><span class="checkbox">☐</span><span class="checklist-text">${parseInline(text)}</span></div>`;
  });
  html = html.replace(/^-\s*\[x\]\s+(.+)$/gmi, (_, text) => {
    return `<div class="checklist-item checked"><span class="checkbox">☑</span><span class="checklist-text">${parseInline(text)}</span></div>`;
  });
  
  // Unordered lists (handle nested)
  html = processLists(html);
  
  // Ordered lists
  html = processOrderedLists(html);
  
  // Images with alt text
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    return `<figure class="content-figure">
      <img src="${src}" alt="${alt}" loading="lazy" class="content-image">
      ${alt ? `<figcaption class="content-figcaption">${alt}</figcaption>` : ''}
    </figure>`;
  });
  
  // Paragraphs - wrap remaining text blocks
  html = processParagraphs(html);
  
  // ===== RESTORE PROTECTED HTML =====
  htmlProtected.forEach((original, index) => {
    html = html.replace(`__HTML_PROTECTED_${index}__`, original);
  });
  
  return html;
}

/**
 * Parse inline markdown elements - IMPROVED to handle all cases
 */
function parseInline(text: string): string {
  if (!text) return '';
  
  let result = text;
  
  // Skip if already contains HTML anchor/div elements
  if (/<(a|div)\s[^>]*>/i.test(result)) {
    return result;
  }
  
  // Bold + Italic combined: ***text*** or ___text___ (process first)
  result = result.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  result = result.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  
  // Bold: **text** - IMPROVED regex to handle multiword and special chars
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Italic: *text* or _text_ (but not in URLs or already processed)
  result = result.replace(/(?<![*_\w])\*([^*\n]+?)\*(?![*_\w])/g, '<em>$1</em>');
  result = result.replace(/(?<![*_\w])_([^_\n]+?)_(?![*_\w])/g, '<em>$1</em>');
  
  // Inline code: `code`
  result = result.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  
  // Links: [text](url) - Make sure to handle properly
  result = result.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, linkText, url) => {
    const isExternal = url.startsWith('http') && !url.includes('vistaceo.com');
    if (isExternal) {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="external-link">${linkText}</a>`;
    }
    return `<a href="${url}" class="internal-link">${linkText}</a>`;
  });
  
  // Auto-link bare URLs (but not if already inside an anchor tag)
  result = result.replace(/(?<!href=["'])(https?:\/\/[^\s<>"')\]]+)/g, (url) => {
    // Don't process if it looks like it's already part of HTML
    if (url.includes('class=') || url.includes('target=')) {
      return url;
    }
    const isExternal = !url.includes('vistaceo.com');
    const displayUrl = url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 35);
    if (isExternal) {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="external-link auto-link">${displayUrl}${url.length > 45 ? '...' : ''}</a>`;
    }
    return `<a href="${url}" class="internal-link auto-link">${displayUrl}${url.length > 45 ? '...' : ''}</a>`;
  });
  
  // Strikethrough: ~~text~~
  result = result.replace(/~~(.+?)~~/g, '<del>$1</del>');
  
  // Emojis - keep as is but wrap for styling
  result = result.replace(/([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|✅|❌|📌|💡|🎯|📋|⚠️|✍️|🔗|📊|🚀|💰|📈|⏱️|🛠️|❓)/gu, 
    '<span class="emoji">$1</span>');
  
  return result;
}

/**
 * Process markdown tables into premium styled HTML tables
 */
function processTables(html: string): string {
  const lines = html.split('\n');
  const result: string[] = [];
  let tableLines: string[] = [];
  let inTable = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if line looks like a table row (starts and ends with |)
    if (line.startsWith('|') && line.endsWith('|')) {
      // Check if it's a separator row (|:---|:---:|---:|)
      const isSeparator = /^\|[\s:-]+\|$/.test(line.replace(/\|/g, '|').replace(/[:\-\s]/g, ''));
      
      if (!inTable) {
        inTable = true;
        tableLines = [];
      }
      tableLines.push(line);
    } else {
      if (inTable && tableLines.length > 0) {
        result.push(renderTable(tableLines));
        tableLines = [];
        inTable = false;
      }
      result.push(lines[i]); // Keep original line (with indentation)
    }
  }
  
  // Handle table at end of content
  if (inTable && tableLines.length > 0) {
    result.push(renderTable(tableLines));
  }
  
  return result.join('\n');
}

/**
 * Render a markdown table as premium styled HTML
 */
function renderTable(tableLines: string[]): string {
  if (tableLines.length < 2) return tableLines.join('\n');
  
  // Parse header
  const headerCells = parseTableRow(tableLines[0]);
  
  // Check for separator row (line 2)
  let alignments: ('left' | 'center' | 'right')[] = [];
  let bodyStartIndex = 1;
  
  if (tableLines[1] && /^[\s|:-]+$/.test(tableLines[1])) {
    alignments = parseTableAlignments(tableLines[1]);
    bodyStartIndex = 2;
  }
  
  // Parse body rows
  const bodyRows: string[][] = [];
  for (let i = bodyStartIndex; i < tableLines.length; i++) {
    if (tableLines[i].trim()) {
      bodyRows.push(parseTableRow(tableLines[i]));
    }
  }
  
  // Build HTML table with premium styling
  let html = '<div class="table-wrapper"><table class="premium-table">';
  
  // Header
  if (headerCells.length > 0) {
    html += '<thead><tr>';
    headerCells.forEach((cell, idx) => {
      const align = alignments[idx] || 'left';
      html += `<th style="text-align: ${align}">${parseInline(cell.trim())}</th>`;
    });
    html += '</tr></thead>';
  }
  
  // Body
  if (bodyRows.length > 0) {
    html += '<tbody>';
    bodyRows.forEach(row => {
      html += '<tr>';
      row.forEach((cell, idx) => {
        const align = alignments[idx] || 'left';
        const content = cell.trim();
        // Render empty cells with placeholder for visual consistency
        html += `<td style="text-align: ${align}">${content ? parseInline(content) : '<span class="empty-cell">—</span>'}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody>';
  }
  
  html += '</table></div>';
  return html;
}

/**
 * Parse a table row into cells
 */
function parseTableRow(row: string): string[] {
  // Remove leading and trailing pipes, then split
  const trimmed = row.trim();
  const withoutPipes = trimmed.startsWith('|') ? trimmed.slice(1) : trimmed;
  const final = withoutPipes.endsWith('|') ? withoutPipes.slice(0, -1) : withoutPipes;
  return final.split('|');
}

/**
 * Parse table alignment row
 */
function parseTableAlignments(row: string): ('left' | 'center' | 'right')[] {
  const cells = parseTableRow(row);
  return cells.map(cell => {
    const trimmed = cell.trim();
    if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
    if (trimmed.endsWith(':')) return 'right';
    return 'left';
  });
}

/**
 * Process blockquotes with special example/tip detection
 */
function processBlockquotes(html: string): string {
  // Multi-line blockquotes
  const blockquoteRegex = /^(?:>\s*.+\n?)+/gm;
  
  return html.replace(blockquoteRegex, (match) => {
    const content = match
      .split('\n')
      .map(line => line.replace(/^>\s*/, ''))
      .join('<br>')
      .trim();
    
    // Detect example blocks
    if (content.includes('**Ejemplo:**') || content.startsWith('Ejemplo:')) {
      return `<div class="example-block">
        <div class="example-header">💡 Ejemplo</div>
        <div class="example-content">${parseInline(content.replace(/\*\*Ejemplo:\*\*\s*/i, ''))}</div>
      </div>`;
    }
    
    // Detect tip/warning blocks
    if (content.startsWith('💡') || content.includes('**Tip:**')) {
      return `<div class="tip-block">
        <div class="tip-content">${parseInline(content)}</div>
      </div>`;
    }
    
    if (content.startsWith('⚠️') || content.includes('**Cuidado:**') || content.includes('**Advertencia:**')) {
      return `<div class="warning-block">
        <div class="warning-content">${parseInline(content)}</div>
      </div>`;
    }
    
    return `<blockquote class="content-blockquote">${parseInline(content)}</blockquote>`;
  });
}

/**
 * Process unordered lists
 */
function processLists(html: string): string {
  const lines = html.split('\n');
  const result: string[] = [];
  let inList = false;
  let listItems: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const listMatch = line.match(/^[-*•]\s+(.+)$/);
    
    if (listMatch && !line.includes('checklist-item')) {
      if (!inList) {
        inList = true;
        listItems = [];
      }
      listItems.push(`<li>${parseInline(listMatch[1])}</li>`);
    } else {
      if (inList) {
        result.push(`<ul class="content-list">${listItems.join('')}</ul>`);
        inList = false;
        listItems = [];
      }
      result.push(line);
    }
  }
  
  if (inList) {
    result.push(`<ul class="content-list">${listItems.join('')}</ul>`);
  }
  
  return result.join('\n');
}

/**
 * Process ordered lists
 */
function processOrderedLists(html: string): string {
  const lines = html.split('\n');
  const result: string[] = [];
  let inList = false;
  let listItems: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const listMatch = line.match(/^\d+[.)]\s+(.+)$/);
    
    if (listMatch) {
      if (!inList) {
        inList = true;
        listItems = [];
      }
      listItems.push(`<li>${parseInline(listMatch[1])}</li>`);
    } else {
      if (inList) {
        result.push(`<ol class="content-ordered-list">${listItems.join('')}</ol>`);
        inList = false;
        listItems = [];
      }
      result.push(line);
    }
  }
  
  if (inList) {
    result.push(`<ol class="content-ordered-list">${listItems.join('')}</ol>`);
  }
  
  return result.join('\n');
}

/**
 * Wrap loose text in paragraphs
 */
function processParagraphs(html: string): string {
  const lines = html.split('\n');
  const result: string[] = [];
  let paragraphBuffer: string[] = [];
  
  const isBlockElement = (line: string): boolean => {
    const trimmed = line.trim();
    return trimmed.startsWith('<h') ||
           trimmed.startsWith('<ul') ||
           trimmed.startsWith('<ol') ||
           trimmed.startsWith('<li') ||
           trimmed.startsWith('<blockquote') ||
           trimmed.startsWith('<pre') ||
           trimmed.startsWith('<figure') ||
           trimmed.startsWith('<div') ||
           trimmed.startsWith('<table') ||
           trimmed.startsWith('<hr') ||
           trimmed.startsWith('</') ||
           trimmed === '';
  };
  
  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      const content = paragraphBuffer.join(' ').trim();
      if (content) {
        result.push(`<p>${parseInline(content)}</p>`);
      }
      paragraphBuffer = [];
    }
  };
  
  for (const line of lines) {
    if (isBlockElement(line)) {
      flushParagraph();
      if (line.trim()) {
        result.push(line);
      }
    } else {
      paragraphBuffer.push(line.trim());
    }
  }
  
  flushParagraph();
  
  return result.join('\n');
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
