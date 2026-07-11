'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import config from '@/lib/config'

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    setMessage(data.message)
    if (res.ok && data.redirect) {
      window.location.href = '/auth/verify?email=' + encodeURIComponent(form.email)
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
          <h2 className="text-2xl font-semibold mb-1">Create Account</h2>
          <p className="text-sm text-[var(--text-muted)] mb-8">Join {config.brandName} today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Rahul Sharma' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'you@email.com' },
              { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' }
            ].map(field => (
              <div key={field.key}>
                <label className="text-sm text-[var(--text-muted)] mb-1 block">{field.label}</label>
                <input type={field.type} placeholder={field.placeholder} className="w-full rounded-2xl border border-[var(--border)]/15 bg-[var(--bg)] px-4 py-3 text-sm placeholder-[var(--text-placeholder)] focus:outline-none focus:border-[var(--border)]/30 transition" onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} required/>
              </div>
            ))}
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} className="w-full rounded-full bg-[var(--btn-dark)] py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--btn-dark-hover)] mt-2">
              {loading ? 'Sending OTP...' : 'Create Account'}
            </motion.button>
          </form>

          {message && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-center text-sm mt-4 ${message.includes('OTP') || message.includes('sent') ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </motion.p>
          )}

          <p className="text-center text-sm text-[var(--text-placeholder)] mt-6">
            Already have an account?{' '}
            <a href="/auth/login" className="font-semibold text-[var(--text-primary)] hover:underline">Login</a>
          </p>
        </motion.div>
      </div>
    </main>
  )
}