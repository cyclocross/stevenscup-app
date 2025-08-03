import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { RaceForm } from "@/components/forms/race-form"
import { getEventById } from "@/lib/actions/events"
import { notFound } from "next/navigation"

interface NewRacePageProps {
  params: Promise<{ id: string }>
}

export default async function NewRacePage({ params }: NewRacePageProps) {
  const { id } = await params
  const eventId = parseInt(id)
  
  const event = await getEventById(eventId)
  if (!event) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/events/${eventId}/races`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add Race</h1>
          <p className="text-gray-600">{event.name}</p>
        </div>
      </div>

      <RaceForm mode="create" eventId={eventId} seriesId={event.seriesId} />
    </div>
  )
} 