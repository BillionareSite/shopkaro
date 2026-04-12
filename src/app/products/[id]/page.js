'use client'
import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'

export default function ProductDetail({ params }) {
  const { id } = use(params)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/products/' + id)
      .then(res => res.json())
      .then(data => {
        setProduct(data.product)
        setLoading(false)
      })
  }, [id])

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find(item => item.id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      cart.push({ ...product, quantity })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-gray-500">Loading product...</p>
    </main>
  )

  if (!product) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-gray-500">Product not found!</p>
    </main>
  )

  const discount = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  return (
    <main className="min-h-screen bg-black text-white">

      {/* Navbar */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="border-b border-gray-800 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <a href="/" className="text-2xl font-bold tracking-wide">ShopKaro</a>
          <div className="hidden md:flex gap-6 text-gray-300 text-sm">
            <a href="/" className="hover:text-white transition">Home</a>
            <a href="/products" className="hover:text-white transition">Products</a>
            <a href="/auth/login" className="hover:text-white transition">Login</a>
            <a href="/auth/signup" className="hover:text-white transition">Signup</a>
          </div>
          <a href="/cart" className="hidden md:block">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-4 py-2 rounded-lg font-semibold text-sm"
            >
              Cart 🛒
            </motion.button>
          </a>
          <button
            className="md:hidden text-white text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-4 flex flex-col gap-4 border-t border-gray-800 pt-4 text-sm"
          >
            <a href="/" className="text-gray-300 hover:text-white">Home</a>
            <a href="/products" className="text-gray-300 hover:text-white">Products</a>
            <a href="/auth/login" className="text-gray-300 hover:text-white">Login</a>
            <a href="/auth/signup" className="bg-white text-black text-center py-2 rounded-lg font-semibold">Sign Up</a>
            <a href="/cart" className="border border-gray-700 text-white text-center py-2 rounded-lg hover:border-white transition">Cart 🛒</a>
          </motion.div>
        )}
      </motion.nav>

      {/* Back button */}
      <div className="px-6 py-4">
        <a href="/products" className="text-gray-400 hover:text-white text-sm transition">
          ← Back to Products
        </a>
      </div>

      {/* Product Detail */}
      <div className="max-w-5xl mx-auto px-6 py-4 pb-16">
        <div className="grid md:grid-cols-2 gap-10">

          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden flex items-center justify-center h-72 md:h-96"
          >
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover"/>
            ) : (
              <span className="text-8xl">🛍️</span>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 border border-gray-700 px-3 py-1 rounded-full w-fit mb-4">
              {product.category}
            </span>

            <h1 className="text-2xl md:text-3xl font-bold mb-3">{product.name}</h1>

            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {product.description}
            </p>

            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl font-bold">₹{product.price}</span>
              {discount > 0 && (
                <>
                  <span className="text-gray-600 line-through text-lg">₹{product.originalPrice}</span>
                  <span className="bg-white text-black text-xs font-bold px-2 py-1 rounded-full">
                    {discount}% off
                  </span>
                </>
              )}
            </div>

            <p className="text-green-400 text-sm mb-6">
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </p>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-gray-400 text-sm">Quantity:</span>
              <div className="flex items-center gap-3 bg-[#111] border border-gray-700 rounded-xl px-4 py-2">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="text-gray-400 hover:text-white text-lg font-bold"
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="text-gray-400 hover:text-white text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-100 transition"
              >
                {added ? '✓ Added to Cart!' : 'Add to Cart 🛒'}
              </motion.button>
              <a href="/cart" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full border border-gray-700 text-white font-semibold py-3 rounded-xl hover:border-white transition"
                >
                  View Cart
                </motion.button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}