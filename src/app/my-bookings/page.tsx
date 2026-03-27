'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Clock, Users, XCircle, CheckCircle, RotateCcw, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'

const STATUS_BADGE: Record<string, string> = {
  HOLD: 'badge-yellow',
  CONFIRMED: 'badge-green',
  CANCELLED: 'badge-red',
}

const STATUS_LABEL: Record<string, string> = {
  HOLD: 'Hold',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
}

const ROUTE_LABELS: Record<string, string> = {
  OTTAWA_MONTREAL: 'Ottawa → Montréal',
  MONTREAL_OTTAWA: 'Montréal → Ottawa',
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/bookings/me')
      .then(r => r.json())
      .then(data => setBookings(data.bookings || []))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Cancel this booking?')) return
    setCancelling(bookingId)
    setError('')
    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCancelling(null)
    }
  }

  return (
    <div className="page-container">
      <h1 className="section-title mb-1">My Bookings</h1>
      <p className="text-slate-400 text-sm mb-6">Your trip history</p>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="card h-28 animate-pulse bg-surface-700" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🎫</div>
          <p className="text-slate-400 font-medium mb-4">No bookings yet</p>
          <Link href="/" className="btn-primary inline-block">Browse Trips</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(booking => {
            const trip = booking.trip
            const [h, m] = (trip?.departureTime || '00:00').split(':').map(Number)
            const period = h >= 12 ? 'PM' : 'AM'
            const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
            const timeStr = `${displayHour}:${m.toString().padStart(2, '0')} ${period}`

            return (
              <div key={booking.id} className="card animate-slide-up">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-base">
                      {ROUTE_LABELS[trip?.route] || trip?.route}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 font-mono">
                      #{booking.id.slice(0, 10).toUpperCase()}
                    </div>
                  </div>
                  <span className={clsx('badge', STATUS_BADGE[booking.status] || 'badge-gray')}>
                    {STATUS_LABEL[booking.status] || booking.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} />
                    {trip?.date} · {timeStr}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={12} />
                    {booking.seats} seat{booking.seats > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-surface-700">
                  <span className="text-brand-400 font-bold">${booking.seats * 35} CAD</span>
                  <div className="flex gap-2">
                    {booking.status === 'HOLD' && (
                      <Link href={`/checkout/${booking.id}`} className="btn-primary py-1.5 px-3 text-xs !rounded-lg">
                        Complete Payment
                      </Link>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <Link href={`/book/${trip?.id}`} className="btn-secondary py-1.5 px-3 text-xs">
                        <RotateCcw size={12} className="inline mr-1" />
                        Rebook
                      </Link>
                    )}
                    {(booking.status === 'HOLD' || booking.status === 'CONFIRMED') && (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        disabled={cancelling === booking.id}
                        className="btn-danger py-1.5 px-3 text-xs"
                      >
                        {cancelling === booking.id ? '...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
