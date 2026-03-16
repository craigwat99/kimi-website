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
    const { imageData, contentType } = await request.json();

    if (!imageData || !contentType) {
      return new Response(
        JSON.stringify({ error: "imageData and contentType are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const store = getStore("letter-images");
    const key = `letter-img-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

    const binaryString = atob(imageData);
    const bytes = new ArrayBuffer(binaryString.length);
    const view = new Uint8Array(bytes);
    for (let i = 0; i < binaryString.length; i++) {
      view[i] = binaryString.charCodeAt(i);
    }

    await store.set(key, bytes, { metadata: { contentType } });

    const imageUrl = `/.netlify/functions/get-letter-image?key=${key}`;

    return new Response(JSON.stringify({ url: imageUrl, key }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Upload letter image error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to upload image" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
