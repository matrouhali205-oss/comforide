'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowRight, MapPin, Clock, Users, Minus, Plus, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'

const ROUTE_INFO: Record<string, { from: string; to: string; pickup: string; dropoff: string }> = {
  OTTAWA_MONTREAL: {
    from: 'Ottawa', to: 'Montréal',
    pickup: '90 Sparks St, Ottawa ON',
    dropoff: '1000 De La Gauchetière W, Montréal QC',
  },
  MONTREAL_OTTAWA: {
    from: 'Montréal', to: 'Ottawa',
    pickup: '1000 De La Gauchetière W, Montréal QC',
    dropoff: '90 Sparks St, Ottawa ON',
  },
}

export default function BookPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const router = useRouter()
  const { data: session } = useSession()

  const [trip, setTrip] = useState<any>(null)
  const [seats, setSeats] = useState(1)
  const [loading, setLoading] = useState(true)
  const [holding, setHolding] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/trips')
      .then(r => r.json())
      .then(data => {
        const found = data.trips?.find((t: any) => t.id === tripId)
        setTrip(found || null)
      })
      .finally(() => setLoading(false))
  }, [tripId])

  if (loading) return (
    <div className="page-container flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!trip) return (
    <div className="page-container text-center py-16">
      <p className="text-slate-400">Trip not found.</p>
      <Link href="/" className="btn-primary mt-4 inline-block">Back to trips</Link>
    </div>
  )

  const info = ROUTE_INFO[trip.route] ?? { from: trip.route, to: '', pickup: '', dropoff: '' }
  const available = trip.capacity - trip.seatsBooked
  const total = seats * 35

  const [h, m] = trip.departureTime.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
  const timeStr = `${displayHour}:${m.toString().padStart(2, '0')} ${period}`

  const handleHold = async () => {
    if (!session?.user) {
      router.push(`/login?redirect=/book/${tripId}`)
      return
    }

    setHolding(true)
    setError('')

    try {
      const res = await fetch('/api/bookings/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId: trip.id, seats }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Hold failed')
      router.push(`/checkout/${data.booking.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setHolding(false)
    }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="text-brand-400 text-sm font-medium hover:text-brand-300 transition-colors">
          ← Back to trips
        </Link>
        <h1 className="text-2xl font-bold mt-3 mb-1">Book Your Seat</h1>
        <p className="text-slate-400 text-sm">Seats are held for 15 minutes after selection</p>
      </div>

      {/* Trip summary card */}
      <div className="card mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-lg font-bold">{info.from}</div>
          <ArrowRight size={16} className="text-brand-400" />
          <div className="text-lg font-bold">{info.to}</div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm text-slate-300">
            <Clock size={14} className="text-slate-500" />
            <span>{trip.date} at <strong>{timeStr}</strong></span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-slate-300">
            <MapPin size={14} className="text-slate-500 mt-0.5" />
            <div>
              <div>Pickup: <span className="text-white">{info.pickup}</span></div>
              <div className="text-slate-500 text-xs mt-0.5">Drop-off: {info.dropoff}</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-300">
            <Users size={14} className="text-slate-500" />
            <span><strong>{available}</strong> of {trip.capacity} seats available</span>
          </div>
        </div>
      </div>

      {/* Seat selector */}
      <div className="card mb-5">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold">Number of Seats</span>
          <span className="text-slate-400 text-sm">$35 each</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">Maximum {Math.min(5, available)} for this trip</p>

        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => setSeats(s => Math.max(1, s - 1))}
            className="w-11 h-11 bg-surface-700 hover:bg-surface-600 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40"
            disabled={seats <= 1}
          >
            <Minus size={18} />
          </button>

          <div className="text-center">
            <div className="text-4xl font-bold text-white w-16 text-center">{seats}</div>
            <div className="text-xs text-slate-500 mt-1">{seats === 1 ? 'seat' : 'seats'}</div>
          </div>

          <button
            onClick={() => setSeats(s => Math.min(Math.min(5, available), s + 1))}
            className="w-11 h-11 bg-surface-700 hover:bg-surface-600 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40"
            disabled={seats >= Math.min(5, available)}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Price summary */}
      <div className="card mb-5">
        <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
          <span>${35} × {seats} seat{seats > 1 ? 's' : ''}</span>
          <span>${total}</span>
        </div>
        <div className="divider" />
        <div className="flex items-center justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-brand-400">${total} CAD</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <button
        onClick={handleHold}
        disabled={holding}
        className="btn-primary w-full text-base flex items-center justify-center gap-2"
      >
        {holding ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Reserving seats...
          </>
        ) : (
          <>Hold {seats} Seat{seats > 1 ? 's' : ''} — ${total}</>
        )}
      </button>

      <p className="text-center text-xs text-slate-500 mt-3">
        Your seats will be held for 15 minutes. No charge until payment.
      </p>
    </div>
  )
}
