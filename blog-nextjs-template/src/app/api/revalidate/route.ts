import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");

  // Validate secret
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { slug, cluster, type } = body;

    const revalidated: string[] = [];

    // Always revalidate home and sitemap
    revalidatePath("/");
    revalidated.push("/");

    revalidatePath("/sitemap.xml");
    revalidated.push("/sitemap.xml");

    // Revalidate specific post
    if (slug) {
      revalidatePath(`/${slug}`);
      revalidated.push(`/${slug}`);
    }

    // Revalidate cluster hub
    if (cluster) {
      revalidatePath(`/tema/${cluster}`);
      revalidated.push(`/tema/${cluster}`);
    }

    // If type is "full", revalidate all cluster pages
    if (type === "full") {
      const clusters = [
        "empleo",
        "ia-aplicada",
        "liderazgo",
        "servicios",
        "emprender",
        "tendencias",
      ];
      for (const c of clusters) {
        revalidatePath(`/tema/${c}`);
        revalidated.push(`/tema/${c}`);
      }
    }

    console.log(`[revalidate] Revalidated paths:`, revalidated);

    return NextResponse.json({
      success: true,
      revalidated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[revalidate] Error:", error);
    return NextResponse.json(
      { error: "Failed to revalidate", details: String(error) },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: "ok", service: "revalidate" });
}
