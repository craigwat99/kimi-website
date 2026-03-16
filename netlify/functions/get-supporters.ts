import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (_req: Request, _context: Context) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
  };

  try {
    const store = getStore("supporters");
    const { blobs } = await store.list();

    const supporters = [];
    for (const blob of blobs) {
      try {
        const data = await store.get(blob.key, { type: "json" });
        if (data) {
          supporters.push({ ...data, id: blob.key });
        }
      } catch {
        // Skip invalid entries
      }
    }

    // Sort by level priority: gold first, then silver, then bronze
    const levelOrder: Record<string, number> = { gold: 0, silver: 1, bronze: 2 };
    supporters.sort((a: { level: string; name: string }, b: { level: string; name: string }) => {
      const levelDiff = (levelOrder[a.level] ?? 3) - (levelOrder[b.level] ?? 3);
      if (levelDiff !== 0) return levelDiff;
      return a.name.localeCompare(b.name);
    });

    return new Response(JSON.stringify({ supporters }), { status: 200, headers });
  } catch (err) {
    console.error("Error fetching supporters:", err);
    return new Response(JSON.stringify({ supporters: [] }), { status: 200, headers });
  }
};
