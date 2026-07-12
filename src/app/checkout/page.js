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
  const discountedSubtotal = Math.max(0, subtotal - discount)

  // Delivery charge logic
  const deliveryCharge = storeSettings
    ? (discountedSubtotal >= (storeSettings.freeDeliveryMin || 500) ? 0 : (storeSettings.deliveryCharge || 0))
    : 0
  const minOrderValue = storeSettings?.minOrderValue || 0
  const freeDeliveryMin = storeSettings?.freeDeliveryMin || 500
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryMin - discountedSubtotal)

  const total = Math.max(0, discountedSubtotal + deliveryCharge)
  const needsPaymentProof = paymentMethod === 'upi' || paymentMethod === 'bank'
  const isRazorpay = paymentMethod === 'card'
  const belowMinOrder = minOrderValue > 0 && subtotal < minOrderValue

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setApplyingCoupon(true); setCouponError('')
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), cartTotal: subtotal, email: userEmail, items: cart })
      })
      const data = await res.json()
      setApplyingCoupon(false)
      if (res.ok) {
        setDiscount(data.discount); setCouponCode(data.coupon.code)
        setCouponId(data.coupon.id); setCouponError('')
      } else { setCouponError(data.message) }
    } catch { setApplyingCoupon(false); setCouponError('Something went wrong. Try again!') }
  }

  const handleRemoveCoupon = () => {
    setDiscount(0); setCouponCode(''); setCouponId(''); setCouponInput(''); setCouponError('')
  }

  const handleScreenshotUpload = async (e, ref) => {
    const file = e.target.files[0]; if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('File size must be less than 5MB!'); return }
    setPaymentProof(prev => ({ ...prev, screenshotPreview: URL.createObjectURL(file) }))
    setUploadingScreenshot(true); setScreenshotUrl('')
    try {
      const formData = new FormData(); formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) { setScreenshotUrl(data.url) }
      else {
        alert('Upload failed: ' + data.message)
        setPaymentProof(prev => ({ ...prev, screenshotPreview: '' })); setScreenshotUrl('')
      }
    } catch {
      alert('Upload failed. Please try again.')
      setPaymentProof(prev => ({ ...prev, screenshotPreview: '' })); setScreenshotUrl('')
    }
    setUploadingScreenshot(false)
  }

  const clearScreenshot = (ref) => {
    setPaymentProof(prev => ({ ...prev, screenshotPreview: '' }))
    setScreenshotUrl('')
    if (ref?.current) ref.current.value = ''
  }

  const buildItemsPayload = () => cart.map(item => ({ id: item.id, quantity: item.quantity, name: item.name, preowned: item.preowned || false }))

  const saveOrderToDB = async (method, paymentVerified = false, razorpayOrderId = '', razorpayPaymentId = '') => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        items: buildItemsPayload(),
        email: userEmail,
        couponCode,
        paymentMethod: method,
        paymentVerified,
        razorpayOrderId,
        razorpayPaymentId,
        deliveryCharge,
        paymentUTR: razorpayPaymentId || (needsPaymentProof ? paymentProof.utr : ''),
        paymentSenderName: needsPaymentProof ? paymentProof.senderName : '',
        paymentScreenshot: needsPaymentProof ? screenshotUrl : ''
      })
    })
    const data = await res.json()
    setPlacing(false)
    if (res.ok) {
      localStorage.removeItem('cart')
      window.dispatchEvent(new Event('storage'))
      setOrderId(data.order.orderId)
      setPlacedPaymentMethod(method)
      setOrdered(true)
    } else { alert(data.message) }
  }

  const handleRazorpayPayment = async () => {
    if (!form.name || !form.phone || !form.address || !form.pincode) { alert('Please fill all delivery details first!'); return }
    if (cart.length === 0) { alert('Your cart is empty!'); return }
    if (belowMinOrder) { alert(`Minimum order value is ₹${minOrderValue}. Add more items to continue.`); return }
    setPlacing(true)
    try {
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: buildItemsPayload(), couponCode, deliveryCharge })
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) { alert('Payment initiation failed: ' + orderData.message); setPlacing(false); return }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(script)
      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: config.brandName,
          description: 'Order Payment',
          order_id: orderData.orderId,
          prefill: { name: form.name, email: userEmail, contact: form.phone },
          theme: { color: '#171313' },
          handler: async (response) => {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature })
            })
            const verifyData = await verifyRes.json()
            if (!verifyRes.ok) { alert('Payment verification failed! Contact support with Payment ID: ' + response.razorpay_payment_id); setPlacing(false); return }
            await saveOrderToDB('card', true, response.razorpay_order_id, response.razorpay_payment_id)
          },
          modal: { ondismiss: () => { setPlacing(false) } }
        }
        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', (response) => { alert('Payment failed: ' + response.error.description); setPlacing(false) })
        rzp.open()
      }
      script.onerror = () => { alert('Failed to load payment gateway. Try again.'); setPlacing(false) }
    } catch (error) { alert('Something went wrong: ' + error.message); setPlacing(false) }
  }

  const handlePlaceOrder = async () => {
    if (belowMinOrder) { alert(`Minimum order value is ₹${minOrderValue}. Please add more items.`); return }
    if (isRazorpay) { await handleRazorpayPayment(); return }
    if (!form.name || !form.phone || !form.address || !form.pincode) { alert('Please fill all delivery details!'); return }
    if (!paymentMethod) { alert('Please select a payment method!'); return }
    if (needsPaymentProof) {
      if (!paymentProof.senderName.trim()) { alert('Please enter the sender name!'); return }
      if (!paymentProof.utr.trim()) { alert('Please enter the UTR/Transaction number!'); return }
      if (!screenshotUrl) { alert('Please upload payment screenshot!'); return }
    }
    if (cart.length === 0) { alert('Your cart is empty!'); return }
    setPlacing(true)
    await saveOrderToDB(paymentMethod, paymentMethod === 'cod')
  }

  const paymentOptions = [
    { id: 'cod', icon: '💵', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
    { id: 'upi', icon: '📱', label: 'UPI Payment', desc: storeSettings?.upiId ? `Pay to ${storeSettings.upiId}` : 'Pay via UPI' },
    { id: 'bank', icon: '🏦', label: 'Bank Transfer', desc: 'Transfer to our bank account' },
    { id: 'card', icon: '💳', label: 'Pay via Razorpay', desc: 'Card, UPI, Wallet — instant confirmation' }
  ].filter(p => availablePayments[p.id])

  const ScreenshotUploader = ({ fileRef }) => (
    <div>
      <label className="text-sm text-[var(--text-muted)] mb-1 block font-medium">Payment Screenshot *</label>
      <input ref={fileRef} type="file" accept="image/*" onChange={(e) => handleScreenshotUpload(e, fileRef)} className="hidden"/>
      {paymentProof.screenshotPreview ? (
        <div className="relative">
          <img src={paymentProof.screenshotPreview} alt="Payment Screenshot" className="w-full h-44 object-cover rounded-2xl border border-[var(--border-light)]"/>
          {uploadingScreenshot && <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center"><div className="text-center"><div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin mx-auto mb-2"/><p className="text-white text-xs font-semibold">Uploading...</p></div></div>}
          {!uploadingScreenshot && screenshotUrl && <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">✓ Uploaded</div>}
          {!uploadingScreenshot && !screenshotUrl && <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">✕ Failed</div>}
          <button type="button" onClick={() => clearScreenshot(fileRef)} className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center hover:bg-black transition">✕</button>
        </div>
      ) : (
        <button type="button" onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-[var(--border-light)] rounded-2xl py-10 text-center hover:border-[var(--border)] hover:bg-[var(--bg-muted)] transition">
          <p className="text-3xl mb-2">📸</p>
          <p className="text-sm font-semibold text-[var(--text-muted)]">Click to Upload Screenshot</p>
          <p className="text-xs text-[var(--text-placeholder)] mt-1">JPG, PNG — max 5MB</p>
        </button>
      )}
    </div>
  )

  if (ordered) return (
    <div className="min-h-screen overflow-x-hidden flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md w-full">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-3xl font-semibold mb-3 text-[var(--text-primary)]">Order Placed!</h2>
        <p className="text-[var(--text-muted)] mb-1">Thank you for shopping with {config.brandName}.</p>
        <div className="rounded-2xl border px-6 py-4 my-4 w-full" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-light)' }}>
          <p className="text-xs text-[var(--text-placeholder)]">Your Order ID</p>
          <p className="font-mono font-bold text-[var(--text-primary)] text-xl mt-1">{orderId}</p>
          <p className="text-xs text-[var(--text-placeholder)] mt-2">📧 Order confirmation sent to your email</p>
        </div>
        {(placedPaymentMethod === 'upi' || placedPaymentMethod === 'bank') && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 mb-6 text-left">
            <p className="text-sm font-semibold text-amber-700 mb-1">⏳ Payment Verification Pending</p>
            <p className="text-xs text-amber-600 leading-relaxed">Your order will be confirmed once we verify your payment.</p>
          </div>
        )}
        {placedPaymentMethod === 'card' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 mb-6 text-left">
            <p className="text-sm font-semibold text-green-700 mb-1">✅ Payment Successful!</p>
            <p className="text-xs text-green-600 leading-relaxed">Your Razorpay payment is verified and your order is confirmed.</p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/orders"><motion.button whileHover={{ scale: 1.05 }} className="w-full sm:w-auto rounded-full px-8 py-3.5 text-sm font-semibold text-white" style={{ backgroundColor: 'var(--btn-dark)' }}>View Orders</motion.button></a>
          <a href="/products"><motion.button whileHover={{ scale: 1.05 }} className="w-full sm:w-auto rounded-full border px-8 py-3.5 text-sm font-semibold text-[var(--text-primary)]" style={{ borderColor: 'var(--border-light)' }}>Continue Shopping</motion.button></a>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen text-[var(--text-primary)] overflow-x-hidden" style={{ backgroundColor: 'var(--bg)', maxWidth: '100vw' }}>
      <Navbar />
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-5 py-8 pb-16 box-border">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Almost there</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">Checkout</h1>
        </motion.div>

        {/* Minimum order warning */}
        {belowMinOrder && (
          <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm font-semibold text-red-700">⚠️ Minimum order value is ₹{minOrderValue}</p>
            <p className="text-xs text-red-600 mt-1">Please add ₹{minOrderValue - subtotal} more to place your order.</p>
          </div>
        )}

        {/* Free delivery progress */}
        {deliveryCharge > 0 && amountNeededForFreeDelivery > 0 && (
          <div className="mb-4 rounded-2xl bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm font-semibold text-blue-700">🚚 Add ₹{amountNeededForFreeDelivery} more for FREE delivery!</p>
            <div className="mt-2 h-2 rounded-full bg-blue-100 overflow-hidden">
              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min(100, (discountedSubtotal / freeDeliveryMin) * 100)}%` }}/>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-8 gap-4">

          {/* LEFT */}
          <div className="space-y-4 min-w-0 w-full">
            {/* Delivery Details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.4rem] shadow-lg p-5 sm:p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
              <h3 className="text-lg font-semibold mb-5">📍 Delivery Details</h3>
              <div className="space-y-4">
                <div><label className="text-sm text-[var(--text-muted)] mb-1 block">Full Name</label><input type="text" placeholder="Rahul Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-2xl border px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none transition" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-input)' }}/></div>
                <div><label className="text-sm text-[var(--text-muted)] mb-1 block">Phone Number</label><input type="tel" placeholder="9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-2xl border px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none transition" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-input)' }}/></div>
                <div>
                  <label className="text-sm text-[var(--text-muted)] mb-1 block">WhatsApp Number <span className="text-xs text-[var(--text-placeholder)]">(Optional)</span></label>
                  <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">💬</span><input type="tel" placeholder="WhatsApp number for updates" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="w-full rounded-2xl border pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none transition" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-input)' }}/></div>
                </div>
                <div><label className="text-sm text-[var(--text-muted)] mb-1 block">Pincode</label><input type="text" placeholder="248001" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="w-full rounded-2xl border px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none transition" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-input)' }}/></div>
                <div><label className="text-sm text-[var(--text-muted)] mb-1 block">Email</label><input type="email" value={userEmail} readOnly className="w-full rounded-2xl border px-4 py-3 text-sm cursor-not-allowed" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-muted)', color: 'var(--text-placeholder)' }}/></div>
                <div><label className="text-sm text-[var(--text-muted)] mb-1 block">Full Address</label><textarea placeholder="House No, Street, Area, City" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} className="w-full rounded-2xl border px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none transition resize-none" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-input)' }}/></div>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-[1.4rem] shadow-lg p-5 sm:p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
              <h3 className="text-lg font-semibold mb-4">💳 Payment Method</h3>
              {loadingSettings ? <p className="text-sm text-[var(--text-muted)]">Loading...</p> : paymentOptions.length === 0 ? <p className="text-sm text-[var(--text-muted)]">No payment methods available.</p> : (
                <div className="space-y-3">
                  {paymentOptions.map(option => (
                    <button key={option.id} onClick={() => { setPaymentMethod(option.id); setPaymentProof({ senderName: '', utr: '', screenshotPreview: '' }); setScreenshotUrl(''); if (upiFileRef.current) upiFileRef.current.value = ''; if (bankFileRef.current) bankFileRef.current.value = '' }}
                      className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition text-left`}
                      style={paymentMethod === option.id ? { borderColor: 'var(--btn-dark)', backgroundColor: 'var(--btn-dark)' } : { borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-input)' }}>
                      <span className="text-2xl flex-shrink-0">{option.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${paymentMethod === option.id ? 'text-white' : 'text-[var(--text-primary)]'}`}>{option.label}</p>
                        <p className={`text-xs mt-0.5 ${paymentMethod === option.id ? 'text-white/60' : 'text-[var(--text-placeholder)]'}`}>{option.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === option.id ? 'border-white' : 'border-[var(--text-placeholder)]'}`}>
                        {paymentMethod === option.id && <div className="w-2.5 h-2.5 rounded-full bg-white"/>}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <AnimatePresence>
                {paymentMethod === 'card' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-4">
                      <p className="text-sm font-bold text-blue-800 mb-1">🔒 Secure Payment via Razorpay</p>
                      <p className="text-sm text-blue-700 mb-3">Accepts Cards, UPI, Net Banking, Wallets and more.</p>
                      <div className="flex gap-2 flex-wrap">{['Visa', 'Mastercard', 'UPI', 'PhonePe', 'GPay', 'Paytm'].map(m => <span key={m} className="text-xs bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded-lg font-medium">{m}</span>)}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {paymentMethod === 'upi' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="mt-4 space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                        <p className="text-sm font-bold text-blue-800 mb-2">📱 Send <span className="font-bold">₹{total}</span> to:</p>
                        <div className="bg-white border border-blue-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
                          <p className="font-mono font-bold text-blue-900 text-sm flex-1 min-w-0 truncate">{storeSettings?.upiId || 'UPI ID not configured'}</p>
                          <button onClick={() => { navigator.clipboard.writeText(storeSettings?.upiId || ''); alert('Copied!') }} className="text-xs text-blue-600 border border-blue-300 bg-blue-50 px-2 py-1 rounded-lg font-medium flex-shrink-0">Copy</button>
                        </div>
                      </div>
                      <div><label className="text-sm text-[var(--text-muted)] mb-1 block font-medium">Sender Name *</label><input type="text" placeholder="Name shown in your UPI app" value={paymentProof.senderName} onChange={(e) => setPaymentProof(prev => ({ ...prev, senderName: e.target.value }))} className="w-full rounded-2xl border px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none transition" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-input)' }}/></div>
                      <div><label className="text-sm text-[var(--text-muted)] mb-1 block font-medium">UTR / Transaction Number *</label><input type="text" placeholder="12-digit UTR" value={paymentProof.utr} onChange={(e) => setPaymentProof(prev => ({ ...prev, utr: e.target.value }))} className="w-full rounded-2xl border px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none transition" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-input)' }}/></div>
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
                        <p className="text-sm font-bold text-purple-800 mb-2">🏦 Transfer <span className="font-bold">₹{total}</span> to:</p>
                        <div className="bg-white border border-purple-200 rounded-xl p-3"><p className="text-sm text-purple-900 whitespace-pre-line font-mono leading-relaxed break-words">{storeSettings?.bankDetails || 'Bank details not configured'}</p></div>
                      </div>
                      <div><label className="text-sm text-[var(--text-muted)] mb-1 block font-medium">Account Holder Name *</label><input type="text" placeholder="Name on your bank account" value={paymentProof.senderName} onChange={(e) => setPaymentProof(prev => ({ ...prev, senderName: e.target.value }))} className="w-full rounded-2xl border px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none transition" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-input)' }}/></div>
                      <div><label className="text-sm text-[var(--text-muted)] mb-1 block font-medium">UTR / Transaction Reference *</label><input type="text" placeholder="Transaction reference" value={paymentProof.utr} onChange={(e) => setPaymentProof(prev => ({ ...prev, utr: e.target.value }))} className="w-full rounded-2xl border px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none transition" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-input)' }}/></div>
                      <ScreenshotUploader fileRef={bankFileRef} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Coupon */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[1.4rem] shadow-lg p-5 sm:p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
              <h3 className="text-lg font-semibold mb-4">🎟️ Have a Coupon?</h3>
              {couponCode ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl px-4 py-3 gap-3">
                  <div className="min-w-0"><p className="text-sm font-semibold text-green-700">{couponCode} applied!</p><p className="text-xs text-green-600 mt-0.5">You save ₹{discount}</p></div>
                  <button onClick={handleRemoveCoupon} className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-3 py-1 rounded-full transition flex-shrink-0">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input type="text" placeholder="Enter coupon code" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon() }} className="flex-1 min-w-0 rounded-full border px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none transition uppercase" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-input)' }}/>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleApplyCoupon} disabled={applyingCoupon || !couponInput.trim()} className="rounded-full px-5 py-3 text-sm font-semibold text-white transition disabled:opacity-50 flex-shrink-0" style={{ backgroundColor: 'var(--btn-dark)' }}>{applyingCoupon ? '...' : 'Apply'}</motion.button>
                </div>
              )}
              {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
            </motion.div>
          </div>

          {/* RIGHT — Order Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-4 min-w-0 w-full">
            <div className="rounded-[1.4rem] shadow-lg p-5 sm:p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
              <h3 className="text-lg font-semibold mb-4">🧾 Order Summary</h3>
              {cart.length === 0 ? <p className="text-sm text-[var(--text-muted)]">Your cart is empty.</p> : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {cart.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--bg-muted)' }}>
                        {item.images?.[0] ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover"/> : <div className="grid h-full place-items-center">🛍️</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-[var(--text-primary)]">{item.name}</p>
                        <p className="text-xs text-[var(--text-placeholder)]">Qty: {item.quantity}{item.preowned ? ' · Preowned' : ''}</p>
                      </div>
                      <span className="text-sm font-semibold flex-shrink-0 text-[var(--text-primary)]">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t mt-4 pt-4 space-y-2" style={{ borderColor: 'var(--border-light)' }}>
                <div className="flex justify-between text-sm"><span className="text-[var(--text-muted)]">Subtotal</span><span className="text-[var(--text-primary)]">₹{subtotal}</span></div>
                {discount > 0 && <div className="flex justify-between text-sm"><span className="text-green-600">Discount ({couponCode})</span><span className="text-green-600">−₹{discount}</span></div>}
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Delivery</span>
                  {deliveryCharge === 0
                    ? <span className="text-green-600 font-semibold">FREE</span>
                    : <span className="text-[var(--text-primary)]">₹{deliveryCharge}</span>
                  }
                </div>
                {paymentMethod && <div className="flex justify-between text-sm"><span className="text-[var(--text-muted)]">Payment</span><span className="font-medium text-[var(--text-primary)]">{paymentOptions.find(p => p.id === paymentMethod)?.label || paymentMethod}</span></div>}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t" style={{ borderColor: 'var(--border-light)' }}>
                  <span className="text-[var(--text-primary)]">Total</span>
                  <span className="text-[var(--text-primary)]">₹{total}</span>
                </div>
              </div>
              {deliveryCharge === 0 && subtotal > 0 && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-2 text-center">
                  <p className="text-sm text-green-700 font-medium">🎉 You get FREE delivery!</p>
                </div>
              )}
              {deliveryCharge > 0 && (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-2 text-center">
                  <p className="text-xs text-blue-700">Add ₹{amountNeededForFreeDelivery} more for FREE delivery</p>
                </div>
              )}
              <p className="text-xs text-[var(--text-placeholder)] mt-3 text-center">🔒 Final amount is verified securely on our server.</p>
            </div>

            {needsPaymentProof && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
                <p className="text-sm font-semibold text-amber-700 mb-1">⚠️ Important</p>
                <p className="text-xs text-amber-600 leading-relaxed">Fill all payment details and upload screenshot before placing order.</p>
              </div>
            )}

            {isRazorpay && (
              <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
                <p className="text-sm font-semibold text-blue-700 mb-1">🔒 100% Secure Checkout</p>
                <p className="text-xs text-blue-600 leading-relaxed">Razorpay's secure payment window will open after clicking the button.</p>
              </div>
            )}

            <motion.button
              whileHover={{ scale: belowMinOrder ? 1 : 1.02 }}
              whileTap={{ scale: belowMinOrder ? 1 : 0.98 }}
              onClick={handlePlaceOrder}
              disabled={placing || !paymentMethod || uploadingScreenshot || belowMinOrder}
              className="w-full rounded-full py-4 font-semibold text-sm text-white transition disabled:opacity-50"
              style={{ backgroundColor: 'var(--btn-dark)' }}
            >
              {belowMinOrder
                ? `Minimum order ₹${minOrderValue}`
                : placing
                ? (isRazorpay ? 'Opening Payment...' : 'Placing Order...')
                : uploadingScreenshot
                ? 'Uploading Screenshot...'
                : isRazorpay
                ? `Pay ₹${total} via Razorpay 🔒`
                : `Place Order 🎉 — ₹${total}`}
            </motion.button>
            <p className="text-center text-xs text-[var(--text-placeholder)]">📧 Order confirmation will be sent to your email</p>
          </motion.div>
        </div>
      </div>

      <footer className="border-t px-5 py-10" style={{ borderColor: 'var(--border-light)' }}>
        <p className="text-center text-sm text-[var(--text-placeholder)]">{config.copyright}</p>
      </footer>
    </div>
  )
}