'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [resetEmail, setResetEmail] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [resetting, setResetting] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = () => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
  }

  const handleResetPassword = async () => {
    if (!resetEmail || !resetPassword) {
      setResetMessage('Please fill all fields!')
      return
    }
    setResetting(true)
    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetEmail, newPassword: resetPassword })
    })
    const data = await res.json()
    setResetMessage(data.message)
    setResetting(false)
    if (res.ok) {
      setResetEmail('')
      setResetPassword('')
    }
  }

  const statusColor = (status) => {
    if (status === 'delivered') return 'text-green-400 bg-green-500/20 border-green-800'
    if (status === 'confirmed') return 'text-blue-400 bg-blue-500/20 border-blue-800'
    if (status === 'cancelled') return 'text-red-400 bg-red-500/20 border-red-800'
    return 'text-yellow-400 bg-yellow-500/20 border-yellow-800'
  }

  const filteredUsers = stats?.users?.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  ) || []

  if (loading) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-gray-500">Loading stats...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-black text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-2xl font-bold">ShopKaro</a>
        <span className="text-gray-400 text-sm">Admin — Stats</span>
        <div className="flex items-center gap-4">
          <a href="/admin" className="text-sm text-gray-400 hover:text-white transition">← Dashboard</a>
          <a href="/admin/orders" className="text-sm text-gray-400 hover:text-white transition">📦 Orders</a>
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

      <div className="max-w-6xl mx-auto px-6 py-8 pb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8"
        >
          Dashboard Stats
        </motion.h2>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-5">
            <p className="text-3xl mb-2">🛍️</p>
            <p className="text-2xl font-bold">{stats.totalProducts}</p>
            <p className="text-gray-400 text-sm">Total Products</p>
          </div>
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-5">
            <p className="text-3xl mb-2">📦</p>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
            <p className="text-gray-400 text-sm">Total Orders</p>
          </div>
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-5">
            <p className="text-3xl mb-2">💰</p>
            <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">Total Revenue</p>
          </div>
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-5">
            <p className="text-3xl mb-2">👥</p>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
            <p className="text-gray-400 text-sm">Total Users</p>
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111] border border-gray-800 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Recent Orders</h3>
            <a href="/admin/orders" className="text-sm text-gray-400 hover:text-white transition">View all →</a>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm">No orders yet!</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between bg-[#1a1a1a] border border-gray-800 rounded-xl p-3">
                  <div>
                    <p className="text-sm font-semibold">{order.name}</p>
                    <p className="text-xs text-gray-500">{order.email}</p>
                    <p className="text-xs text-gray-600 font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">₹{order.total}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short'
                      })}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full border ${statusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Users List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#111] border border-gray-800 rounded-2xl p-6 mb-8"
        >
          <h3 className="text-xl font-bold mb-4">All Users ({stats.totalUsers})</h3>

          {/* Search */}
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition"
            />
          </div>

          <div className="space-y-3">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-gray-400 text-xs">{user.email}</p>
                      <p className="text-gray-600 text-xs">
                        Joined {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 bg-[#222] px-3 py-1 rounded-full border border-gray-700">
                      {user.orders.length} order{user.orders.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                      className="text-xs px-3 py-1 rounded-lg border border-gray-600 text-gray-400 hover:border-white hover:text-white transition"
                    >
                      {selectedUser?.id === user.id ? 'Hide' : 'View Orders'}
                    </button>
                  </div>
                </div>

                {/* User Orders */}
                {selectedUser?.id === user.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 border-t border-gray-800 pt-4"
                  >
                    {user.orders.length === 0 ? (
                      <p className="text-gray-500 text-sm">No orders yet</p>
                    ) : (
                      <div className="space-y-2">
                        {user.orders.map(order => (
                          <div key={order.id} className="flex items-center justify-between bg-[#222] rounded-xl p-3">
                            <div>
                              <p className="text-xs font-mono text-gray-400">#{order.id.slice(-8).toUpperCase()}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                })}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold">₹{order.total}</p>
                              <span className={`text-xs font-bold px-2 py-1 rounded-full border ${statusColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Reset Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#111] border border-gray-800 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold mb-2">Reset User Password 🔐</h3>
          <p className="text-gray-500 text-sm mb-6">Enter the user's email and set a new password for them</p>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">User Email</label>
              <input
                type="email"
                placeholder="user@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">New Password</label>
              <input
                type="password"
                placeholder="New password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleResetPassword}
              disabled={resetting}
              className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-100 transition"
            >
              {resetting ? 'Resetting...' : 'Reset Password'}
            </motion.button>
            {resetMessage && (
              <p className={`text-sm text-center ${resetMessage.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                {resetMessage}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  )
}