'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import config from '@/lib/config'

export default function SubAdminPanel() {
  const [admin, setAdmin] = useState(null)
  const [permissions, setPermissions] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('sub_admin_token')
    if (!token) { window.location.href = '/admin/sub-login'; return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setAdmin(payload)
      setPermissions(Array.isArray(payload.permissions) ? payload.permissions : [])
    } catch { window.location.href = '/admin/sub-login' }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('sub_admin_token')
    window.location.href = '/admin/sub-login'
  }

  const hasPermission = (perm) => permissions.includes(perm)

  if (!admin) return (
    <main className="min-h-screen bg-[#f6f1ea] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#171313] border-t-transparent animate-spin"/>
    </main>
  )

  const menuItems = [
    { permission: 'view_orders', href: '/admin/sub-panel/orders', icon: '📦', title: 'Orders', desc: 'View and manage orders' },
    { permission: 'view_products', href: '/admin/sub-panel/products', icon: '🛍️', title: 'Products', desc: 'View and manage products' },
    { permission: 'view_tickets', href: '/admin/sub-panel/tickets', icon: '🎧', title: 'Support Tickets', desc: 'View and reply to tickets' },
    { permission: 'view_stats', href: '/admin/sub-panel/stats', icon: '📊', title: 'Statistics', desc: 'View dashboard stats' },
    { permission: 'manage_coupons', href: '/admin/sub-panel/coupons', icon: '🎟️', title: 'Coupons', desc: 'Manage coupon codes' },
  ].filter(item => hasPermission(item.permission))

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171313]">
      <header className="sticky top-0 z-50 border-b border-[#241a14]/10 bg-[#f6f1ea]/95 backdrop-blur-xl px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            {config.logo ? (
              <img src={config.logo} alt={config.brandName} className="h-9 w-9 rounded-full object-cover"/>
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#171313] text-xs font-semibold text-white">{config.shortCode}</div>
            )}
            <span className="text-lg font-semibold">{config.brandName}</span>
          </a>
          <span className="text-sm text-[#7b6f66]">Staff Panel</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#7b6f66]">Hi, {admin.name}!</span>
            <button onClick={handleLogout} className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-10 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c6048]">Staff Panel</p>
          <h1 className="mt-2 text-3xl font-semibold">Welcome, {admin.name}! 👋</h1>
          <p className="mt-1 text-sm text-[#7b6f66]">You have {permissions.length} permission{permissions.length !== 1 ? 's' : ''}</p>
        </motion.div>

        {menuItems.length === 0 ? (
          <div className="text-center py-20 rounded-[2rem] border border-[#241a14]/10 bg-white/55">
            <p className="text-4xl mb-4">🔒</p>
            <p className="text-lg font-semibold mb-2">No permissions assigned</p>
            <p className="text-sm text-[#7b6f66]">Contact your master admin to get permissions</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map((item, i) => (
              <motion.a
                key={item.permission}
                href={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6 hover:shadow-xl transition group"
              >
                <p className="text-3xl mb-3">{item.icon}</p>
                <h3 className="font-semibold text-lg mb-1 group-hover:text-[#3a2a21] transition">{item.title}</h3>
                <p className="text-sm text-[#7b6f66]">{item.desc}</p>
              </motion.a>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-[#241a14]/10 px-5 py-10">
        <p className="text-center text-sm text-[#9b8f86]">{config.copyright}</p>
      </footer>
    </main>
  )
}