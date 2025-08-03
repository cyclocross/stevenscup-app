import { ParticipantActions } from "@/components/participant-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getContestById } from "@/lib/actions/contests"
import { getParticipantsByContestWithCounts, getParticipantsCountsByContest } from "@/lib/actions/participants"
import { getSeriesById } from "@/lib/actions/series"
import { ArrowLeft, Edit, Plus, Users } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function ContestParticipantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contestId = Number.parseInt(id)
  const contest = await getContestById(contestId)
  
  if (!contest) {
    notFound()
  }
  const series = await getSeriesById(contest.seriesId)
  if (!series) {
    notFound()
  }
  // participant restrictions are based on the last year of the series' season
  const contestParticipantYear = parseInt(series.season) + 1

  const participantsResult = await getParticipantsByContestWithCounts(contestId)
  const countsResult = await getParticipantsCountsByContest(contestId)

  const participants = participantsResult.data || []
  const counts = countsResult.data || { total: 0, registered: 0, started: 0, finished: 0, dnf: 0, dns: 0 }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/series/${contest.seriesId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{contest.name} - Participants</h1>
          <p className="text-gray-600">{contest.comment}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{counts.total}</div>
            <p className="text-xs text-gray-600">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{counts.registered}</div>
            <p className="text-xs text-gray-600">Registered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{counts.started}</div>
            <p className="text-xs text-gray-600">Started</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{counts.finished}</div>
            <p className="text-xs text-gray-600">Finished</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{counts.dnf}</div>
            <p className="text-xs text-gray-600">DNF</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-gray-600">{counts.dns}</div>
            <p className="text-xs text-gray-600">DNS</p>
          </CardContent>
        </Card>
      </div>

      {/* Participants Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participants ({participants.length})
          </h2>
          <Link href={`/admin/contests/${contestId}/participants/new`}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Participant
            </Button>
          </Link>
        </div>

        {participants.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No participants registered yet.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bib</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age (Season)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {participants.map((participant) => (
                      <tr key={participant.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {participant.bibNumber}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {participant.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {participant.club || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {participant.team || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {contestParticipantYear - participant.birthYear}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {participant.gender}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${participant.status === 'registered' ? 'bg-blue-100 text-blue-800' :
                              participant.status === 'started' ? 'bg-yellow-100 text-yellow-800' :
                                participant.status === 'finished' ? 'bg-green-100 text-green-800' :
                                  participant.status === 'dnf' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                            }`}>
                            {participant.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/participants/${participant.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <ParticipantActions participant={participant} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 