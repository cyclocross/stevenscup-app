"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, Trash2, MoreHorizontal, Download, RotateCcw } from "lucide-react"
import { deleteEvent, updateEvent, resetImportStatusForEvent } from "@/lib/actions/events"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Event {
  id: number
  name: string
  date: string
  location: string
  club: string
  seriesId: number
  registrationUrl?: string
  lastImportAt?: string
  importStatus?: string
}

interface EventActionsProps {
  event: Event
}

export function EventActions({ event }: EventActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${event.name}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteEvent(event.id)
      if (result.success) {
        toast.success("Event deleted successfully")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to delete event")
      }
    } catch {
      toast.error("An error occurred while deleting the event")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleImport = async () => {
    if (!event.registrationUrl) {
      toast.error("No registration URL configured for this event")
      return
    }

    setIsImporting(true)
    try {
      // Update status to pending
      await updateEvent(event.id, { importStatus: 'pending' })
      
      // Simulate import process (replace with actual import logic later)
      toast.info("Starting import process...")
      
      // Simulate import delay
      setTimeout(async () => {
        try {
          // Update status to done and set last import time
          await updateEvent(event.id, { 
            importStatus: 'done',
            lastImportAt: new Date().toISOString()
          })
          toast.success("Import completed successfully!")
          router.refresh() // Refresh to show updated status
        } catch (error) {
          toast.error("Failed to update import status")
        } finally {
          setIsImporting(false)
        }
      }, 3000) // Simulate 3 second import process
      
    } catch (error) {
      toast.error("An error occurred while starting import")
      setIsImporting(false)
    }
  }

  const handleResetImport = async () => {
    setIsResetting(true)
    try {
      const result = await resetImportStatusForEvent(event.id)
      if (result.success) {
        toast.success("Import status reset successfully")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to reset import status")
      }
    } catch {
      toast.error("An error occurred while resetting import status")
    } finally {
      setIsResetting(false)
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
        {event.registrationUrl && (
          <DropdownMenuItem
            onClick={handleImport}
            disabled={isImporting || event.importStatus === 'pending'}
            className="cursor-pointer"
          >
            <Download className="h-4 w-4 mr-2" />
            {isImporting ? "Importing..." : 
             event.importStatus === 'pending' ? "Import in Progress..." :
             event.importStatus === 'done' ? "Re-import" : "Import Registrations"}
          </DropdownMenuItem>
        )}
        {(event.importStatus === 'done' || event.importStatus === 'pending') && (
          <DropdownMenuItem
            onClick={handleResetImport}
            disabled={isResetting}
            className="cursor-pointer text-orange-600 focus:text-orange-600"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {isResetting ? "Resetting..." : "Reset Import Status"}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => router.push(`/admin/events/${event.id}/edit`)}
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