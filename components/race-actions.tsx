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
import { deleteRace } from "@/lib/actions/races"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Race {
  id: number
  eventId: number
  contestId: number
  startTime?: string | null
  duration?: number | null
  status?: string | null
  contest?: {
    name: string
  }
}

interface RaceActionsProps {
  race: Race
}

export function RaceActions({ race }: RaceActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this race? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteRace(race.id)
      if (result.success) {
        toast.success("Race deleted successfully")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to delete race")
      }
    } catch {
      toast.error("An error occurred while deleting the race")
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
          onClick={() => router.push(`/admin/races/${race.id}/edit`)}
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