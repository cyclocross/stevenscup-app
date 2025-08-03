type BroadcastEvent = { type: string; data?: unknown; timestamp: number }

// Optional cross-worker broadcast (Node worker_threads BroadcastChannel)
type CrossWorkerMsg = { data: BroadcastEvent }
type CrossWorkerChannel = {
  postMessage: (data: unknown) => void
  onmessage: ((msg: CrossWorkerMsg) => void) | null
}
let crossWorkerChannel: CrossWorkerChannel | null = null
try {
  // Use dynamic import to satisfy ESM/TS rules without require()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - Node runtime provides this module
  const wt = (await import('node:worker_threads')) as { BroadcastChannel?: new (name: string) => CrossWorkerChannel }
  if (wt && wt.BroadcastChannel) {
    const ch = new wt.BroadcastChannel('sse-bus')
    crossWorkerChannel = ch
  }
} catch {
  // Not available in this runtime; ignore
}

type SSEClient = { send: (payload: Uint8Array) => Promise<void> | void }

type SSEHub = {
  clients: Set<SSEClient>
}

function getGlobalSSEHub(): SSEHub {
  const g = globalThis as unknown as { __sseHub?: SSEHub }
  if (!g.__sseHub) {
    g.__sseHub = { clients: new Set() }
  }
  return g.__sseHub
}

const encoder = new TextEncoder()

export function registerSSEClient(writer: WritableStreamDefaultWriter<Uint8Array>) {
  // eslint-disable-next-line no-console
  console.log(`Registering SSE client ${writer}`)
  const hub = getGlobalSSEHub()
  const client: SSEClient = { send: (payload) => writer.write(payload) }
  hub.clients.add(client)
  return () => {
    hub.clients.delete(client)
  }
}

export function registerSSEController(controller: ReadableStreamDefaultController<Uint8Array>) {
  const hub = getGlobalSSEHub()
  const client: SSEClient = { send: (payload) => controller.enqueue(payload) }
  hub.clients.add(client)
  return () => {
    hub.clients.delete(client)
  }
}

function forwardLocally(event: BroadcastEvent) {
  const hub = getGlobalSSEHub()
  const payload = encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
  const stale: SSEClient[] = []
  hub.clients.forEach((client) => {
    try {
      // eslint-disable-next-line no-console
      console.log(`Sending SSE event to client: ${event.type}`, event.data)
      // Allow sync or async senders
      const maybePromise = client.send(payload)
      if (maybePromise && typeof (maybePromise as Promise<void>).then === 'function') {
        ;(maybePromise as Promise<void>).catch(() => stale.push(client))
      }
    } catch {
      stale.push(client)
    }
  })
  stale.forEach((client) => hub.clients.delete(client))
}

// Bridge: receive cross-worker messages and forward to local clients only
if (crossWorkerChannel) {
  crossWorkerChannel.onmessage = (msg: { data: BroadcastEvent }) => {
    if (!msg || !msg.data) return
    forwardLocally(msg.data)
  }
}

export async function sendSSEEvent(eventType: string, data?: unknown) {
  try {
    const event: BroadcastEvent = { type: eventType, data, timestamp: Date.now() }
    // Forward to local clients
    forwardLocally(event)
    // And notify other workers if channel available
    if (crossWorkerChannel) {
      try {
        crossWorkerChannel.postMessage(event)
      } catch {
        // ignore
      }
    }
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