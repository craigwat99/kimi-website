import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (_req: Request, _context: Context) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=300",
  };

  try {
    const store = getStore("letters");
    const { blobs } = await store.list();

    const letters = [];
    for (const blob of blobs) {
      try {
        const data = await store.get(blob.key, { type: "json" }) as Record<string, unknown>;
        // Only return approved text letters (no video), sanitized
        if (data && data.approved && !data.videoKey) {
          letters.push({
            id: blob.key,
            authorName: data.authorName || "Anonymous",
            letterType: data.letterType || "to-myself",
            message: data.message || "",
            imageKey: data.imageKey || null,
            createdAt: data.createdAt || "",
          });
        }
      } catch {
        // Skip invalid entries
      }
    }

    // Sort by creation date, newest first
    letters.sort((a: { createdAt: string }, b: { createdAt: string }) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    return new Response(JSON.stringify({ letters }), { status: 200, headers });
  } catch (err) {
    console.error("Error fetching approved letters:", err);
    return new Response(JSON.stringify({ letters: [] }), { status: 200, headers });
  }
};
