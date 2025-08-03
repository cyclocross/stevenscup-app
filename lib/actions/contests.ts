"use server"

import { db } from "@/lib/db"
import { contests } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type { NewContest } from "@/lib/db"
import { races } from "@/lib/db/schema"
import { participants } from "@/lib/db/schema"
import { participations } from "@/lib/db/schema"

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
        participants: true,
      },
    })
    return contest
  } catch (error) {
    console.error("Error fetching contest:", error)
    return null
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
    // First, get the contest to know the seriesId for revalidation
    const contest = await db.query.contests.findFirst({
      where: eq(contests.id, id)
    })
    
    if (!contest) {
      return { success: false, error: "Contest not found" }
    }

    // Delete in the correct order to handle foreign key constraints:
    // 1. First delete participations (they reference races and participants)
    // 2. Then delete participants (they reference contests)
    // 3. Then delete races (they reference contests)
    // 4. Finally delete the contest

    // Delete participations for all races in this contest
    const contestRaces = await db.query.races.findMany({
      where: eq(races.contestId, id)
    })
    
    for (const race of contestRaces) {
      await db.delete(participations).where(eq(participations.raceId, race.id))
    }

    // Delete all participants in this contest
    await db.delete(participants).where(eq(participants.contestId, id))

    // Delete all races in this contest
    await db.delete(races).where(eq(races.contestId, id))

    // Finally delete the contest
    await db.delete(contests).where(eq(contests.id, id))

    // Revalidate both the contests list and the series page
    revalidatePath("/admin/contests")
    revalidatePath(`/admin/series/${contest.seriesId}`)
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting contest:", error)
    return { success: false, error: "Failed to delete contest" }
  }
}

export async function upsertContestsFromRaceResult(seriesId: number, raceResultContests: Array<{
  name: string
  category: string
  ageRange: string
  participantCount: number
  externalId: string
}>) {
  try {
    console.log(`🔄 Upserting ${raceResultContests.length} contests for series ${seriesId}`)
    
    const results = []
    
    for (const contestData of raceResultContests) {
      // Clean and trim the contest name
      const cleanName = contestData.name.replace(/\s+/g, ' ').trim()
      
      // Check if contest already exists by name
      const existingContest = await db.query.contests.findFirst({
        where: and(
          eq(contests.seriesId, seriesId),
          eq(contests.name, cleanName)
        )
      })
      
      if (existingContest) {
        // Update existing contest (only name for now)
        const [updatedContest] = await db
          .update(contests)
          .set({
            name: cleanName,
            updatedAt: new Date()
          })
          .where(eq(contests.id, existingContest.id))
          .returning()
        
        results.push({ action: 'updated', contest: updatedContest })
        console.log(`✅ Updated contest: ${cleanName}`)
      } else {
        // Create new contest (only basic fields for now)
        const [newContest] = await db
          .insert(contests)
          .values({
            seriesId,
            name: cleanName,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning()
        
        results.push({ action: 'created', contest: newContest })
        console.log(`✅ Created contest: ${cleanName}`)
      }
    }
    
    revalidatePath(`/admin/series/${seriesId}`)
    return { 
      success: true, 
      results,
      summary: {
        total: results.length,
        created: results.filter(r => r.action === 'created').length,
        updated: results.filter(r => r.action === 'updated').length
      }
    }
  } catch (error) {
    console.error("Error upserting contests:", error)
    return { success: false, error: "Failed to upsert contests" }
  }
}

export async function getContestsBySeriesId(seriesId: number) {
  try {
    const seriesContests = await db.query.contests.findMany({
      where: eq(contests.seriesId, seriesId),
      orderBy: (contests, { asc }) => [asc(contests.name)],
    })
    return seriesContests
  } catch (error) {
    console.error("Error fetching contests:", error)
    return []
  }
}
