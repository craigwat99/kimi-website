import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

export default async (request: Request, _context: Context) => {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return new Response("Missing key parameter", { status: 400 });
  }

  try {
    const store = getStore("supporter-logos");
    const blob = await store.getWithMetadata(key, { type: "arrayBuffer" });

    if (!blob || !blob.data) {
      return new Response("Logo not found", { status: 404 });
    }

    const contentType =
      (blob.metadata as Record<string, string>)?.contentType ||
      "image/png";

    return new Response(blob.data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Get logo error:", err);
    return new Response("Failed to retrieve logo", { status: 500 });
  }
};
