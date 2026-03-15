import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

export default async (request: Request, _context: Context) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { videoData, contentType } = await request.json();

    if (!videoData || !contentType) {
      return new Response(
        JSON.stringify({ error: "videoData and contentType are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const store = getStore("love-videos");
    const key = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

    // Decode base64 and store as binary
    const binaryString = atob(videoData);
    const bytes = new ArrayBuffer(binaryString.length);
    const view = new Uint8Array(bytes);
    for (let i = 0; i < binaryString.length; i++) {
      view[i] = binaryString.charCodeAt(i);
    }

    await store.set(key, bytes, { metadata: { contentType } });

    return new Response(JSON.stringify({ key }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Video upload error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to upload video" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
