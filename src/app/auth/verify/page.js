'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import config from '@/lib/config'

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const emailParam = params.get('email')
    if (!emailParam) { window.location.href = '/auth/signup' }
    else { setEmail(emailParam) }
  }, [])

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) { document.getElementById(`otp-${index + 1}`)?.focus() }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) { document.getElementById(`otp-${index - 1}`)?.focus() }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').slice(0, 6).split('')
    const newOtp = [...otp]
    pasted.forEach((char, i) => { if (i < 6) newOtp[i] = char })
    setOtp(newOtp)
  }

  const handleVerify = async () => {
    const otpString = otp.join('')
    if (otpString.length !== 6) { setMessage('Please enter the complete 6-digit OTP!'); return }
    setLoading(true)
    setMessage('')
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: otpString })
    })
    const data = await res.json()
    setLoading(false)
    setMessage(data.message)
    if (res.ok) { setVerified(true); setTimeout(() => { window.location.href = '/auth/login' }, 2000) }
  }

  const handleResend = async () => {
    setResending(true)
    setMessage('')
    await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, name: 'User', password: 'resend' }) })
    setResending(false)
    setMessage('New OTP sent to your email!')
    setOtp(['', '', '', '', '', ''])
  }

  if (verified) return (
    <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-semibold mb-2 text-[var(--text-primary)]">Email Verified!</h2>
        <p className="text-[var(--text-muted)]">Redirecting to login...</p>
      </motion.div>
    </main>
  )

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
            <p className="text-5xl mb-4">📧</p>
            <h2 className="text-2xl font-semibold mb-2">Check your email</h2>
            <p className="text-sm text-[var(--text-muted)]">We sent a 6-digit OTP to</p>
            <p className="font-semibold text-sm mt-1">{email}</p>
          </div>

          <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-bold rounded-2xl border border-[var(--border)]/15 bg-[var(--bg)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border)]/30 transition"
              />
            ))}
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleVerify} disabled={loading} className="w-full rounded-full bg-[var(--btn-dark)] py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--btn-dark-hover)] mb-4">
            {loading ? 'Verifying...' : 'Verify OTP'}
          </motion.button>

          {message && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-center text-sm mb-4 ${message.includes('sent') || message.includes('verified') || message.includes('Verified') ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </motion.p>
          )}

          <p className="text-center text-sm text-[var(--text-placeholder)]">
            Didn't receive the OTP?{' '}
            <button onClick={handleResend} disabled={resending} className="font-semibold text-[var(--text-primary)] hover:underline">
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          </p>
          <p className="text-center text-xs text-[var(--text-placeholder)] mt-3">OTP expires in 10 minutes</p>
        </motion.div>
      </div>
    </main>
  )
}