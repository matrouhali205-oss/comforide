'use client'

import { useEffect, useState } from 'react'
import clsx from 'clsx'

const ROUTE_LABELS: Record<string, string> = {
  OTTAWA_MONTREAL: 'Ottawa → Montréal',
  MONTREAL_OTTAWA: 'Montréal → Ottawa',
}

const STATUS_BADGE: Record<string, string> = {
  HOLD: 'badge-yellow',
  CONFIRMED: 'badge-green',
  CANCELLED: 'badge-red',
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    setLoading(true)
    const url = filter ? `/api/admin/bookings?status=${filter}` : '/api/admin/bookings'
    fetch(url)
      .then(r => r.json())
      .then(data => setBookings(data.bookings || []))
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <div>
      <h1 className="section-title mb-1">Bookings</h1>
      <p className="text-slate-400 text-sm mb-6">All passenger bookings</p>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['', 'HOLD', 'CONFIRMED', 'CANCELLED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors',
              filter === f ? 'bg-brand-600 text-white' : 'bg-surface-700 text-slate-400 hover:bg-surface-600'
            )}
          >
            {f || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="card h-24 animate-pulse bg-surface-700" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No bookings found</div>
      ) : (
        <div className="space-y-3">
          {bookings.map(booking => (
            <div key={booking.id} className="card animate-slide-up">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-sm">{booking.user?.name || 'Unknown'}</div>
                  <div className="text-xs text-slate-500">{booking.user?.email}</div>
                </div>
                <span className={clsx('badge', STATUS_BADGE[booking.status] || 'badge-gray')}>
                  {booking.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-400 mt-2 pt-2 border-t border-surface-700">
                <div>
                  {ROUTE_LABELS[booking.trip?.route] || booking.trip?.route} · {booking.trip?.date} · {booking.trip?.departureTime}
                </div>
                <div className="font-semibold text-white">{booking.seats} seat{booking.seats > 1 ? 's' : ''} · ${booking.seats * 35}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
