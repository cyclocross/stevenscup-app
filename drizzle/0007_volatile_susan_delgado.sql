ALTER TABLE "contests" DROP CONSTRAINT "contests_series_id_series_id_fk";
--> statement-breakpoint
ALTER TABLE "races" DROP CONSTRAINT "races_contest_id_contests_id_fk";
--> statement-breakpoint
ALTER TABLE "contests" ADD COLUMN "participants_url" text;--> statement-breakpoint
ALTER TABLE "contests" ADD CONSTRAINT "contests_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "races" ADD CONSTRAINT "races_contest_id_contests_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("id") ON DELETE cascade ON UPDATE no action;