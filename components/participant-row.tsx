"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Shirt } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ParticipantRowProps {
  participant: {
    participantId: number
    participantName: string
    participantClub: string | null
    participantBibNumber: number
    totalPoints: number
    lastRacePosition: number | null
    participations: {
      raceId: number
      eventName: string
      eventDate: string
      position: number | null
      points: number
    }[]
  }
  rank: number
}

export function ParticipantRow({ participant, rank }: ParticipantRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-sm font-semibold">
              {rank}
            </div>
            {rank === 1 && (
              <Shirt className="h-4 w-4 text-yellow-500" />
            )}
          </div>
        </td>
        <td className="py-3 px-4">
          <div>
            <div className="font-medium">{participant.participantName}</div>
            <div className="text-sm text-gray-500">#{participant.participantBibNumber}</div>
          </div>
        </td>
        <td className="py-3 px-4">
          <div className="text-gray-600">
            {participant.participantClub || '-'}
          </div>
        </td>
        <td className="py-3 px-4 text-right">
          <div className="font-semibold text-lg">{participant.totalPoints}</div>
        </td>
        <td className="py-3 px-4 text-center">
          {participant.participations.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              )}
            </button>
          )}
        </td>
      </tr>
      {isExpanded && participant.participations.length > 0 && (
        <tr>
          <td colSpan={5} className="bg-gray-50 p-0">
            <div className="p-4">
              <h4 className="font-medium text-sm text-gray-700 mb-3">Race Results</h4>
              <div className="space-y-2">
                {participant.participations.map((participation) => (
                  <div
                    key={participation.raceId}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium text-sm">{participation.eventName}</div>
                        <div className="text-xs text-gray-500">{participation.eventDate}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {participation.position ? (
                        <Badge variant="outline">
                          Position: {participation.position}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">No position</Badge>
                      )}
                      <div className="text-right">
                        <div className="font-semibold">{participation.points}</div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
} 