"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createContest } from "@/lib/actions/contests"

interface ContestFormProps {
  seriesId: number
}

export function ContestForm({ seriesId }: ContestFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    ageGroup: "",
    gender: "",
    participationPoints: 1,
  })

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await createContest({
        ...formData,
        seriesId,
        ageGroup: formData.ageGroup || null,
        gender: formData.gender || null,
      })

      if (result.success) {
        toast.success("Contest created successfully")
        router.push(`/admin/series/${seriesId}`)
      } else {
        toast.error(result.error || "Failed to create contest")
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
        <CardTitle>Contest Details</CardTitle>
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
            <Label htmlFor="ageGroup">Age Group</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, ageGroup: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select age group (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Junior">Junior (U19)</SelectItem>
                <SelectItem value="U23">U23</SelectItem>
                <SelectItem value="Elite">Elite</SelectItem>
                <SelectItem value="Masters">Masters (40+)</SelectItem>
                <SelectItem value="Veterans">Veterans (50+)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, gender: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Men">Men</SelectItem>
                <SelectItem value="Women">Women</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="participationPoints">Participation Points</Label>
            <Input
              id="participationPoints"
              type="number"
              min="0"
              value={formData.participationPoints}
              onChange={(e) => setFormData({ ...formData, participationPoints: Number.parseInt(e.target.value) || 0 })}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Contest"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
