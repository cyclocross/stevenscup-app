"use server"

import { db } from "@/lib/db"
import { events } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type { NewEvent } from "@/lib/db"

export async function createEvent(data: Omit<NewEvent, "id" | "createdAt" | "updatedAt">) {
  try {
    const [newEvent] = await db
      .insert(events)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    revalidatePath("/admin/events")
    return { success: true, data: newEvent }
  } catch (error) {
    console.error("Error creating event:", error)
    return { success: false, error: "Failed to create event" }
  }
}

export async function getEventById(id: number) {
  try {
    const event = await db.query.events.findFirst({
      where: eq(events.id, id),
      with: {
        races: {
          with: {
            contest: true,
          },
        },
      },
    })
    return event
  } catch (error) {
    console.error("Error fetching event:", error)
    return null
  }
}

export async function getEventsBySeriesId(seriesId: number) {
  try {
    const seriesEvents = await db.query.events.findMany({
      where: eq(events.seriesId, seriesId),
      with: {
        races: {
          with: {
            contest: true,
          },
        },
      },
      orderBy: (events, { asc }) => [asc(events.date)],
    })
    return seriesEvents
  } catch (error) {
    console.error("Error fetching events:", error)
    return []
  }
}

export async function updateEvent(id: number, data: Partial<NewEvent>) {
  try {
    const [updatedEvent] = await db
      .update(events)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning()

    revalidatePath("/admin/events")
    return { success: true, data: updatedEvent }
  } catch (error) {
    console.error("Error updating event:", error)
    return { success: false, error: "Failed to update event" }
  }
}

export async function deleteEvent(id: number) {
  try {
    await db.delete(events).where(eq(events.id, id))
    revalidatePath("/admin/events")
    return { success: true }
  } catch (error) {
    console.error("Error deleting event:", error)
    return { success: false, error: "Failed to delete event" }
  }
}
