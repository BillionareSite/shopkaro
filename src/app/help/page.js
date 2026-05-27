'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import config from '@/lib/config'

export default function Help() {
  const [form, setForm] = useState({ subject: '', message: '' })
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const [expandedTicket, setExpandedTicket] = useState(null)
  const [replyText, setReplyText] = useState({})
  const [sendingReply, setSendingReply] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { window.location.href = '/auth/login?redirect=/help'; return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser(payload)
      fetchTickets(payload.email)
    } catch { window.location.href = '/auth/login' }
  }, [])

  const fetchTickets = (email) => {
    fetch('/api/tickets?email=' + email)
      .then(res => res.json())
      .then(data => { setTickets(data.tickets || []); setLoading(false) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.subject || !form.message) return
    setSubmitting(true)
    setMessage('')
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: user.name, email: user.email, subject: form.subject, message: form.message })
    })
    const data = await res.json()
    setSubmitting(false)
    if (res.ok) {
      setMessage('Ticket submitted successfully!')
      setForm({ subject: '', message: '' })
      setShowForm(false)
      fetchTickets(user.email)
    } else {
      setMessage(data.message)
    }
  }

  const handleReply = async (ticketId) => {
    const text = replyText[ticketId]
    if (!text?.trim()) return
    setSendingReply(ticketId)
    const res = await fetch('/api/tickets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ticketId, text, email: user.email })
    })
    const data = await res.json()
    setSendingReply(null)
    if (res.ok) {
      setReplyText(prev => ({ ...prev, [ticketId]: '' }))
      fetchTickets(user.email)
    } else {
      alert(data.message)
    }
  }

  const statusColor = (status) => {
    if (status === 'resolved') return 'text-green-700 bg-green-50 border-green-200'
    return 'text-amber-700 bg-amber-50 border-amber-200'
  }

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171313]">
      <Navbar />

      <div className="mx-auto max-w-3xl px-5 py-10 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c6048]">Support</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Help & Support 🎧</h1>
            <p className="mt-1 text-sm text-[#7b6f66]">Submit a query and we'll get back to you as soon as possible!</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(!showForm)}
            className="rounded-full bg-[#171313] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3a2a21] flex-shrink-0"
          >
            {showForm ? '✕ Cancel' : '+ New Query'}
          </motion.button>
        </motion.div>

        {/* Submit Ticket Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
                <h3 className="text-lg font-semibold mb-6">Submit a New Query</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm text-[#7b6f66] mb-1 block">Subject</label>
                    <input
                      type="text"
                      placeholder="e.g. Order not delivered"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm text-[#171313] placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#7b6f66] mb-1 block">Message</label>
                    <textarea
                      placeholder="Describe your issue in detail..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={4}
                      className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm text-[#171313] placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition resize-none"
                      required
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={submitting}
                    className="w-full rounded-full bg-[#171313] py-3.5 text-sm font-semibold text-white transition hover:bg-[#3a2a21]"
                  >
                    {submitting ? 'Submitting...' : 'Submit Query'}
                  </motion.button>
                  {message && (
                    <p className={`text-center text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>
                  )}
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tickets List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
          <h3 className="text-lg font-semibold mb-6">Your Queries</h3>

          {loading ? (
            <p className="text-sm text-[#7b6f66]">Loading...</p>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">🎧</p>
              <p className="text-sm text-[#7b6f66] mb-4">No queries yet!</p>
              <button
                onClick={() => setShowForm(true)}
                className="rounded-full bg-[#171313] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3a2a21]"
              >
                Submit your first query
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map(ticket => {
                const messages = Array.isArray(ticket.messages) ? ticket.messages : []
                const isExpanded = expandedTicket === ticket.id

                return (
                  <div key={ticket.id} className="rounded-2xl border border-[#241a14]/10 bg-[#f6f1ea] overflow-hidden">
                    {/* Ticket Header */}
                    <button
                      onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                      className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-[#ede8e0] transition"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{ticket.subject}</p>
                        <p className="text-xs text-[#9b8f86] mt-0.5">
                          {new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}{messages.length} message{messages.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColor(ticket.status)}`}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </span>
                        <span className="text-[#9b8f86] text-sm">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </button>

                    {/* Expanded Conversation */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden border-t border-[#241a14]/10"
                        >
                          {/* Messages Thread */}
                          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                            {messages.length === 0 ? (
                              <p className="text-sm text-[#9b8f86] text-center py-4">No messages yet</p>
                            ) : (
                              messages.map((msg, i) => (
                                <div
                                  key={i}
                                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                    msg.sender === 'user'
                                      ? 'bg-[#171313] text-white rounded-br-sm'
                                      : 'bg-white border border-[#241a14]/10 text-[#171313] rounded-bl-sm'
                                  }`}>
                                    <p className={`text-xs font-semibold mb-1 ${msg.sender === 'user' ? 'text-white/60' : 'text-[#8c6048]'}`}>
                                      {msg.sender === 'user' ? 'You' : 'Support Team'}
                                    </p>
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-white/40' : 'text-[#9b8f86]'}`}>
                                      {new Date(msg.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              ))
                            )}
                            <div ref={bottomRef} />
                          </div>

                          {/* Reply Box */}
                          {ticket.status !== 'resolved' ? (
                            <div className="p-4 border-t border-[#241a14]/10 bg-white">
                              <div className="flex gap-3">
                                <textarea
                                  placeholder="Type your reply here..."
                                  value={replyText[ticket.id] || ''}
                                  onChange={(e) => setReplyText(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                                  rows={2}
                                  className="flex-1 rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm text-[#171313] placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition resize-none"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault()
                                      handleReply(ticket.id)
                                    }
                                  }}
                                />
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleReply(ticket.id)}
                                  disabled={sendingReply === ticket.id || !replyText[ticket.id]?.trim()}
                                  className="flex-shrink-0 rounded-full bg-[#171313] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#3a2a21] disabled:opacity-50 disabled:cursor-not-allowed self-end"
                                >
                                  {sendingReply === ticket.id ? '...' : 'Send'}
                                </motion.button>
                              </div>
                              <p className="text-xs text-[#9b8f86] mt-2">Press Enter to send, Shift+Enter for new line</p>
                            </div>
                          ) : (
                            <div className="p-4 border-t border-[#241a14]/10 bg-green-50 text-center">
                              <p className="text-sm text-green-700 font-medium">✅ This ticket has been resolved</p>
                              <button
                                onClick={() => setShowForm(true)}
                                className="text-xs text-green-600 hover:text-green-800 mt-1 underline"
                              >
                                Open a new query if you need more help
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      <footer className="border-t border-[#241a14]/10 px-5 py-10">
        <p className="text-center text-sm text-[#9b8f86]">{config.copyright}</p>
      </footer>
    </main>
  )
}