'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setMessage(data.message)
    setLoading(false)
    if (res.ok) {
      localStorage.setItem('token', data.token)
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get('redirect') || '/'
      window.location.href = redirect
    } else if (data.unverified) {
      window.location.href = '/auth/verify?email=' + encodeURIComponent(data.email)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">

      {/* Navbar */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="border-b border-gray-800 px-6 py-4 flex items-center justify-between"
      >
        <a href="/" className="text-2xl font-bold tracking-wide">ShopKaro</a>
        <div className="flex gap-4 text-gray-300 text-sm">
          <a href="/auth/login" className="hover:text-white transition">Login</a>
          <a href="/auth/signup" className="hover:text-white transition">Signup</a>
        </div>
      </motion.nav>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md bg-[#111] border border-gray-800 rounded-2xl p-8"
        >
          <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-sm mb-8">Login to your ShopKaro account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email</label>
              <input
                type="email"
                placeholder="you@email.com"
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-100 transition mt-2"
            >
              {loading ? 'Logging in...' : 'Login'}
            </motion.button>
          </form>

          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center text-sm mt-4 ${
                message.includes('success') ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {message}
            </motion.p>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <a href="/auth/signup" className="text-white hover:underline">Sign Up</a>
          </p>
        </motion.div>
      </div>
    </main>
  )
}