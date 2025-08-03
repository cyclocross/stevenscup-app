ALTER TABLE "events" ADD COLUMN "registration_url" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "last_import_at" timestamp;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "import_status" varchar(20) DEFAULT 'pending';