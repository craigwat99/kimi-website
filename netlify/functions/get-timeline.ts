import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (_req: Request, _context: Context) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
  };

  try {
    const store = getStore("timeline");
    const data = await store.get("timeline-events", { type: "json" });

    if (data) {
      return new Response(JSON.stringify({ timeline: data }), { status: 200, headers });
    }

    // No timeline stored yet - return empty to signal client should use defaults
    return new Response(JSON.stringify({ timeline: null }), { status: 200, headers });
  } catch (err) {
    console.error("Error fetching timeline:", err);
    return new Response(JSON.stringify({ timeline: null }), { status: 200, headers });
  }
};
