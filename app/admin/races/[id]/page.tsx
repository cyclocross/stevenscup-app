import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, Users, Calendar } from "lucide-react"
import { getRaceById } from "@/lib/actions/races"
import { getParticipationsByRace, getAvailableParticipantsForRace, pointsForParticipation } from "@/lib/actions/participations"
import { notFound } from "next/navigation"
import { ParticipantAssignment } from "@/components/participant-assignment"
import { ParticipationActions } from "@/components/participation-actions"

export default async function RaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const raceId = Number.parseInt(id)
  const race = await getRaceById(raceId)

  if (!race) {
    notFound()
  }

  const participationsResult = await getParticipationsByRace(raceId)
  const availableParticipantsResult = await getAvailableParticipantsForRace(raceId, race.contestId)
  
  const participations = participationsResult.data || []
  const availableParticipants = availableParticipantsResult.data || []

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

  const formatTime = (time: string | null) => {
    if (!time) return "TBD"
    return time
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/events/${race.eventId}/races`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{race.contest?.name}</h1>
          <p className="text-gray-600">{race.event?.name} • {race.event?.date}</p>
        </div>
      </div>

      {/* Race Info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Race Information</CardTitle>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(race.status || "scheduled")}`}>
              {race.status || "scheduled"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Start Time</p>
                <p className="text-sm text-gray-600">{formatTime(race.startTime)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Participants</p>
                <p className="text-sm text-gray-600">{participations.length} assigned</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-gray-600">{race.contest?.duration || 'TBD'} min</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Participations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Add Participations</CardTitle>
          <CardDescription>
            Add participants from the contest to this race
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ParticipantAssignment 
            raceId={raceId}
            contestId={race.contestId}
            availableParticipants={availableParticipants}
          />
        </CardContent>
      </Card>

      {/* Participations by Status */}
      {participations.length > 0 && (
        <div className="space-y-6">
          {/* Finished Participations */}
          {participations.filter(p => p.finished).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  Finished ({participations.filter(p => p.finished).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                                         <thead className="bg-gray-50">
                       <tr>
                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pos</th>
                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bib</th>
                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                       </tr>
                     </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {participations
                        .filter(p => p.finished)
                        .sort((a, b) => (a.position || 0) - (b.position || 0))
                        .map((participation) => (
                                                 <tr key={participation.id} className="hover:bg-gray-50">
                           <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                             {participation.position || '-'}
                           </td>
                           <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                             {participation.participant.bibNumber}
                           </td>
                           <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                             {participation.participant.name}
                           </td>
                           <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                             {participation.participant.club || '-'}
                           </td>
                           <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                             {pointsForParticipation(participation)}
                           </td>
                           <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                             <ParticipationActions participation={participation} />
                           </td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Started Participations */}
          {participations.filter(p => p.started && !p.finished).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  Started ({participations.filter(p => p.started && !p.finished).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bib</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {participations
                        .filter(p => p.started && !p.finished)
                        .sort((a, b) => a.participant.bibNumber - b.participant.bibNumber)
                        .map((participation) => (
                        <tr key={participation.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {participation.participant.bibNumber}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {participation.participant.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {participation.participant.club || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {pointsForParticipation(participation)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <ParticipationActions participation={participation} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Registered Participations */}
          {participations.filter(p => p.registered && !p.started && !p.finished).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  Registered ({participations.filter(p => p.registered && !p.started && !p.finished).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bib</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {participations
                        .filter(p => p.registered && !p.started && !p.finished)
                        .sort((a, b) => a.participant.bibNumber - b.participant.bibNumber)
                        .map((participation) => (
                        <tr key={participation.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {participation.participant.bibNumber}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {participation.participant.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {participation.participant.club || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {pointsForParticipation(participation)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <ParticipationActions participation={participation} />
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
      )}

      {/* Empty State */}
      {participations.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No participations in this race yet.</p>
              <p className="text-sm">Use the form above to add participants.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 