import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

const sql = neon(process.env.DATABASE_URL)
export const db = drizzle(sql, { schema })

export type Series = typeof schema.series.$inferSelect
export type NewSeries = typeof schema.series.$inferInsert
export type Event = typeof schema.events.$inferSelect
export type NewEvent = typeof schema.events.$inferInsert
export type Contest = typeof schema.contests.$inferSelect
export type NewContest = typeof schema.contests.$inferInsert
export type Race = typeof schema.races.$inferSelect
export type NewRace = typeof schema.races.$inferInsert
export type Cyclist = typeof schema.cyclists.$inferSelect
export type NewCyclist = typeof schema.cyclists.$inferInsert
