import Link from "next/link"
import { Trophy, Medal, Users, Calendar, Flag } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAllSeriesRankings, getContestStatistics } from "@/lib/actions/rankings"

export default async function RankingsPage() {
  const seriesRankings = await getAllSeriesRankings()

  // Get statistics for each contest
  const contestStats = new Map()
  for (const series of seriesRankings) {
    for (const contest of series.contests) {
      const stats = await getContestStatistics(contest.contestId)
      contestStats.set(contest.contestId, stats)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Trophy className="mx-auto h-16 w-16 text-orange-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Provisional Rankings</h1>
        <p className="text-gray-600">Current standings across all series and contests</p>
      </div>

      {seriesRankings.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Trophy className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No series found. Rankings will appear here once series and contests are created.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {seriesRankings.map((series) => (
            <Card key={series.seriesId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{series.seriesName}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Calendar className="h-4 w-4" />
                      Season {series.seriesSeason}
                    </CardDescription>
                  </div>
                  <Link href={`/rankings/series/${series.seriesId}`}>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                      View Details
                    </Badge>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {series.contests.map((contest) => {
                    const stats = contestStats.get(contest.contestId)
                    return (
                      <div key={contest.contestId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{contest.contestName}</h3>
                            <div className="flex gap-2 mt-1">
                              {contest.ageGroup && (
                                <Badge variant="secondary">{contest.ageGroup}</Badge>
                              )}
                              {contest.gender && (
                                <Badge variant="secondary">{contest.gender}</Badge>
                              )}
                            </div>
                            {/* Contest Statistics */}
                            {stats && (
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{stats.totalCompletedRaces} completed races</span>
                                </div>
                                {stats.latestFinishedRace && (
                                  <div className="flex items-center gap-1">
                                    <Flag className="h-3 w-3" />
                                    <span>Latest: {stats.latestFinishedRace.eventName}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <Link href={`/rankings/contest/${contest.contestId}`}>
                            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                              View All
                            </Badge>
                          </Link>
                        </div>

                        {contest.topParticipants.length === 0 ? (
                          <div className="text-center text-gray-500 py-4">
                            <Users className="mx-auto h-8 w-8 mb-2 opacity-50" />
                            <p>No participants yet</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {contest.topParticipants.slice(0, 10).map((participant, index) => (
                              <div
                                key={participant.participantId}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-sm font-semibold">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <div className="font-medium">{participant.participantName}</div>
                                    <div className="text-sm text-gray-500">
                                      #{participant.participantBibNumber}
                                      {participant.participantClub && ` • ${participant.participantClub}`}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-right">
                                    <div className="font-semibold text-lg">{participant.totalPoints}</div>
                                    <div className="text-xs text-gray-500">points</div>
                                  </div>
                                  {index < 3 && (
                                    <Medal className={`h-5 w-5 ${
                                      index === 0 ? 'text-yellow-500' : 
                                      index === 1 ? 'text-gray-400' : 'text-orange-600'
                                    }`} />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 