ALTER TABLE "participants" DROP CONSTRAINT "participants_contest_id_contests_id_fk";
--> statement-breakpoint
ALTER TABLE "participations" DROP CONSTRAINT "participations_participant_id_participants_id_fk";
--> statement-breakpoint
ALTER TABLE "participations" DROP CONSTRAINT "participations_race_id_races_id_fk";
--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_contest_id_contests_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participations" ADD CONSTRAINT "participations_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participations" ADD CONSTRAINT "participations_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contests" DROP COLUMN "external_id";--> statement-breakpoint
ALTER TABLE "contests" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "contests" DROP COLUMN "age_range";--> statement-breakpoint
ALTER TABLE "contests" DROP COLUMN "participant_count";