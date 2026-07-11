'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import config from '@/lib/config'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [updating, setUpdating] = useState(null)
  const [viewBill, setViewBill] = useState(null)
  const [viewScreenshot, setViewScreenshot] = useState(null)

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = () => {
    fetch('/api/admin/orders')
      .then(res => res.json())
      .then(data => { setOrders(data.orders || []); setLoading(false) })
  }

  const handleStatusUpdate = async (id, status) => {
    setUpdating(id + '_' + status)
    await fetch('/api/admin/orders/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    setUpdating(null)
    fetchOrders()
  }

  const handleVerifyPayment = async (id) => {
    setUpdating(id + '_verify')
    await fetch('/api/admin/orders/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentVerified: true, status: 'confirmed' })
    })
    setUpdating(null)
    fetchOrders()
  }

  const filtered = orders
    .filter(o => statusFilter === 'All' || o.status === statusFilter)
    .filter(o =>
      o.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.email?.toLowerCase().includes(search.toLowerCase()) ||
      o.phone?.includes(search) ||
      o.orderId?.toLowerCase().includes(search.toLowerCase())
    )

  const statusColor = (status) => {
    if (status === 'delivered') return 'text-green-700 bg-green-50 border-green-200'
    if (status === 'confirmed') return 'text-blue-700 bg-blue-50 border-blue-200'
    if (status === 'cancelled') return 'text-red-700 bg-red-50 border-red-200'
    return 'text-amber-700 bg-amber-50 border-amber-200'
  }

  const paymentLabels = {
    cod: 'Cash on Delivery',
    upi: 'UPI Payment',
    bank: 'Bank Transfer',
    card: 'Card Payment'
  }

  const printBill = (order) => {
    const items = order.items || []
    const subtotal = order.total + (order.discount || 0)
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${order.orderId}</title>
        <style>
          * { margin:0;padding:0;box-sizing:border-box; }
          body { font-family:Arial,sans-serif;font-size:13px;color:#171313;padding:32px; }
          .header { text-align:center;border-bottom:2px solid #171313;padding-bottom:16px;margin-bottom:20px; }
          .brand { font-size:24px;font-weight:800; }
          .tagline { font-size:11px;color:#9b8f86;margin-top:2px; }
          .invoice-title { font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-top:8px;color:#8c6048; }
          .meta { display:flex;justify-content:space-between;margin-bottom:20px;gap:8px; }
          .meta-box { background:#f6f1ea;border-radius:8px;padding:12px 16px;flex:1; }
          .meta-label { font-size:10px;color:#9b8f86;text-transform:uppercase;letter-spacing:0.1em; }
          .meta-value { font-size:13px;font-weight:700;margin-top:2px; }
          table { width:100%;border-collapse:collapse;margin-bottom:16px; }
          th { text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#9b8f86;padding:8px 0;border-bottom:2px solid #f0ebe4; }
          td { padding:10px 0;border-bottom:1px solid #f6f1ea;font-size:13px; }
          .totals { margin-left:auto;width:240px; }
          .total-row { display:flex;justify-content:space-between;padding:4px 0;font-size:13px; }
          .total-row.final { font-size:15px;font-weight:800;border-top:2px solid #171313;margin-top:8px;padding-top:8px; }
          .footer { text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #f0ebe4;font-size:11px;color:#9b8f86; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">${config.brandName}</div>
          <div class="tagline">${config.tagline}</div>
          <div class="invoice-title">Tax Invoice / Receipt</div>
        </div>
        <div class="meta">
          <div class="meta-box"><div class="meta-label">Order ID</div><div class="meta-value">${order.orderId}</div></div>
          <div class="meta-box"><div class="meta-label">Date</div><div class="meta-value">${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div></div>
          <div class="meta-box"><div class="meta-label">Payment</div><div class="meta-value">${paymentLabels[order.paymentMethod] || order.paymentMethod || 'N/A'}</div></div>
          <div class="meta-box"><div class="meta-label">Status</div><div class="meta-value">${order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}</div></div>
        </div>
        <div class="meta" style="margin-bottom:20px;">
          <div class="meta-box" style="flex:1;margin:0;">
            <div class="meta-label">Billed To</div>
            <div class="meta-value" style="margin-top:6px;">${order.name}</div>
            <div style="color:#6f6258;font-size:12px;margin-top:2px;">${order.email}</div>
            <div style="color:#6f6258;font-size:12px;margin-top:2px;">📱 ${order.phone}</div>
            <div style="color:#6f6258;font-size:12px;margin-top:2px;">📍 ${order.address}, ${order.pincode}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Unit Price</th>
              <th style="text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td style="color:#9b8f86;">${item.category || '-'}</td>
                <td style="text-align:center;">${item.quantity}</td>
                <td style="text-align:right;">₹${item.price}</td>
                <td style="text-align:right;font-weight:600;">₹${item.price * item.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="totals">
          <div class="total-row"><span>Subtotal</span><span>₹${subtotal}</span></div>
          ${order.discount > 0 ? `<div class="total-row" style="color:#22c55e;"><span>Coupon (${order.couponCode})</span><span>−₹${order.discount}</span></div>` : ''}
          <div class="total-row"><span>Delivery</span><span style="color:#22c55e;">FREE</span></div>
          <div class="total-row final"><span>Grand Total</span><span>₹${order.total}</span></div>
        </div>
        <div class="footer">
          <p>Thank you for shopping with ${config.brandName}!</p>
          <p style="margin-top:4px;">${config.copyright} · ${config.domain}</p>
        </div>
      </body>
      </html>
    `
    const win = window.open('', '_blank')
    win.document.write(printContent)
    win.document.close()
    win.print()
  }

  const pendingVerification = orders.filter(o => (o.paymentMethod === 'upi' || o.paymentMethod === 'bank') && !o.paymentVerified && o.status === 'pending')

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">

      <header className="sticky top-0 z-50 border-b border-[var(--border)]/10 bg-[var(--bg)]/95 backdrop-blur-xl px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            {config.logo ? <img src={config.logo} alt={config.brandName} className="h-9 w-9 rounded-full object-cover"/> : <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--btn-dark)] text-xs font-semibold text-white">{config.shortCode}</div>}
            <span className="text-lg font-semibold">{config.brandName}</span>
          </a>
          <span className="text-sm text-[var(--text-muted)]">Admin — Orders</span>
          <div className="flex items-center gap-3 flex-wrap">
            <a href="/admin" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">← Dashboard</a>
            <a href="/admin/stats" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">📊 Stats</a>
            <a href="/admin/tickets" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">🎧 Support</a>
            <a href="/admin/settings" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">⚙️ Settings</a>
            <button onClick={async () => { await fetch('/api/admin/logout', { method: 'POST' }); window.location.href = '/admin-login' }} className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100">Logout</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Management</p>
            <h2 className="mt-1 text-3xl font-semibold">Orders</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{orders.length} total orders</p>
          </div>
          <div className="flex gap-2 flex-wrap text-xs">
            {[
              { label: 'Pending Verification', color: 'text-orange-700 bg-orange-50 border-orange-200', count: pendingVerification.length },
              { label: 'Pending', color: 'text-amber-700 bg-amber-50 border-amber-200', count: orders.filter(o => o.status === 'pending').length },
              { label: 'Confirmed', color: 'text-blue-700 bg-blue-50 border-blue-200', count: orders.filter(o => o.status === 'confirmed').length },
              { label: 'Delivered', color: 'text-green-700 bg-green-50 border-green-200', count: orders.filter(o => o.status === 'delivered').length }
            ].map(s => (
              <span key={s.label} className={`font-semibold px-3 py-1 rounded-full border ${s.color}`}>{s.label}: {s.count}</span>
            ))}
          </div>
        </motion.div>

        {/* Pending Verification Alert */}
        {pendingVerification.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-orange-50 border border-orange-200 p-4 mb-6">
            <p className="text-sm font-semibold text-orange-700 mb-1">🔔 {pendingVerification.length} order{pendingVerification.length > 1 ? 's' : ''} awaiting payment verification</p>
            <p className="text-xs text-orange-600">Review payment screenshots and verify to confirm orders.</p>
          </motion.div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-placeholder)]">🔍</span>
          <input type="text" placeholder="Search by Order ID, name, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-full border border-[var(--border)]/15 bg-white pl-10 pr-4 py-3 text-sm placeholder-[var(--text-placeholder)] focus:outline-none focus:border-[var(--border)]/30 transition"/>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto mb-6 pb-1">
          {['All', 'pending', 'confirmed', 'delivered', 'cancelled'].map(status => (
            <button key={status} onClick={() => setStatusFilter(status)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition flex-shrink-0 ${statusFilter === status ? 'bg-[var(--btn-dark)] text-white' : 'border border-[var(--border)]/15 bg-white text-[var(--text-muted)] hover:bg-[var(--bg)]'}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#171313] border-t-transparent animate-spin mx-auto mb-3"/>
            <p className="text-sm text-[var(--text-muted)]">Loading orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 rounded-[2rem] border border-[var(--border)]/10 bg-[var(--bg-card)]/55">
            <p className="text-4xl mb-4">📦</p>
            <p className="text-[var(--text-muted)]">No orders found!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order, i) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-[1.4rem] bg-white shadow-lg shadow-[var(--shadow)]/5 overflow-hidden">

                {/* Payment Verification Alert */}
                {(order.paymentMethod === 'upi' || order.paymentMethod === 'bank') && !order.paymentVerified && order.status === 'pending' && (
                  <div className="px-5 py-3 bg-orange-50 border-b border-orange-200 flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-xs text-orange-700 font-semibold">🔔 Payment verification required</p>
                    <div className="flex items-center gap-2">
                      {order.paymentScreenshot && (
                        <button onClick={() => setViewScreenshot(order)} className="text-xs px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition">👁 View Screenshot</button>
                      )}
                      <button onClick={() => handleVerifyPayment(order.id)} disabled={updating === order.id + '_verify'} className="text-xs px-3 py-1.5 rounded-full bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50">
                        {updating === order.id + '_verify' ? 'Verifying...' : '✅ Verify & Confirm'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Payment Verified Badge */}
                {(order.paymentMethod === 'upi' || order.paymentMethod === 'bank') && order.paymentVerified && (
                  <div className="px-5 py-2 bg-green-50 border-b border-green-200">
                    <p className="text-xs text-green-700 font-semibold">✅ Payment Verified</p>
                  </div>
                )}

                {/* Order Header */}
                <div className="p-5 border-b border-[var(--border)]/10">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex flex-wrap gap-4">
                      <div><p className="text-xs text-[var(--text-placeholder)]">Order ID</p><p className="font-mono font-bold text-sm">{order.orderId || '#' + order.id.slice(-8).toUpperCase()}</p></div>
                      <div><p className="text-xs text-[var(--text-placeholder)]">Customer</p><p className="text-sm font-semibold">{order.name}</p><p className="text-xs text-[var(--text-placeholder)]">{order.email}</p></div>
                      <div><p className="text-xs text-[var(--text-placeholder)]">Phone</p><p className="text-sm">{order.phone}</p></div>
                      <div><p className="text-xs text-[var(--text-placeholder)]">Date</p><p className="text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
                      <div><p className="text-xs text-[var(--text-placeholder)]">Payment</p><p className="text-sm">{paymentLabels[order.paymentMethod] || order.paymentMethod || 'COD'}</p></div>
                      <div><p className="text-xs text-[var(--text-placeholder)]">Total</p><p className="text-sm font-bold">₹{order.total}</p>{order.discount > 0 && <p className="text-xs text-green-600">−₹{order.discount} ({order.couponCode})</p>}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColor(order.status)}`}>{order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}</span>
                      <button onClick={() => setViewBill(order)} className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)]/15 text-[var(--text-muted)] hover:bg-[var(--bg)] transition">🧾 Bill</button>
                      <button onClick={() => printBill(order)} className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)]/15 text-[var(--text-muted)] hover:bg-[var(--bg)] transition">🖨️ Print</button>
                    </div>
                  </div>
                </div>

                {/* Payment Proof Details */}
                {(order.paymentMethod === 'upi' || order.paymentMethod === 'bank') && (order.paymentSenderName || order.paymentUTR) && (
                  <div className="px-5 py-3 border-b border-[var(--border)]/10 bg-[var(--bg)]">
                    <p className="text-xs text-[var(--text-placeholder)] font-semibold uppercase tracking-wider mb-2">Payment Proof Details</p>
                    <div className="flex flex-wrap gap-4">
                      {order.paymentSenderName && <div><p className="text-xs text-[var(--text-placeholder)]">Sender Name</p><p className="text-sm font-semibold">{order.paymentSenderName}</p></div>}
                      {order.paymentUTR && <div><p className="text-xs text-[var(--text-placeholder)]">UTR / Transaction No.</p><p className="text-sm font-mono font-semibold">{order.paymentUTR}</p></div>}
                      {order.paymentScreenshot && (
                        <div>
                          <p className="text-xs text-[var(--text-placeholder)]">Screenshot</p>
                          <button onClick={() => setViewScreenshot(order)} className="text-xs text-blue-600 hover:text-blue-800 underline">View Screenshot</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="px-5 py-4">
                  <div className="space-y-2 mb-4">
                    {(order.items || []).map((item, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--bg-muted)]">
                          {item.images?.[0] ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover"/> : <div className="grid h-full place-items-center text-sm">🛍️</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{item.name}</p>
                          <p className="text-xs text-[var(--text-placeholder)]">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <p className="text-sm font-semibold flex-shrink-0">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <p className="text-xs text-[var(--text-placeholder)]">📍 {order.address}, {order.pincode}</p>
                    <div className="flex gap-2 flex-wrap">
                      {['pending', 'confirmed', 'delivered', 'cancelled'].map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(order.id, status)}
                          disabled={order.status === status || !!updating}
                          className={`text-xs px-3 py-1.5 rounded-full border transition ${order.status === status ? statusColor(status) + ' font-semibold' : 'border-[var(--border)]/15 text-[var(--text-muted)] hover:bg-[var(--bg)]'} disabled:opacity-50`}
                        >
                          {updating === order.id + '_' + status ? '...' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Screenshot Modal */}
      <AnimatePresence>
        {viewScreenshot && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setViewScreenshot(null) }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[1.4rem] w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-[var(--border)]/10 flex items-center justify-between">
                <div>
                  <p className="font-semibold">Payment Screenshot</p>
                  <p className="text-xs text-[var(--text-placeholder)]">{viewScreenshot.orderId} — {viewScreenshot.name}</p>
                </div>
                <button onClick={() => setViewScreenshot(null)} className="text-[var(--text-placeholder)] hover:text-[var(--text-primary)] text-xl">✕</button>
              </div>
              <div className="p-4">
                <div className="rounded-2xl overflow-hidden border border-[var(--border)]/10 mb-4">
                  <img src={viewScreenshot.paymentScreenshot} alt="Payment Screenshot" className="w-full object-contain max-h-96"/>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {viewScreenshot.paymentSenderName && (
                    <div className="rounded-2xl bg-[var(--bg)] border border-[var(--border)]/10 p-3">
                      <p className="text-xs text-[var(--text-placeholder)] mb-1">Sender Name</p>
                      <p className="text-sm font-semibold">{viewScreenshot.paymentSenderName}</p>
                    </div>
                  )}
                  {viewScreenshot.paymentUTR && (
                    <div className="rounded-2xl bg-[var(--bg)] border border-[var(--border)]/10 p-3">
                      <p className="text-xs text-[var(--text-placeholder)] mb-1">UTR / Transaction</p>
                      <p className="text-sm font-mono font-semibold">{viewScreenshot.paymentUTR}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setViewScreenshot(null)} className="flex-1 rounded-full border border-[var(--border)]/15 py-3 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-[var(--bg)]">Close</button>
                  {!viewScreenshot.paymentVerified && (
                    <button
                      onClick={() => { handleVerifyPayment(viewScreenshot.id); setViewScreenshot(null) }}
                      className="flex-1 rounded-full bg-green-600 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                      ✅ Verify & Confirm Order
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bill Modal */}
      <AnimatePresence>
        {viewBill && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setViewBill(null) }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[1.4rem] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="bg-[var(--btn-dark)] rounded-t-[1.4rem] p-6 text-center">
                <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Tax Invoice</p>
                <h2 className="text-white text-2xl font-bold">{config.brandName}</h2>
                <p className="text-white/50 text-xs mt-1">{config.tagline}</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Order ID', value: viewBill.orderId || '#' + viewBill.id.slice(-8).toUpperCase() },
                    { label: 'Date', value: new Date(viewBill.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                    { label: 'Payment', value: paymentLabels[viewBill.paymentMethod] || viewBill.paymentMethod || 'N/A' },
                    { label: 'Status', value: viewBill.status?.charAt(0).toUpperCase() + viewBill.status?.slice(1) }
                  ].map((item, i) => (
                    <div key={i} className="rounded-2xl bg-[var(--bg)] border border-[var(--border)]/10 px-4 py-3">
                      <p className="text-xs text-[var(--text-placeholder)] mb-1">{item.label}</p>
                      <p className="text-sm font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl bg-[var(--bg)] border border-[var(--border)]/10 p-4">
                  <p className="text-xs text-[var(--text-placeholder)] mb-2 font-semibold uppercase tracking-wider">Billed To</p>
                  <p className="font-semibold">{viewBill.name}</p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">{viewBill.email}</p>
                  <p className="text-sm text-[var(--text-muted)]">📱 {viewBill.phone}</p>
                  <p className="text-sm text-[var(--text-muted)]">📍 {viewBill.address}, {viewBill.pincode}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-placeholder)] mb-3 font-semibold uppercase tracking-wider">Items Ordered</p>
                  <div className="space-y-2">
                    {(viewBill.items || []).map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-[var(--bg)] rounded-2xl p-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--bg-muted)]">
                          {item.images?.[0] ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover"/> : <div className="grid h-full place-items-center">🛍️</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{item.name}</p>
                          <p className="text-xs text-[var(--text-placeholder)]">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <p className="text-sm font-bold flex-shrink-0">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-[var(--bg)] border border-[var(--border)]/10 p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-[var(--text-muted)]">Subtotal</span><span>₹{viewBill.total + (viewBill.discount || 0)}</span></div>
                    {viewBill.discount > 0 && <div className="flex justify-between text-sm"><span className="text-green-600">Coupon ({viewBill.couponCode})</span><span className="text-green-600">−₹{viewBill.discount}</span></div>}
                    <div className="flex justify-between text-sm"><span className="text-[var(--text-muted)]">Delivery</span><span className="text-green-600">FREE</span></div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-[var(--border)]/10"><span>Grand Total</span><span>₹{viewBill.total}</span></div>
                  </div>
                </div>
                <p className="text-center text-xs text-[var(--text-placeholder)]">Thank you for shopping with {config.brandName}!</p>
                <div className="flex gap-3">
                  <button onClick={() => setViewBill(null)} className="flex-1 rounded-full border border-[var(--border)]/15 py-3 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-[var(--bg)]">Close</button>
                  <button onClick={() => printBill(viewBill)} className="flex-1 rounded-full bg-[var(--btn-dark)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--btn-dark-hover)]">🖨️ Print Bill</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t border-[var(--border)]/10 px-5 py-10">
        <p className="text-center text-sm text-[var(--text-placeholder)]">{config.copyright}</p>
      </footer>
    </main>
  )
}