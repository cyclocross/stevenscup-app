import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { getEventById } from "@/lib/actions/events"
import { EventForm } from "@/components/forms/event-form"

interface EditEventPageProps {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params
  const eventId = parseInt(id)
  
  const event = await getEventById(eventId)
  
  if (!event) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Event Not Found</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              The event you&apos;re looking for doesn&apos;t exist.
            </p>
          </CardContent>
        </Card>
      </div>
    )
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
          <h1 className="text-2xl font-bold">Edit Event</h1>
          <p className="text-gray-600">Update event details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit {event.name}</CardTitle>
          <CardDescription>
            Update the event information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventForm 
            mode="edit" 
            initialData={event}
            eventId={eventId}
            seriesId={event.seriesId}
          />
        </CardContent>
      </Card>
    </div>
  )
} 