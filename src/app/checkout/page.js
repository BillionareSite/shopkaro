'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

export default function Checkout() {
  const [cart, setCart] = useState([])
  const [form, setForm] = useState({ name: '', phone: '', address: '', pincode: '' })
  const [placing, setPlacing] = useState(false)
  const [ordered, setOrdered] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/auth/login?redirect=/checkout'
      return
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUserEmail(payload.email)
      setForm(f => ({ ...f, name: payload.name }))
    } catch {
      window.location.href = '/auth/login?redirect=/checkout'
      return
    }
    const stored = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(stored)
  }, [])

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handlePlaceOrder = async () => {
    if (!form.name || !form.phone || !form.address || !form.pincode) {
      alert('Please fill all fields!')
      return
    }
    if (cart.length === 0) {
      alert('Your cart is empty!')
      return
    }
    setPlacing(true)
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, items: cart, total, email: userEmail })
    })
    const data = await res.json()
    setPlacing(false)
    if (res.ok) {
      localStorage.removeItem('cart')
      window.dispatchEvent(new Event('storage'))
      setOrdered(true)
    } else {
      alert(data.message)
    }
  }

  if (ordered) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-3xl font-bold mb-3">Order Placed!</h2>
        <p className="text-gray-400 mb-2">Thank you for shopping with ShopKaro.</p>
        <p className="text-gray-500 text-sm mb-8">You can track your order in your profile.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/profile">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-8 py-3 rounded-xl font-semibold"
            >
              View Orders
            </motion.button>
          </a>
          <a href="/products">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border border-gray-700 text-white px-8 py-3 rounded-xl font-semibold hover:border-white transition"
            >
              Continue Shopping
            </motion.button>
          </a>
        </div>
      </motion.div>
    </main>
  )

  return (
    <main className="min-h-screen bg-black text-white">

      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8 pb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold mb-8"
        >
          Checkout
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Delivery Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#111] border border-gray-800 rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold mb-6">Delivery Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Email</label>
                <input
                  type="email"
                  value={userEmail}
                  readOnly
                  className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Phone Number</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Full Address</label>
                <textarea
                  placeholder="House No, Street, Area, City"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={3}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition resize-none"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Pincode</label>
                <input
                  type="text"
                  placeholder="248001"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition"
                />
              </div>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="bg-[#111] border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Order Summary</h3>
              {cart.length === 0 ? (
                <p className="text-gray-500 text-sm">Your cart is empty.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {cart.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">🛍️</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.name}</p>
                        <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t border-gray-800 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Delivery</span>
                  <span className="text-green-400">FREE</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg pt-1">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full bg-white text-black font-semibold py-4 rounded-xl text-lg hover:bg-gray-100 transition"
            >
              {placing ? 'Placing Order...' : 'Place Order 🎉'}
            </motion.button>

            <p className="text-center text-gray-600 text-xs">
              By placing your order, you agree to our Terms & Conditions
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  )
}