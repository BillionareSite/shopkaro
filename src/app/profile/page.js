'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/auth/login'
      return
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser(payload)
      fetch('/api/orders?email=' + payload.email)
        .then(res => res.json())
        .then(data => {
          setOrders(data.orders || [])
          setOrdersLoading(false)
        })
    } catch {
      window.location.href = '/auth/login'
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  if (!user) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-black text-white">

      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-8 pb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold mb-8"
        >
          My Profile
        </motion.h2>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111] border border-gray-800 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold">{user.name}</h3>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Full Name</p>
              <p className="text-sm font-semibold">{user.name}</p>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Email Address</p>
              <p className="text-sm font-semibold">{user.email}</p>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Total Orders</p>
              <p className="text-sm font-semibold">{orders.length}</p>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Account Status</p>
              <p className="text-sm font-semibold text-green-400">✓ Active</p>
            </div>
          </div>
        </motion.div>

        {/* Order History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111] border border-gray-800 rounded-2xl p-6 mb-6"
        >
          <h3 className="text-xl font-bold mb-6">Order History 📦</h3>

          {ordersLoading ? (
            <p className="text-gray-500 text-sm">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-gray-500 text-sm">No orders yet!</p>
              <a href="/products">
                <button className="mt-4 bg-white text-black px-6 py-2 rounded-xl text-sm font-semibold hover:bg-gray-100 transition">
                  Start Shopping
                </button>
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Order ID</p>
                      <p className="text-sm font-mono text-gray-300">#{order.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm text-gray-300">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      order.status === 'delivered'
                        ? 'bg-green-500/20 text-green-400 border-green-800'
                        : order.status === 'confirmed'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-800'
                        : order.status === 'cancelled'
                        ? 'bg-red-500/20 text-red-400 border-red-800'
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 mb-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#222] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {item.images?.[0] ? (
                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover"/>
                          ) : (
                            <span className="text-lg">🛍️</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{item.name}</p>
                          <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-800 pt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Deliver to</p>
                      <p className="text-sm text-gray-300 truncate max-w-[200px]">{order.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-white font-bold">₹{order.total}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <a href="/products">
            <div className="bg-[#111] border border-gray-800 rounded-2xl p-5 hover:border-white transition cursor-pointer">
              <p className="text-2xl mb-2">🛍️</p>
              <p className="font-semibold text-sm">Browse Products</p>
              <p className="text-gray-500 text-xs mt-1">Explore our store</p>
            </div>
          </a>
          <a href="/cart">
            <div className="bg-[#111] border border-gray-800 rounded-2xl p-5 hover:border-white transition cursor-pointer">
              <p className="text-2xl mb-2">🛒</p>
              <p className="font-semibold text-sm">My Cart</p>
              <p className="text-gray-500 text-xs mt-1">View your cart</p>
            </div>
          </a>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full border border-red-900 text-red-500 font-semibold py-3 rounded-xl hover:bg-red-500 hover:text-white transition"
          >
            Logout
          </motion.button>
        </motion.div>
      </div>
    </main>
  )
}