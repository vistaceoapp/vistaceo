import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CANONICAL_DOMAIN = "https://www.vistaceo.com";
const SUPABASE_PROJECT_ID = "nlewrgmcawzcdazhfiyy";
const STORAGE_BUCKET = "blog-ssg-pages";

interface TestResult {
  slug: string;
  url: string;
  passed: boolean;
  checks: {
    name: string;
    passed: boolean;
    expected?: string;
    actual?: string;
    message?: string;
  }[];
  source: "ssg" | "edge" | "spa" | "404";
}

// ===== FETCH HTML FROM STORAGE =====
async function fetchStorageHtml(supabase: any, slug: string): Promise<string | null> {
  const storagePath = `blog/${slug}/index.html`;
  
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  try {
    const response = await fetch(data.publicUrl);
    if (response.ok) {
      return await response.text();
    }
  } catch (e) {
    console.log(`[Test] No SSG found for ${slug}`);
  }
  
  return null;
}

// ===== FETCH HTML FROM EDGE FUNCTION =====
async function fetchEdgeHtml(slug: string): Promise<string | null> {
  const edgeUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/blog-seo?slug=${slug}`;
  
  try {
    const response = await fetch(edgeUrl);
    if (response.ok) {
      return await response.text();
    }
  } catch (e) {
    console.log(`[Test] Edge function failed for ${slug}`);
  }
  
  return null;
}

// ===== EXTRACT META TAGS =====
function extractMeta(html: string, property: string): string | null {
  // Try og: and twitter: properties
  const ogMatch = html.match(new RegExp(`<meta\\s+property="${property}"\\s+content="([^"]*)"`, 'i'));
  if (ogMatch) return ogMatch[1];
  
  const ogMatch2 = html.match(new RegExp(`<meta\\s+content="([^"]*)"\\s+property="${property}"`, 'i'));
  if (ogMatch2) return ogMatch2[1];
  
  // Try name attribute
  const nameMatch = html.match(new RegExp(`<meta\\s+name="${property}"\\s+content="([^"]*)"`, 'i'));
  if (nameMatch) return nameMatch[1];
  
  const nameMatch2 = html.match(new RegExp(`<meta\\s+content="([^"]*)"\\s+name="${property}"`, 'i'));
  if (nameMatch2) return nameMatch2[1];
  
  return null;
}

function extractCanonical(html: string): string | null {
  const match = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
  if (match) return match[1];
  
  const match2 = html.match(/<link\s+href="([^"]*)"\s+rel="canonical"/i);
  if (match2) return match2[1];
  
  return null;
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title>([^<]*)<\/title>/i);
  return match ? match[1] : null;
}

function hasJsonLd(html: string, type: string): boolean {
  const regex = new RegExp(`"@type"\\s*:\\s*"${type}"`, 'i');
  return regex.test(html);
}

// ===== RUN TESTS FOR A SLUG =====
async function testSlug(supabase: any, slug: string): Promise<TestResult> {
  const expectedCanonical = `${CANONICAL_DOMAIN}/blog/${slug}`;
  const checks: TestResult["checks"] = [];
  let source: TestResult["source"] = "404";
  let html: string | null = null;

  // Try to get HTML from SSG storage first
  html = await fetchStorageHtml(supabase, slug);
  if (html) {
    source = "ssg";
  } else {
    // Fallback to edge function
    html = await fetchEdgeHtml(slug);
    if (html) {
      source = "edge";
    }
  }

  if (!html) {
    return {
      slug,
      url: expectedCanonical,
      passed: false,
      checks: [{ name: "HTML Available", passed: false, message: "No HTML found in SSG or edge function" }],
      source: "404"
    };
  }

  // Check 1: Title is not home page title
  const title = extractTitle(html);
  const isHomeTitleWords = ["vistaceo", "tu negocio", "inicio"].some(w => 
    title?.toLowerCase().includes(w) && !title?.toLowerCase().includes(slug.split("-")[0])
  );
  checks.push({
    name: "Title Not Home",
    passed: !!title && title.length > 10 && !title.toLowerCase().startsWith("vistaceo |"),
    expected: "Post-specific title",
    actual: title || "missing",
    message: isHomeTitleWords ? "Title may be generic home page title" : undefined
  });

  // Check 2: Canonical URL is correct
  const canonical = extractCanonical(html);
  checks.push({
    name: "Canonical URL",
    passed: canonical === expectedCanonical,
    expected: expectedCanonical,
    actual: canonical || "missing"
  });

  // Check 3: og:url is correct
  const ogUrl = extractMeta(html, "og:url");
  checks.push({
    name: "og:url",
    passed: ogUrl === expectedCanonical,
    expected: expectedCanonical,
    actual: ogUrl || "missing"
  });

  // Check 4: og:title exists and is not empty
  const ogTitle = extractMeta(html, "og:title");
  checks.push({
    name: "og:title",
    passed: !!ogTitle && ogTitle.length > 5,
    expected: "Non-empty title",
    actual: ogTitle || "missing"
  });

  // Check 5: og:description exists
  const ogDescription = extractMeta(html, "og:description");
  checks.push({
    name: "og:description",
    passed: !!ogDescription && ogDescription.length > 20,
    expected: "Description > 20 chars",
    actual: ogDescription ? `${ogDescription.substring(0, 50)}...` : "missing"
  });

  // Check 6: og:image is a valid URL (not base64, not empty)
  const ogImage = extractMeta(html, "og:image");
  const isValidImage = !!ogImage && 
    ogImage.startsWith("https://") && 
    !ogImage.startsWith("data:");
  checks.push({
    name: "og:image Valid",
    passed: isValidImage,
    expected: "HTTPS URL (not base64)",
    actual: ogImage ? (ogImage.length > 60 ? ogImage.substring(0, 60) + "..." : ogImage) : "missing"
  });

  // Check 7: meta description exists
  const metaDescription = extractMeta(html, "description");
  checks.push({
    name: "meta description",
    passed: !!metaDescription && metaDescription.length > 20,
    expected: "Description > 20 chars",
    actual: metaDescription ? `${metaDescription.substring(0, 50)}...` : "missing"
  });

  // Check 8: JSON-LD BlogPosting present
  checks.push({
    name: "JSON-LD BlogPosting",
    passed: hasJsonLd(html, "BlogPosting"),
    expected: "Present",
    actual: hasJsonLd(html, "BlogPosting") ? "Found" : "Missing"
  });

  // Check 9: JSON-LD BreadcrumbList present
  checks.push({
    name: "JSON-LD BreadcrumbList",
    passed: hasJsonLd(html, "BreadcrumbList"),
    expected: "Present",
    actual: hasJsonLd(html, "BreadcrumbList") ? "Found" : "Missing"
  });

  // Check 10: Twitter card
  const twitterCard = extractMeta(html, "twitter:card");
  checks.push({
    name: "twitter:card",
    passed: twitterCard === "summary_large_image",
    expected: "summary_large_image",
    actual: twitterCard || "missing"
  });

  // Check 11: og:type is article
  const ogType = extractMeta(html, "og:type");
  checks.push({
    name: "og:type",
    passed: ogType === "article",
    expected: "article",
    actual: ogType || "missing"
  });

  // Check 12: Charset is UTF-8
  const hasUtf8 = html.includes('charset="utf-8"') || html.includes("charset='utf-8'") || html.includes('charset=utf-8');
  checks.push({
    name: "Charset UTF-8",
    passed: hasUtf8,
    expected: "utf-8",
    actual: hasUtf8 ? "utf-8" : "not found"
  });

  const allPassed = checks.every(c => c.passed);

  return {
    slug,
    url: expectedCanonical,
    passed: allPassed,
    checks,
    source
  };
}

// ===== MAIN HANDLER =====
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const slugParam = url.searchParams.get("slug");
    const testAll = url.searchParams.get("all") === "true";

    let slugsToTest: string[] = [];

    if (slugParam) {
      // Single slug test
      slugsToTest = [slugParam];
    } else if (testAll) {
      // Test all published posts
      const { data: posts } = await supabase
        .from("blog_posts")
        .select("slug")
        .eq("status", "published")
        .limit(50);
      
      slugsToTest = posts?.map(p => p.slug).filter(Boolean) || [];
    } else {
      // Default: test 3 sample slugs
      slugsToTest = [
        "habilidades-que-te-hacen-contratable-aunque-no-tengas-titulo-tech",
        "agujeros-rentabilidad-servicios-profesionales",
        "agentes-de-ia-que-son-y-para-que-sirven-en-una-empresa-real"
      ];
    }

    console.log(`[SEO Test] Testing ${slugsToTest.length} slugs...`);

    const results: TestResult[] = [];
    
    for (const slug of slugsToTest) {
      const result = await testSlug(supabase, slug);
      results.push(result);
      console.log(`[SEO Test] ${result.passed ? "✓ PASS" : "✗ FAIL"}: ${slug} (source: ${result.source})`);
    }

    const passedCount = results.filter(r => r.passed).length;
    const summary = {
      total: results.length,
      passed: passedCount,
      failed: results.length - passedCount,
      passRate: `${Math.round((passedCount / results.length) * 100)}%`,
      results
    };

    return new Response(
      JSON.stringify(summary, null, 2),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );

  } catch (error: any) {
    console.error("[SEO Test] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
