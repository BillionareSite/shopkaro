'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import config from '@/lib/config'

export default function Cart() {
  const [cart, setCart] = useState([])
  const [storeSettings, setStoreSettings] = useState(null)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(stored)

    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => { if (data.settings) setStoreSettings(data.settings) })
  }, [])

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return
    const updated = cart.map(item => item.id === id ? { ...item, quantity: newQty } : item)
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('storage'))
  }

  const removeItem = (id) => {
    const updated = cart.filter(item => item.id !== id)
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('storage'))
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem('cart')
    window.dispatchEvent(new Event('storage'))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const savings = cart.reduce((sum, item) => sum + ((item.originalPrice - item.price) * item.quantity), 0)

  // Delivery charge from settings
  const freeDeliveryMin = storeSettings?.freeDeliveryMin ?? 500
  const deliveryCharge = storeSettings
    ? (subtotal >= freeDeliveryMin ? 0 : (storeSettings.deliveryCharge || 0))
    : 0
  const amountForFreeDelivery = Math.max(0, freeDeliveryMin - subtotal)
  const total = subtotal + deliveryCharge

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] overflow-x-hidden">
      <Navbar />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-5 py-8 sm:py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Shopping</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">Your Cart 🛒</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
        </motion.div>

        {cart.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 rounded-[2rem] border border-[var(--border)]/10 bg-[var(--bg-card)]/55">
            <p className="text-6xl mb-4">🛒</p>
            <p className="text-xl font-semibold mb-2">Your cart is empty!</p>
            <p className="text-sm text-[var(--text-muted)] mb-8">Add some products to get started</p>
            <a href="/products">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="rounded-full bg-[var(--btn-dark)] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--btn-dark-hover)]">
                Browse Products
              </motion.button>
            </a>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">

            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {cart.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="overflow-hidden rounded-[1.4rem] bg-[var(--bg-card)] shadow-lg shadow-[var(--shadow)]/5 p-4 flex gap-3 sm:gap-4"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-[var(--bg-muted)]">
                    {item.images?.[0]
                      ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover"/>
                      : <div className="grid h-full place-items-center text-2xl">🛍️</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-0.5 truncate">{item.name}</h4>
                    <p className="text-xs text-[var(--text-placeholder)] mb-2">
                      {item.category}{item.preowned ? ' · ♻️ Preowned' : ''}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">₹{item.price}</span>
                      {item.originalPrice > item.price && (
                        <span className="text-xs text-[var(--text-placeholder)] line-through">₹{item.originalPrice}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between flex-shrink-0">
                    <button onClick={() => removeItem(item.id)} className="text-sm text-[var(--text-placeholder)] hover:text-red-500 transition w-6 h-6 flex items-center justify-center">✕</button>
                    <div className="flex items-center gap-2 rounded-full border border-[var(--border)]/10 bg-[var(--bg)] px-3 py-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] w-4 text-center">−</button>
                      <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] w-4 text-center">+</button>
                    </div>
                  </div>
                </motion.div>
              ))}
              <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 transition pl-1">
                Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[1.4rem] bg-[var(--bg-card)] shadow-lg shadow-[var(--shadow)]/5 p-5 sm:p-6 h-fit lg:sticky lg:top-24">
              <h3 className="text-xl font-semibold mb-5">Order Summary</h3>

              {/* Free delivery progress bar */}
              {deliveryCharge > 0 && amountForFreeDelivery > 0 && (
                <div className="mb-4 rounded-2xl bg-blue-50 border border-blue-200 p-3">
                  <p className="text-xs text-blue-700 font-semibold mb-1.5">🚚 Add ₹{amountForFreeDelivery} more for FREE delivery!</p>
                  <div className="h-1.5 rounded-full bg-blue-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${Math.min(100, (subtotal / freeDeliveryMin) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {deliveryCharge === 0 && subtotal > 0 && (
                <div className="mb-4 rounded-2xl bg-green-50 border border-green-200 p-3">
                  <p className="text-xs text-green-700 font-semibold">🎉 You qualify for FREE delivery!</p>
                </div>
              )}

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Items ({cart.length})</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">You save</span>
                    <span className="text-green-600">−₹{savings.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Delivery</span>
                  {deliveryCharge === 0
                    ? <span className="text-green-600 font-semibold">FREE</span>
                    : <span>₹{deliveryCharge}</span>
                  }
                </div>
                <div className="border-t border-[var(--border)]/10 pt-3 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              {savings > 0 && (
                <p className="text-xs text-center text-green-600 mb-4 p-2 rounded-xl bg-green-50">
                  🎉 You are saving ₹{savings.toLocaleString()}!
                </p>
              )}

              <a href="/checkout">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full rounded-full bg-[var(--btn-dark)] py-3.5 font-semibold text-sm text-white transition hover:bg-[var(--btn-dark-hover)] mb-3">
                  Proceed to Checkout →
                </motion.button>
              </a>
              <a href="/products">
                <button className="w-full rounded-full border border-[var(--border)]/10 py-3.5 font-semibold text-sm text-[var(--text-muted)] transition hover:bg-[var(--bg)]">
                  Continue Shopping
                </button>
              </a>
            </motion.div>
          </div>
        )}
      </div>

      <footer className="border-t border-[var(--border)]/10 px-5 py-10 mt-10">
        <p className="text-center text-sm text-[var(--text-placeholder)]">{config.copyright}</p>
      </footer>
    </div>
  )
}