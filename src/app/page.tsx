'use client'

import { useEffect, useState } from 'react'
import { format, addDays, isToday, isTomorrow } from 'date-fns'
import TripCard from '@/components/TripCard'
import { MapPin, Zap } from 'lucide-react'
import clsx from 'clsx'

interface Trip {
  id: string
  route: string
  date: string
  departureTime: string
  capacity: number
  seatsBooked: number
  status: string
}

function dayLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  return format(date, 'EEE, MMM d')
}

export default function HomePage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(0) // 0 = today, 1 = tomorrow, etc.

  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => ({
    index: i,
    label: dayLabel(format(addDays(today, i), 'yyyy-MM-dd')),
    dateStr: format(addDays(today, i), 'yyyy-MM-dd'),
  }))

  useEffect(() => {
    setLoading(true)
    fetch('/api/trips')
      .then(r => r.json())
      .then(data => setTrips(data.trips || []))
      .finally(() => setLoading(false))
  }, [])

  const filteredTrips = trips.filter(t => t.date === days[selectedDay].dateStr)

  return (
    <div className="page-container">
      {/* Hero */}
      <div className="mb-8 pt-2">
        <div className="inline-flex items-center gap-1.5 bg-brand-500/20 text-brand-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
          <Zap size={11} />
          Fixed daily routes — no waiting
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
          Ottawa ↔ Montréal
        </h1>
        <p className="text-slate-400 text-base">
          Premium shuttle • $35/seat • 4 trips daily
        </p>
      </div>

      {/* Pickup info */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 bg-surface-800 border border-surface-700 rounded-2xl p-3.5">
          <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
            <MapPin size={10} />
            Ottawa Pickup
          </div>
          <div className="text-sm font-medium text-slate-200">90 Sparks St</div>
        </div>
        <div className="flex-1 bg-surface-800 border border-surface-700 rounded-2xl p-3.5">
          <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
            <MapPin size={10} />
            Montréal Pickup
          </div>
          <div className="text-sm font-medium text-slate-200">1000 De La Gauchetière</div>
        </div>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-1 px-1">
        {days.map(day => (
          <button
            key={day.index}
            onClick={() => setSelectedDay(day.index)}
            className={clsx(
              'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
              selectedDay === day.index
                ? 'bg-brand-600 text-white shadow-lg'
                : 'bg-surface-800 text-slate-400 hover:bg-surface-700 border border-surface-700'
            )}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Trips */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse h-36 bg-surface-700" />
          ))}
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">🚌</div>
          <p className="font-medium">No trips available for this day</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrips.map(trip => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  )
}
