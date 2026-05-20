CREATE TABLE "programme_orders" (
	"id" serial PRIMARY KEY,
	"contact_name" text NOT NULL,
	"organisation_name" text NOT NULL,
	"postal_address" text NOT NULL,
	"number_of_programmes" integer NOT NULL,
	"mobile_number" text NOT NULL,
	"delivery_notes" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"tracking_info" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
