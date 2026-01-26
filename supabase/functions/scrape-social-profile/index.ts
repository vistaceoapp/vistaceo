import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScrapeResult {
  platform: "instagram" | "facebook";
  success: boolean;
  profileUrl: string;
  data?: {
    username?: string;
    name?: string;
    bio?: string;
    followers?: number;
    following?: number;
    posts?: number;
    profilePicture?: string;
    isVerified?: boolean;
    category?: string;
    website?: string;
    recentPosts?: Array<{
      type: string;
      likes?: number;
      comments?: number;
      caption?: string;
    }>;
  };
  error?: string;
  scrapedAt: string;
}

// Parse Instagram profile data from scraped HTML/content
function parseInstagramData(content: string, markdown: string): ScrapeResult["data"] {
  const data: ScrapeResult["data"] = {};
  
  // Try to extract username from URL or content
  const usernameMatch = markdown.match(/@([a-zA-Z0-9_.]+)/);
  if (usernameMatch) data.username = usernameMatch[1];
  
  // Extract follower count
  const followersPatterns = [
    /(\d+(?:[\.,]\d+)?)\s*(?:mil|k|K)\s*(?:seguidores|followers)/i,
    /(\d+(?:[\.,]\d+)?)\s*(?:M|m)\s*(?:seguidores|followers)/i,
    /(\d+(?:,\d{3})*)\s*(?:seguidores|followers)/i,
    /Followers[:\s]*(\d+(?:[\.,]\d+)?[KMkm]?)/i,
  ];
  
  for (const pattern of followersPatterns) {
    const match = markdown.match(pattern) || content.match(pattern);
    if (match) {
      let count = match[1].replace(/,/g, "");
      if (count.toLowerCase().includes("k") || count.toLowerCase().includes("mil")) {
        count = String(parseFloat(count.replace(/[kKmil]/gi, "")) * 1000);
      } else if (count.toLowerCase().includes("m")) {
        count = String(parseFloat(count.replace(/[mM]/gi, "")) * 1000000);
      }
      data.followers = Math.round(parseFloat(count));
      break;
    }
  }
  
  // Extract posts count
  const postsPatterns = [
    /(\d+(?:,\d{3})*)\s*(?:publicaciones|posts|publicações)/i,
    /Posts[:\s]*(\d+)/i,
  ];
  
  for (const pattern of postsPatterns) {
    const match = markdown.match(pattern) || content.match(pattern);
    if (match) {
      data.posts = parseInt(match[1].replace(/,/g, ""), 10);
      break;
    }
  }
  
  // Extract following count
  const followingPatterns = [
    /(?:siguiendo|following|seguindo)[:\s]*(\d+(?:[\.,]\d+)?[KMkm]?)/i,
    /(\d+)\s*(?:siguiendo|following)/i,
  ];
  
  for (const pattern of followingPatterns) {
    const match = markdown.match(pattern) || content.match(pattern);
    if (match) {
      let count = match[1].replace(/,/g, "");
      if (count.toLowerCase().includes("k")) {
        count = String(parseFloat(count.replace(/[kK]/g, "")) * 1000);
      }
      data.following = Math.round(parseFloat(count));
      break;
    }
  }
  
  // Extract bio
  const bioMatch = markdown.match(/(?:bio|biography)[:\s]+"([^"]+)"/i) ||
                   markdown.match(/(?:description)[:\s]+(.+?)(?:\n|$)/i);
  if (bioMatch) data.bio = bioMatch[1].trim();
  
  // Check for verified badge
  data.isVerified = markdown.toLowerCase().includes("verified") || 
                    content.includes("verified_badge") ||
                    markdown.includes("✓");
  
  return data;
}

// Parse Facebook page data from scraped content
function parseFacebookData(content: string, markdown: string): ScrapeResult["data"] {
  const data: ScrapeResult["data"] = {};
  
  // Extract page name
  const nameMatch = markdown.match(/^#\s*(.+?)(?:\n|$)/m);
  if (nameMatch) data.name = nameMatch[1].trim();
  
  // Extract likes/followers
  const likesPatterns = [
    /(\d+(?:[\.,]\d+)?)\s*(?:mil|k|K)\s*(?:me gusta|likes|curtidas)/i,
    /(\d+(?:[\.,]\d+)?)\s*(?:M|m)\s*(?:me gusta|likes)/i,
    /(\d+(?:,\d{3})*)\s*(?:me gusta|likes|curtidas)/i,
    /Likes[:\s]*(\d+(?:[\.,]\d+)?[KMkm]?)/i,
  ];
  
  for (const pattern of likesPatterns) {
    const match = markdown.match(pattern) || content.match(pattern);
    if (match) {
      let count = match[1].replace(/,/g, "").replace(/\./g, "");
      if (count.toLowerCase().includes("k") || count.toLowerCase().includes("mil")) {
        count = String(parseFloat(count.replace(/[kKmil]/gi, "")) * 1000);
      } else if (count.toLowerCase().includes("m")) {
        count = String(parseFloat(count.replace(/[mM]/gi, "")) * 1000000);
      }
      data.followers = Math.round(parseFloat(count));
      break;
    }
  }
  
  // Extract category
  const categoryMatch = markdown.match(/(?:categoría|category)[:\s]+(.+?)(?:\n|$)/i);
  if (categoryMatch) data.category = categoryMatch[1].trim();
  
  // Check for verification
  data.isVerified = markdown.toLowerCase().includes("verified") ||
                    markdown.includes("✓") ||
                    content.includes("verified");
  
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profileUrl, businessId, platform } = await req.json();

    if (!profileUrl || !businessId) {
      return new Response(
        JSON.stringify({ error: "profileUrl and businessId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      console.error("FIRECRAWL_API_KEY not configured");
      return new Response(
        JSON.stringify({ 
          error: "Scraping service not configured",
          needsSetup: true 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize URL
    let normalizedUrl = profileUrl.trim();
    if (!normalizedUrl.startsWith("http")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Detect platform from URL
    let detectedPlatform: "instagram" | "facebook" = platform;
    if (!detectedPlatform) {
      if (normalizedUrl.includes("instagram.com")) {
        detectedPlatform = "instagram";
      } else if (normalizedUrl.includes("facebook.com") || normalizedUrl.includes("fb.com")) {
        detectedPlatform = "facebook";
      } else {
        return new Response(
          JSON.stringify({ error: "URL must be from Instagram or Facebook" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`[scrape-social] Scraping ${detectedPlatform}: ${normalizedUrl}`);

    // Call Firecrawl API
    const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: normalizedUrl,
        formats: ["markdown", "html"],
        onlyMainContent: true,
        waitFor: 3000, // Wait for dynamic content
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok || !scrapeData.success) {
      console.error("Firecrawl error:", scrapeData);
      return new Response(
        JSON.stringify({ 
          error: scrapeData.error || "Failed to scrape profile",
          platform: detectedPlatform,
          success: false 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the scraped content
    const content = scrapeData.data?.html || "";
    const markdown = scrapeData.data?.markdown || "";
    
    let profileData: ScrapeResult["data"] = {};
    if (detectedPlatform === "instagram") {
      profileData = parseInstagramData(content, markdown) || {};
    } else {
      profileData = parseFacebookData(content, markdown) || {};
    }

    // Extract username from URL if not found
    if (!profileData?.username && !profileData?.name) {
      const urlPath = new URL(normalizedUrl).pathname;
      const username = urlPath.split("/").filter(Boolean)[0];
      if (username && profileData) {
        profileData.username = username;
        profileData.name = username;
      }
    }

    const result: ScrapeResult = {
      platform: detectedPlatform,
      success: true,
      profileUrl: normalizedUrl,
      data: profileData,
      scrapedAt: new Date().toISOString(),
    };

    // Save to database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Upsert the integration with scraped data
    const { error: upsertError } = await supabase
      .from("business_integrations")
      .upsert({
        business_id: businessId,
        integration_type: detectedPlatform,
        status: "scraped", // New status for non-OAuth connections
        credentials: { profile_url: normalizedUrl },
        metadata: {
          ...profileData,
          source: "scraping",
          scraped_at: result.scrapedAt,
          last_sync_at: result.scrapedAt,
        },
        last_sync_at: result.scrapedAt,
      }, {
        onConflict: "business_id,integration_type",
      });

    if (upsertError) {
      console.error("Error saving scraped data:", upsertError);
    } else {
      console.log(`[scrape-social] Saved ${detectedPlatform} data for business ${businessId}`);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error scraping social profile:", error);
    return new Response(
      JSON.stringify({ error: "Failed to scrape profile", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
