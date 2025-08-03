"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    cycleParticipationStatus,
    moveParticipationDown,
    moveParticipationUp,
    removeParticipantFromRace
} from "@/lib/actions/participations"
import { ArrowDown, ArrowUp, MoreHorizontal, RotateCcw, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

interface Participation {
    id: number
    participantId: number
    raceId: number
    registered: boolean | null
    started: boolean | null
    finished: boolean | null
    position: number | null
    participant: {
        id: number
        name: string
        bibNumber: number
    }
}

interface ParticipationActionsProps {
    participation: Participation
}

export function ParticipationActions({ participation }: ParticipationActionsProps) {
    const [isRemoving, setIsRemoving] = useState(false)
    const [isCycling, setIsCycling] = useState(false)
    const [isMoving, setIsMoving] = useState(false)
    const router = useRouter()

    const handleRemove = async () => {
        if (!confirm(`Are you sure you want to remove "${participation.participant.name}" from this race?`)) {
            return
        }

        setIsRemoving(true)
        try {
            const result = await removeParticipantFromRace(participation.participantId, participation.raceId)
            if (!result.error) {
                toast.success("Participant removed from race successfully")
                router.refresh()
            } else {
                toast.error(result.error || "Failed to remove participant")
            }
        } catch {
            toast.error("An error occurred while removing the participant")
        } finally {
            setIsRemoving(false)
        }
    }

    const handleCycleStatus = async () => {
        setIsCycling(true)
        try {
            const result = await cycleParticipationStatus(participation.id)
            if (result.data) {
                toast.success("Status updated successfully")
                router.refresh()
            } else {
                toast.error(result.error || "Failed to update status")
            }
        } catch {
            toast.error("An error occurred while updating status")
        } finally {
            setIsCycling(false)
        }
    }

    const handleMoveUp = async () => {
        setIsMoving(true)
        try {
            const result = await moveParticipationUp(participation.id)
            if (result.data) {
                toast.success("Position updated successfully")
                router.refresh()
            } else {
                toast.error(result.error || "Failed to move up")
            }
        } catch {
            toast.error("An error occurred while moving position")
        } finally {
            setIsMoving(false)
        }
    }

    const handleMoveDown = async () => {
        setIsMoving(true)
        try {
            const result = await moveParticipationDown(participation.id)
            if (result.data) {
                toast.success("Position updated successfully")
                router.refresh()
            } else {
                toast.error(result.error || "Failed to move down")
            }
        } catch {
            toast.error("An error occurred while moving position")
        } finally {
            setIsMoving(false)
        }
    }

    const getStatusText = () => {
        if (participation.finished) return "Finished"
        if (participation.started) return "Started"
        if (participation.registered) return "Registered"
        return "Pending"
    }

    return (
        <div className="flex items-center gap-1">
            {/* Status Cycle Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={handleCycleStatus}
                disabled={isCycling}
                title={`Cycle status: ${getStatusText()}`}
            >
                <RotateCcw className="h-4 w-4" />
            </Button>

            {/* Move Up/Down Buttons (only for finished participations) */}
            {participation.finished && (
                <>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMoveUp}
                        disabled={isMoving}
                        title="Move up"
                    >
                        <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMoveDown}
                        disabled={isMoving}
                        title="Move down"
                    >
                        <ArrowDown className="h-4 w-4" />
                    </Button>
                </>
            )}

            {/* Remove Button */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={handleRemove}
                        disabled={isRemoving}
                        className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isRemoving ? "Removing..." : "Remove from Race"}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
} 