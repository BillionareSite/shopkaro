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
    <main className="min-h-screen bg-[#f6f1ea] text-[#171313] flex flex-col">
      <header className="border-b border-[#241a14]/10 bg-[#f6f1ea]/85 backdrop-blur-xl px-5 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#171313] text-xs font-semibold text-white">{config.shortCode}</div>
          <span className="text-lg font-semibold">{config.brandName}</span>
        </a>
        <div className="flex gap-4 text-sm text-[#6d625a]">
          <a href="/auth/login" className="hover:text-[#171313] transition">Login</a>
          <a href="/auth/signup" className="hover:text-[#171313] transition">Signup</a>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-md rounded-[1.4rem] bg-white shadow-xl shadow-[#3d2619]/8 p-8">
          <div className="text-center mb-8">
            <p className="text-5xl mb-4">🔐</p>
            <h2 className="text-2xl font-semibold mb-2">Forgot Password?</h2>
            <p className="text-sm text-[#7b6f66]">Enter your email and we'll send you an OTP to reset your password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-[#7b6f66] mb-1 block">Email Address</label>
              <input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition" required/>
            </div>
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} className="w-full rounded-full bg-[#171313] py-3.5 text-sm font-semibold text-white transition hover:bg-[#3a2a21]">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </motion.button>
          </form>

          {message && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-center text-sm mt-4 ${message.includes('sent') ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </motion.p>
          )}

          <p className="text-center text-sm text-[#9b8f86] mt-6">
            Remember your password?{' '}
            <a href="/auth/login" className="font-semibold text-[#171313] hover:underline">Login</a>
          </p>
        </motion.div>
      </div>
    </main>
  )
}