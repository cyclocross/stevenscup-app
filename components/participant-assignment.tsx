"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { assignParticipantToRace } from "@/lib/actions/participations"
import { Plus, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

interface Participant {
    id: number
    name: string
    bibNumber: number
    club?: string | null
    team?: string | null
}

interface ParticipantAssignmentProps {
    raceId: number
    contestId: number
    availableParticipants: Participant[]
}

export function ParticipantAssignment({ raceId, availableParticipants }: ParticipantAssignmentProps) {
    const [selectedParticipantId, setSelectedParticipantId] = useState<string>("")
    const [isAssigning, setIsAssigning] = useState(false)
    const router = useRouter()

    const handleAssign = async () => {
        if (!selectedParticipantId) {
            toast.error("Please select a participant")
            return
        }

        setIsAssigning(true)
        try {
            const result = await assignParticipantToRace(parseInt(selectedParticipantId), raceId)
            if (result.data) {
                toast.success("Participant assigned to race successfully")
                setSelectedParticipantId("")
                router.refresh()
            } else {
                toast.error(result.error || "Failed to assign participant")
            }
        } catch {
            toast.error("An error occurred while assigning the participant")
        } finally {
            setIsAssigning(false)
        }
    }

    if (availableParticipants.length === 0) {
        return (
            <div className="text-center py-4 text-gray-500">
                <UserPlus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No available participants to assign</p>
            </div>
        )
    }

    return (
        <div className="flex gap-2">
            <Select value={selectedParticipantId} onValueChange={setSelectedParticipantId}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select participant to assign" />
                </SelectTrigger>
                <SelectContent>
                    {availableParticipants.map((participant) => (
                        <SelectItem key={participant.id} value={participant.id.toString()}>
                            #{participant.bibNumber} - {participant.name}
                            {participant.club && ` (${participant.club})`}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button
                onClick={handleAssign}
                disabled={!selectedParticipantId || isAssigning}
                size="sm"
            >
                <Plus className="h-4 w-4 mr-1" />
                {isAssigning ? "Assigning..." : "Assign"}
            </Button>
        </div>
    )
} 