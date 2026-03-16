import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return new Response(
      JSON.stringify({ error: "Admin password not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    if (body.password !== adminPassword) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const store = getStore("letters");
    const { blobs } = await store.list();

    const letters = [];
    for (const blob of blobs) {
      try {
        const data = await store.get(blob.key, { type: "json" });
        if (data) {
          letters.push({ id: blob.key, ...data });
        }
      } catch {
        // Skip invalid entries
      }
    }

    // Sort by creation date, newest first
    letters.sort(
      (a: { createdAt?: string }, b: { createdAt?: string }) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    return new Response(JSON.stringify({ letters }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching letters:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch letters" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
