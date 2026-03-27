import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId, seats } = await req.json()

    if (!tripId || !seats || seats < 1 || seats > 5) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Use a transaction to atomically check and hold seats
    const result = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id: tripId } })

      if (!trip) throw new Error('Trip not found')
      if (trip.status !== 'SCHEDULED') throw new Error('Trip is not available')

      const availableSeats = trip.capacity - trip.seatsBooked
      if (availableSeats < seats) {
        throw new Error(`Only ${availableSeats} seat${availableSeats === 1 ? '' : 's'} available`)
      }

      const holdMinutes = parseInt(process.env.SEAT_HOLD_MINUTES || '15')
      const holdExpiresAt = new Date(Date.now() + holdMinutes * 60 * 1000)

      const booking = await tx.booking.create({
        data: {
          userId: session.user.id!,
          tripId,
          seats,
          status: 'HOLD',
          paymentStatus: 'PENDING',
          holdExpiresAt,
        },
      })

      await tx.trip.update({
        where: { id: tripId },
        data: { seatsBooked: { increment: seats } },
      })

      return booking
    })

    return NextResponse.json({ booking: result })
  } catch (error: any) {
    console.error('[API/bookings/hold] Error:', error)
    return NextResponse.json({ error: error.message || 'Hold failed' }, { status: 400 })
  }
}
