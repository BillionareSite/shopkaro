'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import config from '@/lib/config'

export default function StaffPanel() {
  const [admin, setAdmin] = useState(null)
  const [permissions, setPermissions] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('sub_admin_token')
    if (!token) { window.location.href = '/staff-login'; return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      // Check token expiry
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        localStorage.removeItem('sub_admin_token')
        window.location.href = '/staff-login'
        return
      }
      setAdmin(payload)
      setPermissions(Array.isArray(payload.permissions) ? payload.permissions : [])
    } catch {
      localStorage.removeItem('sub_admin_token')
      window.location.href = '/staff-login'
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('sub_admin_token')
    window.location.href = '/staff-login'
  }

  const hasPermission = (perm) => permissions.includes(perm)

  if (!admin) return (
    <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#171313] border-t-transparent animate-spin"/>
    </main>
  )

  const menuItems = [
    {
      permissions: ['view_orders', 'update_order_status'],
      href: '/staff-panel/orders',
      icon: '📦',
      title: 'Orders',
      desc: 'View and manage customer orders',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      permissions: ['view_products', 'add_product', 'edit_product', 'delete_product'],
      href: '/staff-panel/products',
      icon: '🛍️',
      title: 'Products',
      desc: 'View and manage products',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      permissions: ['view_tickets', 'reply_tickets'],
      href: '/staff-panel/tickets',
      icon: '🎧',
      title: 'Support Tickets',
      desc: 'View and reply to customer tickets',
      color: 'bg-amber-50 border-amber-200'
    },
    {
      permissions: ['view_stats'],
      href: '/staff-panel/stats',
      icon: '📊',
      title: 'Statistics',
      desc: 'View store statistics and reports',
      color: 'bg-green-50 border-green-200'
    },
    {
      permissions: ['manage_coupons'],
      href: '/staff-panel/coupons',
      icon: '🎟️',
      title: 'Coupons',
      desc: 'Manage discount coupon codes',
      color: 'bg-pink-50 border-pink-200'
    },
  ].filter(item => item.permissions.some(p => hasPermission(p)))

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border)]/10 bg-[var(--bg)]/95 backdrop-blur-xl px-5 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            {config.logo ? (
              <img src={config.logo} alt={config.brandName} className="h-9 w-9 rounded-full object-cover"/>
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--btn-dark)] text-xs font-semibold text-white">{config.shortCode}</div>
            )}
            <span className="text-lg font-semibold">{config.brandName}</span>
          </a>
          <span className="text-sm text-[var(--text-muted)] hidden sm:block">Staff Panel</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--text-muted)]">Hi, {admin.name}!</span>
            <button
              onClick={handleLogout}
              className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Staff Panel</p>
          <h1 className="mt-2 text-3xl font-semibold">Welcome, {admin.name}! 👋</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            You have access to {menuItems.length} section{menuItems.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {menuItems.length === 0 ? (
          <div className="text-center py-20 rounded-[2rem] border border-[var(--border)]/10 bg-[var(--bg-card)]/55">
            <p className="text-4xl mb-4">🔒</p>
            <p className="text-lg font-semibold mb-2">No permissions assigned yet</p>
            <p className="text-sm text-[var(--text-muted)]">Contact your master admin to get access</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item, i) => (
              <motion.a
                key={item.href}
                href={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-[1.4rem] bg-white shadow-lg shadow-[var(--shadow)]/5 p-6 hover:shadow-xl transition group border ${item.color}`}
              >
                <p className="text-3xl mb-3">{item.icon}</p>
                <h3 className="font-semibold text-lg mb-1 group-hover:text-[#3a2a21] transition">{item.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{item.desc}</p>
                <p className="text-xs text-[var(--text-placeholder)] mt-3">
                  {item.permissions.filter(p => hasPermission(p)).join(', ').replace(/_/g, ' ')}
                </p>
              </motion.a>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-[var(--border)]/10 px-5 py-10">
        <p className="text-center text-sm text-[var(--text-placeholder)]">{config.copyright}</p>
      </footer>
    </main>
  )
}