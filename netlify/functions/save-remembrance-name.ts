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
    const { name, id, oldFallbackName } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return new Response(JSON.stringify({ error: "Name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const store = getStore("remembrance-names");

    // If editing a fallback name, add the old name to the removed list
    if (oldFallbackName) {
      let removedFallback: string[] = [];
      try {
        const removed = await store.get("__removed_fallback__", { type: "json" }) as { names: string[] } | null;
        if (removed?.names) {
          removedFallback = removed.names;
        }
      } catch {
        // No removed list yet
      }

      if (!removedFallback.includes(oldFallbackName)) {
        removedFallback.push(oldFallbackName);
      }
      await store.setJSON("__removed_fallback__", { names: removedFallback });
    }

    // For fallback edits, always create a new custom entry
    const isEditingFallback = typeof id === "string" && id.startsWith("fallback:");
    const entryId = isEditingFallback
      ? `name-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      : (id || `name-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

    await store.setJSON(entryId, {
      name: name.trim(),
      createdAt: (!id || isEditingFallback) ? new Date().toISOString() : (body.createdAt || new Date().toISOString()),
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
