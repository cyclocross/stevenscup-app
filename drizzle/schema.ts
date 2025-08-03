import { boolean, date, foreignKey, integer, pgTable, serial, text, time, timestamp, unique, varchar } from "drizzle-orm/pg-core";



export const participations = pgTable("participations", {
	id: serial().primaryKey().notNull(),
	participantId: integer("participant_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	raceId: integer("race_id").notNull(),
	registered: boolean().default(false),
	started: boolean().default(false),
	finished: boolean().default(false),
	position: integer(),
	isProvisional: boolean("is_provisional").default(false),
}, (table) => [
	foreignKey({
		columns: [table.participantId],
		foreignColumns: [participants.id],
		name: "participations_participant_id_participants_id_fk"
	}),
	foreignKey({
		columns: [table.raceId],
		foreignColumns: [races.id],
		name: "participations_race_id_races_id_fk"
	}),
	unique("participations_participant_id_race_id_unique").on(table.participantId, table.raceId),
]);

export const series = pgTable("series", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	season: varchar({ length: 10 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const events = pgTable("events", {
	id: serial().primaryKey().notNull(),
	seriesId: integer("series_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	date: date().notNull(),
	location: varchar({ length: 255 }).notNull(),
	club: varchar({ length: 255 }).notNull(),
	registrationUrl: text(),
	lastImportAt: timestamp("last_import_at"),
	importStatus: varchar({ length: 20 }).default('pending'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
		columns: [table.seriesId],
		foreignColumns: [series.id],
		name: "events_series_id_series_id_fk"
	}),
]);

export const races = pgTable("races", {
	id: serial().primaryKey().notNull(),
	eventId: integer("event_id").notNull(),
	contestId: integer("contest_id").notNull(),
	startTime: time("start_time"),
	status: varchar({ length: 20 }).default('scheduled'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
		columns: [table.eventId],
		foreignColumns: [events.id],
		name: "races_event_id_events_id_fk"
	}),
	foreignKey({
		columns: [table.contestId],
		foreignColumns: [contests.id],
		name: "races_contest_id_contests_id_fk"
	}),
]);

export const participants = pgTable("participants", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	club: varchar({ length: 255 }),
	licenseNumber: varchar("license_number", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	contestId: integer("contest_id").notNull(),
	birthYear: integer("birth_year").notNull(),
	gender: varchar({ length: 10 }).notNull(),
	team: varchar({ length: 255 }),
	bibNumber: integer("bib_number").notNull(),
	status: varchar({ length: 20 }).default('registered'),
}, (table) => [
	foreignKey({
		columns: [table.contestId],
		foreignColumns: [contests.id],
		name: "participants_contest_id_contests_id_fk"
	}),
]);

export const contests = pgTable("contests", {
	id: serial().primaryKey().notNull(),
	seriesId: integer("series_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	comment: text(),
	gender: varchar({ length: 10 }),
	participationPoints: integer("participation_points").default(1),
	group: varchar({ length: 255 }),
	durationMinutes: integer("duration_minutes"),
	birthYearFrom: integer("birth_year_from"),
	birthYearTo: integer("birth_year_to"),
}, (table) => [
	foreignKey({
		columns: [table.seriesId],
		foreignColumns: [series.id],
		name: "contests_series_id_series_id_fk"
	}),
]);

export const adminUsers = pgTable("admin_users", {
	id: serial().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	passwordHash: varchar({ length: 255 }).notNull(),
	role: varchar({ length: 50 }).default('admin'),
	isActive: boolean().default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const adminSessions = pgTable("admin_sessions", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	sessionToken: varchar({ length: 255 }).notNull().unique(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [adminUsers.id],
		name: "admin_sessions_user_id_admin_users_id_fk"
	}),
]);
