import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (_req: Request, _context: Context) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
  };

  try {
    const store = getStore("remembrance-names");
    const { blobs } = await store.list();

    const names: { id: string; name: string; createdAt: string }[] = [];
    for (const blob of blobs) {
      try {
        const data = await store.get(blob.key, { type: "json" }) as { name: string; createdAt: string } | null;
        if (data) {
          names.push({ ...data, id: blob.key });
        }
      } catch {
        // Skip invalid entries
      }
    }

    names.sort((a, b) => a.name.localeCompare(b.name));

    return new Response(JSON.stringify({ names }), { status: 200, headers });
  } catch (err) {
    console.error("Error fetching remembrance names:", err);
    return new Response(JSON.stringify({ names: [] }), { status: 200, headers });
  }
};
