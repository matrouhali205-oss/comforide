'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle, MapPin, Clock, Users, ArrowRight, Navigation } from 'lucide-react'
import Link from 'next/link'

export default function ConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/bookings/me')
      .then(r => r.json())
      .then(data => {
        const found = data.bookings?.find((b: any) => b.id === bookingId)
        setBooking(found)
      })
      .finally(() => setLoading(false))
  }, [bookingId])

  if (loading) return (
    <div className="page-container flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!booking) return (
    <div className="page-container text-center py-16">
      <p className="text-slate-400">Booking not found.</p>
      <Link href="/" className="btn-primary mt-4 inline-block">Go Home</Link>
    </div>
  )

  const trip = booking.trip
  const routeMap: Record<string, { from: string; to: string; pickup: string; color: string }> = {
    OTTAWA_MONTREAL: {
      from: 'Ottawa', to: 'Montréal',
      pickup: '90 Sparks St, Ottawa, ON',
      color: '#6366f1',
    },
    MONTREAL_OTTAWA: {
      from: 'Montréal', to: 'Ottawa',
      pickup: '1000 De La Gauchetière W, Montréal, QC',
      color: '#06b6d4',
    },
  }
  const info = routeMap[trip?.route] ?? { from: '', to: '', pickup: '', color: '#6366f1' }

  const [h, m] = (trip?.departureTime || '00:00').split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
  const timeStr = `${displayHour}:${m.toString().padStart(2, '0')} ${period}`

  return (
    <div className="page-container">
      {/* Big checkmark header */}
      <div className="text-center py-8 animate-slide-up">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
          <CheckCircle size={44} className="text-emerald-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-1">Booking Confirmed!</h1>
        <p className="text-slate-400 text-sm">Your seats are reserved. See you on board!</p>
      </div>

      {/* Map-style visual */}
      <div className="card mb-5 overflow-hidden relative">
        {/* Faux map background */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 30px), repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 30px)`,
          }}
        />

        <div className="relative z-10">
          {/* Route line visual */}
          <div className="flex items-center justify-between mb-5 px-2">
            {/* Origin */}
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-glow">
                <Navigation size={22} className="text-white" />
              </div>
              <div className="font-bold text-sm">{info.from}</div>
              <div className="text-xs text-slate-500">{timeStr}</div>
            </div>

            {/* Connecting line */}
            <div className="flex-1 mx-3 flex items-center gap-1">
              <div className="h-0.5 flex-1 bg-gradient-to-r from-brand-500 to-cyan-500 opacity-60" />
              <div className="w-2 h-2 bg-brand-400 rounded-full" />
              <div className="h-0.5 flex-1 bg-gradient-to-r from-brand-500 to-cyan-500 opacity-60" />
            </div>

            {/* Destination */}
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-600/80 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <MapPin size={22} className="text-white" />
              </div>
              <div className="font-bold text-sm">{info.to}</div>
              <div className="text-xs text-slate-500">~2h 30m</div>
            </div>
          </div>

          <div className="divider" />

          {/* Details */}
          <div className="space-y-2.5 mt-1">
            <div className="flex items-center gap-2.5 text-sm">
              <Clock size={14} className="text-slate-500" />
              <span className="text-slate-400">Date & Time:</span>
              <span className="text-white font-medium ml-auto">{trip?.date} · {timeStr}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <MapPin size={14} className="text-slate-500" />
              <span className="text-slate-400">Pickup:</span>
              <span className="text-white font-medium ml-auto text-right max-w-48">{info.pickup}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Users size={14} className="text-slate-500" />
              <span className="text-slate-400">Seats:</span>
              <span className="text-white font-medium ml-auto">{booking.seats} seat{booking.seats > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking ID */}
      <div className="card mb-5 text-center">
        <div className="text-xs text-slate-500 mb-1">Booking Reference</div>
        <div className="font-mono text-sm text-brand-400 font-semibold tracking-wider">
          {booking.id.toUpperCase().slice(0, 12)}
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <span className="badge badge-green">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            Confirmed
          </span>
          <span className="badge badge-blue">Paid</span>
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        <Link href="/my-bookings" className="btn-secondary w-full text-center block">
          View All Bookings
        </Link>
        <Link href="/" className="btn-primary w-full text-center block">
          Book Another Trip
        </Link>
      </div>
    </div>
  )
}
