'use client'

import { useState } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import clsx from 'clsx'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const DEMO_RESPONSES: Record<string, string> = {
  default: "Hello! I'm your ComfoRide assistant. I can help you with schedules, pricing, and booking questions. What would you like to know?",
  schedule: "We run 4 fixed daily trips:\n\n🚌 Ottawa → Montréal: 8:00 AM & 3:30 PM\n🚌 Montréal → Ottawa: 11:30 AM & 7:30 PM\n\nAll trips depart from fixed pickup locations and cost $35/seat.",
  price: "All ComfoRide trips are $35 CAD per seat, regardless of the time or direction. No hidden fees!",
  cancel: "You can cancel your booking up to 2 hours before departure at no charge. Just go to 'My Bookings' to cancel.",
  seats: "Each trip has 5 seats. Once you select a trip, your seats are held for 15 minutes while you complete payment.",
}

function getDemoResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('schedule') || lower.includes('time') || lower.includes('when') || lower.includes('bus'))
    return DEMO_RESPONSES.schedule
  if (lower.includes('price') || lower.includes('cost') || lower.includes('$') || lower.includes('fee'))
    return DEMO_RESPONSES.price
  if (lower.includes('cancel') || lower.includes('refund'))
    return DEMO_RESPONSES.cancel
  if (lower.includes('seat') || lower.includes('capacity') || lower.includes('hold'))
    return DEMO_RESPONSES.seats
  return DEMO_RESPONSES.default
}

export default function AIChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: DEMO_RESPONSES.default }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMsg }]
        }),
      })

      if (!res.ok) throw new Error('API unavailable')

      // Try to read streaming response
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          // Parse AI SDK data format
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('0:"')) {
              try {
                const text = JSON.parse(line.slice(2))
                fullText += text
              } catch {}
            }
          }
        }
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: fullText || getDemoResponse(userMsg)
      }])
    } catch {
      // Fallback to demo responses
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: getDemoResponse(userMsg)
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={clsx(
          'fixed bottom-6 right-4 z-50 w-14 h-14 bg-gradient-to-br from-brand-600 to-cyan-600 rounded-2xl shadow-lg hover:shadow-glow flex items-center justify-center transition-all duration-300',
          open ? 'scale-0 opacity-0' : 'scale-100 opacity-100 animate-pulse-glow'
        )}
        aria-label="Open AI Assistant"
      >
        <Bot size={24} className="text-white" />
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-4 z-50 w-80 max-h-[500px] bg-surface-800 border border-surface-700 rounded-3xl shadow-xl flex flex-col animate-slide-up overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-brand-600/20 to-cyan-600/20 border-b border-surface-700">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <div className="font-semibold text-sm">ComfoRide AI</div>
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  Online
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 max-h-80">
            {messages.map((msg, i) => (
              <div key={i} className={clsx('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 bg-gradient-to-br from-brand-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={12} className="text-white" />
                  </div>
                )}
                <div className={clsx(
                  'max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line',
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-sm'
                    : 'bg-surface-700 text-slate-200 rounded-bl-sm'
                )}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-6 h-6 bg-surface-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User size={12} className="text-slate-300" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-brand-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot size={12} className="text-white" />
                </div>
                <div className="bg-surface-700 px-3 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-surface-700 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 bg-surface-700 border border-surface-600 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 rounded-xl flex items-center justify-center transition-colors"
            >
              <Send size={15} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
