import { pgTable, serial, varchar, text, timestamp, integer, date, time } from "drizzle-orm/pg-core"
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
  ageGroup: varchar("age_group", { length: 50 }),
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
  duration: integer("duration_minutes"),
  status: varchar("status", { length: 20 }).default("scheduled"), // scheduled, ongoing, completed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Cyclists table
export const cyclists = pgTable("cyclists", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  club: varchar("club", { length: 255 }),
  licenseNumber: varchar("license_number", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Cyclist Contest relationship (fixed bib number per contest)
export const cyclistContests = pgTable("cyclist_contests", {
  id: serial("id").primaryKey(),
  cyclistId: integer("cyclist_id")
    .references(() => cyclists.id)
    .notNull(),
  contestId: integer("contest_id")
    .references(() => contests.id)
    .notNull(),
  bibNumber: integer("bib_number").notNull(),
  status: varchar("status", { length: 20 }).default("registered"), // registered, active, withdrawn
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

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
  cyclistContests: many(cyclistContests),
}))

export const racesRelations = relations(races, ({ one }) => ({
  event: one(events, {
    fields: [races.eventId],
    references: [events.id],
  }),
  contest: one(contests, {
    fields: [races.contestId],
    references: [contests.id],
  }),
}))

export const cyclistsRelations = relations(cyclists, ({ many }) => ({
  cyclistContests: many(cyclistContests),
}))

export const cyclistContestsRelations = relations(cyclistContests, ({ one }) => ({
  cyclist: one(cyclists, {
    fields: [cyclistContests.cyclistId],
    references: [cyclists.id],
  }),
  contest: one(contests, {
    fields: [cyclistContests.contestId],
    references: [contests.id],
  }),
}))
