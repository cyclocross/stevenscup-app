import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, Users, Plus, Calendar } from "lucide-react"
import { getEventById } from "@/lib/actions/events"
import { getRacesByEventId } from "@/lib/actions/races"
import { notFound } from "next/navigation"
import { RaceActions } from "@/components/race-actions"

interface EventRacesPageProps {
  params: Promise<{ id: string }>
}

export default async function EventRacesPage({ params }: EventRacesPageProps) {
  const { id } = await params
  const eventId = parseInt(id)
  
  const event = await getEventById(eventId)
  if (!event) {
    notFound()
  }

  const races = await getRacesByEventId(eventId)

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
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/series/${event.seriesId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Manage Races</h1>
          <p className="text-gray-600">{event.name}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Races
          </h2>
          <Link href={`/admin/events/${eventId}/races/new`}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Race
            </Button>
          </Link>
        </div>

        {races.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No races scheduled yet.</p>
            </CardContent>
          </Card>
        ) : (
          races.map((race) => (
            <Card key={race.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{race.contest?.name}</CardTitle>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(race.status || "scheduled")}`}>
                    {race.status || "scheduled"}
                  </span>
                </div>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatTime(race.startTime)}
                  </span>
                  {race.duration && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {race.duration} min
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    View Details
                  </Button>
                  <RaceActions race={race} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 