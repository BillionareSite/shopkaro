'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import config from '@/lib/config'
import Navbar from '../components/Navbar'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [addedMap, setAddedMap] = useState({})

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const cat = params.get('category')
    const q = params.get('search')
    if (cat) setCategory(cat)
    if (q) setSearch(q)

    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/categories').then(r => r.json())
    ]).then(([productData, categoryData]) => {
      setProducts(productData.products || [])
      setCategories(categoryData.categories || [])
      setLoading(false)
    })
  }, [])

  const handleAddToCart = (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock === 0) return
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find(item => item.id === product.id)
    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('storage'))
    setAddedMap(prev => ({ ...prev, [product.id]: true }))
    setTimeout(() => setAddedMap(prev => ({ ...prev, [product.id]: false })), 1500)
  }

  const categoryList = ['All', ...categories.map(c => c.name)]

  const filtered = products
    .filter(p => category === 'All' || p.category === category)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <Navbar />

      <div className="mx-auto max-w-7xl px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Shop</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">All Products</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Discover our entire collection</p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-placeholder)]">🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-[var(--border)]/15 bg-white/70 py-3 pl-11 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none focus:border-[var(--border)]/30 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-placeholder)] hover:text-[var(--text-primary)] transition">✕</button>
          )}
        </motion.div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto mb-8 pb-2">
          {categoryList.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition flex-shrink-0 ${category === cat ? 'bg-[var(--btn-dark)] text-white' : 'border border-[var(--border)]/15 bg-[var(--bg-card)]/55 text-[var(--text-muted)] hover:bg-white/80'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {search && (
          <p className="text-sm mb-4 text-[var(--text-muted)]">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<span className="text-[var(--text-primary)] font-medium">{search}</span>"
          </p>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#171313] border-t-transparent animate-spin mx-auto mb-3"/>
            <p className="text-sm text-[var(--text-muted)]">Loading products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 rounded-[2rem] border border-[var(--border)]/10 bg-[var(--bg-card)]/55">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-lg font-semibold text-[var(--text-primary)] mb-2">No products found!</p>
            <p className="text-sm text-[var(--text-muted)] mb-4">{search ? `No results for "${search}"` : 'No products in this category yet.'}</p>
            {search && <button onClick={() => setSearch('')} className="rounded-full border border-[var(--border)]/15 bg-[var(--bg-card)]/55 px-4 py-2 text-sm font-medium text-[var(--text-muted)] transition hover:bg-white/80">Clear Search</button>}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6"
          >
            {filtered.map(product => (
              <motion.a
                key={product.id}
                href={`/products/${product.id}`}
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                className="group overflow-hidden rounded-[1.4rem] bg-white shadow-lg shadow-[var(--shadow)]/5 flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-[var(--bg-muted)] flex-shrink-0">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/>
                  ) : (
                    <div className="grid h-full place-items-center text-sm text-[var(--text-muted)]">No image</div>
                  )}

                  {/* Discount badge */}
                  {product.originalPrice > product.price && product.stock > 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[var(--text-primary)] shadow">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                    </span>
                  )}

                  {/* Out of stock overlay */}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--text-primary)]">Out of Stock</span>
                    </div>
                  )}

                  {/* Cart button — top right corner of image */}
                  {product.stock > 0 && (
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={(e) => handleAddToCart(e, product)}
                      className={`absolute top-2 right-2 w-9 h-9 rounded-full shadow-lg flex items-center justify-center text-sm font-bold transition z-10 ${addedMap[product.id] ? 'bg-green-500 text-white' : 'bg-white/90 backdrop-blur-sm hover:bg-white text-[var(--text-primary)]'}`}
                    >
                      {addedMap[product.id] ? '✓' : '🛒'}
                    </motion.button>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="truncate text-sm font-semibold md:text-base">{product.name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-semibold">₹{product.price}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-[var(--text-placeholder)] line-through">₹{product.originalPrice}</span>
                    )}
                  </div>

                  {/* Limited stock warning — only show if 5 or less */}
                 {product.stock > 0 && product.stock <= 5 && (
                  <p className="text-xs text-red-500 font-medium mt-1">⚠️ Limited Stock!</p>
                 )}

                  {/* View Product button */}
                  <div className={`mt-3 rounded-full border border-[var(--border)]/10 px-4 py-2 text-center text-sm font-semibold transition mt-auto ${product.stock === 0 ? 'text-[var(--text-placeholder)] cursor-not-allowed' : 'group-hover:bg-[var(--btn-dark)] group-hover:text-white group-hover:border-[#171313]'}`}>
                    {product.stock === 0 ? 'Out of Stock' : 'View Product'}
                  </div>
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}
      </div>

      <footer className="border-t border-[var(--border)]/10 px-5 py-10 mt-10">
        <p className="text-center text-sm text-[var(--text-placeholder)]">{config.copyright}</p>
      </footer>
    </main>
  )
}