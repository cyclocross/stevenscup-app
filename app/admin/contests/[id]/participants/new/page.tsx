import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getContestById } from "@/lib/actions/contests"
import { notFound } from "next/navigation"
import { ParticipantForm } from "@/components/forms/participant-form"

export default async function NewParticipantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contestId = Number.parseInt(id)
  const contest = await getContestById(contestId)

  if (!contest) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/contests/${contestId}/participants`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add New Participant</h1>
          <p className="text-gray-600">{contest.name}</p>
        </div>
      </div>

      <ParticipantForm 
        mode="create" 
        contestId={contestId}
      />
    </div>
  )
} 