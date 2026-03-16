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
    const { timeline } = body;

    if (!Array.isArray(timeline)) {
      return new Response(JSON.stringify({ error: "Timeline array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const store = getStore("timeline");
    await store.setJSON("timeline-events", timeline);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error saving timeline:", err);
    return new Response(JSON.stringify({ error: "Failed to save timeline" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
