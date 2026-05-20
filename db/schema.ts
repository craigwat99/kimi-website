import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const programmeOrders = pgTable("programme_orders", {
  id: serial().primaryKey(),
  contactName: text("contact_name").notNull(),
  organisationName: text("organisation_name").notNull(),
  postalAddress: text("postal_address").notNull(),
  numberOfProgrammes: integer("number_of_programmes").notNull(),
  mobileNumber: text("mobile_number").notNull(),
  deliveryNotes: text("delivery_notes"),
  status: text("status").notNull().default("pending"),
  trackingInfo: text("tracking_info"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
