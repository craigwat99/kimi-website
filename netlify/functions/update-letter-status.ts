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

    const { letterId, approved } = body;
    if (!letterId || typeof approved !== "boolean") {
      return new Response(
        JSON.stringify({ error: "letterId and approved (boolean) are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const store = getStore("letters");
    const existing = await store.get(letterId, { type: "json" });

    if (!existing) {
      return new Response(
        JSON.stringify({ error: "Letter not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const updated = { ...existing, approved };
    await store.setJSON(letterId, updated);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error updating letter status:", err);
    return new Response(
      JSON.stringify({ error: "Failed to update letter status" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
