/**
 * VistaSEOOS P2.1 — SEO Linter Editorial
 * Validates blog posts before publishing for SEO compliance
 */

export interface SEOLintResult {
  passed: boolean;
  score: number; // 0-100
  issues: SEOIssue[];
  warnings: SEOWarning[];
  suggestions: string[];
}

export interface SEOIssue {
  code: string;
  severity: 'error' | 'warning';
  message: string;
  field: string;
}

export interface SEOWarning {
  code: string;
  message: string;
  suggestion: string;
}

interface BlogPostData {
  title: string;
  slug: string;
  excerpt?: string | null;
  content_md: string;
  meta_title?: string | null;
  meta_description?: string | null;
  hero_image_url?: string | null;
  image_alt_text?: string | null;
  tags?: string[] | null;
  pillar?: string | null;
  primary_keyword?: string | null;
  secondary_keywords?: string[] | null;
}

// ===== VALIDATION RULES =====

const TITLE_MIN_LENGTH = 30;
const TITLE_MAX_LENGTH = 70;
const META_DESC_MIN_LENGTH = 120;
const META_DESC_MAX_LENGTH = 160;
const CONTENT_MIN_WORDS = 800;
const CONTENT_IDEAL_WORDS = 1500;
const H2_MIN_COUNT = 3;
const INTERNAL_LINKS_MIN = 2;
const IMAGES_MIN = 2;
const PARAGRAPH_MAX_WORDS = 100;

// ===== HELPER FUNCTIONS =====

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function extractHeadings(markdown: string): { level: number; text: string }[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: { level: number; text: string }[] = [];
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].replace(/[*_`]/g, '').trim()
    });
  }
  return headings;
}

function extractLinks(markdown: string): { text: string; url: string; isInternal: boolean }[] {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links: { text: string; url: string; isInternal: boolean }[] = [];
  let match;
  while ((match = linkRegex.exec(markdown)) !== null) {
    const url = match[2];
    links.push({
      text: match[1],
      url,
      isInternal: url.startsWith('/') || url.includes('vistaceo.com')
    });
  }
  return links;
}

function extractImages(markdown: string): { alt: string; src: string }[] {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const images: { alt: string; src: string }[] = [];
  let match;
  while ((match = imageRegex.exec(markdown)) !== null) {
    images.push({
      alt: match[1],
      src: match[2]
    });
  }
  return images;
}

function countParagraphs(markdown: string): { total: number; long: number } {
  const paragraphs = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#.*$/gm, '')
    .split(/\n\n+/)
    .filter(p => p.trim().length > 50);
  
  const longParagraphs = paragraphs.filter(p => countWords(p) > PARAGRAPH_MAX_WORDS);
  
  return {
    total: paragraphs.length,
    long: longParagraphs.length
  };
}

function hasKeywordInTitle(title: string, keyword: string | null | undefined): boolean {
  if (!keyword) return false;
  const normalizedTitle = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalizedKeyword = keyword.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return normalizedTitle.includes(normalizedKeyword);
}

function hasKeywordInFirstParagraph(content: string, keyword: string | null | undefined): boolean {
  if (!keyword) return false;
  const firstPara = content.replace(/^#.*\n/gm, '').split(/\n\n/)[0] || '';
  const normalizedContent = firstPara.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalizedKeyword = keyword.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return normalizedContent.includes(normalizedKeyword);
}

// ===== MAIN LINTER =====

export function lintBlogPost(post: BlogPostData): SEOLintResult {
  const issues: SEOIssue[] = [];
  const warnings: SEOWarning[] = [];
  const suggestions: string[] = [];
  
  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt || '';
  const content = post.content_md || '';
  const wordCount = countWords(content);
  const headings = extractHeadings(content);
  const links = extractLinks(content);
  const images = extractImages(content);
  const paragraphs = countParagraphs(content);
  
  // ===== CRITICAL CHECKS (ERRORS) =====
  
  // Title length
  if (title.length < TITLE_MIN_LENGTH) {
    issues.push({
      code: 'TITLE_TOO_SHORT',
      severity: 'error',
      message: `Título muy corto (${title.length} chars). Mínimo: ${TITLE_MIN_LENGTH}`,
      field: 'title'
    });
  } else if (title.length > TITLE_MAX_LENGTH) {
    issues.push({
      code: 'TITLE_TOO_LONG',
      severity: 'error',
      message: `Título muy largo (${title.length} chars). Máximo: ${TITLE_MAX_LENGTH}`,
      field: 'title'
    });
  }
  
  // Meta description length
  if (description.length < META_DESC_MIN_LENGTH) {
    issues.push({
      code: 'META_DESC_TOO_SHORT',
      severity: 'error',
      message: `Meta descripción muy corta (${description.length} chars). Mínimo: ${META_DESC_MIN_LENGTH}`,
      field: 'meta_description'
    });
  } else if (description.length > META_DESC_MAX_LENGTH) {
    warnings.push({
      code: 'META_DESC_TOO_LONG',
      message: `Meta descripción larga (${description.length} chars). Se truncará en buscadores.`,
      suggestion: `Reducir a menos de ${META_DESC_MAX_LENGTH} caracteres`
    });
  }
  
  // Single H1
  const h1Count = headings.filter(h => h.level === 1).length;
  if (h1Count > 1) {
    issues.push({
      code: 'MULTIPLE_H1',
      severity: 'error',
      message: `Múltiples H1 detectados (${h1Count}). Debe haber solo 1.`,
      field: 'content'
    });
  }
  
  // Content length
  if (wordCount < CONTENT_MIN_WORDS) {
    issues.push({
      code: 'CONTENT_TOO_SHORT',
      severity: 'error',
      message: `Contenido muy corto (${wordCount} palabras). Mínimo: ${CONTENT_MIN_WORDS}`,
      field: 'content'
    });
  }
  
  // H2 count
  const h2Count = headings.filter(h => h.level === 2).length;
  if (h2Count < H2_MIN_COUNT) {
    issues.push({
      code: 'FEW_H2',
      severity: 'warning',
      message: `Pocos H2 (${h2Count}). Recomendado: al menos ${H2_MIN_COUNT}`,
      field: 'content'
    });
  }
  
  // Hero image
  if (!post.hero_image_url) {
    issues.push({
      code: 'NO_HERO_IMAGE',
      severity: 'warning',
      message: 'Sin imagen principal. Afecta CTR en redes sociales.',
      field: 'hero_image_url'
    });
  } else if (post.hero_image_url.startsWith('data:')) {
    issues.push({
      code: 'BASE64_IMAGE',
      severity: 'error',
      message: 'Imagen en base64 detectada. Debe usar URL pública.',
      field: 'hero_image_url'
    });
  }
  
  // ===== WARNINGS =====
  
  // Internal links
  const internalLinks = links.filter(l => l.isInternal);
  if (internalLinks.length < INTERNAL_LINKS_MIN) {
    warnings.push({
      code: 'FEW_INTERNAL_LINKS',
      message: `Pocos enlaces internos (${internalLinks.length}). Recomendado: ${INTERNAL_LINKS_MIN}+`,
      suggestion: 'Agregar enlaces a otros artículos del blog para mejorar estructura'
    });
  }
  
  // Images in content
  if (images.length < IMAGES_MIN) {
    warnings.push({
      code: 'FEW_IMAGES',
      message: `Pocas imágenes (${images.length}). Recomendado: ${IMAGES_MIN}+`,
      suggestion: 'Agregar imágenes relevantes para mejorar engagement'
    });
  }
  
  // Images without alt
  const imagesWithoutAlt = images.filter(i => !i.alt || i.alt.trim().length < 5);
  if (imagesWithoutAlt.length > 0) {
    warnings.push({
      code: 'IMAGES_NO_ALT',
      message: `${imagesWithoutAlt.length} imagen(es) sin alt text adecuado`,
      suggestion: 'Agregar alt text descriptivo a todas las imágenes'
    });
  }
  
  // Long paragraphs
  if (paragraphs.long > 0) {
    warnings.push({
      code: 'LONG_PARAGRAPHS',
      message: `${paragraphs.long} párrafo(s) muy largos (${PARAGRAPH_MAX_WORDS}+ palabras)`,
      suggestion: 'Dividir párrafos largos para mejorar legibilidad'
    });
  }
  
  // Keyword in title
  if (post.primary_keyword && !hasKeywordInTitle(title, post.primary_keyword)) {
    warnings.push({
      code: 'KEYWORD_NOT_IN_TITLE',
      message: 'Keyword principal no está en el título',
      suggestion: `Incluir "${post.primary_keyword}" naturalmente en el título`
    });
  }
  
  // Keyword in first paragraph
  if (post.primary_keyword && !hasKeywordInFirstParagraph(content, post.primary_keyword)) {
    warnings.push({
      code: 'KEYWORD_NOT_IN_INTRO',
      message: 'Keyword principal no está en el primer párrafo',
      suggestion: `Mencionar "${post.primary_keyword}" en la introducción`
    });
  }
  
  // No pillar/cluster assigned
  if (!post.pillar) {
    warnings.push({
      code: 'NO_PILLAR',
      message: 'Sin pilar/cluster asignado',
      suggestion: 'Asignar a un cluster temático para mejor estructura'
    });
  }
  
  // No tags
  if (!post.tags || post.tags.length === 0) {
    warnings.push({
      code: 'NO_TAGS',
      message: 'Sin etiquetas',
      suggestion: 'Agregar 3-5 etiquetas relevantes'
    });
  }
  
  // ===== SUGGESTIONS =====
  
  if (wordCount < CONTENT_IDEAL_WORDS) {
    suggestions.push(`Considera expandir el contenido a ${CONTENT_IDEAL_WORDS}+ palabras para mejor ranking`);
  }
  
  if (links.filter(l => !l.isInternal).length === 0) {
    suggestions.push('Agregar 1-3 enlaces externos a fuentes de autoridad');
  }
  
  if (h2Count > 8) {
    suggestions.push('Muchos H2s. Considera agrupar secciones con H3s');
  }
  
  // ===== CALCULATE SCORE =====
  
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = warnings.length;
  
  let score = 100;
  score -= errorCount * 15;
  score -= warningCount * 5;
  score = Math.max(0, Math.min(100, score));
  
  const passed = errorCount === 0 && score >= 60;
  
  return {
    passed,
    score,
    issues,
    warnings,
    suggestions
  };
}

// ===== QUICK VALIDATION FOR PRE-PUBLISH =====

export function canPublish(post: BlogPostData): { allowed: boolean; blockers: string[] } {
  const result = lintBlogPost(post);
  const blockers = result.issues
    .filter(i => i.severity === 'error')
    .map(i => i.message);
  
  return {
    allowed: blockers.length === 0,
    blockers
  };
}
