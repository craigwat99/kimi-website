import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

export default async (request: Request, _context: Context) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Verify admin password
    const { password } = await request.json();
    const adminPassword = Netlify.env.get("ADMIN_PASSWORD");

    if (!adminPassword || password !== adminPassword) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const store = getStore("love-letters");
    const { blobs } = await store.list();

    const letters = [];
    for (const blob of blobs) {
      const letter = await store.get(blob.key, { type: "json" });
      if (letter) {
        letters.push(letter);
      }
    }

    // Sort by newest first
    letters.sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return new Response(JSON.stringify({ letters }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Get letters error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to retrieve letters" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
