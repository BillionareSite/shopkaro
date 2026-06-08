'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import config from '@/lib/config'

export default function StaffLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/sub-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      setLoading(false)
      if (res.ok) {
        localStorage.setItem('sub_admin_token', data.token)
        window.location.href = '/staff-panel'
      } else {
        setError(data.message)
      }
    } catch (err) {
      setLoading(false)
      setError('Something went wrong!')
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171313] flex flex-col">
      <header className="border-b border-[#241a14]/10 bg-[#f6f1ea]/85 backdrop-blur-xl px-5 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          {config.logo ? (
            <img src={config.logo} alt={config.brandName} className="h-9 w-9 rounded-full object-cover"/>
          ) : (
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#171313] text-xs font-semibold text-white">{config.shortCode}</div>
          )}
          <span className="text-lg font-semibold">{config.brandName}</span>
        </a>
        <span className="text-sm text-[#7b6f66]">Staff Login</span>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md rounded-[1.4rem] bg-white shadow-xl shadow-[#3d2619]/8 p-8"
        >
          <div className="text-center mb-8">
            <p className="text-4xl mb-4">👤</p>
            <h2 className="text-2xl font-semibold mb-2">Staff Login</h2>
            <p className="text-sm text-[#7b6f66]">Login with your staff credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-[#7b6f66] mb-1 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition"
                required
              />
            </div>
            <div>
              <label className="text-sm text-[#7b6f66] mb-1 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition"
                required
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full rounded-full bg-[#171313] py-3.5 text-sm font-semibold text-white transition hover:bg-[#3a2a21] disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Login to Staff Panel'}
            </motion.button>
          </form>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-red-500 text-sm mt-4"
            >
              {error}
            </motion.p>
          )}

          <p className="text-center text-sm text-[#9b8f86] mt-6">
            Are you the master admin?{' '}
            <a href="/admin-login" className="font-semibold text-[#171313] hover:underline">Login here</a>
          </p>
        </motion.div>
      </div>
    </main>
  )
}