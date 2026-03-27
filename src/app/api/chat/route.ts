import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

const SYSTEM_PROMPT = `You are ComfoRide's helpful AI assistant. ComfoRide is a premium intercity shuttle service between Ottawa and Montreal.

FIXED DAILY SCHEDULE:
- Ottawa → Montréal: 8:00 AM and 3:30 PM (departing from 90 Sparks St, Ottawa)
- Montréal → Ottawa: 11:30 AM and 7:30 PM (departing from 1000 De La Gauchetière W, Montréal)

PRICING: $35 CAD per seat (all trips)
CAPACITY: 5 seats per trip
BOOKING: Seats can be held for 15 minutes while you complete payment
CANCELLATION: Free cancellation up to 2 hours before departure

Be helpful, concise, and professional. If asked about booking, guide users to select their trip on the home screen.
If you don't know something, say so honestly.`

export async function POST(req: Request) {
  try {
    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-REPLACE_ME') {
      return new Response(
        JSON.stringify({
          error: 'AI assistant not configured. Set OPENAI_API_KEY in .env to enable.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { messages } = await req.json()

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: SYSTEM_PROMPT,
      messages,
      maxTokens: 500,
    })

    return result.toDataStreamResponse()
  } catch (error: any) {
    console.error('[API/chat] Error:', error)
    return new Response(JSON.stringify({ error: 'Chat unavailable' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
