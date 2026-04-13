'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const data = await res.json()
      setLoading(false)

      if (res.ok) {
        window.location.href = '/admin'
      } else {
        setError(data.message)
      }
    } catch (err) {
      setLoading(false)
      setError('Error: ' + err.message)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">

      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="border-b border-gray-800 px-6 py-4 flex items-center justify-between"
      >
        <a href="/" className="text-2xl font-bold tracking-wide">ShopKaro</a>
        <span className="text-gray-400 text-sm">Admin Access</span>
      </motion.nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md bg-[#111] border border-gray-800 rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <p className="text-4xl mb-4">🔐</p>
            <h2 className="text-3xl font-bold mb-2">Admin Access</h2>
            <p className="text-gray-400 text-sm">Enter the admin password to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Admin Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition"
                required
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-100 transition"
            >
              {loading ? 'Verifying...' : 'Enter Admin Panel'}
            </motion.button>
          </form>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-red-400 text-sm mt-4"
            >
              {error}
            </motion.p>
          )}

          <p className="text-center text-sm text-gray-600 mt-6">
            <a href="/" className="hover:text-white transition">← Back to Store</a>
          </p>
        </motion.div>
      </div>
    </main>
  )
}