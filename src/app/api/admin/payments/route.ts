import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const payments = await prisma.payment.findMany({
      include: {
        booking: {
          include: {
            user: { select: { name: true, email: true } },
            trip: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('[API/admin/payments] Error:', error)
    return NextResponse.json({ error: 'Failed to load payments' }, { status: 500 })
  }
}
