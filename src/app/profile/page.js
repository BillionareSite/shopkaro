'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import config from '@/lib/config'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [orderCount, setOrderCount] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { window.location.href = '/auth/login'; return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser(payload)
      fetch('/api/orders?email=' + payload.email)
        .then(res => res.json())
        .then(data => setOrderCount((data.orders || []).length))
    } catch { window.location.href = '/auth/login' }
  }, [])

  const handleLogout = () => { localStorage.removeItem('token'); window.location.href = '/' }

  if (!user) return (
    <main className="min-h-screen bg-[#f6f1ea] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#171313] border-t-transparent animate-spin"/>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171313]">
      <Navbar />
      <div className="mx-auto max-w-3xl px-5 py-10 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c6048]">Account</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">My Profile</h1>
          <p className="mt-1 text-sm text-[#7b6f66]">Manage your account and preferences</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6 mb-6">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-full bg-[#171313] text-white flex items-center justify-center text-2xl font-semibold flex-shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-sm text-[#7b6f66]">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Full Name', value: user.name },
              { label: 'Email', value: user.email },
              { label: 'Account Status', value: '✓ Active', green: true }
            ].map((item, i) => (
              <div key={i} className="rounded-2xl bg-[#f6f1ea] border border-[#241a14]/10 px-4 py-3">
                <p className="text-xs text-[#9b8f86] mb-1">{item.label}</p>
                <p className={`text-sm font-semibold truncate ${item.green ? 'text-green-600' : 'text-[#171313]'}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-4 mb-6">
          {[
            { href: '/orders', icon: '📦', title: 'My Orders', sub: `${orderCount} order${orderCount !== 1 ? 's' : ''} placed` },
            { href: '/products', icon: '🛍️', title: 'Browse Products', sub: 'Explore our store' },
            { href: '/cart', icon: '🛒', title: 'My Cart', sub: 'View your cart' },
            { href: '/help', icon: '🎧', title: 'Help & Support', sub: 'Get assistance' },
            { href: '/contact', icon: '📬', title: 'Contact Us', sub: 'Reach out to us' },
            { href: '/auth/forgot-password', icon: '🔐', title: 'Change Password', sub: 'Update your password' }
          ].map((item, i) => (
            <a key={i} href={item.href}>
              <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-5 hover:shadow-xl transition cursor-pointer h-full">
                <p className="text-2xl mb-2">{item.icon}</p>
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-[#9b8f86] mt-1">{item.sub}</p>
              </div>
            </a>
          ))}
        </motion.div>

        {/* Logout */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full rounded-full border border-red-200 bg-red-50 py-3.5 font-semibold text-sm text-red-600 transition hover:bg-red-100"
          >
            Logout
          </motion.button>
        </motion.div>
      </div>

      <footer className="border-t border-[#241a14]/10 px-5 py-10">
        <p className="text-center text-sm text-[#9b8f86]">{config.copyright}</p>
      </footer>
    </main>
  )
}