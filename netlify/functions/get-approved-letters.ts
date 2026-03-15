import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

export default async (request: Request, _context: Context) => {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const store = getStore("love-letters");
    const { blobs } = await store.list();

    const letters = [];
    for (const blob of blobs) {
      const letter = await store.get(blob.key, { type: "json" }) as any;
      if (letter && letter.approved && letter.message && !letter.videoKey) {
        // Only return approved text letters with sanitized data (no email)
        letters.push({
          id: letter.id,
          authorName: letter.authorName || "Anonymous",
          letterType: letter.letterType,
          recipientName: letter.recipientName || "",
          message: letter.message,
          createdAt: letter.createdAt,
        });
      }
    }

    // Sort by newest first
    letters.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return new Response(JSON.stringify({ letters }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    console.error("Get approved letters error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to retrieve letters" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
