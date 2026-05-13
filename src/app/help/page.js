'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

export default function Help() {
  const [form, setForm] = useState({ subject: '', message: '' })
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/auth/login?redirect=/help'
      return
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser(payload)
      fetchTickets(payload.email)
    } catch {
      window.location.href = '/auth/login'
    }
  }, [])

  const fetchTickets = (email) => {
    fetch('/api/tickets?email=' + email)
      .then(res => res.json())
      .then(data => {
        setTickets(data.tickets || [])
        setLoading(false)
      })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.subject || !form.message) return
    setSubmitting(true)
    setMessage('')

    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: user.name,
        email: user.email,
        subject: form.subject,
        message: form.message
      })
    })

    const data = await res.json()
    setSubmitting(false)

    if (res.ok) {
      setMessage('Ticket submitted successfully!')
      setForm({ subject: '', message: '' })
      fetchTickets(user.email)
    } else {
      setMessage(data.message)
    }
  }

  const statusColor = (status) => {
    if (status === 'resolved') return 'text-green-400 bg-green-500/20 border-green-800'
    return 'text-yellow-400 bg-yellow-500/20 border-yellow-800'
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-8 pb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold mb-2"
        >
          Help & Support 🎧
        </motion.h2>
        <p className="text-gray-400 text-sm mb-8">Submit a query and we'll get back to you as soon as possible!</p>

        {/* Submit Ticket */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111] border border-gray-800 rounded-2xl p-6 mb-8"
        >
          <h3 className="text-lg font-bold mb-6">Submit a Query</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Subject</label>
              <input
                type="text"
                placeholder="e.g. Order not delivered"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Message</label>
              <textarea
                placeholder="Describe your issue in detail..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition resize-none"
                required
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={submitting}
              className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-100 transition"
            >
              {submitting ? 'Submitting...' : 'Submit Query'}
            </motion.button>
            {message && (
              <p className={`text-center text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                {message}
              </p>
            )}
          </form>
        </motion.div>

        {/* Previous Tickets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111] border border-gray-800 rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold mb-6">Your Queries</h3>

          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">🎧</p>
              <p className="text-gray-500 text-sm">No queries yet!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map(ticket => (
                <div key={ticket.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-sm">{ticket.subject}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border flex-shrink-0 ${statusColor(ticket.status)}`}>
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </span>
                  </div>

                  <div className="bg-[#222] rounded-xl p-3 mb-3">
                    <p className="text-xs text-gray-500 mb-1">Your Message</p>
                    <p className="text-sm text-gray-300">{ticket.message}</p>
                  </div>

                  {ticket.reply && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <p className="text-xs text-green-400 mb-1">✅ Admin Reply</p>
                      <p className="text-sm text-gray-200">{ticket.reply}</p>
                    </div>
                  )}

                  {!ticket.reply && (
                    <p className="text-xs text-gray-600 italic">Waiting for reply...</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  )
}