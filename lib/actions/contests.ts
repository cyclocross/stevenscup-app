"use server"

import { db } from "@/lib/db"
import { contests } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type { NewContest } from "@/lib/db"

export async function createContest(data: Omit<NewContest, "id" | "createdAt" | "updatedAt">) {
  try {
    const [newContest] = await db
      .insert(contests)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    revalidatePath("/admin/contests")
    return { success: true, data: newContest }
  } catch (error) {
    console.error("Error creating contest:", error)
    return { success: false, error: "Failed to create contest" }
  }
}

export async function getContestById(id: number) {
  try {
    const contest = await db.query.contests.findFirst({
      where: eq(contests.id, id),
      with: {
        cyclistContests: {
          with: {
            cyclist: true,
          },
        },
      },
    })
    return contest
  } catch (error) {
    console.error("Error fetching contest:", error)
    return null
  }
}

export async function getContestsBySeriesId(seriesId: number) {
  try {
    const seriesContests = await db.query.contests.findMany({
      where: eq(contests.seriesId, seriesId),
      with: {
        participants: true,
      },
      orderBy: (contests, { asc }) => [asc(contests.name)],
    })
    return seriesContests
  } catch (error) {
    console.error("Error fetching contests:", error)
    return []
  }
}

export async function updateContest(id: number, data: Partial<NewContest>) {
  try {
    const [updatedContest] = await db
      .update(contests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(contests.id, id))
      .returning()

    revalidatePath("/admin/contests")
    return { success: true, data: updatedContest }
  } catch (error) {
    console.error("Error updating contest:", error)
    return { success: false, error: "Failed to update contest" }
  }
}

export async function deleteContest(id: number) {
  try {
    await db.delete(contests).where(eq(contests.id, id))
    revalidatePath("/admin/contests")
    return { success: true }
  } catch (error) {
    console.error("Error deleting contest:", error)
    return { success: false, error: "Failed to delete contest" }
  }
}
