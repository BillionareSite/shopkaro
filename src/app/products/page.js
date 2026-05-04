'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || [])
        setLoading(false)
      })
  }, [])

  const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books', 'Toys']
  const filtered = products
    .filter(p => category === 'All' || p.category === category)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <main className="min-h-screen bg-black text-white">

      <Navbar />

      <div className="px-6 py-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold mb-6"
        >
          All Products
        </motion.h2>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-6"
        >
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111] border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
            >
              ✕
            </button>
          )}
        </motion.div>

        {/* Category Pills */}
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

        {search && (
          <p className="text-gray-500 text-sm mb-4">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<span className="text-white">{search}</span>"
          </p>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading products...</div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-gray-500 text-lg">No products found!</p>
            <p className="text-gray-600 text-sm mt-2">
              {search ? `No results for "${search}". Try a different keyword.` : 'No products in this category yet.'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-4 text-white border border-gray-700 px-4 py-2 rounded-lg text-sm hover:border-white transition"
              >
                Clear Search
              </button>
            )}
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
                {/* Image with Out of Stock overlay */}
                <div className="relative bg-[#1a1a1a] h-36 md:h-44 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover"/>
                  ) : (
                    <span className="text-4xl">🛍️</span>
                  )}
                  {product.originalPrice > product.price && product.stock > 0 && (
                    <span className="absolute top-2 left-2 bg-white text-black text-xs font-bold px-2 py-1 rounded-full">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                    </span>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                <h4 className="font-semibold text-sm mb-1">{product.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">₹{product.price}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-gray-600 text-xs line-through">₹{product.originalPrice}</span>
                  )}
                </div>

                {/* Button */}
                <motion.button
                  whileHover={{ scale: product.stock === 0 ? 1 : 1.05 }}
                  whileTap={{ scale: product.stock === 0 ? 1 : 0.95 }}
                  disabled={product.stock === 0}
                  className={`mt-3 w-full text-sm py-2 rounded-lg font-semibold transition ${
                    product.stock === 0
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'View Product'}
                </motion.button>
              </motion.a>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  )
}