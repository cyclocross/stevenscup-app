"use server"

import { db } from "@/lib/db"
import { series } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type { NewSeries } from "@/lib/db"

export async function createSeries(data: Omit<NewSeries, "id" | "createdAt" | "updatedAt">) {
  try {
    const [newSeries] = await db
      .insert(series)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    revalidatePath("/admin/series")
    return { success: true, data: newSeries }
  } catch (error) {
    console.error("Error creating series:", error)
    return { success: false, error: "Failed to create series" }
  }
}

export async function getAllSeries() {
  try {
    const allSeries = await db.query.series.findMany({
      with: {
        events: true,
        contests: true,
      },
      orderBy: (series, { desc }) => [desc(series.createdAt)],
    })
    return allSeries
  } catch (error) {
    console.error("Error fetching series:", error)
    return []
  }
}

export async function getSeriesById(id: number) {
  try {
    const seriesData = await db.query.series.findFirst({
      where: eq(series.id, id),
      with: {
        events: {
          with: {
            races: {
              with: {
                contest: true,
              },
            },
          },
        },
        contests: {
          with: {
            participants: true,
          },
        },
      },
    })
    return seriesData
  } catch (error) {
    console.error("Error fetching series:", error)
    return null
  }
}

export async function updateSeries(id: number, data: Partial<NewSeries>) {
  try {
    const [updatedSeries] = await db
      .update(series)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(series.id, id))
      .returning()

    revalidatePath("/admin/series")
    return { success: true, data: updatedSeries }
  } catch (error) {
    console.error("Error updating series:", error)
    return { success: false, error: "Failed to update series" }
  }
}

export async function deleteSeries(id: number) {
  try {
    await db.delete(series).where(eq(series.id, id))
    revalidatePath("/admin/series")
    return { success: true }
  } catch (error) {
    console.error("Error deleting series:", error)
    return { success: false, error: "Failed to delete series" }
  }
}
