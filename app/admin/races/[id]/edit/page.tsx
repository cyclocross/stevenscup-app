import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { getRaceById } from "@/lib/actions/races"
import { RaceForm } from "@/components/forms/race-form"

interface EditRacePageProps {
  params: Promise<{ id: string }>
}

export default async function EditRacePage({ params }: EditRacePageProps) {
  const { id } = await params
  const raceId = parseInt(id)
  
  const race = await getRaceById(raceId)
  
  if (!race) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Race Not Found</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              The race you&apos;re looking for doesn&apos;t exist.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/events/${race.eventId}/races`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Race</h1>
          <p className="text-gray-600">Update race details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit {race.contest?.name}</CardTitle>
          <CardDescription>
            Update the race information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RaceForm 
            mode="edit" 
            initialData={race}
            raceId={raceId}
            eventId={race.eventId}
            seriesId={race.event.seriesId}
          />
        </CardContent>
      </Card>
    </div>
  )
} 