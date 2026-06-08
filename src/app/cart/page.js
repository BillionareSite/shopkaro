'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import config from '@/lib/config'

export default function Cart() {
  const [cart, setCart] = useState([])

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(stored)
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

  return (
    <div className="min-h-screen bg-[#f6f1ea] text-[#171313] overflow-x-hidden">
      <Navbar />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-5 py-8 sm:py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c6048]">Shopping</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">Your Cart 🛒</h1>
          <p className="mt-1 text-sm text-[#7b6f66]">{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
        </motion.div>

        {cart.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 rounded-[2rem] border border-[#241a14]/10 bg-white/55">
            <p className="text-6xl mb-4">🛒</p>
            <p className="text-xl font-semibold mb-2">Your cart is empty!</p>
            <p className="text-sm text-[#7b6f66] mb-8">Add some products to get started</p>
            <a href="/products">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="rounded-full bg-[#171313] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#3a2a21]">
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
                  className="overflow-hidden rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-4 flex gap-3 sm:gap-4"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-[#eadfd4]">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover"/>
                    ) : <div className="grid h-full place-items-center text-2xl">🛍️</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-0.5 truncate">{item.name}</h4>
                    <p className="text-xs text-[#9b8f86] mb-2">{item.category}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">₹{item.price}</span>
                      {item.originalPrice > item.price && (
                        <span className="text-xs text-[#9b8f86] line-through">₹{item.originalPrice}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between flex-shrink-0">
                    <button onClick={() => removeItem(item.id)} className="text-sm text-[#9b8f86] hover:text-red-500 transition w-6 h-6 flex items-center justify-center">✕</button>
                    <div className="flex items-center gap-2 rounded-full border border-[#241a14]/10 bg-[#f6f1ea] px-3 py-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="font-semibold text-[#7b6f66] hover:text-[#171313] w-4 text-center">−</button>
                      <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="font-semibold text-[#7b6f66] hover:text-[#171313] w-4 text-center">+</button>
                    </div>
                  </div>
                </motion.div>
              ))}
              <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 transition pl-1">
                Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-5 sm:p-6 h-fit lg:sticky lg:top-24">
              <h3 className="text-xl font-semibold mb-5">Order Summary</h3>
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-[#7b6f66]">Items ({cart.length})</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#7b6f66]">You save</span>
                    <span className="text-green-600">−₹{savings.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#7b6f66]">Delivery</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t border-[#241a14]/10 pt-3 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
              </div>
              {savings > 0 && (
                <p className="text-xs text-center text-green-600 mb-4 p-2 rounded-xl bg-green-50">
                  🎉 You are saving ₹{savings.toLocaleString()}!
                </p>
              )}
              <a href="/checkout">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full rounded-full bg-[#171313] py-3.5 font-semibold text-sm text-white transition hover:bg-[#3a2a21] mb-3">
                  Proceed to Checkout →
                </motion.button>
              </a>
              <a href="/products">
                <button className="w-full rounded-full border border-[#241a14]/10 py-3.5 font-semibold text-sm text-[#6d625a] transition hover:bg-[#f6f1ea]">
                  Continue Shopping
                </button>
              </a>
            </motion.div>
          </div>
        )}
      </div>

      <footer className="border-t border-[#241a14]/10 px-5 py-10 mt-10">
        <p className="text-center text-sm text-[#9b8f86]">{config.copyright}</p>
      </footer>
    </div>
  )
}