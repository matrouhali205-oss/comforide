'use client'

import { useEffect, useState } from 'react'
import { DollarSign, Users, Bus, TrendingUp, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

const ROUTE_LABELS: Record<string, string> = {
  OTTAWA_MONTREAL: 'Ottawa → Montréal',
  MONTREAL_OTTAWA: 'Montréal → Ottawa',
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="card h-28 animate-pulse bg-surface-700" />)}
      </div>
    </div>
  )

  const kpis = [
    {
      label: 'Total Revenue',
      value: `$${(data?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/20',
    },
    {
      label: 'Confirmed Bookings',
      value: data?.confirmedBookings || 0,
      icon: Users,
      color: 'text-brand-400',
      bg: 'bg-brand-500/20',
    },
    {
      label: 'Occupancy Rate',
      value: `${data?.occupancyRate || 0}%`,
      icon: TrendingUp,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/20',
    },
    {
      label: 'Cancellations',
      value: data?.cancelledBookings || 0,
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/20',
    },
  ]

  return (
    <div>
      <h1 className="section-title mb-1">Dashboard</h1>
      <p className="text-slate-400 text-sm mb-6">Operations overview</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="card animate-slide-up">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-3', kpi.bg)}>
              <kpi.icon size={20} className={kpi.color} />
            </div>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart (simple bar representation) */}
      {data?.dailyRevenue && (
        <div className="card mb-8">
          <h2 className="font-semibold mb-4">7-Day Revenue</h2>
          <div className="flex items-end gap-2 h-32">
            {data.dailyRevenue.map((d: { date: string; amount: number }) => {
              const max = Math.max(...data.dailyRevenue.map((x: any) => x.amount), 1)
              const pct = (d.amount / max) * 100
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-slate-500">${d.amount}</span>
                  <div
                    className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${Math.max(pct, 4)}%` }}
                  />
                  <span className="text-[10px] text-slate-600">{d.date.slice(5)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Today's Trips */}
      <div className="card">
        <h2 className="font-semibold mb-4">Today&apos;s Trips</h2>
        {data?.todayTrips?.length === 0 ? (
          <p className="text-slate-500 text-sm">No trips today</p>
        ) : (
          <div className="space-y-3">
            {data?.todayTrips?.map((trip: any) => (
              <div key={trip.id} className="flex items-center justify-between bg-surface-700 px-4 py-3 rounded-xl">
                <div>
                  <div className="font-medium text-sm">{ROUTE_LABELS[trip.route] || trip.route}</div>
                  <div className="text-xs text-slate-500">{trip.departureTime}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {trip.seatsConfirmed}/{trip.capacity} seats
                  </div>
                  <div className={clsx(
                    'text-xs',
                    trip.seatsConfirmed === trip.capacity ? 'text-emerald-400' : 'text-slate-500'
                  )}>
                    {trip.seatsConfirmed === trip.capacity ? 'Full' : `${trip.capacity - trip.seatsConfirmed} available`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
