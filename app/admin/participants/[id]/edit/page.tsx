import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getParticipant } from "@/lib/actions/participants"
import { notFound } from "next/navigation"
import { ParticipantForm } from "@/components/forms/participant-form"

export default async function EditParticipantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const participantId = Number.parseInt(id)
  const participantResult = await getParticipant(participantId)

  if (!participantResult.data) {
    notFound()
  }

  const participant = participantResult.data

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/contests/${participant.contestId}/participants`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Participant</h1>
          <p className="text-gray-600">{participant.name}</p>
        </div>
      </div>

      <ParticipantForm 
        mode="edit" 
        contestId={participant.contestId}
        initialData={participant}
        participantId={participantId}
      />
    </div>
  )
} 