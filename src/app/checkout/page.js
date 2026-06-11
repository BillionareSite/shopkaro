'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import config from '@/lib/config'

export default function Checkout() {
  const [cart, setCart] = useState([])
  const [form, setForm] = useState({ name: '', phone: '', whatsapp: '', address: '', pincode: '' })
  const [placing, setPlacing] = useState(false)
  const [ordered, setOrdered] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [placedPaymentMethod, setPlacedPaymentMethod] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponId, setCouponId] = useState('')
  const [couponError, setCouponError] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [availablePayments, setAvailablePayments] = useState({ cod: true, upi: false, bank: false, card: false })
  const [storeSettings, setStoreSettings] = useState(null)
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [paymentProof, setPaymentProof] = useState({ senderName: '', utr: '', screenshotPreview: '' })
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false)
  const [screenshotUrl, setScreenshotUrl] = useState('')
  const upiFileRef = useRef(null)
  const bankFileRef = useRef(null)

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

    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          const methods = data.settings.paymentMethods
          setAvailablePayments(methods)
          setStoreSettings(data.settings)
          const firstEnabled = Object.keys(methods).find(k => methods[k])
          if (firstEnabled) setPaymentMethod(firstEnabled)
        }
        setLoadingSettings(false)
      })
      .catch(() => setLoadingSettings(false))
  }, [])

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = Math.max(0, subtotal - discount)
  const needsPaymentProof = paymentMethod === 'upi' || paymentMethod === 'bank'

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setApplyingCoupon(true)
    setCouponError('')

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), cartTotal: subtotal, email: userEmail, items: cart })
      })

      const data = await res.json()
      setApplyingCoupon(false)

      if (res.ok) {
        setDiscount(data.discount)
        setCouponCode(data.coupon.code)
        setCouponId(data.coupon.id)
        setCouponError('')
      } else {
        setCouponError(data.message)
      }
    } catch {
      setApplyingCoupon(false)
      setCouponError('Something went wrong. Try again!')
    }
  }

  const handleRemoveCoupon = () => {
    setDiscount(0)
    setCouponCode('')
    setCouponId('')
    setCouponInput('')
    setCouponError('')
  }

  const handleScreenshotUpload = async (e, ref) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB!')
      return
    }

    const preview = URL.createObjectURL(file)
    setPaymentProof(prev => ({ ...prev, screenshotPreview: preview }))
    setUploadingScreenshot(true)
    setScreenshotUrl('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (res.ok) {
        setScreenshotUrl(data.url)
      } else {
        alert('Screenshot upload failed: ' + data.message)
        setPaymentProof(prev => ({ ...prev, screenshotPreview: '' }))
        setScreenshotUrl('')
      }
    } catch {
      alert('Upload failed. Please try again.')
      setPaymentProof(prev => ({ ...prev, screenshotPreview: '' }))
      setScreenshotUrl('')
    }

    setUploadingScreenshot(false)
  }

  const clearScreenshot = (ref) => {
    setPaymentProof(prev => ({ ...prev, screenshotPreview: '' }))
    setScreenshotUrl('')
    if (ref?.current) ref.current.value = ''
  }

  const handlePlaceOrder = async () => {
    if (!form.name || !form.phone || !form.address || !form.pincode) {
      alert('Please fill all delivery details!')
      return
    }

    if (!paymentMethod) {
      alert('Please select a payment method!')
      return
    }

    if (needsPaymentProof) {
      if (!paymentProof.senderName.trim()) {
        alert('Please enter the sender name!')
        return
      }

      if (!paymentProof.utr.trim()) {
        alert('Please enter the UTR/Transaction number!')
        return
      }

      if (!screenshotUrl) {
        alert('Please upload payment screenshot!')
        return
      }
    }

    if (cart.length === 0) {
      alert('Your cart is empty!')
      return
    }

    setPlacing(true)

    const isSameDay = cart.some(item =>
      item.sameDayPincodes?.includes(form.pincode.trim())
    )

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
        couponId,
        paymentMethod,
        isSameDay,
        paymentSenderName: needsPaymentProof ? paymentProof.senderName : '',
        paymentUTR: needsPaymentProof ? paymentProof.utr : '',
        paymentScreenshot: needsPaymentProof ? screenshotUrl : ''
      })
    })

    const data = await res.json()
    setPlacing(false)

    if (res.ok) {
      localStorage.removeItem('cart')
      window.dispatchEvent(new Event('storage'))
      setOrderId(data.order.orderId)
      setPlacedPaymentMethod(paymentMethod)
      setOrdered(true)
    } else {
      alert(data.message)
    }
  }

  const paymentOptions = [
    { id: 'cod', icon: '💵', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
    { id: 'upi', icon: '📱', label: 'UPI Payment', desc: storeSettings?.upiId ? `Pay to ${storeSettings.upiId}` : 'Pay via UPI' },
    { id: 'bank', icon: '🏦', label: 'Bank Transfer', desc: 'Transfer to our bank account' },
    { id: 'card', icon: '💳', label: 'Card Payment', desc: 'Credit or Debit card' }
  ].filter(p => availablePayments[p.id])

  const ScreenshotUploader = ({ fileRef }) => (
    <div>
      <label className="text-sm text-[#7b6f66] mb-1 block font-medium">Payment Screenshot *</label>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleScreenshotUpload(e, fileRef)}
        className="hidden"
      />

      {paymentProof.screenshotPreview ? (
        <div className="relative">
          <img
            src={paymentProof.screenshotPreview}
            alt="Payment Screenshot"
            className="w-full h-44 object-cover rounded-2xl border border-[#241a14]/15"
          />

          {uploadingScreenshot && (
            <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin mx-auto mb-2" />
                <p className="text-white text-xs font-semibold">Uploading...</p>
              </div>
            </div>
          )}

          {!uploadingScreenshot && screenshotUrl && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              ✓ Uploaded
            </div>
          )}

          {!uploadingScreenshot && !screenshotUrl && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              ✕ Failed
            </div>
          )}

          <button
            type="button"
            onClick={() => clearScreenshot(fileRef)}
            className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center hover:bg-black transition"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-[#241a14]/20 rounded-2xl py-10 text-center hover:border-[#241a14]/40 hover:bg-white/50 transition"
        >
          <p className="text-3xl mb-2">📸</p>
          <p className="text-sm font-semibold text-[#7b6f66]">Click to Upload Screenshot</p>
          <p className="text-xs text-[#9b8f86] mt-1">JPG, PNG — max 5MB</p>
        </button>
      )}
    </div>
  )

  if (ordered) return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#f6f1ea] flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md w-full">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-3xl font-semibold text-[#171313] mb-3">Order Placed!</h2>
        <p className="text-[#7b6f66] mb-1">Thank you for shopping with {config.brandName}.</p>

        <div className="bg-white rounded-2xl border border-[#241a14]/10 px-6 py-4 my-4 w-full">
          <p className="text-xs text-[#9b8f86]">Your Order ID</p>
          <p className="font-mono font-bold text-[#171313] text-xl mt-1">{orderId}</p>
          <p className="text-xs text-[#9b8f86] mt-2">📧 Order confirmation sent to your email</p>
        </div>

        {(placedPaymentMethod === 'upi' || placedPaymentMethod === 'bank') && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 mb-6 text-left">
            <p className="text-sm font-semibold text-amber-700 mb-1">⏳ Payment Verification Pending</p>
            <p className="text-xs text-amber-600 leading-relaxed">
              Your order will be confirmed as soon as we verify your payment. This usually takes a few minutes to a few hours.
            </p>
          </div>
        )}

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
    <main className="min-h-screen w-full overflow-x-hidden bg-[#f6f1ea] text-[#171313]">
      <Navbar />

      <div className="mx-auto w-full max-w-5xl px-5 py-10 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c6048]">Almost there</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Checkout</h1>
        </motion.div>

        <div className="grid w-full min-w-0 md:grid-cols-2 gap-8">
          <div className="space-y-4 min-w-0">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
              <h3 className="text-lg font-semibold mb-6">📍 Delivery Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[#7b6f66] mb-1 block">Full Name</label>
                  <input type="text" placeholder="Rahul Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition" />
                </div>

                <div>
                  <label className="text-sm text-[#7b6f66] mb-1 block">Phone Number</label>
                  <input type="tel" placeholder="9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition" />
                </div>

                <div>
                  <label className="text-sm text-[#7b6f66] mb-1 block">
                    WhatsApp Number <span className="text-[#9b8f86] text-xs">(Optional)</span>
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">💬</span>
                    <input type="tel" placeholder="WhatsApp number for order updates" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] pl-10 pr-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition" />
                  </div>

                  <p className="text-xs text-[#8c6048] mt-1.5">
                    📲 Drop your WhatsApp number for faster order updates and delivery coordination!
                  </p>
                </div>

                <div>
                  <label className="text-sm text-[#7b6f66] mb-1 block">Pincode</label>
                  <input type="text" placeholder="248001" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition" />
                </div>

                <div>
                  <label className="text-sm text-[#7b6f66] mb-1 block">Email</label>
                  <input type="email" value={userEmail} readOnly className="w-full rounded-2xl border border-[#241a14]/10 bg-[#f6f1ea]/50 px-4 py-3 text-sm text-[#9b8f86] cursor-not-allowed" />
                </div>

                <div>
                  <label className="text-sm text-[#7b6f66] mb-1 block">Full Address</label>
                  <textarea placeholder="House No, Street, Area, City" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition resize-none" />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
              <h3 className="text-lg font-semibold mb-4">💳 Payment Method</h3>

              {loadingSettings ? (
                <p className="text-sm text-[#7b6f66]">Loading payment options...</p>
              ) : paymentOptions.length === 0 ? (
                <p className="text-sm text-[#7b6f66]">No payment methods available. Contact support.</p>
              ) : (
                <div className="space-y-3">
                  {paymentOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setPaymentMethod(option.id)
                        setPaymentProof({ senderName: '', utr: '', screenshotPreview: '' })
                        setScreenshotUrl('')
                        if (upiFileRef.current) upiFileRef.current.value = ''
                        if (bankFileRef.current) bankFileRef.current.value = ''
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition text-left ${paymentMethod === option.id ? 'border-[#171313] bg-[#171313]' : 'border-[#241a14]/15 bg-[#f6f1ea] hover:border-[#241a14]/30'}`}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${paymentMethod === option.id ? 'text-white' : 'text-[#171313]'}`}>{option.label}</p>
                        <p className={`text-xs mt-0.5 ${paymentMethod === option.id ? 'text-white/60' : 'text-[#9b8f86]'}`}>{option.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === option.id ? 'border-white' : 'border-[#9b8f86]'}`}>
                        {paymentMethod === option.id && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <AnimatePresence>
                {paymentMethod === 'upi' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="mt-4 space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                        <p className="text-sm font-bold text-blue-800 mb-2">📱 UPI Payment Instructions</p>
                        <p className="text-sm text-blue-700 mb-2">Send <span className="font-bold">₹{total}</span> to UPI ID:</p>
                        <div className="bg-white border border-blue-200 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3">
                          <p className="font-mono font-bold text-blue-900 text-base break-all">{storeSettings?.upiId || 'UPI ID not configured'}</p>
                          <button
                            onClick={() => { navigator.clipboard.writeText(storeSettings?.upiId || ''); alert('UPI ID copied!') }}
                            className="text-xs text-blue-600 hover:text-blue-800 border border-blue-300 bg-blue-50 px-3 py-1 rounded-lg transition font-medium flex-shrink-0"
                          >
                            Copy
                          </button>
                        </div>
                        <p className="text-xs text-blue-600 mt-2">After payment, fill the details below and upload your screenshot.</p>
                      </div>

                      <div>
                        <label className="text-sm text-[#7b6f66] mb-1 block font-medium">Sender Name (as in UPI app) *</label>
                        <input type="text" placeholder="Name shown in your UPI app" value={paymentProof.senderName} onChange={(e) => setPaymentProof(prev => ({ ...prev, senderName: e.target.value }))} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition" />
                      </div>

                      <div>
                        <label className="text-sm text-[#7b6f66] mb-1 block font-medium">UTR / Transaction Number *</label>
                        <input type="text" placeholder="12-digit UTR from your payment app" value={paymentProof.utr} onChange={(e) => setPaymentProof(prev => ({ ...prev, utr: e.target.value }))} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition" />
                      </div>

                      <ScreenshotUploader fileRef={upiFileRef} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {paymentMethod === 'bank' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="mt-4 space-y-4">
                      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                        <p className="text-sm font-bold text-purple-800 mb-2">🏦 Bank Transfer Instructions</p>
                        <p className="text-sm text-purple-700 mb-2">Transfer <span className="font-bold">₹{total}</span> to:</p>
                        <div className="bg-white border border-purple-200 rounded-xl p-3">
                          <p className="text-sm text-purple-900 whitespace-pre-line font-mono leading-relaxed break-words">{storeSettings?.bankDetails || 'Bank details not configured'}</p>
                        </div>
                        <p className="text-xs text-purple-600 mt-2">After transfer, fill the details below and upload your proof.</p>
                      </div>

                      <div>
                        <label className="text-sm text-[#7b6f66] mb-1 block font-medium">Account Holder Name *</label>
                        <input type="text" placeholder="Name on your bank account" value={paymentProof.senderName} onChange={(e) => setPaymentProof(prev => ({ ...prev, senderName: e.target.value }))} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition" />
                      </div>

                      <div>
                        <label className="text-sm text-[#7b6f66] mb-1 block font-medium">UTR / Transaction Reference *</label>
                        <input type="text" placeholder="Transaction reference from your bank" value={paymentProof.utr} onChange={(e) => setPaymentProof(prev => ({ ...prev, utr: e.target.value }))} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition" />
                      </div>

                      <ScreenshotUploader fileRef={bankFileRef} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
              <h3 className="text-lg font-semibold mb-4">🎟️ Have a Coupon?</h3>

              {couponCode ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-green-700">{couponCode} applied!</p>
                    <p className="text-xs text-green-600 mt-0.5">You save ₹{discount}</p>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-3 py-1 rounded-full transition">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input type="text" placeholder="Enter coupon code" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon() }} className="flex-1 min-w-0 rounded-full border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition uppercase" />
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleApplyCoupon} disabled={applyingCoupon || !couponInput.trim()} className="rounded-full bg-[#171313] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3a2a21] disabled:opacity-50 flex-shrink-0">
                    {applyingCoupon ? '...' : 'Apply'}
                  </motion.button>
                </div>
              )}

              {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4 min-w-0">
            <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
              <h3 className="text-lg font-semibold mb-4">🧾 Order Summary</h3>

              {cart.length === 0 ? (
                <p className="text-sm text-[#7b6f66]">Your cart is empty.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {cart.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#eadfd4]">
                        {item.images?.[0] ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" /> : <div className="grid h-full place-items-center">🛍️</div>}
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
                <div className="flex justify-between text-sm"><span className="text-[#7b6f66]">Subtotal</span><span>₹{subtotal}</span></div>
                {discount > 0 && <div className="flex justify-between text-sm"><span className="text-green-600">Discount ({couponCode})</span><span className="text-green-600">−₹{discount}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-[#7b6f66]">Delivery</span><span className="text-green-600">FREE</span></div>
                {paymentMethod && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7b6f66]">Payment</span>
                    <span className="font-medium">{paymentOptions.find(p => p.id === paymentMethod)?.label || paymentMethod}</span>
                  </div>
                )}
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

            {needsPaymentProof && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
                <p className="text-sm font-semibold text-amber-700 mb-1">⚠️ Important</p>
                <p className="text-xs text-amber-600 leading-relaxed">Fill all payment details and upload screenshot before placing order. Your order will be confirmed after verification.</p>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePlaceOrder}
              disabled={placing || !paymentMethod || uploadingScreenshot}
              className="w-full rounded-full bg-[#171313] py-4 font-semibold text-sm text-white transition hover:bg-[#3a2a21] disabled:opacity-50"
            >
              {placing ? 'Placing Order...' : uploadingScreenshot ? 'Uploading Screenshot...' : `Place Order 🎉 — ₹${total}`}
            </motion.button>

            <p className="text-center text-xs text-[#9b8f86]">📧 Order confirmation will be sent to your email</p>
          </motion.div>
        </div>
      </div>

      <footer className="border-t border-[#241a14]/10 px-5 py-10">
        <p className="text-center text-sm text-[#9b8f86]">{config.copyright}</p>
      </footer>
    </main>
  )
}