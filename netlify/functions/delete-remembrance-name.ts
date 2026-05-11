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
    const { nameId } = body;

    if (!nameId) {
      return new Response(JSON.stringify({ error: "Name ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const store = getStore("remembrance-names");
    await store.delete(nameId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error deleting remembrance name:", err);
    return new Response(JSON.stringify({ error: "Failed to delete name" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
