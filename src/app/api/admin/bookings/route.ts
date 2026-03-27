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
    const status = searchParams.get('status')

    const bookings = await prisma.booking.findMany({
      where: status ? { status: status as any } : {},
      include: {
        user: { select: { name: true, email: true, phone: true } },
        trip: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('[API/admin/bookings] Error:', error)
    return NextResponse.json({ error: 'Failed to load bookings' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { bookingId, status } = await req.json()

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    })

    return NextResponse.json({ booking })
  } catch (error: any) {
    console.error('[API/admin/bookings] PATCH Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
