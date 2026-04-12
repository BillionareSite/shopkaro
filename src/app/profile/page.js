'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/auth/login'
      return
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser(payload)
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

      {/* Navbar */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="border-b border-gray-800 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <a href="/" className="text-2xl font-bold tracking-wide">ShopKaro</a>
          <div className="hidden md:flex gap-6 text-gray-300 text-sm">
            <a href="/" className="hover:text-white transition">Home</a>
            <a href="/products" className="hover:text-white transition">Products</a>
            <a href="/profile" className="text-white transition">Profile</a>
          </div>
          <a href="/cart" className="hidden md:block">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-4 py-2 rounded-lg font-semibold text-sm"
            >
              Cart 🛒
            </motion.button>
          </a>
          <button
            className="md:hidden text-white text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-4 flex flex-col gap-4 border-t border-gray-800 pt-4 text-sm"
          >
            <a href="/" className="text-gray-300 hover:text-white">Home</a>
            <a href="/products" className="text-gray-300 hover:text-white">Products</a>
            <a href="/profile" className="text-white">Profile</a>
            <a href="/cart" className="border border-gray-700 text-white text-center py-2 rounded-lg hover:border-white transition">Cart 🛒</a>
          </motion.div>
        )}
      </motion.nav>

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
              <p className="text-xs text-gray-500 mb-1">Member Since</p>
              <p className="text-sm font-semibold">
                {new Date(user.iat * 1000).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
              </p>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Account Status</p>
              <p className="text-sm font-semibold text-green-400">✓ Active</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
          transition={{ delay: 0.3 }}
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