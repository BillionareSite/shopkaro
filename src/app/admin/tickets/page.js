'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function AdminTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [replyForm, setReplyForm] = useState({})
  const [updating, setUpdating] = useState(null)
  const [userOrders, setUserOrders] = useState({})
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
    if (!reply) return
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
    if (status === 'resolved') return 'text-green-400 bg-green-500/20 border-green-800'
    return 'text-yellow-400 bg-yellow-500/20 border-yellow-800'
  }

  return (
    <main className="min-h-screen bg-black text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-2xl font-bold">ShopKaro</a>
        <span className="text-gray-400 text-sm">Admin — Support Tickets</span>
        <div className="flex items-center gap-4">
          <a href="/admin" className="text-sm text-gray-400 hover:text-white transition">← Dashboard</a>
          <a href="/admin/orders" className="text-sm text-gray-400 hover:text-white transition">📦 Orders</a>
          <a href="/admin/stats" className="text-sm text-gray-400 hover:text-white transition">📊 Stats</a>
          <button
            onClick={async () => {
              await fetch('/api/admin/logout', { method: 'POST' })
              window.location.href = '/admin-login'
            }}
            className="text-sm border border-red-900 text-red-500 px-3 py-1 rounded-lg hover:bg-red-500 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
          <h2 className="text-3xl font-bold">Support Tickets</h2>
          <div className="flex gap-3 text-sm flex-wrap">
            <span className="text-yellow-400 bg-yellow-500/20 border border-yellow-800 px-3 py-1 rounded-full">
              Open: {tickets.filter(t => t.status === 'open').length}
            </span>
            <span className="text-green-400 bg-green-500/20 border border-green-800 px-3 py-1 rounded-full">
              Resolved: {tickets.filter(t => t.status === 'resolved').length}
            </span>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111] border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition"
          />
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-20">Loading tickets...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🎧</p>
            <p className="text-gray-500">No tickets yet!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((ticket, i) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#111] border border-gray-800 rounded-2xl p-6"
              >
                {/* Ticket Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-bold text-lg">{ticket.subject}</p>
                    <p className="text-sm text-gray-400 mt-1">{ticket.name} — {ticket.email}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColor(ticket.status)}`}>
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </span>
                </div>

                {/* Message */}
                <div className="bg-[#1a1a1a] rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-2">User Message</p>
                  <p className="text-sm text-gray-200">{ticket.message}</p>
                </div>

                {/* View Order History */}
                <button
                  onClick={() => fetchUserOrders(ticket.email)}
                  className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-white px-3 py-1 rounded-lg transition mb-4"
                >
                  {expandedUser === ticket.email ? '▲ Hide Order History' : '▼ View Order History'}
                </button>

                {/* Order History */}
                {expandedUser === ticket.email && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 bg-[#1a1a1a] border border-gray-800 rounded-xl p-4"
                  >
                    <p className="text-xs text-gray-500 mb-3">Order History for {ticket.email}</p>
                    {!userOrders[ticket.email] || userOrders[ticket.email].length === 0 ? (
                      <p className="text-gray-600 text-sm">No orders found</p>
                    ) : (
                      <div className="space-y-2">
                        {userOrders[ticket.email].map(order => (
                          <div key={order.id} className="flex items-center justify-between bg-[#222] rounded-xl p-3">
                            <div>
                              <p className="text-xs font-mono text-gray-400">#{order.id.slice(-8).toUpperCase()}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                })}
                              </p>
                              <p className="text-xs text-gray-500">{order.items.length} item(s)</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold">₹{order.total}</p>
                              <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                                order.status === 'delivered' ? 'text-green-400 bg-green-500/20 border-green-800' :
                                order.status === 'confirmed' ? 'text-blue-400 bg-blue-500/20 border-blue-800' :
                                order.status === 'cancelled' ? 'text-red-400 bg-red-500/20 border-red-800' :
                                'text-yellow-400 bg-yellow-500/20 border-yellow-800'
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

                {/* Existing Reply */}
                {ticket.reply && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                    <p className="text-xs text-green-400 mb-2">✅ Your Reply</p>
                    <p className="text-sm text-gray-200">{ticket.reply}</p>
                  </div>
                )}

                {/* Success Message */}
                {successMessage[ticket.id] && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-400 text-sm mb-3"
                  >
                    ✅ {successMessage[ticket.id]}
                  </motion.p>
                )}

                {/* Reply Box */}
                <div className="space-y-3">
                  <textarea
                    placeholder="Type your reply here..."
                    value={replyForm[ticket.id] || ''}
                    onChange={(e) => setReplyForm(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                    rows={3}
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition resize-none"
                  />

                  {/* Separate Buttons */}
                  <div className="flex flex-wrap gap-3">

                    {/* Reply Only Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleReply(ticket.id)}
                      disabled={updating === ticket.id + '_reply' || !replyForm[ticket.id]}
                      className="flex-1 bg-white text-black font-semibold py-2 rounded-xl hover:bg-gray-100 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating === ticket.id + '_reply' ? 'Sending...' : '💬 Send Reply'}
                    </motion.button>

                    {/* Resolve Button */}
                    {ticket.status === 'open' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleResolve(ticket.id)}
                        disabled={updating === ticket.id + '_resolve'}
                        className="flex-1 bg-green-500 text-white font-semibold py-2 rounded-xl hover:bg-green-600 transition text-sm disabled:opacity-50"
                      >
                        {updating === ticket.id + '_resolve' ? 'Resolving...' : '✅ Mark Resolved'}
                      </motion.button>
                    )}

                    {/* Reopen Button */}
                    {ticket.status === 'resolved' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleReopen(ticket.id)}
                        disabled={updating === ticket.id + '_reopen'}
                        className="flex-1 border border-yellow-800 text-yellow-400 font-semibold py-2 rounded-xl hover:bg-yellow-500 hover:text-black transition text-sm disabled:opacity-50"
                      >
                        {updating === ticket.id + '_reopen' ? 'Reopening...' : '🔄 Reopen Ticket'}
                      </motion.button>
                    )}

                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}