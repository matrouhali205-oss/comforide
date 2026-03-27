import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const dateFrom = searchParams.get('from')
    const dateTo = searchParams.get('to')
    const status = searchParams.get('status')

    const trips = await prisma.trip.findMany({
      where: {
        ...(dateFrom && dateTo ? { date: { gte: dateFrom, lte: dateTo } } : {}),
        ...(status ? { status: status as any } : {}),
      },
      include: {
        driver: { include: { user: true } },
        bookings: { where: { status: 'CONFIRMED' }, select: { seats: true } },
      },
      orderBy: [{ date: 'asc' }, { departureTime: 'asc' }],
    })

    return NextResponse.json({ trips })
  } catch (error) {
    console.error('[API/admin/trips] Error:', error)
    return NextResponse.json({ error: 'Failed to load trips' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { tripId, action, newTime, newDate } = await req.json()

    if (action === 'cancel') {
      // Cancel trip and all active bookings
      const trip = await prisma.trip.update({
        where: { id: tripId },
        data: { status: 'CANCELLED' },
        include: { bookings: { where: { status: { in: ['HOLD', 'CONFIRMED'] } } } },
      })
      // Cancel all associated bookings
      await prisma.booking.updateMany({
        where: { tripId, status: { in: ['HOLD', 'CONFIRMED'] } },
        data: { status: 'CANCELLED' },
      })
      return NextResponse.json({ trip })
    }

    if (action === 'disable') {
      const trip = await prisma.trip.update({
        where: { id: tripId },
        data: { status: 'DISABLED' },
      })
      return NextResponse.json({ trip })
    }

    if (action === 'enable') {
      const trip = await prisma.trip.update({
        where: { id: tripId },
        data: { status: 'SCHEDULED' },
      })
      return NextResponse.json({ trip })
    }

    if (action === 'reschedule' && (newTime || newDate)) {
      const trip = await prisma.trip.update({
        where: { id: tripId },
        data: {
          ...(newTime ? { departureTime: newTime } : {}),
          ...(newDate ? { date: newDate } : {}),
        },
      })
      return NextResponse.json({ trip })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('[API/admin/trips] PATCH Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
