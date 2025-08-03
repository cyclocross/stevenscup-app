import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getContestStatistics } from "@/lib/actions/rankings"
import { getAllSeriesWithRankings } from "@/lib/actions/series"
import { Archive, Settings, Trophy } from "lucide-react"
import Link from "next/link"
import { LiveUpdates } from "@/components/live-updates"

// Force revalidation every 30 seconds for live rankings
export const revalidate = 30

export default async function HomePage() {
  const allSeries = await getAllSeriesWithRankings()

  // Separate series by status
  const ongoingSeries = allSeries.filter(series => series.status === 'ongoing')
  const scheduledSeries = allSeries.filter(series => series.status === 'scheduled')
  const finishedSeries = allSeries.filter(series => series.status === 'finished')
  const activeSeries = ongoingSeries.concat(scheduledSeries)

  // Get statistics for each contest
  const contestStats = new Map()
  for (const series of allSeries) {
    for (const contest of series.contests) {
      const stats = await getContestStatistics(contest.contestId)
      contestStats.set(contest.contestId, stats)
    }
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <Trophy className="mx-auto h-16 w-16 text-orange-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">STEVENS Cup Cyclocross</h1>
        <p className="text-gray-600">Live provisional rankings and results</p>
      </div>

      {/* Admin Links - Small and Unobtrusive */}
      <div className="flex justify-center gap-4 mb-8">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Admin
          </Button>
        </Link>
        <Link href="/rankings/archive">
          <Button variant="ghost" size="sm">
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        </Link>
      </div>

      {/* Main Content - Rankings */}
      {allSeries.length === 0 ? (
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
          {/* Active Series */}
          {activeSeries.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Active Series</h2>
                <span className="text-sm text-gray-500">({activeSeries.length} series)</span>
              </div>
              <div className="space-y-6">
                {activeSeries.map((series) => (
                  <Card key={series.id} className="border-green-200 bg-green-50/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-green-600" />
                            {series.name}
                            <span className="text-sm font-normal text-gray-500">({series.status})</span>
                          </CardTitle>
                          <CardDescription>Season {series.season}</CardDescription>
                        </div>
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
                                </CardHeader>
                              </Link>
                              <CardContent className="space-y-3">
                                {/* Contest Statistics */}
                                {stats && (
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Trophy className="h-3 w-3" />
                                      <span>{stats.totalCompletedRaces} completed races</span>
                                    </div>
                                    {stats.latestFinishedRace && (
                                      <Link
                                        key={stats.latestFinishedRace.raceId}
                                        href={`/rankings/race/${stats.latestFinishedRace.raceId}`}>
                                        <div className="flex items-center gap-1 text-gray-800">
                                          <Trophy className="h-3 w-3" />
                                          <span className="font-medium">Latest: {stats.latestFinishedRace.eventName}</span>
                                        </div>
                                      </Link>
                                    )}
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
                                      <span>Leader: <span className="font-medium">{leaderName}</span></span>
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
            </div>
          )}

          {/* Archive Link */}
          {finishedSeries.length > 0 && (
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Archive className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-4">
                    {finishedSeries.length} finished series available in the archive
                  </p>
                  <Link href="/rankings/archive">
                    <Button variant="outline">
                      <Archive className="h-4 w-4 mr-2" />
                      View Archive
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Active Series */}
          {activeSeries.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  <Trophy className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No active series found.</p>
                  <p className="text-sm">Check the archive for finished series.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      </div>
      <LiveUpdates />
    </>
  )
}
