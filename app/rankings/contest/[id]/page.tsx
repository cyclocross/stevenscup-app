import { LiveUpdates } from "@/components/live-updates"
import { ParticipantRow } from "@/components/participant-row"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getContestRankingsDetail, getContestStatistics } from "@/lib/actions/rankings"
import { ArrowLeft, Award, Calendar, Trophy, Users, Flag } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface ContestDetailPageProps {
  params: Promise<{
    id: string
  }>
}

// Force revalidation every 30 seconds for live rankings
export const revalidate = 30

export default async function ContestDetailPage({ params }: ContestDetailPageProps) {
  const { id } = await params
  const contestId = parseInt(id)
  
  if (isNaN(contestId)) {
    notFound()
  }

  const contestData = await getContestRankingsDetail(contestId)
  const contestStats = await getContestStatistics(contestId)
  
  if (!contestData) {
    notFound()
  }

  const { contest, rankings } = contestData

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
          <Trophy className="mx-auto h-16 w-16 text-orange-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{contest.name}</h1>
          <div className="flex items-center justify-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{contest.series?.name} - Season {contest.series?.season}</span>
            </div>
            {contest.birthYearFrom && contest.birthYearTo && (
              <Badge variant="secondary">{contest.birthYearFrom}-{contest.birthYearTo}</Badge>
            )}
            {contest.gender && (
              <Badge variant="secondary">{contest.gender}</Badge>
            )}
          </div>
          
          {/* Contest Statistics */}
          {contestStats && (
            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span><strong>{contestStats.totalCompletedRaces}</strong> completed races</span>
              </div>
              {contestStats.latestFinishedRace && (
                <div className="flex items-center gap-1">
                  <Flag className="h-4 w-4" />
                  <span>Latest: <strong>{contestStats.latestFinishedRace.eventName}</strong> on {new Date(contestStats.latestFinishedRace.eventDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Overall Series Rankings
          </CardTitle>
          <CardDescription>
            All participants ranked by total points. For equal points, better last race position determines ranking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rankings.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No participants yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Participant</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Club</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Points</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((participant, index) => (
                    <ParticipantRow 
                      key={participant.participantId}
                      participant={participant}
                      rank={index + 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <LiveUpdates />
    </div>
  )
}
