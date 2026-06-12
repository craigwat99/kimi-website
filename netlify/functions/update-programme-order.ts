import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { programmeOrders } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export default async (req: Request) => {
  if (req.method !== "PUT") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const deliveryPassword = process.env.DELIVERY_PASSWORD;
  const authHeader = req.headers.get("x-admin-password");

  const authorized = !!authHeader && (
    (!!adminPassword && authHeader === adminPassword) ||
    (!!deliveryPassword && authHeader === deliveryPassword)
  );

  if (!authorized) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status, trackingInfo } = body;

    if (!id) {
      return Response.json({ error: "Order ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (status !== undefined) updateData.status = status;
    if (trackingInfo !== undefined) updateData.trackingInfo = trackingInfo;

    const [updated] = await db.update(programmeOrders)
      .set(updateData)
      .where(eq(programmeOrders.id, Number(id)))
      .returning();

    if (!updated) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    return Response.json({ success: true, order: updated });
  } catch (err) {
    console.error("Error updating programme order:", err);
    return Response.json({ error: "Failed to update order" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/programme-orders",
  method: "PUT",
};
