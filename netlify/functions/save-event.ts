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
    const { event } = body;

    if (!event || !event.name) {
      return new Response(JSON.stringify({ error: "Event data with name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const store = getStore("events");
    const id = event.id || `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const eventData = { ...event };
    delete eventData.id; // id is the blob key, not stored in the value

    await store.setJSON(id, eventData);

    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error saving event:", err);
    return new Response(JSON.stringify({ error: "Failed to save event" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
