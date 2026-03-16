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
    const { supporterId } = body;

    if (!supporterId) {
      return new Response(JSON.stringify({ error: "Supporter ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const store = getStore("supporters");
    await store.delete(supporterId);

    // Also try to delete the logo
    try {
      const logoStore = getStore("supporter-logos");
      await logoStore.delete(supporterId);
    } catch {
      // Logo may not exist
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error deleting supporter:", err);
    return new Response(JSON.stringify({ error: "Failed to delete supporter" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
