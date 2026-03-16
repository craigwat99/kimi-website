import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return new Response(
      JSON.stringify({ error: "Admin password not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    if (body.password !== adminPassword) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { letterId } = body;
    if (!letterId) {
      return new Response(
        JSON.stringify({ error: "letterId is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const store = getStore("letters");

    // Get the letter first to check for associated video
    const letter = await store.get(letterId, { type: "json" });
    if (letter && letter.videoKey) {
      try {
        const videoStore = getStore("videos");
        await videoStore.delete(letter.videoKey);
      } catch {
        // Video may already be deleted
      }
    }

    await store.delete(letterId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error deleting letter:", err);
    return new Response(
      JSON.stringify({ error: "Failed to delete letter" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
