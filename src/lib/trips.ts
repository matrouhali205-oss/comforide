import { prisma } from './prisma'
import { addDays, format } from 'date-fns'

const FIXED_ROUTES = [
  { route: 'OTTAWA_MONTREAL', times: ['08:00', '15:30'] },
  { route: 'MONTREAL_OTTAWA', times: ['11:30', '19:30'] },
]

/**
 * Generate trips for a given date if they don't already exist.
 */
export async function ensureTripsForDate(date: Date) {
  const dateStr = format(date, 'yyyy-MM-dd')

  for (const { route, times } of FIXED_ROUTES) {
    for (const departureTime of times) {
      await prisma.trip.upsert({
        where: {
          route_date_departureTime: { route, date: dateStr, departureTime },
        },
        update: {},
        create: {
          route,
          date: dateStr,
          departureTime,
          capacity: 5,
          seatsBooked: 0,
          status: 'SCHEDULED',
        },
      })
    }
  }
}

/**
 * Ensure trips exist for today + the next N days.
 */
export async function ensureUpcomingTrips(days = 14) {
  const today = new Date()
  for (let i = 0; i < days; i++) {
    await ensureTripsForDate(addDays(today, i))
  }
}

/**
 * Cancel expired holds and free up seats.
 */
export async function releaseExpiredHolds() {
  const now = new Date()

  // Find expired holds
  const expiredBookings = await prisma.booking.findMany({
    where: {
      status: 'HOLD',
      holdExpiresAt: { lt: now },
    },
  })

  for (const booking of expiredBookings) {
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED' },
      }),
      prisma.trip.update({
        where: { id: booking.tripId },
        data: { seatsBooked: { decrement: booking.seats } },
      }),
    ])
  }

  return expiredBookings.length
}

export function routeLabel(route: string): { from: string; to: string } {
  if (route === 'OTTAWA_MONTREAL') return { from: 'Ottawa', to: 'Montréal' }
  if (route === 'MONTREAL_OTTAWA') return { from: 'Montréal', to: 'Ottawa' }
  return { from: route, to: '' }
}

export function pickupAddress(route: string): string {
  if (route === 'OTTAWA_MONTREAL') return '90 Sparks St, Ottawa, ON'
  if (route === 'MONTREAL_OTTAWA') return '1000 De La Gauchetière W, Montréal, QC'
  return 'Pickup location TBD'
}
