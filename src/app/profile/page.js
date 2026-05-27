'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import config from '@/lib/config'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { window.location.href = '/auth/login'; return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser(payload)
      fetch('/api/orders?email=' + payload.email)
        .then(res => res.json())
        .then(data => { setOrders(data.orders || []); setOrdersLoading(false) })
    } catch { window.location.href = '/auth/login' }
  }, [])

  const handleLogout = () => { localStorage.removeItem('token'); window.location.href = '/' }

  const statusColor = (status) => {
    if (status === 'delivered') return 'text-green-700 bg-green-50 border-green-200'
    if (status === 'confirmed') return 'text-blue-700 bg-blue-50 border-blue-200'
    if (status === 'cancelled') return 'text-red-700 bg-red-50 border-red-200'
    return 'text-amber-700 bg-amber-50 border-amber-200'
  }

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Full Name', value: user.name },
              { label: 'Email', value: user.email },
              { label: 'Total Orders', value: orders.length },
              { label: 'Status', value: '✓ Active', green: true }
            ].map((item, i) => (
              <div key={i} className="rounded-2xl bg-[#f6f1ea] border border-[#241a14]/10 px-4 py-3">
                <p className="text-xs text-[#9b8f86] mb-1">{item.label}</p>
                <p className={`text-sm font-semibold truncate ${item.green ? 'text-green-600' : 'text-[#171313]'}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Order History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6 mb-6">
          <h3 className="text-xl font-semibold mb-6">Order History 📦</h3>
          {ordersLoading ? (
            <p className="text-sm text-[#7b6f66]">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-sm text-[#7b6f66] mb-4">No orders yet!</p>
              <a href="/products">
                <button className="rounded-full bg-[#171313] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3a2a21]">Start Shopping</button>
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="rounded-2xl border border-[#241a14]/10 bg-[#f6f1ea] p-4">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div>
                      <p className="text-xs text-[#9b8f86]">Order ID</p>
                      <p className="text-sm font-mono font-semibold">#{order.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9b8f86]">Date</p>
                      <p className="text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="space-y-2 mb-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#eadfd4]">
                          {item.images?.[0] ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover"/> : <div className="grid h-full place-items-center text-sm">🛍️</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{item.name}</p>
                          <p className="text-xs text-[#9b8f86]">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-[#241a14]/10 pt-3">
                    <div>
                      <p className="text-xs text-[#9b8f86]">Deliver to</p>
                      <p className="text-sm truncate max-w-[200px]">{order.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#9b8f86]">Total</p>
                      <p className="font-semibold">₹{order.total}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 gap-4 mb-6">
          {[
            { href: '/products', icon: '🛍️', title: 'Browse Products', sub: 'Explore our store' },
            { href: '/cart', icon: '🛒', title: 'My Cart', sub: 'View your cart' },
            { href: '/help', icon: '🎧', title: 'Help & Support', sub: 'Get assistance' },
            { href: '/auth/forgot-password', icon: '🔐', title: 'Change Password', sub: 'Update your password' }
          ].map((item, i) => (
            <a key={i} href={item.href}>
              <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-5 hover:shadow-xl transition cursor-pointer">
                <p className="text-2xl mb-2">{item.icon}</p>
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-[#9b8f86] mt-1">{item.sub}</p>
              </div>
            </a>
          ))}
        </motion.div>

        {/* Logout */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
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