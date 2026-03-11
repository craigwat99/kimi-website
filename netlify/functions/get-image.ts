import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

export default async (request: Request, _context: Context) => {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return new Response("Missing key parameter", { status: 400 });
  }

  try {
    const store = getStore("event-images");
    const blob = await store.getWithMetadata(key, { type: "arrayBuffer" });

    if (!blob || !blob.data) {
      return new Response("Image not found", { status: 404 });
    }

    const contentType =
      (blob.metadata as Record<string, string>)?.contentType ||
      "image/jpeg";

    return new Response(blob.data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Get image error:", err);
    return new Response("Failed to retrieve image", { status: 500 });
  }
};
