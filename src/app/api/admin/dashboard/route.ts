import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { startOfDay, endOfDay, format, subDays } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const today = new Date()
    const todayStr = format(today, 'yyyy-MM-dd')
    const sevenDaysAgo = format(subDays(today, 7), 'yyyy-MM-dd')

    const [
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue,
      todayTrips,
      allPayments,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      prisma.trip.findMany({
        where: { date: todayStr, status: { notIn: ['CANCELLED', 'DISABLED'] } },
        include: { bookings: { where: { status: 'CONFIRMED' } } },
      }),
      prisma.payment.findMany({
        where: {
          status: 'PAID',
          createdAt: { gte: new Date(sevenDaysAgo) },
        },
        orderBy: { createdAt: 'asc' },
      }),
    ])

    const totalSeats = todayTrips.reduce((sum, t) => sum + t.capacity, 0)
    const filledSeats = todayTrips.reduce((sum, t) => sum + t.bookings.length * (t.bookings[0]?.seats || 0), 0)

    // Daily revenue for chart
    const dailyRevenue: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const dateStr = format(subDays(today, i), 'yyyy-MM-dd')
      dailyRevenue[dateStr] = 0
    }
    allPayments.forEach((p) => {
      const dateStr = format(p.createdAt, 'yyyy-MM-dd')
      if (dailyRevenue[dateStr] !== undefined) {
        dailyRevenue[dateStr] += p.amount
      }
    })

    return NextResponse.json({
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue: totalRevenue._sum.amount || 0,
      occupancyRate: totalSeats > 0 ? Math.round((filledSeats / totalSeats) * 100) : 0,
      todayTrips: todayTrips.map((t) => ({
        ...t,
        seatsConfirmed: t.bookings.reduce((sum, b) => sum + b.seats, 0),
      })),
      dailyRevenue: Object.entries(dailyRevenue).map(([date, amount]) => ({ date, amount })),
    })
  } catch (error) {
    console.error('[API/admin/dashboard] Error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}
