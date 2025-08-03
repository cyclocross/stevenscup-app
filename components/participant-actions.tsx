"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, Trash2, MoreHorizontal } from "lucide-react"
import { deleteParticipant } from "@/lib/actions/participants"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Participant {
  id: number
  name: string
  contestId: number
}

interface ParticipantActionsProps {
  participant: Participant
}

export function ParticipantActions({ participant }: ParticipantActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${participant.name}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteParticipant(participant.id)
      if (!result.error) {
        toast.success("Participant deleted successfully")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to delete participant")
      }
    } catch {
      toast.error("An error occurred while deleting the participant")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/admin/participants/${participant.id}/edit`)}
          className="cursor-pointer"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          disabled={isDeleting}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {isDeleting ? "Deleting..." : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 