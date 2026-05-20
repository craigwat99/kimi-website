import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { programmeOrders } from "../../db/schema.js";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await req.json();
    const { contactName, organisationName, postalAddress, numberOfProgrammes, mobileNumber, deliveryNotes } = body;

    if (!contactName || !organisationName || !postalAddress || !numberOfProgrammes || !mobileNumber) {
      return Response.json({ error: "All required fields must be provided" }, { status: 400 });
    }

    const quantity = parseInt(numberOfProgrammes, 10);
    if (isNaN(quantity) || quantity < 1) {
      return Response.json({ error: "Number of programmes must be at least 1" }, { status: 400 });
    }

    const [order] = await db.insert(programmeOrders).values({
      contactName: String(contactName).trim(),
      organisationName: String(organisationName).trim(),
      postalAddress: String(postalAddress).trim(),
      numberOfProgrammes: quantity,
      mobileNumber: String(mobileNumber).trim(),
      deliveryNotes: deliveryNotes ? String(deliveryNotes).trim() : null,
    }).returning();

    return Response.json({ success: true, order });
  } catch (err) {
    console.error("Error saving programme order:", err);
    return Response.json({ error: "Failed to save order" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/programme-orders",
  method: "POST",
};
