"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createContest, updateContest } from "@/lib/actions/contests"

interface ContestFormProps {
  mode: "create" | "edit"
  seriesId: number
  initialData?: {
    id?: number
    name: string
    comment?: string
    participantsUrl?: string
  }
  contestId?: number
}

export function ContestForm({ mode, seriesId, initialData, contestId }: ContestFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    comment: initialData?.comment || "",
    participantsUrl: initialData?.participantsUrl || "",
  })

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let result

      if (mode === "create") {
        result = await createContest({
          ...formData,
          seriesId,
        })
      } else {
        if (!contestId) {
          toast.error("Contest ID is required for editing")
          return
        }
        result = await updateContest(contestId, formData)
      }

      if (result.success) {
        toast.success(
          mode === "create" 
            ? "Contest created successfully" 
            : "Contest updated successfully"
        )
        router.push(`/admin/series/${seriesId}`)
      } else {
        toast.error(result.error || `Failed to ${mode} contest`)
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
          {mode === "create" ? "Create New Contest" : "Edit Contest"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Contest Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Elite Men, Junior Women"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Optional comment about this contest"
              className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="participantsUrl">RaceResult Participants URL</Label>
            <input
              id="participantsUrl"
              type="url"
              value={formData.participantsUrl}
              onChange={(e) => setFormData({ ...formData, participantsUrl: e.target.value })}
              placeholder="https://my4.raceresult.com/.../RRPublish/data/list?..."
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-sm text-gray-500">
              Optional: URL to import participants from RaceResult
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading 
              ? (mode === "create" ? "Creating..." : "Updating...") 
              : (mode === "create" ? "Create Contest" : "Update Contest")
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
