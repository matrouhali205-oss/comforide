import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/auth'
import Navbar from '@/components/Navbar'
import AIChat from '@/components/AIChat'

export const metadata: Metadata = {
  title: 'ComfoRide — Premium Ottawa ↔ Montréal Shuttle',
  description: 'Book premium intercity shuttle seats between Ottawa and Montréal. Fixed daily schedules, $35/seat, instant confirmation.',
  keywords: 'Ottawa Montreal shuttle, intercity bus, ComfoRide, premium shuttle',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-surface-900 text-white min-h-screen">
        <SessionProvider session={session}>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
          <AIChat />
        </SessionProvider>
      </body>
    </html>
  )
}
