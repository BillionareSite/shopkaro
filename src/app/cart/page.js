'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

export default function Cart() {
  const [cart, setCart] = useState([])

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(stored)
  }, [])

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return
    const updated = cart.map(item =>
      item.id === id ? { ...item, quantity: newQty } : item
    )
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

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const savings = cart.reduce((sum, item) => sum + ((item.originalPrice - item.price) * item.quantity), 0)

  return (
    <main className="min-h-screen bg-black text-white">

      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8"
        >
          Your Cart 🛒
        </motion.h2>

        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-6xl mb-4">🛒</p>
            <p className="text-gray-400 text-lg mb-2">Your cart is empty!</p>
            <p className="text-gray-600 text-sm mb-8">Add some products to get started</p>
            <a href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-black px-8 py-3 rounded-xl font-semibold"
              >
                Browse Products
              </motion.button>
            </a>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cart.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#111] border border-gray-800 rounded-2xl p-4 flex gap-4"
                >
                  <div className="w-20 h-20 bg-[#1a1a1a] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover"/>
                    ) : (
                      <span className="text-2xl">🛍️</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1 truncate">{item.name}</h4>
                    <p className="text-gray-500 text-xs mb-2">{item.category}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">₹{item.price}</span>
                      {item.originalPrice > item.price && (
                        <span className="text-gray-600 text-xs line-through">₹{item.originalPrice}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-400 text-sm"
                    >✕</button>
                    <div className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-gray-400 hover:text-white font-bold"
                      >−</button>
                      <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-gray-400 hover:text-white font-bold"
                      >+</button>
                    </div>
                  </div>
                </motion.div>
              ))}
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-400 text-sm transition"
              >
                Clear Cart
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#111] border border-gray-800 rounded-2xl p-6 h-fit sticky top-6"
            >
              <h3 className="text-xl font-bold mb-6">Order Summary</h3>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Items ({cart.length})</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">You save</span>
                    <span className="text-green-400">−₹{savings.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery</span>
                  <span className="text-green-400">FREE</span>
                </div>
                <div className="border-t border-gray-800 pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
              </div>
              {savings > 0 && (
                <p className="text-green-400 text-xs text-center mb-4">
                  🎉 You are saving ₹{savings.toLocaleString()} on this order!
                </p>
              )}
              <a href="/checkout">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-100 transition"
                >
                  Proceed to Checkout →
                </motion.button>
              </a>
              <a href="/products">
                <button className="w-full mt-3 border border-gray-700 text-white font-semibold py-3 rounded-xl hover:border-white transition text-sm">
                  Continue Shopping
                </button>
              </a>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  )
}