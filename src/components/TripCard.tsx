'use client'

import { MapPin, Clock, ArrowRight, Users } from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'

interface TripCardProps {
  trip: {
    id: string
    route: string
    date: string
    departureTime: string
    capacity: number
    seatsBooked: number
    status: string
  }
  onSelect?: () => void
}

const ROUTE_INFO: Record<string, { from: string; to: string; fromShort: string; toShort: string; pickup: string }> = {
  OTTAWA_MONTREAL: {
    from: 'Ottawa',
    to: 'Montréal',
    fromShort: 'OTT',
    toShort: 'MTL',
    pickup: '90 Sparks St, Ottawa',
  },
  MONTREAL_OTTAWA: {
    from: 'Montréal',
    to: 'Ottawa',
    fromShort: 'MTL',
    toShort: 'OTT',
    pickup: '1000 De La Gauchetière W',
  },
}

export default function TripCard({ trip, onSelect }: TripCardProps) {
  const info = ROUTE_INFO[trip.route] ?? { from: trip.route, to: '', fromShort: '', toShort: '', pickup: '' }
  const available = trip.capacity - trip.seatsBooked
  const isLow = available <= 2
  const isFull = available === 0

  // Format time to 12h
  const [h, m] = trip.departureTime.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
  const timeStr = `${displayHour}:${m.toString().padStart(2, '0')} ${period}`

  return (
    <div
      className={clsx(
        'card group hover:border-brand-500/50 transition-all duration-300 hover:shadow-glow cursor-pointer animate-slide-up',
        isFull && 'opacity-60 cursor-not-allowed'
      )}
    >
      {/* Route header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-lg leading-none">{info.fromShort}</span>
            <span className="text-xs text-slate-500">{info.from}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <div className="w-10 h-px bg-surface-600" />
              <ArrowRight size={14} className="text-brand-400" />
              <div className="w-10 h-px bg-surface-600" />
            </div>
            <span className="text-xs text-slate-500">2h 30m</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-lg leading-none">{info.toShort}</span>
            <span className="text-xs text-slate-500">{info.to}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xl font-bold text-brand-400">$35</div>
          <div className="text-xs text-slate-500">per seat</div>
        </div>
      </div>

      {/* Departure & seats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-slate-300">
            <Clock size={14} className="text-slate-500" />
            <span className="font-semibold">{timeStr}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <MapPin size={12} className="text-slate-500" />
            <span className="text-xs">{info.pickup}</span>
          </div>
        </div>
      </div>

      {/* Seats + CTA */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-700">
        <div className="flex items-center gap-1.5">
          <Users size={14} className={clsx(isLow ? 'text-amber-400' : 'text-slate-500')} />
          {isFull ? (
            <span className="text-sm font-semibold text-red-400">Sold Out</span>
          ) : isLow ? (
            <span className="text-sm font-semibold text-amber-400">Only {available} seat{available > 1 ? 's' : ''} left!</span>
          ) : (
            <span className="text-sm text-slate-400">{available} of {trip.capacity} seats available</span>
          )}
        </div>

        {!isFull && (
          <Link
            href={`/book/${trip.id}`}
            onClick={onSelect}
            className="btn-primary py-2 px-4 text-sm !rounded-xl"
          >
            Book Now
          </Link>
        )}
      </div>
    </div>
  )
}
