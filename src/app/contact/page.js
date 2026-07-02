'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import config from '@/lib/config'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loggedInUser, setLoggedInUser] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setLoggedInUser(payload)
        // Pre-fill name and email from token
        setForm(f => ({ ...f, name: payload.name || '', email: payload.email || '' }))
      } catch {
        // Token invalid, treat as guest
      }
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.subject || !form.message) { setError('Please fill all fields!'); return }
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        isGuest: !loggedInUser,
        userId: loggedInUser?.id || null
      })
    })
    setSubmitting(false)
    if (res.ok) { setSubmitted(true) }
    else { setError('Something went wrong. Please try again!') }
  }

  if (submitted) return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171313]">
      <Navbar />
      <div className="flex items-center justify-center min-h-[80vh] px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-3xl font-semibold mb-3">Message Sent!</h2>
          <p className="text-[#7b6f66] mb-2">Thank you for reaching out to us.</p>
          <p className="text-sm text-[#9b8f86] mb-8">We'll get back to you as soon as possible!</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/"><motion.button whileHover={{ scale: 1.05 }} className="rounded-full bg-[#171313] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#3a2a21]">Go Home</motion.button></a>
            <a href="/products"><motion.button whileHover={{ scale: 1.05 }} className="rounded-full border border-[#241a14]/15 px-8 py-3.5 text-sm font-semibold text-[#171313] transition hover:bg-white/80">Shop Now</motion.button></a>
          </div>
        </motion.div>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171313]">
      <Navbar />

      <div className="mx-auto max-w-5xl px-5 py-12 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="w-fit mx-auto rounded-full border border-[#241a14]/10 bg-white/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#8c6048]">
            Get In Touch
          </p>
          <h1 className="mt-6 text-4xl md:text-5xl font-semibold tracking-tight">Contact Us 📬</h1>
          <p className="mt-3 text-[#7b6f66] max-w-xl mx-auto text-sm md:text-base">
            Have a question, complaint or just want to say hello? We'd love to hear from you!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
              <h3 className="text-xl font-semibold mb-6">Let's Talk 💬</h3>
              <div className="space-y-5">
                {[
                  { icon: '📧', title: 'Email', value: config.email, sub: 'We reply within 24 hours' },
                  { icon: '📱', title: 'WhatsApp', value: config.phone, sub: 'Mon-Sat, 9am to 6pm' },
                  { icon: '📍', title: 'Location', value: config.location, sub: 'India' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#f6f1ea] border border-[#241a14]/10 flex items-center justify-center text-xl flex-shrink-0">{item.icon}</div>
                    <div>
                      <p className="text-xs text-[#9b8f86] mb-1">{item.title}</p>
                      <p className="font-semibold text-sm">{item.value}</p>
                      <p className="text-xs text-[#9b8f86] mt-1">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
              <h3 className="text-lg font-semibold mb-4">Follow Us 🌐</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: '📸', name: 'Instagram', href: config.social.instagram },
                  { icon: '🐦', name: 'Twitter', href: config.social.twitter },
                  { icon: '▶️', name: 'YouTube', href: config.social.youtube }
                ].map((social, i) => (
                  <a key={i} href={social.href}>
                    <div className="rounded-2xl bg-[#f6f1ea] border border-[#241a14]/10 p-3 text-center hover:bg-white transition cursor-pointer">
                      <p className="text-2xl mb-1">{social.icon}</p>
                      <p className="text-xs text-[#7b6f66]">{social.name}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Answers ⚡</h3>
              <div className="space-y-4">
                {[
                  { q: 'How long does delivery take?', a: 'Usually 3-7 business days depending on your location.' },
                  { q: 'Can I return a product?', a: 'Yes! We have a hassle-free return policy within 7 days.' },
                  { q: 'Are the electronics tested?', a: 'Yes, all secondhand electronics are tested before listing.' }
                ].map((faq, i) => (
                  <div key={i} className="border-b border-[#241a14]/10 pb-4 last:border-0 last:pb-0">
                    <p className="text-sm font-semibold mb-1">{faq.q}</p>
                    <p className="text-xs text-[#7b6f66]">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Send a Message ✉️</h3>
              {/* Badge showing logged in or guest */}
              {loggedInUser ? (
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700">
                  ✓ Signed In
                </span>
              ) : (
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                  👤 Guest
                </span>
              )}
            </div>

            {/* Info banner for guests */}
            {!loggedInUser && (
              <div className="mb-5 rounded-2xl bg-blue-50 border border-blue-200 p-4">
                <p className="text-xs text-blue-700 font-semibold mb-1">💡 Have an account?</p>
                <p className="text-xs text-blue-600">
                  <a href="/auth/login?redirect=/contact" className="underline font-semibold">Sign in</a> for faster support — we can link your message to your orders automatically.
                </p>
              </div>
            )}

            {/* Info banner for logged in users */}
            {loggedInUser && (
              <div className="mb-5 rounded-2xl bg-green-50 border border-green-200 p-4">
                <p className="text-xs text-green-700 font-semibold">✓ Sending as {loggedInUser.name}</p>
                <p className="text-xs text-green-600 mt-0.5">Your message will be linked to your account for faster support.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-[#7b6f66] mb-1 block">Full Name</label>
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  readOnly={!!loggedInUser}
                  className={`w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm text-[#171313] placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition ${loggedInUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-[#7b6f66] mb-1 block">Email Address</label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  readOnly={!!loggedInUser}
                  className={`w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm text-[#171313] placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition ${loggedInUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                  required
                />
              </div>

              {/* WhatsApp field */}
              <div>
                <label className="text-sm text-[#7b6f66] mb-1 block">
                  WhatsApp Number <span className="text-[#9b8f86] text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">💬</span>
                  <input
                    type="tel"
                    placeholder="Your WhatsApp number for quick reply"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] pl-10 pr-4 py-3 text-sm text-[#171313] placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition"
                  />
                </div>
                <p className="text-xs text-[#8c6048] mt-1.5">📲 Adding WhatsApp helps us reply faster!</p>
              </div>

              <div>
                <label className="text-sm text-[#7b6f66] mb-1 block">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Order issue, Product query..."
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm text-[#171313] placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-[#7b6f66] mb-1 block">Message</label>
                <textarea
                  placeholder="Tell us how we can help you..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm text-[#171313] placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition resize-none"
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={submitting}
                className="w-full rounded-full bg-[#171313] py-3.5 text-sm font-semibold text-white transition hover:bg-[#3a2a21] disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Send Message 📬'}
              </motion.button>
              <p className="text-center text-xs text-[#9b8f86]">We typically respond within 24 hours</p>
            </form>
          </motion.div>
        </div>
      </div>

      <footer className="border-t border-[#241a14]/10 px-5 py-10">
        <p className="text-center text-sm text-[#9b8f86]">{config.copyright}</p>
      </footer>
    </main>
  )
}