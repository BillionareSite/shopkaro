'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const emailParam = params.get('email')
    if (!emailParam) {
      window.location.href = '/auth/forgot-password'
    } else {
      setEmail(emailParam)
    }
  }, [])

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').slice(0, 6).split('')
    const newOtp = [...otp]
    pasted.forEach((char, i) => { if (i < 6) newOtp[i] = char })
    setOtp(newOtp)
  }

  const handleSubmit = async () => {
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      setMessage('Please enter the complete 6-digit OTP!')
      return
    }
    if (!newPassword || !confirmPassword) {
      setMessage('Please enter your new password!')
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match!')
      return
    }
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters!')
      return
    }
    setLoading(true)
    setMessage('')
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: otpString, newPassword })
    })
    const data = await res.json()
    setLoading(false)
    setMessage(data.message)
    if (res.ok) {
      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/auth/login'
      }, 2000)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setMessage('')
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    setResending(false)
    setMessage('New OTP sent to your email!')
    setOtp(['', '', '', '', '', ''])
  }

  if (success) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-2">Password Reset!</h2>
        <p className="text-gray-400">Redirecting to login...</p>
      </motion.div>
    </main>
  )

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
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

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md bg-[#111] border border-gray-800 rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <p className="text-5xl mb-4">🔑</p>
            <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
            <p className="text-gray-400 text-sm">Enter the OTP sent to</p>
            <p className="text-white font-semibold text-sm mt-1">{email}</p>
          </div>

          {/* OTP Input */}
          <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
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
                className="w-12 h-14 text-center text-xl font-bold bg-[#1a1a1a] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white transition"
              />
            ))}
          </div>

          {/* New Password */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">New Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-100 transition mb-4"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </motion.button>

          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center text-sm mb-4 ${
                message.includes('sent') || message.includes('success') || message.includes('reset')
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}
            >
              {message}
            </motion.p>
          )}

          <p className="text-center text-sm text-gray-500">
            Didn't receive the OTP?{' '}
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-white hover:underline"
            >
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          </p>
        </motion.div>
      </div>
    </main>
  )
}