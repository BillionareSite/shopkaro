'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import config from '@/lib/config'

export default function AdminStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false) })
  }, [])

  const statusColor = (status) => {
    if (status === 'delivered') return 'text-green-700 bg-green-50 border-green-200'
    if (status === 'confirmed') return 'text-blue-700 bg-blue-50 border-blue-200'
    if (status === 'cancelled') return 'text-red-700 bg-red-50 border-red-200'
    return 'text-amber-700 bg-amber-50 border-amber-200'
  }

  const filteredUsers = stats?.allUsers?.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  ) || []

  if (loading) return (
    <main className="min-h-screen bg-[#f6f1ea] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#171313] border-t-transparent animate-spin mx-auto mb-3"/>
        <p className="text-sm text-[#7b6f66]">Loading stats...</p>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171313]">

      {/* Navbar */}
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
          <span className="text-sm text-[#7b6f66]">Admin — Statistics</span>
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-sm text-[#7b6f66] hover:text-[#171313] transition">← Dashboard</a>
            <a href="/admin/orders" className="text-sm text-[#7b6f66] hover:text-[#171313] transition">📦 Orders</a>
            <button
              onClick={async () => { await fetch('/api/admin/logout', { method: 'POST' }); window.location.href = '/admin-login' }}
              className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c6048]">Overview</p>
          <h2 className="mt-1 text-3xl font-semibold">Statistics</h2>
        </motion.div>

        {/* Main Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '📦', color: 'text-[#171313]' },
            { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: 'text-green-600' },
            { label: 'Total Products', value: stats?.totalProducts || 0, icon: '🛍️', color: 'text-blue-600' },
            { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'text-purple-600' },
          ].map((stat, i) => (
            <div key={i} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-5">
              <p className="text-3xl mb-3">{stat.icon}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-[#9b8f86] mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Order Status Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pending Orders', value: stats?.statusCounts?.pending || 0, color: 'text-amber-600 bg-amber-50 border-amber-200' },
            { label: 'Confirmed Orders', value: stats?.statusCounts?.confirmed || 0, color: 'text-blue-600 bg-blue-50 border-blue-200' },
            { label: 'Delivered Orders', value: stats?.statusCounts?.delivered || 0, color: 'text-green-600 bg-green-50 border-green-200' },
            { label: 'Cancelled Orders', value: stats?.statusCounts?.cancelled || 0, color: 'text-red-600 bg-red-50 border-red-200' },
          ].map((stat, i) => (
            <div key={i} className={`rounded-[1.4rem] border p-5 ${stat.color}`}>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs mt-1 opacity-80">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Revenue + Coupons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
            <h3 className="text-lg font-semibold mb-4">💰 Revenue Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-2xl bg-[#f6f1ea]">
                <p className="text-sm text-[#7b6f66]">Total Revenue (non-cancelled)</p>
                <p className="font-bold text-green-600">₹{(stats?.totalRevenue || 0).toLocaleString()}</p>
              </div>
              <div className="flex justify-between items-center p-3 rounded-2xl bg-[#f6f1ea]">
                <p className="text-sm text-[#7b6f66]">Delivered Revenue</p>
                <p className="font-bold text-green-700">₹{(stats?.deliveredRevenue || 0).toLocaleString()}</p>
              </div>
              <div className="flex justify-between items-center p-3 rounded-2xl bg-[#f6f1ea]">
                <p className="text-sm text-[#7b6f66]">Active Coupons</p>
                <p className="font-bold text-purple-600">{stats?.totalCoupons || 0}</p>
              </div>
              <div className="flex justify-between items-center p-3 rounded-2xl bg-[#f6f1ea]">
                <p className="text-sm text-[#7b6f66]">Pending Orders</p>
                <p className="font-bold text-amber-600">{stats?.pendingOrders || 0}</p>
              </div>
            </div>
          </div>

          {/* Low Stock */}
          <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
            <h3 className="text-lg font-semibold mb-4">⚠️ Low Stock Products</h3>
            {!stats?.lowStockProducts?.length ? (
              <div className="text-center py-6">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-sm text-[#7b6f66]">All products are well stocked!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-52 overflow-y-auto">
                {stats.lowStockProducts.map(product => (
                  <div key={product.id} className={`flex items-center justify-between p-3 rounded-2xl border ${product.stock === 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {product.images?.[0] && (
                        <img src={product.images[0]} alt={product.name} className="w-8 h-8 rounded-xl object-cover flex-shrink-0"/>
                      )}
                      <p className={`text-sm font-semibold truncate ${product.stock === 0 ? 'text-red-700' : 'text-amber-700'}`}>{product.name}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${product.stock === 0 ? 'text-red-700 bg-red-100' : 'text-amber-700 bg-amber-100'}`}>
                      {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">📦 Recent Orders</h3>
            <a href="/admin/orders" className="text-xs text-[#7b6f66] hover:text-[#171313] border border-[#241a14]/15 px-3 py-1.5 rounded-full transition">View All →</a>
          </div>
          {!stats?.recentOrders?.length ? (
            <p className="text-sm text-[#9b8f86] text-center py-6">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#f6f1ea] border border-[#241a14]/10">
                  <div className="flex items-center gap-4 flex-wrap flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <p className="text-xs text-[#9b8f86]">Order ID</p>
                      <p className="text-sm font-mono font-bold">{order.orderId}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <p className="text-xs text-[#9b8f86]">Customer</p>
                      <p className="text-sm font-semibold">{order.name}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <p className="text-xs text-[#9b8f86]">Date</p>
                      <p className="text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    {order.isSameDay && (
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full flex-shrink-0">⚡ Same Day</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="font-semibold text-sm">₹{order.total}</p>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColor(order.status)}`}>
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Users */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h3 className="text-lg font-semibold">👥 All Users ({stats?.allUsers?.length || 0})</h3>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b8f86] text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-full border border-[#241a14]/15 bg-[#f6f1ea] pl-8 pr-4 py-2 text-sm placeholder-[#9b8f86] focus:outline-none transition"
              />
            </div>
          </div>
          {filteredUsers.length === 0 ? (
            <p className="text-sm text-[#9b8f86] text-center py-6">No users found</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#f6f1ea] border border-[#241a14]/10">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#171313] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-[#9b8f86] truncate">{user.email}</p>
                      <p className="text-xs text-[#9b8f86]">Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${user.verified ? 'text-green-700 bg-green-50 border-green-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                      {user.verified ? '✓ Verified' : '⏳ Unverified'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <footer className="border-t border-[#241a14]/10 px-5 py-10">
        <p className="text-center text-sm text-[#9b8f86]">{config.copyright}</p>
      </footer>
    </main>
  )
}