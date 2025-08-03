"use server"

import { db, Contest, Series, Participant } from "@/lib/db"
import { contests, events, participants, participations, races, series } from "@/lib/db/schema"
import { and, eq, desc } from "drizzle-orm"
import { sql } from "drizzle-orm"

export type ParticipantRanking = {
    participantId: number
    participantName: string
    participantClub: string | null
    participantBibNumber: number
    totalPoints: number
    lastRacePosition: number | null
    participations: {
        raceId: number
        eventName: string
        eventDate: string
        position: number | null
        points: number
    }[]
}

export type ContestRanking = {
    contestId: number
    contestName: string
    ageGroup: string | null
    gender: string | null
    topParticipants: ParticipantRanking[]
}

export type SeriesRanking = {
    seriesId: number
    seriesName: string
    seriesSeason: string
    contests: ContestRanking[]
}

/**
 * Calculate points for a participation based on position and participation status
 */
export async function calculatePointsForParticipation(participation: {
    registered: boolean | null
    started: boolean | null
    finished: boolean | null
    position: number | null
}): Promise<number> {
    let points = 0

    // Base points for participation
    if (participation.started) points += 2

    // Position points for finished participations
    const pointsForPosition = [20, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1, 1, 1, 1, 1]

    if (participation.finished && participation.position) {
        if (participation.position >= 1 && participation.position <= pointsForPosition.length) {
            points += pointsForPosition[participation.position - 1]
        }
    }

    return points
}

/**
 * Get all series with their rankings
 */
export async function getAllSeriesRankings(): Promise<SeriesRanking[]> {
    try {
        const allSeries = await db.query.series.findMany({
            with: {
                contests: {
                    with: {
                        participants: true,
                    },
                },
                events: {
                    with: {
                        races: {
                            with: {
                                contest: true,
                            },
                        },
                    },
                },
            },
        })

        const seriesRankings: SeriesRanking[] = []

        for (const seriesData of allSeries) {
            const contestRankings: ContestRanking[] = []

            for (const contest of seriesData.contests) {
                const participantRankings = await getContestRankings(contest.id)

                contestRankings.push({
                    contestId: contest.id,
                    contestName: contest.name,
                    ageGroup: contest.birthYearFrom && contest.birthYearTo
                        ? `${contest.birthYearFrom}-${contest.birthYearTo}`
                        : null,
                    gender: contest.gender,
                    topParticipants: participantRankings.slice(0, 10), // Top 10 only
                })
            }

            seriesRankings.push({
                seriesId: seriesData.id,
                seriesName: seriesData.name,
                seriesSeason: seriesData.season,
                contests: contestRankings,
            })
        }

        return seriesRankings
    } catch (error) {
        console.error("Error fetching series rankings:", error)
        return []
    }
}

/**
 * Get rankings for a specific contest
 */
export async function getContestRankings(contestId: number): Promise<ParticipantRanking[]> {
    try {
        // Get all participants in this contest
        const contestParticipants = await db
            .select()
            .from(participants)
            .where(eq(participants.contestId, contestId))

        const participantRankings: ParticipantRanking[] = []

        for (const participant of contestParticipants) {
            // Get all participations for this participant
            const participantParticipations = await db
                .select({
                    id: participations.id,
                    raceId: participations.raceId,
                    registered: participations.registered,
                    started: participations.started,
                    finished: participations.finished,
                    position: participations.position,
                    eventName: events.name,
                    eventDate: events.date,
                })
                .from(participations)
                .innerJoin(races, eq(participations.raceId, races.id))
                .innerJoin(events, eq(races.eventId, events.id))
                .where(and(
                    eq(participations.participantId, participant.id),
                    eq(races.contestId, contestId)
                ))

            let totalPoints = 0
            let lastRacePosition: number | null = null
            const participationsData: ParticipantRanking['participations'] = []

            for (const participation of participantParticipations) {
                const points = await calculatePointsForParticipation(participation)
                totalPoints += points

                if (participation.finished && participation.position) {
                    lastRacePosition = participation.position
                }

                participationsData.push({
                    raceId: participation.raceId,
                    eventName: participation.eventName,
                    eventDate: participation.eventDate,
                    position: participation.position,
                    points,
                })
            }

            participantRankings.push({
                participantId: participant.id,
                participantName: participant.name,
                participantClub: participant.club,
                participantBibNumber: participant.bibNumber,
                totalPoints,
                lastRacePosition,
                participations: participationsData,
            })
        }

        // Sort by total points (descending), then by last race position (ascending)
        return participantRankings.sort((a, b) => {
            if (a.totalPoints !== b.totalPoints) {
                return b.totalPoints - a.totalPoints
            }

            // For equal points, better last race position (lower number) wins
            if (a.lastRacePosition === null && b.lastRacePosition === null) return 0
            if (a.lastRacePosition === null) return 1
            if (b.lastRacePosition === null) return -1
            return a.lastRacePosition - b.lastRacePosition
        })
    } catch (error) {
        console.error("Error fetching contest rankings:", error)
        return []
    }
}

/**
 * Get a specific series by ID with rankings
 */
export async function getSeriesRankings(seriesId: number): Promise<SeriesRanking | null> {
    try {
        const seriesData = await db.query.series.findFirst({
            where: eq(series.id, seriesId),
            with: {
                contests: {
                    with: {
                        participants: true,
                    },
                },
                events: {
                    with: {
                        races: {
                            with: {
                                contest: true,
                            },
                        },
                    },
                },
            },
        })

        if (!seriesData) return null

        const contestRankings: ContestRanking[] = []

        for (const contest of seriesData.contests) {
            const participantRankings = await getContestRankings(contest.id)

            contestRankings.push({
                contestId: contest.id,
                contestName: contest.name,
                ageGroup: contest.birthYearFrom && contest.birthYearTo
                    ? `${contest.birthYearFrom}-${contest.birthYearTo}`
                    : null,
                gender: contest.gender,
                topParticipants: participantRankings, // All participants for detail view
            })
        }

        return {
            seriesId: seriesData.id,
            seriesName: seriesData.name,
            seriesSeason: seriesData.season,
            contests: contestRankings,
        }
    } catch (error) {
        console.error("Error fetching series rankings:", error)
        return null
    }
}

/**
 * Get a specific contest by ID with full rankings
 */
export async function getContestRankingsDetail(contestId: number): Promise<{
    contest: Contest & { series: Series, participants: Participant[] }
    rankings: ParticipantRanking[]
} | null> {
    try {
        const contest = await db.query.contests.findFirst({
            where: eq(contests.id, contestId),
            with: {
                series: true,
                participants: true,
            },
        })

        if (!contest) return null

        const rankings = await getContestRankings(contestId)

        return {
            contest,
            rankings,
        }
    } catch (error) {
        console.error("Error fetching contest rankings detail:", error)
        return null
    }
}

/**
 * Get contest statistics including total completed races and latest finished race
 */
export async function getContestStatistics(contestId: number): Promise<{
    totalCompletedRaces: number
    latestFinishedRace: {
        eventName: string
        eventDate: string
        raceId: number
    } | null
} | null> {
    try {
        // Count completed races (those with status = 'completed')
        const completedRaces = await db
            .select({ count: sql<number>`count(*)` })
            .from(races)
            .where(and(
                eq(races.contestId, contestId),
                eq(races.status, 'completed')
            ))

        // Get the latest finished race
        const latestFinishedRace = await db
            .select({
                raceId: races.id,
                eventName: events.name,
                eventDate: events.date,
            })
            .from(races)
            .innerJoin(events, eq(races.eventId, events.id))
            .where(and(
                eq(races.contestId, contestId),
                eq(races.status, 'completed')
            ))
            .orderBy(desc(events.date))
            .limit(1)

        return {
            totalCompletedRaces: completedRaces[0]?.count || 0,
            latestFinishedRace: latestFinishedRace[0] || null,
        }
    } catch (error) {
        console.error("Error fetching contest statistics:", error)
        return null
    }
} 