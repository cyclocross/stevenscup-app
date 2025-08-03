ALTER TABLE "contests" ADD COLUMN "external_id" varchar(100);--> statement-breakpoint
ALTER TABLE "contests" ADD COLUMN "category" varchar(255);--> statement-breakpoint
ALTER TABLE "contests" ADD COLUMN "age_range" varchar(100);--> statement-breakpoint
ALTER TABLE "contests" ADD COLUMN "participant_count" integer;