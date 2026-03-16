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
    const { supporter } = body;

    if (!supporter || !supporter.name) {
      return new Response(JSON.stringify({ error: "Supporter data with name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const store = getStore("supporters");
    const id = supporter.id || `supporter-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const supporterData = { ...supporter };
    delete supporterData.id;

    await store.setJSON(id, supporterData);

    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error saving supporter:", err);
    return new Response(JSON.stringify({ error: "Failed to save supporter" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
