'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import CountdownTimer from '@/components/CountdownTimer'
import { ArrowRight, CreditCard, Shield, AlertCircle, CheckCircle } from 'lucide-react'

export default function CheckoutPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const router = useRouter()

  const [booking, setBooking] = useState<any>(null)
  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/bookings/me')
      .then(r => r.json())
      .then(data => {
        const found = data.bookings?.find((b: any) => b.id === bookingId)
        setBooking(found)
        setTrip(found?.trip)
      })
      .finally(() => setLoading(false))
  }, [bookingId])

  if (loading) return (
    <div className="page-container flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!booking || booking.status === 'CANCELLED') return (
    <div className="page-container text-center py-16">
      <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
      <h2 className="text-xl font-bold mb-2">Hold Expired</h2>
      <p className="text-slate-400 mb-6">Your seat hold has expired. Please try booking again.</p>
      <Link href="/" className="btn-primary inline-block">Find Another Trip</Link>
    </div>
  )

  if (booking.status === 'CONFIRMED') {
    router.replace(`/confirmation/${bookingId}`)
    return null
  }

  const routeMap: Record<string, { from: string; to: string }> = {
    OTTAWA_MONTREAL: { from: 'Ottawa', to: 'Montréal' },
    MONTREAL_OTTAWA: { from: 'Montréal', to: 'Ottawa' },
  }
  const routeInfo = routeMap[trip?.route] ?? { from: '', to: '' }

  const [h, m] = (trip?.departureTime || '00:00').split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
  const timeStr = `${displayHour}:${m.toString().padStart(2, '0')} ${period}`

  const total = booking.seats * 35

  const handlePay = async () => {
    setPaying(true)
    setError('')
    try {
      // Demo payment flow
      const res = await fetch('/api/payments/demo-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Payment failed')
      router.push(`/confirmation/${bookingId}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPaying(false)
    }
  }

  const handleExpired = () => {
    setError('Your hold has expired. Please book again.')
  }

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold mb-1">Complete Payment</h1>
        <CountdownTimer expiresAt={booking.holdExpiresAt} onExpired={handleExpired} />
      </div>

      {/* Booking summary */}
      <div className="card mb-5">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Booking Summary</h2>
        <div className="flex items-center gap-2 font-bold text-lg mb-4">
          <span>{routeInfo.from}</span>
          <ArrowRight size={16} className="text-brand-400" />
          <span>{routeInfo.to}</span>
        </div>
        <div className="space-y-2 text-sm text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-500">Date</span>
            <span>{trip?.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Departure</span>
            <span>{timeStr}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Seats</span>
            <span>{booking.seats}</span>
          </div>
          <div className="divider" />
          <div className="flex justify-between font-bold text-base text-white">
            <span>Total</span>
            <span className="text-brand-400">${total} CAD</span>
          </div>
        </div>
      </div>

      {/* Demo payment form */}
      <div className="card mb-5">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={18} className="text-brand-400" />
          <h2 className="font-semibold">Payment Details</h2>
          <span className="ml-auto badge badge-yellow">Demo Mode</span>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            className="input"
            placeholder="4242 4242 4242 4242"
            defaultValue="4242 4242 4242 4242"
            readOnly
          />
          <div className="grid grid-cols-2 gap-3">
            <input type="text" className="input" placeholder="MM / YY" defaultValue="12 / 28" readOnly />
            <input type="text" className="input" placeholder="CVV" defaultValue="123" readOnly />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3">
          <Shield size={11} />
          Demo mode — no real charges. Connect Stripe API key for live payments.
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={paying}
        className="btn-primary w-full text-base flex items-center justify-center gap-2"
      >
        {paying ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CheckCircle size={18} />
            Confirm & Pay ${total} CAD
          </>
        )}
      </button>
    </div>
  )
}
