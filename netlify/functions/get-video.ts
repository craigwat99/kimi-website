import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

export default async (request: Request, _context: Context) => {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return new Response(JSON.stringify({ error: "key parameter is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const store = getStore("love-videos");
    const blob = await store.getWithMetadata(key, { type: "arrayBuffer" });

    if (!blob || !blob.data) {
      return new Response("Video not found", { status: 404 });
    }

    const contentType = (blob.metadata as any)?.contentType || "video/webm";

    return new Response(blob.data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Get video error:", err);
    return new Response("Failed to retrieve video", { status: 500 });
  }
};
