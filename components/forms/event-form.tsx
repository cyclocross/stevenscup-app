"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createEvent, updateEvent } from "@/lib/actions/events"

interface EventFormProps {
  mode: "create" | "edit"
  seriesId: number
  initialData?: {
    id?: number
    name: string
    date: string
    location: string
    club: string
    seriesId: number
    registrationUrl?: string | null
  }
  eventId?: number
}

export function EventForm({ mode, seriesId, initialData, eventId }: EventFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    date: initialData?.date || "",
    location: initialData?.location || "",
    club: initialData?.club || "",
    registrationUrl: initialData?.registrationUrl || "",
  })

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let result

      if (mode === "create") {
        result = await createEvent({
          ...formData,
          seriesId,
        })
      } else {
        if (!eventId) {
          toast.error("Event ID is required for editing")
          return
        }
        result = await updateEvent(eventId, formData)
      }

      if (result.success) {
        toast.success(
          mode === "create" 
            ? "Event created successfully" 
            : "Event updated successfully"
        )
        router.push(`/admin/series/${seriesId}`)
      } else {
        toast.error(result.error || `Failed to ${mode} event`)
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create New Event" : "Edit Event"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Round 1 - City Park"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., City Park, Main Street"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="club">Organizing Club</Label>
            <Input
              id="club"
              value={formData.club}
              onChange={(e) => setFormData({ ...formData, club: e.target.value })}
              placeholder="e.g., Local Cycling Club"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationUrl">External Registration URL</Label>
            <Input
              id="registrationUrl"
              type="url"
              value={formData.registrationUrl || ""}
              onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
              placeholder="https://example.com/register"
            />
            <p className="text-sm text-gray-500">
              Optional: Link to external registration website
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading 
              ? (mode === "create" ? "Creating..." : "Updating...") 
              : (mode === "create" ? "Create Event" : "Update Event")
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
