'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || [])
        setLoading(false)
      })
  }, [])

  const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books', 'Toys']
  const filtered = category === 'All' ? products : products.filter(p => p.category === category)

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
            {isLoggedIn ? (
              <a href="/profile" className="hover:text-white transition">Profile</a>
            ) : (
              <>
                <a href="/auth/login" className="hover:text-white transition">Login</a>
                <a href="/auth/signup" className="hover:text-white transition">Signup</a>
              </>
            )}
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
            className="md:hidden text-white text-2xl focus:outline-none"
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
            <a href="/" className="text-gray-300 hover:text-white transition">Home</a>
            <a href="/products" className="text-gray-300 hover:text-white transition">Products</a>
            {isLoggedIn ? (
              <a href="/profile" className="text-gray-300 hover:text-white transition">Profile</a>
            ) : (
              <>
                <a href="/auth/login" className="text-gray-300 hover:text-white transition">Login</a>
                <a href="/auth/signup" className="bg-white text-black text-center py-2 rounded-lg font-semibold">Sign Up</a>
              </>
            )}
            <a href="/cart" className="border border-gray-700 text-white text-center py-2 rounded-lg hover:border-white transition">Cart 🛒</a>
          </motion.div>
        )}
      </motion.nav>

      <div className="px-6 py-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold mb-6"
        >
          All Products
        </motion.h2>

        <div className="flex gap-3 overflow-x-auto mb-8 pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm font-medium transition ${
                category === cat
                  ? 'bg-white text-black border-white'
                  : 'border-gray-700 text-gray-400 hover:border-white hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading products...</div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-gray-500 text-lg">No products yet!</p>
            <p className="text-gray-600 text-sm mt-2">Products will appear here once added.</p>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } }
            }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {filtered.map((product) => (
              <motion.a
                key={product.id}
                href={'/products/' + product.id}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.03 }}
                className="bg-[#111] border border-gray-800 rounded-xl p-4 cursor-pointer block"
              >
                <div className="relative bg-[#1a1a1a] h-36 md:h-44 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover"/>
                  ) : (
                    <span className="text-4xl">🛍️</span>
                  )}
                  {product.originalPrice > product.price && (
                    <span className="absolute top-2 left-2 bg-white text-black text-xs font-bold px-2 py-1 rounded-full">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-sm mb-1">{product.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">₹{product.price}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-gray-600 text-xs line-through">₹{product.originalPrice}</span>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-3 w-full bg-white text-black text-sm py-2 rounded-lg font-semibold"
                >
                  View Product
                </motion.button>
              </motion.a>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  )
}