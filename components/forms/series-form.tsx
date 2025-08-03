"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createSeries, updateSeries } from "@/lib/actions/series"

interface SeriesFormProps {
  mode: "create" | "edit"
  initialData?: {
    id?: number
    name: string
    season: string
    description?: string | null
    status?: string | null
  }
  seriesId?: number
}

export function SeriesForm({ mode, initialData, seriesId }: SeriesFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    season: initialData?.season || new Date().getFullYear().toString(),
    description: initialData?.description || "",
    status: initialData?.status || "scheduled",
  })

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let result

      if (mode === "create") {
        result = await createSeries(formData)
      } else {
        if (!seriesId) {
          toast.error("Series ID is required for editing")
          return
        }
        result = await updateSeries(seriesId, formData)
      }

      if (result.success) {
        toast.success(
          mode === "create" 
            ? "Series created successfully" 
            : "Series updated successfully"
        )
        router.push("/admin")
      } else {
        toast.error(result.error || `Failed to ${mode} series`)
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
          {mode === "create" ? "Create New Series" : "Edit Series"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Series Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Winter Cyclocross Series"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="season">Season</Label>
            <Input
              id="season"
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              placeholder="e.g., 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="finished">Finished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the series..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading 
              ? (mode === "create" ? "Creating..." : "Updating...") 
              : (mode === "create" ? "Create Series" : "Update Series")
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
