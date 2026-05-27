'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import config from '@/lib/config'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { window.location.href = '/auth/login?redirect=/orders'; return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser(payload)
      fetch('/api/orders?email=' + payload.email)
        .then(res => res.json())
        .then(data => {
          setOrders(data.orders || [])
          setLoading(false)
        })
    } catch { window.location.href = '/auth/login' }
  }, [])

  const statusColor = (status) => {
    if (status === 'delivered') return 'text-green-700 bg-green-50 border-green-200'
    if (status === 'confirmed') return 'text-blue-700 bg-blue-50 border-blue-200'
    if (status === 'cancelled') return 'text-red-700 bg-red-50 border-red-200'
    return 'text-amber-700 bg-amber-50 border-amber-200'
  }

  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter)

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
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">My Orders 📦</h1>
          <p className="mt-1 text-sm text-[#7b6f66]">Track and manage all your orders</p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: orders.length, color: 'text-[#171313]' },
            { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: 'text-amber-600' },
            { label: 'Confirmed', value: orders.filter(o => o.status === 'confirmed').length, color: 'text-blue-600' },
            { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: 'text-green-600' },
          ].map((stat, i) => (
            <div key={i} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-4 text-center">
              <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-[#9b8f86] mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Filter Pills */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex gap-2 overflow-x-auto mb-6 pb-1">
          {['All', 'pending', 'confirmed', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition flex-shrink-0 ${
                filter === status
                  ? 'bg-[#171313] text-white'
                  : 'border border-[#241a14]/15 bg-white/55 text-[#6d625a] hover:bg-white/80'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#171313] border-t-transparent animate-spin mx-auto mb-3"/>
            <p className="text-sm text-[#7b6f66]">Loading orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 rounded-[2rem] border border-[#241a14]/10 bg-white/55">
            <p className="text-4xl mb-4">📦</p>
            <p className="text-lg font-semibold mb-2">No orders found!</p>
            <p className="text-sm text-[#7b6f66] mb-8">
              {filter === 'All' ? "You haven't placed any orders yet." : `No ${filter} orders found.`}
            </p>
            {filter === 'All' ? (
              <a href="/products">
                <button className="rounded-full bg-[#171313] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#3a2a21]">
                  Start Shopping
                </button>
              </a>
            ) : (
              <button onClick={() => setFilter('All')} className="rounded-full border border-[#241a14]/15 px-6 py-2.5 text-sm font-medium text-[#6d625a] transition hover:bg-white/80">
                View All Orders
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-5 border-b border-[#241a14]/10">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <p className="text-xs text-[#9b8f86]">Order ID</p>
                        <p className="font-mono font-semibold text-sm">{order.orderId || '#' + order.id.slice(-8).toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#9b8f86]">Date</p>
                        <p className="text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#9b8f86]">Total</p>
                        <p className="text-sm font-semibold">₹{order.total}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="p-5 space-y-3">
                  {order.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#eadfd4]">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover"/>
                        ) : (
                          <div className="grid h-full place-items-center text-lg">🛍️</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.name}</p>
                        <p className="text-xs text-[#9b8f86]">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                      <p className="text-sm font-semibold flex-shrink-0">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="px-5 pb-5">
                  <div className="rounded-2xl bg-[#f6f1ea] border border-[#241a14]/10 p-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#9b8f86] mb-1">📍 Delivery Address</p>
                      <p className="text-sm text-[#6f6258]">{order.address}, {order.pincode}</p>
                      <p className="text-xs text-[#9b8f86] mt-1">📱 {order.phone}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-[#9b8f86] mb-1">Amount Paid</p>
                      <p className="text-lg font-semibold">₹{order.total}</p>
                    </div>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="px-5 pb-5">
                  <div className="flex items-center gap-2">
                    {['pending', 'confirmed', 'delivered'].map((s, index) => (
                      <div key={s} className="flex items-center gap-2 flex-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          order.status === 'cancelled' ? 'bg-red-100 text-red-500' :
                          ['pending', 'confirmed', 'delivered'].indexOf(order.status) >= index
                            ? 'bg-[#171313] text-white'
                            : 'bg-[#f6f1ea] border border-[#241a14]/15 text-[#9b8f86]'
                        }`}>
                          {order.status === 'cancelled' ? '✕' : index + 1}
                        </div>
                        <p className={`text-xs flex-1 ${
                          order.status === 'cancelled' ? 'text-red-400' :
                          ['pending', 'confirmed', 'delivered'].indexOf(order.status) >= index
                            ? 'text-[#171313] font-medium'
                            : 'text-[#9b8f86]'
                        }`}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </p>
                        {index < 2 && (
                          <div className={`h-0.5 flex-1 ${
                            order.status === 'cancelled' ? 'bg-red-100' :
                            ['pending', 'confirmed', 'delivered'].indexOf(order.status) > index
                              ? 'bg-[#171313]'
                              : 'bg-[#241a14]/10'
                          }`}/>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
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