import { pgTable, serial, varchar, text, timestamp, integer, date, time, unique, boolean } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Series table
export const series = pgTable("series", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  season: varchar("season", { length: 10 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Events table (date, location, club within a series)
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  seriesId: integer("series_id")
    .references(() => series.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  date: date("date").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  club: varchar("club", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Contests table (categories within a series)
export const contests = pgTable("contests", {
  id: serial("id").primaryKey(),
  seriesId: integer("series_id")
    .references(() => series.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  duration: integer("duration_minutes"),
  birthYearFrom: integer("birth_year_from"),
  birthYearTo: integer("birth_year_to"),
  gender: varchar("gender", { length: 10 }),
  participationPoints: integer("participation_points").default(1),
  group: varchar("group", { length: 255 }),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Races table (contest happening at specific event)
export const races = pgTable("races", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .references(() => events.id)
    .notNull(),
  contestId: integer("contest_id")
    .references(() => contests.id)
    .notNull(),
  startTime: time("start_time"),
  status: varchar("status", { length: 20 }).default("scheduled"), // scheduled, ongoing, completed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Participants table
export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  contestId: integer("contest_id")
    .references(() => contests.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  birthYear: integer("birth_year").notNull(),
  gender: varchar("gender", { length: 10 }).notNull(),
  club: varchar("club", { length: 255 }),
  team: varchar("team", { length: 255 }),
  licenseNumber: varchar("license_number", { length: 50 }),
  bibNumber: integer("bib_number").notNull(),
  status: varchar("status", { length: 20 }).default("registered"), // registered, active, withdrawn
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Participations table
export const participations = pgTable("participations", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id")
    .references(() => participants.id)
    .notNull(),
  raceId: integer("race_id")
    .references(() => races.id)
    .notNull(),
  registered: boolean("registered").default(false),
  started: boolean("started").default(false),
  finished: boolean("finished").default(false),
  position: integer("position"),
  isProvisional: boolean("is_provisional").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueParticipation: unique().on(table.participantId, table.raceId),
}))

// Relations
export const seriesRelations = relations(series, ({ many }) => ({
  events: many(events),
  contests: many(contests),
}))

export const eventsRelations = relations(events, ({ one, many }) => ({
  series: one(series, {
    fields: [events.seriesId],
    references: [series.id],
  }),
  races: many(races),
}))

export const contestsRelations = relations(contests, ({ one, many }) => ({
  series: one(series, {
    fields: [contests.seriesId],
    references: [series.id],
  }),
  races: many(races),
  participants: many(participants),
}))

export const racesRelations = relations(races, ({ one, many }) => ({
  event: one(events, {
    fields: [races.eventId],
    references: [events.id],
  }),
  contest: one(contests, {
    fields: [races.contestId],
    references: [contests.id],
  }),
  participations: many(participations),
}))

export const participantsRelations = relations(participants, ({ one, many }) => ({
  contest: one(contests, {
    fields: [participants.contestId],
    references: [contests.id],
  }),
  participations: many(participations),
}))

export const participationsRelations = relations(participations, ({ one }) => ({
  participant: one(participants, {
    fields: [participations.participantId],
    references: [participants.id],
  }),
  race: one(races, {
    fields: [participations.raceId],
    references: [races.id],
  }),
}))