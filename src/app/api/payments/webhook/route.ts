import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  // Demo mode: simulate payment confirmation
  const body = await req.text()

  // Check if demo payment
  if (body.includes('"type":"demo.payment_intent.succeeded"')) {
    try {
      const event = JSON.parse(body)
      const bookingId = event.data?.object?.metadata?.bookingId
      if (bookingId) {
        await confirmBooking(bookingId, 'demo')
      }
      return NextResponse.json({ received: true })
    } catch {
      return NextResponse.json({ received: true })
    }
  }

  // Real Stripe webhook
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_REPLACE_ME') {
    return NextResponse.json({ received: true })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  const sig = req.headers.get('stripe-signature')!
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    const bookingId = pi.metadata?.bookingId
    if (bookingId) {
      await confirmBooking(bookingId, pi.id)
    }
  }

  return NextResponse.json({ received: true })
}

async function confirmBooking(bookingId: string, stripeId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking || booking.status !== 'HOLD') return

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED', paymentStatus: 'PAID' },
    }),
    prisma.payment.upsert({
      where: { bookingId },
      update: { status: 'PAID', stripeId },
      create: {
        bookingId,
        amount: booking.seats * 35,
        status: 'PAID',
        stripeId,
      },
    }),
  ])
}
