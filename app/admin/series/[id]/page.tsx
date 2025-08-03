import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Users, Plus } from "lucide-react"
import { getSeriesById } from "@/lib/actions/series"
import { notFound } from "next/navigation"
import { EventActions } from "@/components/event-actions"
import { ContestActions } from "@/components/contest-actions"

export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const seriesId = Number.parseInt(id)
  const series = await getSeriesById(seriesId)

  if (!series) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{series.name}</h1>
          <div className="flex items-center gap-2">
            <p className="text-gray-600">{series.season}</p>
            <Badge 
              variant={series.status === 'finished' ? 'default' : series.status === 'ongoing' ? 'secondary' : 'outline'}
              className="text-xs"
            >
              {series.status || 'scheduled'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Events
          </h2>
          <Link href={`/admin/series/${seriesId}/events/new`}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Event
            </Button>
          </Link>
        </div>

        {series.events === undefined || series.events.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No events scheduled yet.</p>
            </CardContent>
          </Card>
        ) : (
          series.events.map((event: { id: number; name: string; date: string; location: string; club: string; seriesId: number; races?: unknown[] }) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle className="text-base">{event.name}</CardTitle>
                <CardDescription>
                  {new Date(event.date).toLocaleDateString()} • {event.location} • {event.club}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{event.races?.length || 0} races scheduled</p>
                <div className="flex gap-2">
                  <Link href={`/admin/events/${event.id}/races`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <Calendar className="h-4 w-4 mr-1" />
                      Races
                    </Button>
                  </Link>
                  <EventActions event={event} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Contests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Contests
          </h2>
          <Link href={`/admin/series/${seriesId}/contests/new`}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Contest
            </Button>
          </Link>
        </div>

        {!series.contests || series.contests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No contests created yet.</p>
            </CardContent>
          </Card>
        ) : (
          series.contests.map((contest) => (
            <Card key={contest.id}>
              <CardHeader>
                <CardTitle className="text-base">{contest.name}</CardTitle>
                <CardDescription>
                  {contest.comment && <>{contest.comment}</>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{contest.participants?.length || 0} participants registered</p>
                <div className="flex gap-2">
                  <Link href={`/admin/contests/${contest.id}/participants`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <Users className="h-4 w-4 mr-1" />
                      Participants
                    </Button>
                  </Link>
                  <ContestActions contest={contest} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
