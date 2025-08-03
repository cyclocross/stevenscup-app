import { NextRequest } from 'next/server'
import { registerSSEController } from '@/lib/utils/sse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const unregister = registerSSEController(controller)

      // Send initial event immediately
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`)
      )

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`)
          )
        } catch {
          clearInterval(heartbeat)
          try { controller.close() } catch {}
          unregister()
        }
      }, 30000)

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        try { controller.close() } catch {}
        unregister()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}