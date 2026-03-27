'use client'

import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import { Bus, Users, MapPin, Clock, ChevronDown, ChevronUp, Phone, Mail, LogOut, Home } from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'

const ROUTE_LABELS: Record<string, { from: string; to: string; pickup: string }> = {
  OTTAWA_MONTREAL: { from: 'Ottawa', to: 'Montréal', pickup: '90 Sparks St, Ottawa' },
  MONTREAL_OTTAWA: { from: 'Montréal', to: 'Ottawa', pickup: '1000 De La Gauchetière W, Montréal' },
}

export default function DriverPage() {
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/driver/trips')
      .then(r => r.json())
      .then(data => setTrips(data.trips || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-surface-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface-800 border-b border-surface-700 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Bus size={16} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-sm">ComfoRide</div>
            <div className="text-xs text-slate-500">Driver Panel</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="text-slate-400 hover:text-white p-2"><Home size={16} /></Link>
          <button onClick={() => signOut()} className="text-red-400 hover:text-red-300 p-2"><LogOut size={16} /></button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="section-title mb-1">Your Trips</h1>
        <p className="text-slate-400 text-sm mb-6">Upcoming assigned departures</p>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="card h-28 animate-pulse bg-surface-700" />)}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-16">
            <Bus size={48} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No assigned trips</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map(trip => {
              const info = ROUTE_LABELS[trip.route] ?? { from: trip.route, to: '', pickup: '' }
              const isExpanded = expanded === trip.id
              const passengerCount = trip.bookings?.reduce((s: number, b: any) => s + b.seats, 0) || 0

              const [h, m] = trip.departureTime.split(':').map(Number)
              const period = h >= 12 ? 'PM' : 'AM'
              const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
              const timeStr = `${displayHour}:${m.toString().padStart(2, '0')} ${period}`

              return (
                <div key={trip.id} className="card animate-slide-up overflow-hidden">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : trip.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 font-semibold">
                        {info.from} → {info.to}
                      </div>
                      {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1"><Clock size={12} />{trip.date} · {timeStr}</span>
                      <span className="flex items-center gap-1"><Users size={12} />{passengerCount} passenger{passengerCount !== 1 ? 's' : ''}</span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                      <MapPin size={11} />
                      {info.pickup}
                    </div>
                  </button>

                  {/* Expanded: passenger manifest */}
                  {isExpanded && trip.bookings?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-surface-700 space-y-3 animate-fade-in">
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Passenger Manifest</h3>
                      {trip.bookings.map((booking: any, idx: number) => (
                        <div key={booking.id || idx} className="flex items-center justify-between bg-surface-700 px-3 py-2.5 rounded-xl">
                          <div>
                            <div className="font-medium text-sm">{booking.user?.name || 'Unknown'}</div>
                            <div className="flex items-center gap-3 mt-1">
                              {booking.user?.phone && (
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <Phone size={10} />{booking.user.phone}
                                </span>
                              )}
                              {booking.user?.email && (
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <Mail size={10} />{booking.user.email}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="badge badge-green">{booking.seats} seat{booking.seats > 1 ? 's' : ''}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {isExpanded && (!trip.bookings || trip.bookings.length === 0) && (
                    <div className="mt-4 pt-4 border-t border-surface-700 text-center text-sm text-slate-500 animate-fade-in">
                      No passengers booked yet
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
