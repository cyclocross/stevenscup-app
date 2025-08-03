export async function sendSSEEvent(eventType: string, data?: unknown) {
  try {
    // In a real implementation, you would send this to connected SSE clients
    // For now, we'll just log it as a placeholder
    console.log(`SSE Event: ${eventType}`, data)
    
    // In production, you would:
    // 1. Store connected clients in a Map or Set
    // 2. Send the event to all connected clients
    // 3. Handle reconnection logic
    
    // Example implementation:
    // const event = `data: ${JSON.stringify({ type: eventType, data, timestamp: Date.now() })}\n\n`
    // connectedClients.forEach(client => client.enqueue(event))
  } catch (error) {
    console.error('Error sending SSE event:', error)
  }
}

export async function notifyRaceUpdate(raceId: number) {
  await sendSSEEvent('race-updated', { raceId })
}

export async function notifyContestUpdate(contestId: number) {
  await sendSSEEvent('contest-updated', { contestId })
}

export async function notifySeriesUpdate(seriesId: number) {
  await sendSSEEvent('series-updated', { seriesId })
} 