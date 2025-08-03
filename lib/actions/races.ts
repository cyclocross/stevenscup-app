"use server"

import { db } from "@/lib/db"
import { races } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type { NewRace } from "@/lib/db"

export async function createRace(data: Omit<NewRace, "id" | "createdAt" | "updatedAt">) {
  try {
    const [newRace] = await db
      .insert(races)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    revalidatePath("/admin/races")
    return { success: true, data: newRace }
  } catch (error) {
    console.error("Error creating race:", error)
    return { success: false, error: "Failed to create race" }
  }
}

export async function getRaceById(id: number) {
  try {
    const race = await db.query.races.findFirst({
      where: eq(races.id, id),
      with: {
        event: true,
        contest: true,
      },
    })
    return race
  } catch (error) {
    console.error("Error fetching race:", error)
    return null
  }
}

export async function getRacesByEventId(eventId: number) {
  try {
    const eventRaces = await db.query.races.findMany({
      where: eq(races.eventId, eventId),
      with: {
        contest: true,
      },
      orderBy: (races, { asc }) => [asc(races.startTime)],
    })
    return eventRaces
  } catch (error) {
    console.error("Error fetching races:", error)
    return []
  }
}

export async function updateRace(id: number, data: Partial<NewRace>) {
  try {
    const [updatedRace] = await db
      .update(races)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(races.id, id))
      .returning()

    revalidatePath("/admin/races")
    return { success: true, data: updatedRace }
  } catch (error) {
    console.error("Error updating race:", error)
    return { success: false, error: "Failed to update race" }
  }
}

export async function deleteRace(id: number) {
  try {
    await db.delete(races).where(eq(races.id, id))
    revalidatePath("/admin/races")
    return { success: true }
  } catch (error) {
    console.error("Error deleting race:", error)
    return { success: false, error: "Failed to delete race" }
  }
} 