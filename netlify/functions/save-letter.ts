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
    const body = await request.json();
    const { authorName, email, letterType, recipientName, message, videoKey, galaPermission } = body;

    if (!email || (!message && !videoKey)) {
      return new Response(
        JSON.stringify({ error: "Email and either a message or video are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const store = getStore("love-letters");
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

    const letter = {
      id,
      authorName: authorName || "Anonymous",
      email,
      letterType: letterType || "to-myself",
      recipientName: recipientName || "",
      message: message || "",
      videoKey: videoKey || null,
      galaPermission: !!galaPermission,
      approved: false,
      createdAt: new Date().toISOString(),
    };

    await store.setJSON(id, letter);

    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Save letter error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to save letter" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
