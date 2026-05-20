import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { programmeOrders } from "../../db/schema.js";
import { desc } from "drizzle-orm";

export default async (req: Request) => {
  if (req.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const authHeader = req.headers.get("x-admin-password");

  if (!adminPassword || authHeader !== adminPassword) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await db.select().from(programmeOrders).orderBy(desc(programmeOrders.createdAt));
    return Response.json({ orders });
  } catch (err) {
    console.error("Error fetching programme orders:", err);
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/programme-orders",
  method: "GET",
};
