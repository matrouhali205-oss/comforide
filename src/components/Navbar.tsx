'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { LogOut, User, Shield, Truck } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  // Hide navbar on admin/driver pages (they have their own sidebar)
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/driver')) return null

  return (
    <header className="sticky top-0 z-50 bg-surface-900/95 backdrop-blur-md border-b border-surface-700">
      <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-bold text-lg tracking-tight">ComfoRide</span>
        </Link>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {session?.user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 bg-surface-700 hover:bg-surface-600 px-3 py-2 rounded-xl transition-colors text-sm font-medium"
              >
                <div className="w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">{session.user.name?.[0]?.toUpperCase()}</span>
                </div>
                <span className="hidden sm:block max-w-24 truncate">{session.user.name}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-12 bg-surface-800 border border-surface-700 rounded-2xl p-2 min-w-44 shadow-xl animate-fade-in z-50">
                  <Link
                    href="/my-bookings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-surface-700 text-sm transition-colors"
                  >
                    <User size={15} className="text-slate-400" />
                    My Bookings
                  </Link>
                  {session.user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-surface-700 text-sm transition-colors"
                    >
                      <Shield size={15} className="text-brand-400" />
                      Admin Panel
                    </Link>
                  )}
                  {session.user.role === 'DRIVER' && (
                    <Link
                      href="/driver"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-surface-700 text-sm transition-colors"
                    >
                      <Truck size={15} className="text-emerald-400" />
                      Driver Panel
                    </Link>
                  )}
                  <hr className="border-surface-700 my-1.5" />
                  <button
                    onClick={() => { signOut(); setMenuOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-surface-700 text-sm text-red-400 transition-colors"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-brand-600 hover:bg-brand-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
