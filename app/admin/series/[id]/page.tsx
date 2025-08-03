import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Users, Plus, Clock, CheckCircle, AlertCircle, Download } from "lucide-react"
import { getSeriesById } from "@/lib/actions/series"
import { notFound } from "next/navigation"
import { EventActions } from "@/components/event-actions"
import { ContestActions } from "@/components/contest-actions"
import { RaceResultImportSection } from "@/components/raceresult-import-section"

export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const seriesId = parseInt(id)

  const seriesData = await getSeriesById(seriesId)
  if (!seriesData) {
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
          <h1 className="text-2xl font-bold">{seriesData.name}</h1>
          <div className="flex items-center gap-2">
            <p className="text-gray-600">{seriesData.season}</p>
            <Badge 
              variant={seriesData.status === 'finished' ? 'default' : seriesData.status === 'ongoing' ? 'secondary' : 'outline'}
              className="text-xs"
            >
              {seriesData.status || 'scheduled'}
            </Badge>
          </div>
          {seriesData.participantsUrl && (
            <div className="mt-2">
              <a
                href={seriesData.participantsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Default RaceResult Participants
              </a>
            </div>
          )}
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

        {seriesData.events === undefined || seriesData.events.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No events scheduled yet.</p>
            </CardContent>
          </Card>
        ) : (
          seriesData.events.map((event: { 
            id: number; 
            name: string; 
            date: string; 
            location: string; 
            club: string; 
            seriesId: number; 
            races?: unknown[];
            registrationUrl?: string | null;
            lastImportAt?: Date | null;
            importStatus?: string | null;
          }) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle className="text-base">{event.name}</CardTitle>
                <CardDescription>
                  {new Date(event.date).toLocaleDateString()} • {event.location} • {event.club}
                </CardDescription>
                {event.registrationUrl && (
                  <div className="mt-2">
                    <a 
                      href={event.registrationUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      External Registration Site
                    </a>
                  </div>
                )}
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    Import Status: 
                    {event.importStatus === 'done' ? (
                      <Badge variant="default" className="ml-1 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        done
                      </Badge>
                    ) : event.importStatus === 'pending' ? (
                      <Badge variant="secondary" className="ml-1 flex items-center gap-1">
                        <Clock className="h-3 w-3 animate-pulse" />
                        pending
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="ml-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        none
                      </Badge>
                    )}
                  </span>
                  {event.lastImportAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last Import: {event.lastImportAt instanceof Date ? event.lastImportAt.toLocaleString() : new Date(event.lastImportAt).toLocaleString()}
                    </span>
                  )}
                </div>
                {event.importStatus === 'pending' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">Import in progress...</p>
                  </div>
                )}
                {!event.registrationUrl && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 italic">No registration URL configured</p>
                  </div>
                )}
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
                  <EventActions event={{
                    ...event,
                    registrationUrl: event.registrationUrl || undefined,
                    lastImportAt: event.lastImportAt ? (event.lastImportAt instanceof Date ? event.lastImportAt.toISOString() : event.lastImportAt) : undefined,
                    importStatus: event.importStatus || undefined
                  }} />
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

        {!seriesData.contests || seriesData.contests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No contests created yet.</p>
            </CardContent>
          </Card>
        ) : (
          seriesData.contests.map((contest: {
            id: number;
            name: string;
            comment?: string | null;
            seriesId: number;
            participants?: Array<{
              id: number;
              name: string;
              bibNumber: number;
            }>;
          }) => (
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

             {/* Race Result Import Section */}
       <div className="space-y-4">
         <div className="flex items-center justify-between">
           <h2 className="text-lg font-semibold flex items-center gap-2">
             <Download className="h-5 w-5" />
             Import Contests from RaceResult
           </h2>
         </div>
         
         <RaceResultImportSection seriesId={seriesId} participantsUrl={seriesData.participantsUrl} />
       </div>
    </div>
  )
}
