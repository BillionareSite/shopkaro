'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import config from '@/lib/config'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      setMessage(data.message)
      setLoading(false)
      if (res.ok) { window.location.href = '/auth/reset-password?email=' + encodeURIComponent(email) }
    } catch (err) {
      setLoading(false)
      setMessage('Something went wrong. Please try again!')
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col">
      <header className="border-b border-[var(--border)]/10 bg-[var(--bg)]/85 backdrop-blur-xl px-5 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--btn-dark)] text-xs font-semibold text-white">{config.shortCode}</div>
          <span className="text-lg font-semibold">{config.brandName}</span>
        </a>
        <div className="flex gap-4 text-sm text-[var(--text-muted)]">
          <a href="/auth/login" className="hover:text-[var(--text-primary)] transition">Login</a>
          <a href="/auth/signup" className="hover:text-[var(--text-primary)] transition">Signup</a>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-md rounded-[1.4rem] bg-white shadow-xl shadow-[#3d2619]/8 p-8">
          <div className="text-center mb-8">
            <p className="text-5xl mb-4">🔐</p>
            <h2 className="text-2xl font-semibold mb-2">Forgot Password?</h2>
            <p className="text-sm text-[var(--text-muted)]">Enter your email and we'll send you an OTP to reset your password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-[var(--text-muted)] mb-1 block">Email Address</label>
              <input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-[var(--border)]/15 bg-[var(--bg)] px-4 py-3 text-sm placeholder-[var(--text-placeholder)] focus:outline-none focus:border-[var(--border)]/30 transition" required/>
            </div>
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} className="w-full rounded-full bg-[var(--btn-dark)] py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--btn-dark-hover)]">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </motion.button>
          </form>

          {message && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-center text-sm mt-4 ${message.includes('sent') ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </motion.p>
          )}

          <p className="text-center text-sm text-[var(--text-placeholder)] mt-6">
            Remember your password?{' '}
            <a href="/auth/login" className="font-semibold text-[var(--text-primary)] hover:underline">Login</a>
          </p>
        </motion.div>
      </div>
    </main>
  )
}