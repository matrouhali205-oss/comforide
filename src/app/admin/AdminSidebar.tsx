'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Bus, BookOpen, CreditCard, LogOut, Home } from 'lucide-react'
import clsx from 'clsx'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/trips', label: 'Trips', icon: Bus },
  { href: '/admin/bookings', label: 'Bookings', icon: BookOpen },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-64 bg-surface-800 border-r border-surface-700 flex-col z-40">
        <div className="p-5 border-b border-surface-700">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <div>
              <div className="font-bold text-sm">ComfoRide</div>
              <div className="text-xs text-slate-500">Admin Panel</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                pathname === href
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:bg-surface-700 hover:text-white'
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-surface-700 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-surface-700 hover:text-white transition-colors">
            <Home size={17} />
            Passenger View
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-surface-700 transition-colors"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-surface-800 border-b border-surface-700 px-4 h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">C</span>
          </div>
          <span className="font-bold text-sm">Admin</span>
        </Link>
        <div className="flex gap-1 ml-auto">
          {NAV_ITEMS.map(({ href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
                pathname === href ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-surface-700'
              )}
            >
              <Icon size={16} />
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
