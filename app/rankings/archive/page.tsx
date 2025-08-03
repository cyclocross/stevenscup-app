import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getContestStatistics } from "@/lib/actions/rankings"
import { getAllSeriesWithRankings } from "@/lib/actions/series"
import { Archive, ArrowLeft, Trophy } from "lucide-react"
import Link from "next/link"

export default async function ArchivePage() {
  const allSeries = await getAllSeriesWithRankings()

  // Filter only finished series
  const finishedSeries = allSeries.filter(series => series.status === 'finished')

  // Get statistics for each contest
  const contestStats = new Map()
  for (const series of finishedSeries) {
    for (const contest of series.contests) {
      const stats = await getContestStatistics(contest.contestId)
      contestStats.set(contest.contestId, stats)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Live Rankings
        </Link>

        <div className="text-center mb-8">
          <Archive className="mx-auto h-16 w-16 text-gray-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Series Archive</h1>
          <p className="text-gray-600">Completed series and their final standings</p>
        </div>
      </div>

      {finishedSeries.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Archive className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No finished series found in the archive.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {finishedSeries.map((series) => (
            <Card key={series.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{series.name}</CardTitle>
                    <CardDescription>Season {series.season}</CardDescription>
                  </div>
                  <Badge variant="default" className="text-xs">
                    Finished
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {series.contests.map((contest) => {
                    const stats = contestStats.get(contest.contestId)
                    const hasCompletedRaces = (stats?.totalCompletedRaces ?? 0) > 0
                    const leaderName = hasCompletedRaces && contest.topParticipants.length > 0
                      ? contest.topParticipants[0].participantName
                      : null
                    return (
                      <Card key={contest.contestId} className="hover:shadow-md transition-shadow cursor-pointer">
                        <Link href={`/rankings/contest/${contest.contestId}`}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">{contest.contestName}</CardTitle>
                            <CardDescription>{contest.ageGroup} • {contest.gender}</CardDescription>
                          </CardHeader>
                        </Link>
                        <CardContent className="space-y-3">
                          <div className="flex gap-2">
                            {contest.ageGroup && (
                              <Badge variant="secondary">{contest.ageGroup}</Badge>
                            )}
                            {contest.gender && (
                              <Badge variant="secondary">{contest.gender}</Badge>
                            )}
                          </div>

                          {/* Contest Statistics */}
                          {stats && (
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Trophy className="h-3 w-3" />
                                <span>{stats.totalCompletedRaces} completed races</span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="text-sm text-gray-500">
                              {contest.topParticipants.length} participants
                            </div>
                            {/* Overall Leader (only when at least one race completed) */}
                            {leaderName && (
                              <div className="flex items-center gap-2 text-sm text-gray-800">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                <span>Winner: <span className="font-medium">{leaderName}</span></span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
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