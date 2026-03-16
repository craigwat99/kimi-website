import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, _context: Context) => {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return new Response(JSON.stringify({ error: "Video key is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const store = getStore("videos");
    const { data, metadata } = await store.getWithMetadata(key, { type: "arrayBuffer" });

    if (!data) {
      return new Response(JSON.stringify({ error: "Video not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const contentType = (metadata as { contentType?: string })?.contentType || "video/webm";

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Error fetching video:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch video" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
