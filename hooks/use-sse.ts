'use client'

import { useEffect, useRef, useState } from 'react'

interface SSEEvent {
  type: 'connected' | 'heartbeat' | 'race-updated' | 'contest-updated' | 'series-updated'
  message?: string
  timestamp?: number
  data?: any
}

export function useSSE() {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const connectSSE = () => {
      if (typeof window === 'undefined') return

      const eventSource = new EventSource('/api/events')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setIsConnected(true)
        console.log('SSE connection established')
      }

      eventSource.onmessage = (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data)
          setLastEvent(data)
          
          // Handle different event types
          switch (data.type) {
            case 'connected':
              console.log('SSE connected:', data.message)
              break
            case 'heartbeat':
              // Keep connection alive
              break
            case 'race-updated':
            case 'contest-updated':
            case 'series-updated':
              // Trigger page refresh for live updates
              window.location.reload()
              break
          }
        } catch (error) {
          console.error('Error parsing SSE event:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        setIsConnected(false)
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (eventSourceRef.current) {
            eventSourceRef.current.close()
            connectSSE()
          }
        }, 5000)
      }
    }

    connectSSE()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  return { isConnected, lastEvent }
} 