import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

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

    if (booking.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Already cancelled' }, { status: 400 })
    }

    // Check cancellation policy: must be 2h before departure
    const [hours, mins] = booking.trip.departureTime.split(':').map(Number)
    const departureDate = new Date(`${booking.trip.date}T${booking.trip.departureTime}:00`)
    const twoHoursBefore = new Date(departureDate.getTime() - 2 * 60 * 60 * 1000)

    if (booking.status === 'CONFIRMED' && new Date() > twoHoursBefore) {
      return NextResponse.json(
        { error: 'Cannot cancel within 2 hours of departure' },
        { status: 400 }
      )
    }

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      }),
      prisma.trip.update({
        where: { id: booking.tripId },
        data: { seatsBooked: { decrement: booking.seats } },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API/bookings/cancel] Error:', error)
    return NextResponse.json({ error: error.message || 'Cancel failed' }, { status: 500 })
  }
}
