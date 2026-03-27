import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20',
})

const PRICE_PER_SEAT = parseInt(process.env.PRICE_PER_SEAT || '35')

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingId } = await req.json()

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { trip: true },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (booking.status !== 'HOLD') {
      return NextResponse.json({ error: 'Booking is not in hold state' }, { status: 400 })
    }

    if (new Date() > booking.holdExpiresAt) {
      return NextResponse.json({ error: 'Hold has expired' }, { status: 400 })
    }

    const amount = booking.seats * PRICE_PER_SEAT * 100 // in cents

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_REPLACE_ME') {
      // Demo mode: simulate payment intent
      const demoClientSecret = `demo_pi_${bookingId}_secret_demo`
      return NextResponse.json({
        clientSecret: demoClientSecret,
        amount,
        demo: true,
      })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'cad',
      metadata: { bookingId, userId: session.user.id },
      automatic_payment_methods: { enabled: true },
    })

    await prisma.booking.update({
      where: { id: bookingId },
      data: { stripePaymentIntentId: paymentIntent.id },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, amount })
  } catch (error: any) {
    console.error('[API/payments/create-intent] Error:', error)
    return NextResponse.json({ error: error.message || 'Payment failed' }, { status: 500 })
  }
}
