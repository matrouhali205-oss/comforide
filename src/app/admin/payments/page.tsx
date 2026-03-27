'use client'

import { useEffect, useState } from 'react'
import { DollarSign, CheckCircle, XCircle } from 'lucide-react'
import clsx from 'clsx'

const STATUS_BADGE: Record<string, string> = {
  PAID: 'badge-green',
  PENDING: 'badge-yellow',
  FAILED: 'badge-red',
  REFUNDED: 'badge-gray',
}

const ROUTE_LABELS: Record<string, string> = {
  OTTAWA_MONTREAL: 'OTT → MTL',
  MONTREAL_OTTAWA: 'MTL → OTT',
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/payments')
      .then(r => r.json())
      .then(data => setPayments(data.payments || []))
      .finally(() => setLoading(false))
  }, [])

  const totalPaid = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0)

  return (
    <div>
      <h1 className="section-title mb-1">Payments</h1>
      <p className="text-slate-400 text-sm mb-6">All payment records</p>

      {/* Summary */}
      <div className="card mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <DollarSign size={20} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold">${totalPaid.toLocaleString()} CAD</div>
            <div className="text-xs text-slate-500">Total collected from {payments.filter(p => p.status === 'PAID').length} payments</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="card h-20 animate-pulse bg-surface-700" />)}
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No payments yet</div>
      ) : (
        <div className="space-y-3">
          {payments.map(payment => (
            <div key={payment.id} className="card animate-slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{payment.booking?.user?.name || 'Unknown'}</div>
                  <div className="text-xs text-slate-500">
                    {ROUTE_LABELS[payment.booking?.trip?.route] || ''} · {payment.booking?.trip?.date}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-base">${payment.amount}</div>
                  <span className={clsx('badge', STATUS_BADGE[payment.status] || 'badge-gray')}>
                    {payment.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
