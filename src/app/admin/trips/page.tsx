'use client'

import { useEffect, useState } from 'react'
import { Bus, XCircle, Pause, Play, Clock, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

const ROUTE_LABELS: Record<string, string> = {
  OTTAWA_MONTREAL: 'Ottawa → Montréal',
  MONTREAL_OTTAWA: 'Montréal → Ottawa',
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'badge-green',
  CANCELLED: 'badge-red',
  DISABLED: 'badge-yellow',
  COMPLETED: 'badge-gray',
}

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/admin/trips')
      .then(r => r.json())
      .then(data => setTrips(data.trips || []))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleAction = async (tripId: string, action: string) => {
    setActing(tripId)
    setError('')
    try {
      const res = await fetch('/api/admin/trips', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, action }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActing(null)
    }
  }

  return (
    <div>
      <h1 className="section-title mb-1">Trip Control</h1>
      <p className="text-slate-400 text-sm mb-6">Manage auto-generated daily trips</p>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="card h-20 animate-pulse bg-surface-700" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map(trip => {
            const confirmedSeats = trip.bookings?.reduce((sum: number, b: any) => sum + b.seats, 0) || 0
            return (
              <div key={trip.id} className="card animate-slide-up">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold">{ROUTE_LABELS[trip.route] || trip.route}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {trip.date} · {trip.departureTime}
                    </div>
                  </div>
                  <span className={clsx('badge', STATUS_COLORS[trip.status] || 'badge-gray')}>
                    {trip.status}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-700">
                  <div className="text-sm text-slate-400">
                    <span className="font-semibold text-white">{confirmedSeats}</span>/{trip.capacity} confirmed seats
                  </div>
                  <div className="flex gap-2">
                    {trip.status === 'SCHEDULED' && (
                      <>
                        <button
                          onClick={() => handleAction(trip.id, 'disable')}
                          disabled={acting === trip.id}
                          className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
                        >
                          <Pause size={12} />
                          Disable
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Cancel this trip and all bookings?'))
                              handleAction(trip.id, 'cancel')
                          }}
                          disabled={acting === trip.id}
                          className="btn-danger py-1.5 px-3 text-xs flex items-center gap-1"
                        >
                          <XCircle size={12} />
                          Cancel
                        </button>
                      </>
                    )}
                    {trip.status === 'DISABLED' && (
                      <button
                        onClick={() => handleAction(trip.id, 'enable')}
                        disabled={acting === trip.id}
                        className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1 !rounded-xl"
                      >
                        <Play size={12} />
                        Enable
                      </button>
                    )}
                    {trip.status === 'CANCELLED' && (
                      <span className="text-xs text-slate-600">Trip cancelled</span>
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
