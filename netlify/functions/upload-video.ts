import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { videoData, contentType } = body;

    if (!videoData) {
      return new Response(JSON.stringify({ error: "Video data is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const store = getStore("videos");
    const key = `video-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Convert base64 to buffer
    const buffer = Buffer.from(videoData, "base64");

    await store.set(key, buffer, {
      metadata: { contentType: contentType || "video/webm" },
    });

    return new Response(JSON.stringify({ success: true, key }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error uploading video:", err);
    return new Response(JSON.stringify({ error: "Failed to upload video" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
