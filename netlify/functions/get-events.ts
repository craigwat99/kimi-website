import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (_req: Request, _context: Context) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=60",
  };

  try {
    const store = getStore("events");
    const { blobs } = await store.list();

    const events = [];
    for (const blob of blobs) {
      try {
        const data = await store.get(blob.key, { type: "json" });
        if (data) {
          events.push({ ...data, id: blob.key });
        }
      } catch {
        // Skip invalid entries
      }
    }

    // Sort by startDate ascending
    events.sort((a: { startDate: string }, b: { startDate: string }) =>
      new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime()
    );

    return new Response(JSON.stringify({ events }), { status: 200, headers });
  } catch (err) {
    console.error("Error fetching events:", err);
    return new Response(JSON.stringify({ events: [] }), { status: 200, headers });
  }
};
