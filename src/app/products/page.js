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
    const params = new URLSearchParams(window.location.search)
    const cat = params.get('category')
    const q = params.get('search')
    if (cat) setCategory(cat)
    if (q) setSearch(q)

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
    <main className="min-h-screen bg-[#f6f1ea] text-[#171313]">
      <Navbar />

      <div className="mx-auto max-w-7xl px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c6048]">Shop</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">All Products</h1>
          <p className="mt-1 text-sm text-[#7b6f66]">Discover our entire collection</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b8f86]">🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-[#241a14]/15 bg-white/70 py-3 pl-11 pr-4 text-sm text-[#171313] placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9b8f86] hover:text-[#171313] transition">✕</button>
          )}
        </motion.div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto mb-8 pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition ${
                category === cat
                  ? 'bg-[#171313] text-white'
                  : 'border border-[#241a14]/15 bg-white/55 text-[#6d625a] hover:bg-white/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {search && (
          <p className="text-sm mb-4 text-[#7b6f66]">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<span className="text-[#171313] font-medium">{search}</span>"
          </p>
        )}

        {loading ? (
          <div className="text-center py-20 text-[#9b8f86]">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 rounded-[2rem] border border-[#241a14]/10 bg-white/55">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-lg font-semibold text-[#171313] mb-2">No products found!</p>
            <p className="text-sm text-[#7b6f66] mb-4">
              {search ? `No results for "${search}"` : 'No products in this category yet.'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="rounded-full border border-[#241a14]/15 bg-white/55 px-4 py-2 text-sm font-medium text-[#6d625a] transition hover:bg-white/80">
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6"
          >
            {filtered.map((product, index) => (
              <motion.a
                key={product.id}
                href={`/products/${product.id}`}
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ y: -5 }}
                className="group overflow-hidden rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5"
              >
                <div className="relative aspect-square overflow-hidden bg-[#eadfd4]">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/>
                  ) : (
                    <div className="grid h-full place-items-center text-sm text-[#7b6f66]">No image</div>
                  )}
                  {product.originalPrice > product.price && product.stock > 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#171313] shadow">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                    </span>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#171313]">Out of Stock</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="truncate text-sm font-semibold md:text-base">{product.name}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-semibold">₹{product.price}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-[#9b8f86] line-through">₹{product.originalPrice}</span>
                    )}
                  </div>
                  <div className={`mt-4 rounded-full border border-[#241a14]/10 px-4 py-2 text-center text-sm font-semibold transition ${product.stock === 0 ? 'text-[#9b8f86] cursor-not-allowed' : 'group-hover:bg-[#171313] group-hover:text-white'}`}>
                    {product.stock === 0 ? 'Out of Stock' : 'View product'}
                  </div>
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#241a14]/10 px-5 py-10 mt-10">
        <p className="text-center text-sm text-[#9b8f86]">© 2026 Shropping. All rights reserved.</p>
      </footer>
    </main>
  )
}