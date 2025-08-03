"use server"

import { db } from "@/lib/db"
import { participants, participations } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type Participant = typeof participants.$inferSelect
export type NewParticipant = typeof participants.$inferInsert

export async function getParticipants(contestId: number) {
  try {
    const result = await db
      .select()
      .from(participants)
      .where(eq(participants.contestId, contestId))
      .orderBy(participants.bibNumber)

    return { data: result, error: null }
  } catch {
    return { data: null, error: "Failed to fetch participants" }
  }
}

export async function getParticipant(id: number) {
  try {
    const result = await db
      .select()
      .from(participants)
      .where(eq(participants.id, id))
      .limit(1)

    return { data: result[0] || null, error: null }
  } catch {
    return { data: null, error: "Failed to fetch participant" }
  }
}

export async function createParticipant(data: NewParticipant) {
  try {
    const result = await db.insert(participants).values(data).returning()

    revalidatePath(`/admin/contests/${data.contestId}`)
    return { data: result[0], error: null }
  } catch {
    return { data: null, error: "Failed to create participant" }
  }
}

export async function updateParticipant(id: number, data: Partial<NewParticipant>) {
  try {
    const result = await db
      .update(participants)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(participants.id, id))
      .returning()

    revalidatePath(`/admin/contests/${result[0]?.contestId}`)
    return { data: result[0], error: null }
  } catch {
    return { data: null, error: "Failed to update participant" }
  }
}

export async function deleteParticipant(id: number) {
  try {
    const participant = await getParticipant(id)
    if (!participant.data) {
      return { error: "Participant not found" }
    }

    await db.delete(participants).where(eq(participants.id, id))

    revalidatePath(`/admin/contests/${participant.data.contestId}`)
    return { error: null }
  } catch {
    return { error: "Failed to delete participant" }
  }
}

export async function getParticipantParticipations(participantId: number) {
  try {
    const result = await db
      .select()
      .from(participations)
      .where(eq(participations.participantId, participantId))
      .orderBy(desc(participations.createdAt))

    return { data: result, error: null }
  } catch {
    return { data: null, error: "Failed to fetch participations" }
  }
}

export async function getParticipantsByContestWithCounts(contestId: number) {
  try {
    const result = await db
      .select({
        id: participants.id,
        name: participants.name,
        club: participants.club,
        licenseNumber: participants.licenseNumber,
        birthYear: participants.birthYear,
        gender: participants.gender,
        team: participants.team,
        bibNumber: participants.bibNumber,
        status: participants.status,
        contestId: participants.contestId,
        createdAt: participants.createdAt,
        updatedAt: participants.updatedAt,
      })
      .from(participants)
      .where(eq(participants.contestId, contestId))
      .orderBy(participants.bibNumber)

    return { data: result, error: null }
  } catch {
    return { data: null, error: "Failed to fetch participants" }
  }
}

export async function getParticipantsCountsByContest(contestId: number) {
  try {
    const allParticipants = await db
      .select()
      .from(participants)
      .where(eq(participants.contestId, contestId))

    const counts = {
      total: allParticipants.length,
      registered: allParticipants.filter(p => p.status === 'registered').length,
      started: allParticipants.filter(p => p.status === 'started').length,
      finished: allParticipants.filter(p => p.status === 'finished').length,
      dnf: allParticipants.filter(p => p.status === 'dnf').length,
      dns: allParticipants.filter(p => p.status === 'dns').length,
    }

    return { data: counts, error: null }
  } catch {
    return { data: null, error: "Failed to fetch participant counts" }
  }
}