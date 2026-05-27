'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import config from '@/lib/config'

export default function AdminTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [replyForm, setReplyForm] = useState({})
  const [updating, setUpdating] = useState(null)
  const [userOrders, setUserOrders] = useState({})
  const [expandedTicket, setExpandedTicket] = useState(null)
  const [expandedUser, setExpandedUser] = useState(null)
  const [successMessage, setSuccessMessage] = useState({})

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = () => {
    fetch('/api/admin/tickets')
      .then(res => res.json())
      .then(data => {
        setTickets(data.tickets || [])
        setLoading(false)
      })
  }

  const fetchUserOrders = async (email) => {
    if (userOrders[email]) {
      setExpandedUser(expandedUser === email ? null : email)
      return
    }
    const res = await fetch('/api/orders?email=' + email)
    const data = await res.json()
    setUserOrders(prev => ({ ...prev, [email]: data.orders || [] }))
    setExpandedUser(email)
  }

  const handleReply = async (id) => {
    const reply = replyForm[id]
    if (!reply?.trim()) return
    setUpdating(id + '_reply')
    await fetch('/api/admin/tickets/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    })
    setUpdating(null)
    setSuccessMessage(prev => ({ ...prev, [id]: 'Reply sent!' }))
    setTimeout(() => setSuccessMessage(prev => ({ ...prev, [id]: '' })), 3000)
    setReplyForm(prev => ({ ...prev, [id]: '' }))
    fetchTickets()
  }

  const handleResolve = async (id) => {
    setUpdating(id + '_resolve')
    await fetch('/api/admin/tickets/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' })
    })
    setUpdating(null)
    setSuccessMessage(prev => ({ ...prev, [id]: 'Marked as resolved!' }))
    setTimeout(() => setSuccessMessage(prev => ({ ...prev, [id]: '' })), 3000)
    fetchTickets()
  }

  const handleReopen = async (id) => {
    setUpdating(id + '_reopen')
    await fetch('/api/admin/tickets/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'open' })
    })
    setUpdating(null)
    fetchTickets()
  }

  const filtered = tickets.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  )

  const statusColor = (status) => {
    if (status === 'resolved') return 'text-green-700 bg-green-50 border-green-200'
    return 'text-amber-700 bg-amber-50 border-amber-200'
  }

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171313]">

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#241a14]/10 bg-[#f6f1ea]/95 backdrop-blur-xl px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#171313] text-xs font-semibold text-white">{config.shortCode}</div>
            <span className="text-lg font-semibold">{config.brandName}</span>
          </a>
          <span className="text-sm text-[#7b6f66]">Admin — Support Tickets</span>
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-sm text-[#7b6f66] hover:text-[#171313] transition">← Dashboard</a>
            <a href="/admin/orders" className="text-sm text-[#7b6f66] hover:text-[#171313] transition">📦 Orders</a>
            <a href="/admin/stats" className="text-sm text-[#7b6f66] hover:text-[#171313] transition">📊 Stats</a>
            <button
              onClick={async () => {
                await fetch('/api/admin/logout', { method: 'POST' })
                window.location.href = '/admin-login'
              }}
              className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c6048]">Support</p>
            <h2 className="mt-1 text-3xl font-semibold">Support Tickets</h2>
          </div>
          <div className="flex gap-3 text-sm flex-wrap">
            <span className="text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs font-semibold">
              Open: {tickets.filter(t => t.status === 'open').length}
            </span>
            <span className="text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full text-xs font-semibold">
              Resolved: {tickets.filter(t => t.status === 'resolved').length}
            </span>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b8f86]">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-[#241a14]/15 bg-white pl-10 pr-4 py-3 text-sm text-[#171313] placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition"
          />
        </div>

        {loading ? (
          <p className="text-[#9b8f86] text-center py-20">Loading tickets...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 rounded-[2rem] border border-[#241a14]/10 bg-white/55">
            <p className="text-4xl mb-4">🎧</p>
            <p className="text-[#7b6f66]">No tickets yet!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((ticket, i) => {
              const messages = Array.isArray(ticket.messages) ? ticket.messages : []
              const isExpanded = expandedTicket === ticket.id

              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 overflow-hidden"
                >
                  {/* Ticket Header */}
                  <button
                    onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-[#f9f6f2] transition"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{ticket.subject}</p>
                      <p className="text-sm text-[#7b6f66] mt-0.5">{ticket.name} — {ticket.email}</p>
                      <p className="text-xs text-[#9b8f86] mt-0.5">
                        {new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden border-t border-[#241a14]/10"
                      >
                        {/* Conversation Thread */}
                        <div className="p-5 space-y-3 max-h-80 overflow-y-auto bg-[#f6f1ea]">
                          {messages.length === 0 ? (
                            <p className="text-sm text-[#9b8f86] text-center py-4">No messages in thread</p>
                          ) : (
                            messages.map((msg, i) => (
                              <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                  msg.sender === 'admin'
                                    ? 'bg-[#171313] text-white rounded-br-sm'
                                    : 'bg-white border border-[#241a14]/10 text-[#171313] rounded-bl-sm'
                                }`}>
                                  <p className={`text-xs font-semibold mb-1 ${msg.sender === 'admin' ? 'text-white/60' : 'text-[#8c6048]'}`}>
                                    {msg.sender === 'admin' ? 'Support Team' : ticket.name}
                                  </p>
                                  <p className="text-sm leading-relaxed">{msg.text}</p>
                                  <p className={`text-xs mt-1 ${msg.sender === 'admin' ? 'text-white/40' : 'text-[#9b8f86]'}`}>
                                    {new Date(msg.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* View Order History */}
                        <div className="px-5 py-3 border-t border-[#241a14]/10 bg-white">
                          <button
                            onClick={() => fetchUserOrders(ticket.email)}
                            className="text-xs text-[#7b6f66] hover:text-[#171313] border border-[#241a14]/15 px-3 py-1.5 rounded-full transition"
                          >
                            {expandedUser === ticket.email ? '▲ Hide Order History' : '▼ View Order History'}
                          </button>

                          {expandedUser === ticket.email && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-2xl border border-[#241a14]/10 bg-[#f6f1ea] p-4">
                              <p className="text-xs text-[#9b8f86] mb-3">Order History for {ticket.email}</p>
                              {!userOrders[ticket.email] || userOrders[ticket.email].length === 0 ? (
                                <p className="text-sm text-[#9b8f86]">No orders found</p>
                              ) : (
                                <div className="space-y-2">
                                  {userOrders[ticket.email].map(order => (
                                    <div key={order.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-[#241a14]/10">
                                      <div>
                                        <p className="text-xs font-mono text-[#7b6f66]">#{order.id.slice(-8).toUpperCase()}</p>
                                        <p className="text-xs text-[#9b8f86]">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        <p className="text-xs text-[#9b8f86]">{order.items.length} item(s)</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-semibold">₹{order.total}</p>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                                          order.status === 'delivered' ? 'text-green-700 bg-green-50 border-green-200' :
                                          order.status === 'confirmed' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                                          order.status === 'cancelled' ? 'text-red-700 bg-red-50 border-red-200' :
                                          'text-amber-700 bg-amber-50 border-amber-200'
                                        }`}>
                                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>

                        {/* Success Message */}
                        {successMessage[ticket.id] && (
                          <div className="px-5 py-2 bg-green-50 border-t border-green-100">
                            <p className="text-green-700 text-sm font-medium">✅ {successMessage[ticket.id]}</p>
                          </div>
                        )}

                        {/* Admin Reply Box */}
                        <div className="p-5 border-t border-[#241a14]/10 bg-white space-y-3">
                          <textarea
                            placeholder="Type your reply here..."
                            value={replyForm[ticket.id] || ''}
                            onChange={(e) => setReplyForm(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                            rows={3}
                            className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm text-[#171313] placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition resize-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleReply(ticket.id)
                              }
                            }}
                          />

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-3">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleReply(ticket.id)}
                              disabled={updating === ticket.id + '_reply' || !replyForm[ticket.id]?.trim()}
                              className="flex-1 rounded-full bg-[#171313] py-2.5 text-sm font-semibold text-white transition hover:bg-[#3a2a21] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updating === ticket.id + '_reply' ? 'Sending...' : '💬 Send Reply'}
                            </motion.button>

                            {ticket.status === 'open' && (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleResolve(ticket.id)}
                                disabled={updating === ticket.id + '_resolve'}
                                className="flex-1 rounded-full bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                              >
                                {updating === ticket.id + '_resolve' ? 'Resolving...' : '✅ Mark Resolved'}
                              </motion.button>
                            )}

                            {ticket.status === 'resolved' && (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleReopen(ticket.id)}
                                disabled={updating === ticket.id + '_reopen'}
                                className="flex-1 rounded-full border border-amber-200 bg-amber-50 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                              >
                                {updating === ticket.id + '_reopen' ? 'Reopening...' : '🔄 Reopen Ticket'}
                              </motion.button>
                            )}
                          </div>
                          <p className="text-xs text-[#9b8f86]">Press Enter to send, Shift+Enter for new line</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <footer className="border-t border-[#241a14]/10 px-5 py-10">
        <p className="text-center text-sm text-[#9b8f86]">{config.copyright}</p>
      </footer>
    </main>
  )
}