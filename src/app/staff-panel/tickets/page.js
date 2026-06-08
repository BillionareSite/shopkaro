'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import config from '@/lib/config'

export default function StaffTickets() {
  const [admin, setAdmin] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedTicket, setExpandedTicket] = useState(null)
  const [replyForm, setReplyForm] = useState({})
  const [sendingReply, setSendingReply] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('sub_admin_token')
    if (!token) { window.location.href = '/staff-login'; return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        localStorage.removeItem('sub_admin_token')
        window.location.href = '/staff-login'
        return
      }
      const perms = Array.isArray(payload.permissions) ? payload.permissions : []
      if (!perms.includes('view_tickets')) { window.location.href = '/staff-panel'; return }
      setAdmin(payload)
      setPermissions(perms)
      fetchTickets()
    } catch { window.location.href = '/staff-login' }
  }, [])

  const fetchTickets = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/tickets')
    const data = await res.json()
    setTickets(data.tickets || [])
    setLoading(false)
  }

  const handleReply = async (ticketId) => {
    if (!permissions.includes('reply_tickets')) { alert('No permission to reply.'); return }
    const text = replyForm[ticketId]
    if (!text?.trim()) return
    setSendingReply(ticketId)
    await fetch('/api/admin/tickets/' + ticketId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: text })
    })
    setSendingReply(null)
    setReplyForm(prev => ({ ...prev, [ticketId]: '' }))
    fetchTickets()
  }

  const handleResolve = async (id, status) => {
    if (!permissions.includes('reply_tickets')) { alert('No permission.'); return }
    await fetch('/api/admin/tickets/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    fetchTickets()
  }

  const statusColor = (s) => s === 'resolved' ? 'text-green-700 bg-green-50 border-green-200' : 'text-amber-700 bg-amber-50 border-amber-200'

  if (!admin) return <main className="min-h-screen bg-[#f6f1ea] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-[#171313] border-t-transparent animate-spin"/></main>

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171313]">
      <header className="sticky top-0 z-50 border-b border-[#241a14]/10 bg-[#f6f1ea]/95 backdrop-blur-xl px-5 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/staff-panel" className="text-sm text-[#7b6f66] hover:text-[#171313] transition">← Panel</a>
            <span className="text-lg font-semibold">🎧 Support Tickets</span>
          </div>
          <button onClick={() => { localStorage.removeItem('sub_admin_token'); window.location.href = '/staff-login' }} className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100">Logout</button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-8 pb-16 space-y-4">
        <div className="flex gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full border text-amber-700 bg-amber-50 border-amber-200">Open: {tickets.filter(t => t.status === 'open').length}</span>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full border text-green-700 bg-green-50 border-green-200">Resolved: {tickets.filter(t => t.status === 'resolved').length}</span>
        </div>

        {loading ? (
          <div className="text-center py-20"><div className="w-8 h-8 rounded-full border-2 border-[#171313] border-t-transparent animate-spin mx-auto"/></div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 rounded-[2rem] border border-[#241a14]/10 bg-white/55"><p className="text-4xl mb-4">🎧</p><p className="text-[#7b6f66]">No tickets yet!</p></div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const messages = Array.isArray(ticket.messages) ? ticket.messages : []
              const isExpanded = expandedTicket === ticket.id
              return (
                <div key={ticket.id} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 overflow-hidden">
                  <button onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)} className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-[#f9f6f2] transition">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{ticket.subject}</p>
                      <p className="text-sm text-[#7b6f66] mt-0.5">{ticket.name} · {ticket.email}</p>
                      <p className="text-xs text-[#9b8f86] mt-0.5">{messages.length} messages</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColor(ticket.status)}`}>{ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}</span>
                      <span className="text-[#9b8f86] text-sm">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-[#241a14]/10">
                        <div className="p-4 space-y-3 max-h-72 overflow-y-auto bg-[#f6f1ea]">
                          {messages.map((msg, j) => (
                            <div key={j} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.sender === 'admin' ? 'bg-[#171313] text-white rounded-br-sm' : 'bg-white border border-[#241a14]/10 text-[#171313] rounded-bl-sm'}`}>
                                <p className={`text-xs font-semibold mb-1 ${msg.sender === 'admin' ? 'text-white/60' : 'text-[#8c6048]'}`}>{msg.sender === 'admin' ? 'Support Team' : ticket.name}</p>
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {permissions.includes('reply_tickets') && (
                          <div className="p-4 border-t border-[#241a14]/10 bg-white">
                            <div className="flex gap-2">
                              <textarea
                                placeholder="Type your reply..."
                                value={replyForm[ticket.id] || ''}
                                onChange={(e) => setReplyForm(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                                rows={2}
                                className="flex-1 rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-2.5 text-sm placeholder-[#9b8f86] focus:outline-none transition resize-none"
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(ticket.id) } }}
                              />
                              <div className="flex flex-col gap-2">
                                <button onClick={() => handleReply(ticket.id)} disabled={sendingReply === ticket.id || !replyForm[ticket.id]?.trim()} className="rounded-full bg-[#171313] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
                                  {sendingReply === ticket.id ? '...' : 'Send'}
                                </button>
                                <button onClick={() => handleResolve(ticket.id, ticket.status === 'resolved' ? 'open' : 'resolved')} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${ticket.status === 'resolved' ? 'border border-amber-200 bg-amber-50 text-amber-700' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                                  {ticket.status === 'resolved' ? 'Reopen' : 'Resolve'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        {!permissions.includes('reply_tickets') && (
                          <div className="p-4 border-t border-[#241a14]/10 bg-[#f6f1ea] text-center">
                            <p className="text-xs text-[#9b8f86] italic">View only — no permission to reply</p>
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
      </div>
    </main>
  )
}