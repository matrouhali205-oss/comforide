import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { format } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'DRIVER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const driver = await prisma.driver.findUnique({
      where: { userId: session.user.id },
    })

    if (!driver) {
      return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 })
    }

    const today = format(new Date(), 'yyyy-MM-dd')

    const trips = await prisma.trip.findMany({
      where: {
        driverId: driver.id,
        date: { gte: today },
        status: { notIn: ['CANCELLED'] },
      },
      include: {
        bookings: {
          where: { status: 'CONFIRMED' },
          include: { user: { select: { name: true, phone: true, email: true } } },
        },
      },
      orderBy: [{ date: 'asc' }, { departureTime: 'asc' }],
    })

    return NextResponse.json({ trips })
  } catch (error) {
    console.error('[API/driver/trips] Error:', error)
    return NextResponse.json({ error: 'Failed to load driver trips' }, { status: 500 })
  }
}
