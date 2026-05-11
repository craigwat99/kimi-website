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
    const { name, id } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return new Response(JSON.stringify({ error: "Name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const store = getStore("remembrance-names");
    const entryId = id || `name-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await store.setJSON(entryId, {
      name: name.trim(),
      createdAt: id ? (body.createdAt || new Date().toISOString()) : new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true, id: entryId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error saving remembrance name:", err);
    return new Response(JSON.stringify({ error: "Failed to save name" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
