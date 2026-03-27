import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureUpcomingTrips, releaseExpiredHolds } from '@/lib/trips'
import { addDays, format } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    // Generate upcoming trips if needed
    await ensureUpcomingTrips(14)

    // Release expired holds
    await releaseExpiredHolds()

    const { searchParams } = new URL(req.url)
    const dateFrom = searchParams.get('from') || format(new Date(), 'yyyy-MM-dd')
    const dateTo = searchParams.get('to') || format(addDays(new Date(), 6), 'yyyy-MM-dd')

    const trips = await prisma.trip.findMany({
      where: {
        date: { gte: dateFrom, lte: dateTo },
        status: { notIn: ['CANCELLED', 'DISABLED'] },
      },
      include: {
        driver: { include: { user: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: [{ date: 'asc' }, { departureTime: 'asc' }],
    })

    return NextResponse.json({ trips })
  } catch (error) {
    console.error('[API/trips] Error:', error)
    return NextResponse.json({ error: 'Failed to load trips' }, { status: 500 })
  }
}
