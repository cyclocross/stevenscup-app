"use server"

import { db } from "@/lib/db"
import { participants, participations } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type Participation = typeof participations.$inferSelect
export type NewParticipation = typeof participations.$inferInsert

export async function getParticipationsByRace(raceId: number) {
    try {
        const result = await db
            .select({
                id: participations.id,
                participantId: participations.participantId,
                raceId: participations.raceId,
                registered: participations.registered,
                started: participations.started,
                finished: participations.finished,
                position: participations.position,
                isProvisional: participations.isProvisional,
                createdAt: participations.createdAt,
                updatedAt: participations.updatedAt,
                participant: {
                    id: participants.id,
                    name: participants.name,
                    club: participants.club,
                    bibNumber: participants.bibNumber,
                    birthYear: participants.birthYear,
                    gender: participants.gender,
                    team: participants.team,
                    status: participants.status,
                }
            })
            .from(participations)
            .innerJoin(participants, eq(participations.participantId, participants.id))
            .where(eq(participations.raceId, raceId))
            .orderBy(participants.bibNumber)

        return { data: result, error: null }
    } catch {
        return { data: null, error: "Failed to fetch participations" }
    }
}

export async function getAvailableParticipantsForRace(raceId: number, contestId: number) {
    try {
        // Get all participants in the contest
        const allParticipants = await db
            .select()
            .from(participants)
            .where(eq(participants.contestId, contestId))
            .orderBy(participants.bibNumber)

        // Get participants already assigned to this race
        const assignedParticipantIds = await db
            .select({ participantId: participations.participantId })
            .from(participations)
            .where(eq(participations.raceId, raceId))

        const assignedIds = assignedParticipantIds.map(p => p.participantId)

        // Filter out already assigned participants
        const availableParticipants = allParticipants.filter(
            participant => !assignedIds.includes(participant.id)
        )

        return { data: availableParticipants, error: null }
    } catch {
        return { data: null, error: "Failed to fetch available participants" }
    }
}

export async function assignParticipantToRace(participantId: number, raceId: number) {
    try {
        const result = await db
            .insert(participations)
            .values({
                participantId,
                raceId,
                registered: true,
                started: false,
                finished: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning()

        revalidatePath(`/admin/races/${raceId}`)
        return { data: result[0], error: null }
    } catch {
        return { data: null, error: "Failed to assign participant to race" }
    }
}

export async function removeParticipantFromRace(participantId: number, raceId: number) {
    try {
        await db
            .delete(participations)
            .where(and(
                eq(participations.participantId, participantId),
                eq(participations.raceId, raceId)
            ))

        revalidatePath(`/admin/races/${raceId}`)
        return { error: null }
    } catch {
        return { error: "Failed to remove participant from race" }
    }
}

export async function updateParticipation(participationId: number, data: Partial<NewParticipation>) {
    try {
        const result = await db
            .update(participations)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(participations.id, participationId))
            .returning()

        revalidatePath(`/admin/races/${result[0]?.raceId}`)
        return { data: result[0], error: null }
    } catch {
        return { data: null, error: "Failed to update participation" }
    }
}

export async function cycleParticipationStatus(participationId: number) {
    try {
        const participation = await db
            .select()
            .from(participations)
            .where(eq(participations.id, participationId))
            .limit(1)

        if (!participation[0]) {
            return { data: null, error: "Participation not found" }
        }

        const current = participation[0]
        let newData: Partial<NewParticipation> = {}

        // Cycle: registered -> started -> finished -> registered
        if (current.registered && !current.started && !current.finished) {
            // registered -> started
            newData = { started: true }
        } else if (current.started && !current.finished) {
            // started -> finished
            newData = { finished: true }
        } else if (current.finished) {
            // finished -> registered (reset)
            newData = {
                registered: true,
                started: false,
                finished: false,
                position: null // Clear position when not finished
            }
        } else {
            // Default to registered
            newData = { registered: true, started: false, finished: false }
        }

        const result = await db
            .update(participations)
            .set({ ...newData, updatedAt: new Date() })
            .where(eq(participations.id, participationId))
            .returning()

        // If the participation just became finished, assign it the next available position
        if (newData.finished && !current.finished) {
            const finishedParticipations = await db
                .select()
                .from(participations)
                .where(and(
                    eq(participations.raceId, current.raceId),
                    eq(participations.finished, true)
                ))
                .orderBy(participations.position)

            // not add 1 because new finished participation is already in the list
            const nextPosition = finishedParticipations.length

            await db
                .update(participations)
                .set({ position: nextPosition, updatedAt: new Date() })
                .where(eq(participations.id, participationId))
        }

        // If the participation just became registered (was finished), reorder remaining finished participations
        if (newData.registered && current.finished && !newData.finished) {
            await reorderFinishedParticipations(current.raceId)
        }

        revalidatePath(`/admin/races/${result[0]?.raceId}`)
        return { data: result[0], error: null }
    } catch {
        return { data: null, error: "Failed to cycle participation status" }
    }
}

export async function moveParticipationUp(participationId: number) {
    try {
        const participation = await db
            .select()
            .from(participations)
            .where(eq(participations.id, participationId))
            .limit(1)

        if (!participation[0]) {
            return { data: null, error: "Participation not found" }
        }

        const current = participation[0]

        // Only allow moving finished participations
        if (!current.finished) {
            return { data: null, error: "Only finished participations can be reordered" }
        }

        // Get all finished participations for this race, ordered by position
        const allFinished = await db
            .select()
            .from(participations)
            .where(and(
                eq(participations.raceId, current.raceId),
                eq(participations.finished, true)
            ))
            .orderBy(participations.position)

        // Find current index
        const currentIndex = allFinished.findIndex(p => p.id === participationId)
        if (currentIndex <= 0) {
            return { data: current, error: null } // Already at top
        }

        // Swap with previous participation
        const previousParticipation = allFinished[currentIndex - 1]

        // Update both positions
        await db
            .update(participations)
            .set({ position: current.position, updatedAt: new Date() })
            .where(eq(participations.id, previousParticipation.id))

        await db
            .update(participations)
            .set({ position: previousParticipation.position, updatedAt: new Date() })
            .where(eq(participations.id, participationId))

        revalidatePath(`/admin/races/${current.raceId}`)
        return { data: current, error: null }
    } catch {
        return { data: null, error: "Failed to move participation up" }
    }
}

export async function moveParticipationDown(participationId: number) {
    try {
        const participation = await db
            .select()
            .from(participations)
            .where(eq(participations.id, participationId))
            .limit(1)

        if (!participation[0]) {
            return { data: null, error: "Participation not found" }
        }

        const current = participation[0]

        // Only allow moving finished participations
        if (!current.finished) {
            return { data: null, error: "Only finished participations can be reordered" }
        }

        // Get all finished participations for this race, ordered by position
        const allFinished = await db
            .select()
            .from(participations)
            .where(and(
                eq(participations.raceId, current.raceId),
                eq(participations.finished, true)
            ))
            .orderBy(participations.position)

        // Find current index
        const currentIndex = allFinished.findIndex(p => p.id === participationId)
        if (currentIndex === -1 || currentIndex >= allFinished.length - 1) {
            return { data: current, error: null } // Already at bottom
        }

        // Swap with next participation
        const nextParticipation = allFinished[currentIndex + 1]

        // Update both positions
        await db
            .update(participations)
            .set({ position: current.position, updatedAt: new Date() })
            .where(eq(participations.id, nextParticipation.id))

        await db
            .update(participations)
            .set({ position: nextParticipation.position, updatedAt: new Date() })
            .where(eq(participations.id, participationId))

        revalidatePath(`/admin/races/${current.raceId}`)
        return { data: current, error: null }
    } catch {
        return { data: null, error: "Failed to move participation down" }
    }
}

export async function reorderFinishedParticipations(raceId: number) {
    try {
        // Get all finished participations for this race, ordered by current position
        const allFinished = await db
            .select()
            .from(participations)
            .where(and(
                eq(participations.raceId, raceId),
                eq(participations.finished, true)
            ))
            .orderBy(participations.position)

        // Reassign positions sequentially (1, 2, 3, ...)
        for (let i = 0; i < allFinished.length; i++) {
            const participation = allFinished[i]
            const newPosition = i + 1

            if (participation.position !== newPosition) {
                await db
                    .update(participations)
                    .set({ position: newPosition, updatedAt: new Date() })
                    .where(eq(participations.id, participation.id))
            }
        }

        return { error: null }
    } catch {
        return { error: "Failed to reorder finished participations" }
    }
}

export async function pointsForParticipation(participation: {
    registered: boolean | null
    started: boolean | null
    finished: boolean | null
    position: number | null
}): Promise<number> {
    let points = 0

    // Base points for participation
    if (participation.started) points += 2

    const pointsforPosition = [ 20, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1, 1, 1, 1, 1 ];

    // Position points for finished participations
    if (participation.finished && participation.position) {
        // Position 1 gets 10 points, position 2 gets 9 points, etc.
        if(participation.position >= 1 && participation.position <= pointsforPosition.length) {
            points += pointsforPosition[participation.position - 1]
        }
    }

    return points
} 