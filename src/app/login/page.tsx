'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      router.push(redirect)
    }
  }

  return (
    <div className="page-container flex flex-col justify-center min-h-[calc(100vh-80px)]">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-xl">C</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-slate-400 text-sm">Sign in to manage your bookings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="text-center text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-brand-400 hover:text-brand-300 font-semibold">
            Register
          </Link>
        </div>
      </form>

      {/* Demo credentials hint */}
      <div className="mt-8 p-4 bg-surface-800 border border-surface-700 rounded-2xl">
        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Demo Accounts</div>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Passenger:</span>
            <span className="font-mono text-xs text-slate-300">passenger@example.com / passenger123</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Admin:</span>
            <span className="font-mono text-xs text-slate-300">admin@comforide.com / admin123</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Driver:</span>
            <span className="font-mono text-xs text-slate-300">driver@comforide.com / driver123</span>
          </div>
        </div>
      </div>
    </div>
  )
}
