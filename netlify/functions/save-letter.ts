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
    const { authorName, email, letterType, recipientName, message, videoKey, imageKey, galaPermission } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const store = getStore("letters");
    const id = `letter-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const letter = {
      authorName: authorName || "Anonymous",
      email,
      letterType: letterType || "to-myself",
      recipientName: recipientName || "",
      message: message || "",
      videoKey: videoKey || null,
      imageKey: imageKey || null,
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
    console.error("Error saving letter:", err);
    return new Response(JSON.stringify({ error: "Failed to save letter" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
