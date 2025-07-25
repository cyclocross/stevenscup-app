"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createEvent } from "@/lib/actions/events"

interface EventFormProps {
  seriesId: number
}

export function EventForm({ seriesId }: EventFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    location: "",
    club: "",
  })

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await createEvent({
        ...formData,
        seriesId,
      })

      if (result.success) {
        toast.success("Event created successfully")
        router.push(`/admin/series/${seriesId}`)
      } else {
        toast.error(result.error || "Failed to create event")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Event"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
