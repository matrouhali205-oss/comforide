import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/login?redirect=/admin')

  return (
    <div className="flex min-h-screen bg-surface-900">
      <AdminSidebar />
      <main className="flex-1 ml-0 lg:ml-64">
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
