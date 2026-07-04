import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const urlParams = new URL(request.url).searchParams;
  const imageUrl = urlParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        // Spoof as a standard browser to bypass simple WAF/hotlink protections
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://bacalightnovel.co/", // Spoof the referer just in case
      },
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch image from upstream", { status: response.status });
    }

    // Stream the image back to the client
    const headers = new Headers();
    const contentType = response.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);

    // Cache the image on our Vercel edge/CDN for 1 day
    headers.set("Cache-Control", "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400");

    return new NextResponse(response.body, { headers, status: 200 });
  } catch (error) {
    console.error("Image proxy error:", error);
    return new NextResponse("Internal server error fetching image", { status: 500 });
  }
}
