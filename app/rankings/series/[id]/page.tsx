import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSeriesRankings } from "@/lib/actions/rankings"
import { ArrowLeft, Calendar, Medal, Trophy, Users } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface SeriesDetailPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function SeriesDetailPage({ params }: SeriesDetailPageProps) {
    const { id } = await params
    const seriesId = parseInt(id)

    if (isNaN(seriesId)) {
        notFound()
    }

    const seriesRankings = await getSeriesRankings(seriesId)

    if (!seriesRankings) {
        notFound()
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{seriesRankings.seriesName}</h1>
                    <p className="text-gray-600 flex items-center justify-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Season {seriesRankings.seriesSeason}
                    </p>
                </div>
            </div>

            <div className="space-y-8">
                {seriesRankings.contests.map((contest) => (
                    <Card key={contest.contestId}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">{contest.contestName}</CardTitle>
                                    <div className="flex gap-2 mt-2">
                                        {contest.ageGroup && (
                                            <Badge variant="secondary">{contest.ageGroup}</Badge>
                                        )}
                                        {contest.gender && (
                                            <Badge variant="secondary">{contest.gender}</Badge>
                                        )}
                                    </div>
                                </div>
                                <Link href={`/rankings/contest/${contest.contestId}`}>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                                        View Details
                                    </Badge>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {contest.topParticipants.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                    <p>No participants yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {contest.topParticipants.map((participant, index) => (
                                        <div
                                            key={participant.participantId}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-200 text-sm font-semibold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-lg">{participant.participantName}</div>
                                                    <div className="text-sm text-gray-500">
                                                        #{participant.participantBibNumber}
                                                        {participant.participantClub && ` • ${participant.participantClub}`}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="font-semibold text-xl">{participant.totalPoints}</div>
                                                    <div className="text-xs text-gray-500">total points</div>
                                                </div>
                                                {index < 3 && (
                                                    <Medal className={`h-6 w-6 ${index === 0 ? 'text-yellow-500' :
                                                        index === 1 ? 'text-gray-400' : 'text-orange-600'
                                                        }`} />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
} 