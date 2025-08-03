import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusIcon } from "@/components/ui/status-icon"
import { getParticipationsByRace, pointsForParticipation } from "@/lib/actions/participations"
import { getRaceById } from "@/lib/actions/races"
import { ArrowLeft, Award, Clock, Flag, Trophy, Users } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface RaceRankingsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function RaceRankingsPage({ params }: RaceRankingsPageProps) {
  const { id } = await params
  const raceId = parseInt(id)

  if (isNaN(raceId)) {
    notFound()
  }

  const race = await getRaceById(raceId)
  const participationsResult = await getParticipationsByRace(raceId)

  if (!race || !participationsResult.data) {
    notFound()
  }

  const participations = participationsResult.data

  // Separate participations by status
  const finishedParticipations = participations.filter(p => p.finished)
  const allParticipations = participations.sort((a, b) => a.participant.bibNumber - b.participant.bibNumber)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "ongoing":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
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
          <Trophy className="mx-auto h-16 w-16 text-orange-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Provisional Race Rankings</h1>
          <div className="flex items-center justify-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{race.event?.name} • {race.event?.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              <span>{race.contest?.name}</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(race.status || "scheduled")}`}>
              {race.status || "scheduled"}
            </span>
          </div>

          {/* Race Statistics */}
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span><strong>{participations.length}</strong> participants</span>
            </div>
            {finishedParticipations.length > 0 && (
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span><strong>{finishedParticipations.length}</strong> finished</span>
              </div>
            )}

          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Finished Participations */}
        {finishedParticipations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                Finishers ({finishedParticipations.length})
              </CardTitle>
              <CardDescription>
                Race positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Position</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Bib</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Club</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finishedParticipations
                      .sort((a, b) => (a.position || 0) - (b.position || 0))
                      .map((participation) => (
                        <tr key={participation.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            {participation.position || '-'}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            {participation.participant.bibNumber}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {participation.participant.name}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {participation.participant.club || '-'}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                            {pointsForParticipation(participation)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}



        {/* All Participations (Starter List) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Starter List ({allParticipations.length})
            </CardTitle>
            <CardDescription>
              All registered participants sorted by bib number
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Bib</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Club</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {allParticipations.map((participation) => (
                    <tr key={participation.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {participation.participant.bibNumber}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {participation.participant.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {participation.participant.club || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <StatusIcon status={participation.finished ? "finished" : participation.started ? "started" : "registered"} />
                          <span className="capitalize">
                            {participation.finished ? "Finished" : participation.started ? "Started" : "Registered"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                        {pointsForParticipation(participation)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 