import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt-ts'
import { addDays, format } from 'date-fns'

const prisma = new PrismaClient()

const FIXED_ROUTES = [
  { route: 'OTTAWA_MONTREAL', times: ['08:00', '15:30'] },
  { route: 'MONTREAL_OTTAWA', times: ['11:30', '19:30'] },
]

async function generateTripsForDate(dateStr: string, driverId?: string) {
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
          driverId: driverId ?? null,
        },
      })
    }
  }
}

async function main() {
  console.log('🌱 Seeding ComfoRide database...')

  const adminPassword = await hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@comforide.com' },
    update: {},
    create: {
      name: 'ComfoRide Admin',
      email: 'admin@comforide.com',
      phone: '+1-613-000-0001',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin created:', admin.email)

  const driverPassword = await hash('driver123', 10)
  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@comforide.com' },
    update: {},
    create: {
      name: 'Alex Dumont',
      email: 'driver@comforide.com',
      phone: '+1-613-000-0002',
      passwordHash: driverPassword,
      role: 'DRIVER',
    },
  })

  const driver = await prisma.driver.upsert({
    where: { userId: driverUser.id },
    update: {},
    create: { userId: driverUser.id },
  })
  console.log('✅ Driver created:', driverUser.email)

  const passengerPassword = await hash('passenger123', 10)
  await prisma.user.upsert({
    where: { email: 'passenger@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'passenger@example.com',
      phone: '+1-613-555-0100',
      passwordHash: passengerPassword,
      role: 'PASSENGER',
    },
  })
  console.log('✅ Passenger created: passenger@example.com')

  const today = new Date()
  for (let i = 0; i < 14; i++) {
    const date = addDays(today, i)
    const dateStr = format(date, 'yyyy-MM-dd')
    await generateTripsForDate(dateStr, driver.id)
  }
  console.log('✅ Generated trips for next 14 days')

  console.log('\n🚌 ComfoRide is ready!')
  console.log('─────────────────────────────')
  console.log('Admin:     admin@comforide.com / admin123')
  console.log('Driver:    driver@comforide.com / driver123')
  console.log('Passenger: passenger@example.com / passenger123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
