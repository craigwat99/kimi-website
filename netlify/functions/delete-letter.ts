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
    const { password, letterId } = await request.json();
    const adminPassword = Netlify.env.get("ADMIN_PASSWORD");

    if (!adminPassword || password !== adminPassword) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!letterId) {
      return new Response(
        JSON.stringify({ error: "letterId is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const store = getStore("love-letters");
    const letter = await store.get(letterId, { type: "json" }) as any;

    // If there's a video, delete it too
    if (letter?.videoKey) {
      const videoStore = getStore("love-videos");
      await videoStore.delete(letter.videoKey);
    }

    await store.delete(letterId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Delete letter error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to delete letter" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
