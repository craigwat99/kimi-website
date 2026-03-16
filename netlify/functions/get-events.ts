import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

// Keys used by the old seed-events function — these are stale sample data
const SAMPLE_EVENT_KEYS = [
  "event-sample-1",
  "event-sample-2",
  "event-sample-3",
  "event-sample-4",
  "event-sample-5",
];

export default async (_req: Request, _context: Context) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
  };

  try {
    const store = getStore("events");
    const { blobs } = await store.list();

    const events = [];
    for (const blob of blobs) {
      // Skip and delete old sample events left over from seed-events
      if (SAMPLE_EVENT_KEYS.includes(blob.key)) {
        store.delete(blob.key).catch(() => {});
        continue;
      }

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
