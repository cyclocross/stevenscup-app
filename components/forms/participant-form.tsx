"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createParticipant, updateParticipant } from "@/lib/actions/participants"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ParticipantFormProps {
  mode: "create" | "edit"
  contestId: number
  initialData?: {
    id?: number
    name: string
    club?: string | null
    licenseNumber?: string | null
    birthYear: number
    gender: string
    team?: string | null
    bibNumber: number
    status?: string | null
  }
  participantId?: number
}

export function ParticipantForm({ mode, contestId, initialData, participantId }: ParticipantFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    club: initialData?.club || "",
    licenseNumber: initialData?.licenseNumber || "",
    birthYear: initialData?.birthYear || new Date().getFullYear(),
    gender: initialData?.gender || "male",
    team: initialData?.team || "",
    bibNumber: initialData?.bibNumber || 1,
    status: initialData?.status || "registered",
  })

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let result

      if (mode === "create") {
        result = await createParticipant({
          ...formData,
          contestId,
        })
      } else {
        if (!participantId) {
          toast.error("Participant ID is required for editing")
          return
        }
        result = await updateParticipant(participantId, formData)
      }

      if (result.data) {
        toast.success(
          mode === "create" 
            ? "Participant created successfully" 
            : "Participant updated successfully"
        )
        router.push(`/admin/contests/${contestId}/participants`)
      } else {
        toast.error(result.error || `Failed to ${mode} participant`)
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
          {mode === "create" ? "Add New Participant" : "Edit Participant"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bibNumber">Bib Number *</Label>
              <Input
                id="bibNumber"
                type="number"
                value={formData.bibNumber}
                onChange={(e) => setFormData({ ...formData, bibNumber: parseInt(e.target.value) })}
                placeholder="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="club">Club</Label>
              <Input
                id="club"
                value={formData.club}
                onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                placeholder="Club name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Input
                id="team"
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                placeholder="Team name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                placeholder="License number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthYear">Birth Year *</Label>
              <Input
                id="birthYear"
                type="number"
                value={formData.birthYear}
                onChange={(e) => setFormData({ ...formData, birthYear: parseInt(e.target.value) })}
                placeholder="1990"
                min="1900"
                max={new Date().getFullYear()}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registered">Registered</SelectItem>
                  <SelectItem value="started">Started</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                  <SelectItem value="dnf">DNF</SelectItem>
                  <SelectItem value="dns">DNS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading 
              ? (mode === "create" ? "Creating..." : "Updating...") 
              : (mode === "create" ? "Add Participant" : "Update Participant")
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 