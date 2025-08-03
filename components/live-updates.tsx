'use client'

import { useSSE } from '@/hooks/use-sse'
import { Wifi, WifiOff } from 'lucide-react'

export function LiveUpdates() {
  const { isConnected } = useSSE()

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium ${
        isConnected 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3" />
            <span>Live Updates</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span>Offline</span>
          </>
        )}
      </div>
    </div>
  )
} 