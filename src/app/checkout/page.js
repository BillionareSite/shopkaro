'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import config from '@/lib/config'

export default function Checkout() {
  const [cart, setCart] = useState([])
  const [form, setForm] = useState({ name: '', phone: '', address: '', pincode: '' })
  const [placing, setPlacing] = useState(false)
  const [ordered, setOrdered] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponId, setCouponId] = useState('')
  const [couponMessage, setCouponMessage] = useState('')
  const [couponError, setCouponError] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { window.location.href = '/auth/login?redirect=/checkout'; return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUserEmail(payload.email)
      setForm(f => ({ ...f, name: payload.name }))
    } catch { window.location.href = '/auth/login?redirect=/checkout'; return }
    const stored = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(stored)
  }, [])

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = Math.max(0, subtotal - discount)

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setApplyingCoupon(true)
    setCouponMessage('')
    setCouponError('')
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponInput.trim(),
          cartTotal: subtotal,
          email: userEmail,
          items: cart
        })
      })
      const data = await res.json()
      setApplyingCoupon(false)
      if (res.ok) {
        setDiscount(data.discount)
        setCouponCode(data.coupon.code)
        setCouponId(data.coupon.id)
        setCouponMessage(`🎉 ${data.coupon.code} applied! You save ₹${data.discount}`)
        setCouponError('')
      } else {
        setCouponError(data.message)
        setCouponMessage('')
      }
    } catch (err) {
      setApplyingCoupon(false)
      setCouponError('Something went wrong. Try again!')
    }
  }

  const handleRemoveCoupon = () => {
    setDiscount(0)
    setCouponCode('')
    setCouponId('')
    setCouponInput('')
    setCouponMessage('')
    setCouponError('')
  }

  const handlePlaceOrder = async () => {
    if (!form.name || !form.phone || !form.address || !form.pincode) { alert('Please fill all fields!'); return }
    if (cart.length === 0) { alert('Your cart is empty!'); return }
    setPlacing(true)
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        items: cart,
        total,
        email: userEmail,
        discount,
        couponCode,
        couponId
      })
    })
    const data = await res.json()
    setPlacing(false)
    if (res.ok) {
      localStorage.removeItem('cart')
      window.dispatchEvent(new Event('storage'))
      setOrderId(data.order.orderId)
      setOrdered(true)
    } else { alert(data.message) }
  }

  if (ordered) return (
    <main className="min-h-screen bg-[#f6f1ea] flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-3xl font-semibold text-[#171313] mb-3">Order Placed!</h2>
        <p className="text-[#7b6f66] mb-1">Thank you for shopping with {config.brandName}.</p>
        <div className="bg-white rounded-2xl border border-[#241a14]/10 px-6 py-3 inline-block my-4">
          <p className="text-xs text-[#9b8f86]">Your Order ID</p>
          <p className="font-mono font-bold text-[#171313] text-lg">{orderId}</p>
        </div>
        <p className="text-sm text-[#9b8f86] mb-8">Save this Order ID for future reference</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/orders">
            <motion.button whileHover={{ scale: 1.05 }} className="rounded-full bg-[#171313] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#3a2a21]">
              View Orders
            </motion.button>
          </a>
          <a href="/products">
            <motion.button whileHover={{ scale: 1.05 }} className="rounded-full border border-[#241a14]/15 px-8 py-3.5 text-sm font-semibold text-[#171313] transition hover:bg-white/80">
              Continue Shopping
            </motion.button>
          </a>
        </div>
      </motion.div>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171313]">
      <Navbar />
      <div className="mx-auto max-w-5xl px-5 py-10 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c6048]">Almost there</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Checkout</h1>
          <p className="mt-1 text-sm text-[#7b6f66]">Complete your order</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Delivery Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
              <h3 className="text-lg font-semibold mb-6">Delivery Details</h3>
              <div className="space-y-4">
                {[
                  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Rahul Sharma' },
                  { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '9876543210' },
                  { label: 'Pincode', key: 'pincode', type: 'text', placeholder: '248001' }
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-sm text-[#7b6f66] mb-1 block">{field.label}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm text-[#171313] placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-sm text-[#7b6f66] mb-1 block">Email</label>
                  <input type="email" value={userEmail} readOnly className="w-full rounded-2xl border border-[#241a14]/10 bg-[#f6f1ea]/50 px-4 py-3 text-sm text-[#9b8f86] cursor-not-allowed"/>
                </div>
                <div>
                  <label className="text-sm text-[#7b6f66] mb-1 block">Full Address</label>
                  <textarea
                    placeholder="House No, Street, Area, City"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    rows={3}
                    className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm text-[#171313] placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Coupon Section */}
            <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
              <h3 className="text-lg font-semibold mb-4">Have a Coupon? 🎟️</h3>

              {couponCode ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-green-700">{couponCode} applied!</p>
                    <p className="text-xs text-green-600 mt-0.5">You save ₹{discount}</p>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-xs text-red-500 hover:text-red-700 font-medium transition border border-red-200 px-3 py-1 rounded-full">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon() }}
                    className="flex-1 rounded-full border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm text-[#171313] placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition uppercase"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon || !couponInput.trim()}
                    className="flex-shrink-0 rounded-full bg-[#171313] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3a2a21] disabled:opacity-50"
                  >
                    {applyingCoupon ? '...' : 'Apply'}
                  </motion.button>
                </div>
              )}

              {couponMessage && !couponCode && (
                <p className="text-green-600 text-sm mt-2">{couponMessage}</p>
              )}
              {couponError && (
                <p className="text-red-500 text-sm mt-2">{couponError}</p>
              )}
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
            <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              {cart.length === 0 ? (
                <p className="text-sm text-[#7b6f66]">Your cart is empty.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {cart.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#eadfd4]">
                        {item.images?.[0] ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover"/> : <div className="grid h-full place-items-center">🛍️</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.name}</p>
                        <p className="text-xs text-[#9b8f86]">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-[#241a14]/10 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#7b6f66]">Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount ({couponCode})</span>
                    <span className="text-green-600">−₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[#7b6f66]">Delivery</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-[#241a14]/10">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {discount > 0 && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-2 text-center">
                  <p className="text-sm text-green-700 font-medium">🎉 You save ₹{discount} with {couponCode}!</p>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full rounded-full bg-[#171313] py-4 font-semibold text-sm text-white transition hover:bg-[#3a2a21]"
            >
              {placing ? 'Placing Order...' : `Place Order 🎉 — ₹${total}`}
            </motion.button>
            <p className="text-center text-xs text-[#9b8f86]">By placing your order, you agree to our Terms & Conditions</p>
          </motion.div>
        </div>
      </div>

      <footer className="border-t border-[#241a14]/10 px-5 py-10">
        <p className="text-center text-sm text-[#9b8f86]">{config.copyright}</p>
      </footer>
    </main>
  )
}