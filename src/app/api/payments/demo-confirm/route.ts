import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Demo mode: confirm a booking without real Stripe
export async function POST(req: NextRequest) {
  try {
    const { bookingId } = await req.json()

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    if (booking.status !== 'HOLD') return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    if (new Date() > booking.holdExpiresAt) return NextResponse.json({ error: 'Hold expired' }, { status: 400 })

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED', paymentStatus: 'PAID', stripePaymentIntentId: 'demo_' + bookingId },
      }),
      prisma.payment.upsert({
        where: { bookingId },
        update: { status: 'PAID', stripeId: 'demo_' + bookingId },
        create: {
          bookingId,
          amount: booking.seats * 35,
          status: 'PAID',
          stripeId: 'demo_' + bookingId,
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API/payments/demo-confirm] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
