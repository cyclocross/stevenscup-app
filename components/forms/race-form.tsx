"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getContestsBySeriesId } from "@/lib/actions/contests"
import { createRace, updateRace } from "@/lib/actions/races"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface RaceFormProps {
  mode: "create" | "edit"
  eventId: number
  seriesId: number
  initialData?: {
    id?: number
    eventId: number
    contestId: number
    startTime?: string | null
    duration?: number | null
    status?: string | null
  }
  raceId?: number
}

export function RaceForm({ mode, eventId, seriesId, initialData, raceId }: RaceFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [contests, setContests] = useState<Array<{ id: number; name: string }>>([])
  const [formData, setFormData] = useState({
    contestId: initialData?.contestId || 0,
    startTime: initialData?.startTime || "",
    duration: initialData?.duration || 0,
    status: initialData?.status || "scheduled",
  })

  const router = useRouter()

  useEffect(() => {
    const loadContests = async () => {
      try {
        const seriesContests = await getContestsBySeriesId(seriesId)
        setContests(seriesContests)
      } catch (error) {
        console.error("Error loading contests:", error)
        toast.error("Failed to load contests")
      }
    }

    loadContests()
  }, [seriesId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let result

      if (mode === "create") {
        result = await createRace({
          eventId,
          contestId: formData.contestId,
          startTime: formData.startTime || null,
          status: formData.status,
        })
      } else {
        if (!raceId) {
          toast.error("Race ID is required for editing")
          return
        }
        result = await updateRace(raceId, {
          contestId: formData.contestId,
          startTime: formData.startTime || null,
          status: formData.status,
        })
      }

      if (result.success) {
        toast.success(
          mode === "create"
            ? "Race created successfully"
            : "Race updated successfully"
        )
        router.push(`/admin/events/${eventId}/races`)
      } else {
        toast.error(result.error || `Failed to ${mode} race`)
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
          {mode === "create" ? "Create New Race" : "Edit Race"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contest">Contest</Label>
            <Select
              value={formData.contestId.toString()}
              onValueChange={(value) => setFormData({ ...formData, contestId: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a contest" />
              </SelectTrigger>
              <SelectContent>
                {contests.map((contest) => (
                  <SelectItem key={contest.id} value={contest.id.toString()}>
                    {contest.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="0"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
              placeholder="e.g., 45"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || formData.contestId === 0}>
            {isLoading
              ? (mode === "create" ? "Creating..." : "Updating...")
              : (mode === "create" ? "Create Race" : "Update Race")
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 