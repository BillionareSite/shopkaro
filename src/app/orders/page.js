'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import config from '@/lib/config'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [filter, setFilter] = useState('All')
  const [viewBill, setViewBill] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { window.location.href = '/auth/login?redirect=/orders'; return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser(payload)
      fetch('/api/orders?email=' + payload.email)
        .then(res => res.json())
        .then(data => { setOrders(data.orders || []); setLoading(false) })
    } catch { window.location.href = '/auth/login' }
  }, [])

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

  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter)

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

  if (!user) return (
    <main className="min-h-screen bg-[#f6f1ea] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#171313] border-t-transparent animate-spin"/>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171313]">
      <Navbar />

      <div className="mx-auto max-w-3xl px-5 py-10 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c6048]">Account</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">My Orders 📦</h1>
          <p className="mt-1 text-sm text-[#7b6f66]">Track and manage all your orders</p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: orders.length, color: 'text-[#171313]' },
            { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: 'text-amber-600' },
            { label: 'Confirmed', value: orders.filter(o => o.status === 'confirmed').length, color: 'text-blue-600' },
            { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: 'text-green-600' }
          ].map((stat, i) => (
            <div key={i} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-4 text-center">
              <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-[#9b8f86] mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto mb-6 pb-1">
          {['All', 'pending', 'confirmed', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition flex-shrink-0 ${filter === status ? 'bg-[#171313] text-white' : 'border border-[#241a14]/15 bg-white/55 text-[#6d625a] hover:bg-white/80'}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#171313] border-t-transparent animate-spin mx-auto mb-3"/>
            <p className="text-sm text-[#7b6f66]">Loading orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 rounded-[2rem] border border-[#241a14]/10 bg-white/55">
            <p className="text-4xl mb-4">📦</p>
            <p className="text-lg font-semibold mb-2">No orders found!</p>
            <p className="text-sm text-[#7b6f66] mb-8">{filter === 'All' ? "You haven't placed any orders yet." : `No ${filter} orders found.`}</p>
            {filter === 'All' ? (
              <a href="/products"><button className="rounded-full bg-[#171313] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#3a2a21]">Start Shopping</button></a>
            ) : (
              <button onClick={() => setFilter('All')} className="rounded-full border border-[#241a14]/15 px-6 py-2.5 text-sm font-medium text-[#6d625a] transition hover:bg-white/80">View All Orders</button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order, i) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 overflow-hidden">

                {/* Order Header */}
                <div className="p-5 border-b border-[#241a14]/10">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <p className="text-xs text-[#9b8f86]">Order ID</p>
                        <p className="font-mono font-bold text-sm">{order.orderId || '#' + order.id.slice(-8).toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#9b8f86]">Date</p>
                        <p className="text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#9b8f86]">Payment</p>
                        <p className="text-sm">{paymentLabels[order.paymentMethod] || 'COD'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#9b8f86]">Total</p>
                        <p className="text-sm font-bold">₹{order.total}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColor(order.status)}`}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </span>
                      <button onClick={() => setViewBill(order)} className="text-xs px-3 py-1.5 rounded-full border border-[#241a14]/15 text-[#6d625a] hover:bg-[#f6f1ea] transition">🧾 Bill</button>
                      <button onClick={() => printBill(order)} className="text-xs px-3 py-1.5 rounded-full border border-[#241a14]/15 text-[#6d625a] hover:bg-[#f6f1ea] transition">🖨️ Print</button>
                    </div>
                  </div>
                </div>

                {/* Payment Verification Pending Notice */}
                {(order.paymentMethod === 'upi' || order.paymentMethod === 'bank') && !order.paymentVerified && order.status === 'pending' && (
                  <div className="px-5 py-3 bg-amber-50 border-b border-amber-200">
                    <p className="text-xs text-amber-700 font-semibold">⏳ Payment verification pending — Your order will be confirmed once we verify your payment.</p>
                  </div>
                )}

                {/* Items */}
                <div className="p-5 space-y-3">
                  {order.items?.map((item, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#eadfd4]">
                        {item.images?.[0] ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover"/> : <div className="grid h-full place-items-center text-lg">🛍️</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.name}</p>
                        <p className="text-xs text-[#9b8f86]">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                      <p className="text-sm font-semibold flex-shrink-0">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                {/* Delivery + Timeline */}
                <div className="px-5 pb-5">
                  <div className="rounded-2xl bg-[#f6f1ea] border border-[#241a14]/10 p-4 flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#9b8f86] mb-1">📍 Delivery Address</p>
                      <p className="text-sm text-[#6f6258]">{order.address}, {order.pincode}</p>
                      <p className="text-xs text-[#9b8f86] mt-1">📱 {order.phone}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-[#9b8f86] mb-1">Amount Paid</p>
                      <p className="text-lg font-semibold">₹{order.total}</p>
                      {order.discount > 0 && <p className="text-xs text-green-600">Saved ₹{order.discount}</p>}
                    </div>
                  </div>

                  {/* Status Timeline */}
                  {order.status !== 'cancelled' && (
                    <div className="flex items-center gap-1">
                      {['pending', 'confirmed', 'delivered'].map((s, index) => (
                        <div key={s} className="flex items-center gap-1 flex-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${['pending', 'confirmed', 'delivered'].indexOf(order.status) >= index ? 'bg-[#171313] text-white' : 'bg-[#f6f1ea] border border-[#241a14]/15 text-[#9b8f86]'}`}>
                            {index + 1}
                          </div>
                          <p className={`text-xs flex-1 ${['pending', 'confirmed', 'delivered'].indexOf(order.status) >= index ? 'text-[#171313] font-medium' : 'text-[#9b8f86]'}`}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </p>
                          {index < 2 && (
                            <div className={`h-0.5 flex-1 ${['pending', 'confirmed', 'delivered'].indexOf(order.status) > index ? 'bg-[#171313]' : 'bg-[#241a14]/10'}`}/>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {order.status === 'cancelled' && (
                    <p className="text-xs text-red-500 font-semibold">❌ This order was cancelled</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Bill Modal */}
      <AnimatePresence>
        {viewBill && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setViewBill(null) }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[1.4rem] w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="bg-[#171313] rounded-t-[1.4rem] p-6 text-center">
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
                    <div key={i} className="rounded-2xl bg-[#f6f1ea] border border-[#241a14]/10 px-4 py-3">
                      <p className="text-xs text-[#9b8f86] mb-1">{item.label}</p>
                      <p className="text-sm font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl bg-[#f6f1ea] border border-[#241a14]/10 p-4">
                  <p className="text-xs text-[#9b8f86] mb-2 font-semibold uppercase tracking-wider">Billed To</p>
                  <p className="font-semibold">{viewBill.name}</p>
                  <p className="text-sm text-[#7b6f66] mt-1">{viewBill.email}</p>
                  <p className="text-sm text-[#7b6f66]">📱 {viewBill.phone}</p>
                  <p className="text-sm text-[#7b6f66]">📍 {viewBill.address}, {viewBill.pincode}</p>
                </div>
                <div>
                  <p className="text-xs text-[#9b8f86] mb-3 font-semibold uppercase tracking-wider">Items Ordered</p>
                  <div className="space-y-2">
                    {(viewBill.items || []).map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-[#f6f1ea] rounded-2xl p-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#eadfd4]">
                          {item.images?.[0] ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover"/> : <div className="grid h-full place-items-center">🛍️</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{item.name}</p>
                          <p className="text-xs text-[#9b8f86]">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <p className="text-sm font-bold flex-shrink-0">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-[#f6f1ea] border border-[#241a14]/10 p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-[#7b6f66]">Subtotal</span><span>₹{viewBill.total + (viewBill.discount || 0)}</span></div>
                    {viewBill.discount > 0 && <div className="flex justify-between text-sm"><span className="text-green-600">Coupon ({viewBill.couponCode})</span><span className="text-green-600">−₹{viewBill.discount}</span></div>}
                    <div className="flex justify-between text-sm"><span className="text-[#7b6f66]">Delivery</span><span className="text-green-600">FREE</span></div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-[#241a14]/10"><span>Grand Total</span><span>₹{viewBill.total}</span></div>
                  </div>
                </div>
                <p className="text-center text-xs text-[#9b8f86]">Thank you for shopping with {config.brandName}! · {config.domain}</p>
                <div className="flex gap-3">
                  <button onClick={() => setViewBill(null)} className="flex-1 rounded-full border border-[#241a14]/15 py-3 text-sm font-semibold text-[#6d625a] transition hover:bg-[#f6f1ea]">Close</button>
                  <button onClick={() => printBill(viewBill)} className="flex-1 rounded-full bg-[#171313] py-3 text-sm font-semibold text-white transition hover:bg-[#3a2a21]">🖨️ Print</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t border-[#241a14]/10 px-5 py-10">
        <p className="text-center text-sm text-[#9b8f86]">{config.copyright}</p>
      </footer>
    </main>
  )
}