'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import config from '@/lib/config'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = () => {
    fetch('/api/admin/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data.orders || [])
        setLoading(false)
      })
  }

  const updateStatus = async (id, status) => {
    setUpdating(id)
    await fetch('/api/admin/orders/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    setUpdating(null)
    fetchOrders()
  }

  const statusColor = (status) => {
    if (status === 'delivered') return 'text-green-400 bg-green-500/20 border-green-800'
    if (status === 'confirmed') return 'text-blue-400 bg-blue-500/20 border-blue-800'
    if (status === 'cancelled') return 'text-red-400 bg-red-500/20 border-red-800'
    return 'text-yellow-400 bg-yellow-500/20 border-yellow-800'
  }

  const filtered = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.id.slice(-8).toUpperCase().includes(search.toUpperCase()) ||
      order.name.toLowerCase().includes(search.toLowerCase()) ||
      order.email.toLowerCase().includes(search.toLowerCase()) ||
      order.phone.includes(search)

    const matchesStatus = statusFilter === 'All' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <main className="min-h-screen bg-black text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
  <a href="/" className="text-2xl font-bold">{config.brandName}</a>
  <span className="text-gray-400 text-sm">Admin — Orders</span>
  <div className="flex items-center gap-4">
    <a href="/admin" className="text-sm text-gray-400 hover:text-white transition">← Dashboard</a>
    <a href="/admin/stats" className="text-sm text-gray-400 hover:text-white transition">📊 Stats</a>
    <a href="/admin/tickets" className="text-sm text-gray-400 hover:text-white transition">🎧 Support</a>
    <button
      onClick={async () => {
        await fetch('/api/admin/logout', { method: 'POST' })
        window.location.href = '/admin-login'
      }}
      className="text-sm border border-red-900 text-red-500 px-3 py-1 rounded-lg hover:bg-red-500 hover:text-white transition"
    >
      Logout
    </button>
  </div>
</nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
          <h2 className="text-3xl font-bold">All Orders</h2>
          <div className="flex gap-3 text-sm flex-wrap">
            <span className="text-yellow-400 bg-yellow-500/20 border border-yellow-800 px-3 py-1 rounded-full">
              Pending: {orders.filter(o => o.status === 'pending').length}
            </span>
            <span className="text-blue-400 bg-blue-500/20 border border-blue-800 px-3 py-1 rounded-full">
              Confirmed: {orders.filter(o => o.status === 'confirmed').length}
            </span>
            <span className="text-green-400 bg-green-500/20 border border-green-800 px-3 py-1 rounded-full">
              Delivered: {orders.filter(o => o.status === 'delivered').length}
            </span>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            <input
              type="text"
              placeholder="Search by Order ID, name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111] border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {['All', 'pending', 'confirmed', 'delivered', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                  statusFilter === status
                    ? status === 'delivered' ? 'bg-green-500 text-white border-green-500'
                    : status === 'confirmed' ? 'bg-blue-500 text-white border-blue-500'
                    : status === 'cancelled' ? 'bg-red-500 text-white border-red-500'
                    : status === 'pending' ? 'bg-yellow-500 text-black border-yellow-500'
                    : 'bg-white text-black border-white'
                    : 'border-gray-700 text-gray-400 hover:border-white hover:text-white'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {(search || statusFilter !== 'All') && (
          <p className="text-gray-500 text-sm mb-4">
            Showing {filtered.length} of {orders.length} orders
          </p>
        )}

        {loading ? (
          <p className="text-gray-500 text-center py-20">Loading orders...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">📦</p>
            <p className="text-gray-500">No orders found!</p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-4 text-white border border-gray-700 px-4 py-2 rounded-lg text-sm hover:border-white transition"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#111] border border-gray-800 rounded-2xl p-6"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Order ID</p>
                    <p className="font-mono text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date</p>
                    <p className="text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Customer</p>
                    <p className="text-sm font-semibold">{order.name}</p>
                    <p className="text-xs text-gray-500">{order.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <p className="text-sm">{order.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total</p>
                    <p className="text-lg font-bold">₹{order.total}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                {/* Address */}
                <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Delivery Address</p>
                  <p className="text-sm text-gray-300">{order.address}, {order.pincode}</p>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-gray-500 mb-2">Items Ordered</p>
                  {order.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl p-3">
                      <div className="w-10 h-10 bg-[#222] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover"/>
                        ) : (
                          <span>🛍️</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{item.name}</p>
                        <p className="text-gray-500 text-xs">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                      <p className="text-sm font-semibold">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                {/* Status Buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-800">
                  <p className="text-xs text-gray-500 w-full mb-1">Update Status:</p>
                  {['pending', 'confirmed', 'delivered', 'cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => updateStatus(order.id, status)}
                      disabled={order.status === status || updating === order.id}
                      className={`text-xs px-3 py-2 rounded-lg border transition font-medium ${
                        order.status === status
                          ? 'opacity-50 cursor-not-allowed border-gray-700 text-gray-500'
                          : status === 'delivered'
                          ? 'border-green-800 text-green-400 hover:bg-green-500 hover:text-white hover:border-green-500'
                          : status === 'confirmed'
                          ? 'border-blue-800 text-blue-400 hover:bg-blue-500 hover:text-white hover:border-blue-500'
                          : status === 'cancelled'
                          ? 'border-red-900 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500'
                          : 'border-yellow-800 text-yellow-400 hover:bg-yellow-500 hover:text-black hover:border-yellow-500'
                      }`}
                    >
                      {updating === order.id ? 'Updating...' :
                        status === 'pending' ? '⏳ Pending' :
                        status === 'confirmed' ? '✅ Confirm' :
                        status === 'delivered' ? '📦 Delivered' :
                        '❌ Cancel'
                      }
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}