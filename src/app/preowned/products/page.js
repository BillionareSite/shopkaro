'use client'
import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import config from '@/lib/config'

const CONDITIONS = {
  excellent: { label: 'Excellent', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  good: { label: 'Good', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  fair: { label: 'Fair', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' }
}

function PreownedProducts() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [addedMap, setAddedMap] = useState({})
  const [cartCount, setCartCount] = useState(0)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All')
  const [selectedCondition, setSelectedCondition] = useState('All')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    fetch('/api/preowned/products')
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setLoading(false) })

    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartCount(cart.reduce((s, i) => s + i.quantity, 0))
    }
    updateCart()
    window.addEventListener('storage', updateCart)
    return () => window.removeEventListener('storage', updateCart)
  }, [])

  const handleAddToCart = (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock === 0) return
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find(i => i.id === product.id && i.preowned)
    if (existing) { existing.quantity += 1 } else {
      cart.push({ ...product, quantity: 1, preowned: true })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('storage'))
    setAddedMap(prev => ({ ...prev, [product.id]: true }))
    setTimeout(() => setAddedMap(prev => ({ ...prev, [product.id]: false })), 1500)
    setCartCount(cart.reduce((s, i) => s + i.quantity, 0))
  }

  const categories = ['All', ...new Set(products.map(p => p.category)).values()]

  const filtered = products
    .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
    .filter(p => selectedCondition === 'All' || p.condition === selectedCondition)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'price_low') return a.price - b.price
      if (sortBy === 'price_high') return b.price - a.price
      if (sortBy === 'discount') return (1 - b.price / b.originalPrice) - (1 - a.price / a.originalPrice)
      return 0
    })

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/8 bg-[#0f1117]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-6">
            <Link href="/preowned" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-black">P</div>
              <div>
                <span className="text-sm font-bold text-white">{config.brandName}</span>
                <span className="ml-1 text-xs font-semibold text-emerald-400">· Preowned</span>
              </div>
            </Link>
            <Link href="/" className="hidden text-xs text-white/40 hover:text-white/70 transition md:block">← Main Store</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/cart" className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 hover:border-emerald-500/50 transition">
              <span className="text-sm">🛒</span>
              {cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-black">{cartCount}</span>}
            </Link>
            <Link href="/auth/login" className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-black hover:bg-emerald-400 transition">Account</Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-5 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">All Listings</p>
          <h1 className="text-3xl font-bold">Preowned Items</h1>
          <p className="text-white/40 mt-1 text-sm">{filtered.length} item{filtered.length !== 1 ? 's' : ''} available</p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
            <input
              type="text"
              placeholder="Search preowned items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold border transition flex-shrink-0 ${selectedCategory === cat ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-white/10 text-white/60 hover:border-emerald-500/40 hover:text-white'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {['All', 'excellent', 'good', 'fair'].map(c => (
                <button key={c} onClick={() => setSelectedCondition(c)} className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold border transition ${selectedCondition === c ? 'bg-white/15 border-white/30 text-white' : 'border-white/8 text-white/40 hover:border-white/20 hover:text-white/70'}`}>
                  {c === 'All' ? 'All Conditions' : CONDITIONS[c]?.label}
                </button>
              ))}
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="ml-auto rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60 focus:outline-none focus:border-emerald-500/50">
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="discount">Most Discounted</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto mb-3"/>
            <p className="text-white/40 text-sm">Loading listings...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/8 bg-white/3 py-20 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-white/40">No items found. Try different filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {filtered.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.2) }}>
                <Link href={`/preowned/products/${product.id}`} className="group block rounded-2xl border border-white/8 bg-white/3 overflow-hidden hover:border-emerald-500/30 hover:bg-white/5 transition">
                  <div className="relative aspect-square overflow-hidden bg-white/5">
                    {product.images?.[0]
                      ? <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/>
                      : <div className="grid h-full place-items-center text-white/20 text-3xl">📦</div>
                    }
                    {product.originalPrice > product.price && (
                      <span className="absolute left-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-black">
                        {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                      </span>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <span className="rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-semibold text-white/70">Sold</span>
                      </div>
                    )}
                    {product.stock > 0 && (
                      <button onClick={(e) => handleAddToCart(e, product)} className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border transition text-xs ${addedMap[product.id] ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-black/50 border-white/20 text-white hover:bg-black/70'}`}>
                        {addedMap[product.id] ? '✓' : '🛒'}
                      </button>
                    )}
                    {product.featured && (
                      <span className="absolute bottom-2 left-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">⭐ Featured</span>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="mb-1.5 flex items-center gap-1.5 flex-wrap">
                      {product.condition && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${CONDITIONS[product.condition]?.color || CONDITIONS.good.color}`}>
                          {CONDITIONS[product.condition]?.label}
                        </span>
                      )}
                      <span className="text-[10px] text-white/30">{product.category}</span>
                    </div>
                    <p className="text-sm font-semibold text-white truncate">{product.name}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-sm font-bold text-emerald-400">₹{product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-xs text-white/30 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                    <p className="mt-2 rounded-full border border-white/8 py-1.5 text-center text-xs font-semibold text-white/60 group-hover:border-emerald-500/40 group-hover:text-emerald-400 transition">
                      {product.stock === 0 ? 'Sold Out' : 'View Item'}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/8 px-5 py-8 mt-12">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/preowned" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-black">P</div>
            <span className="text-sm font-semibold">{config.brandName} Preowned</span>
          </Link>
          <div className="flex gap-6 text-sm text-white/40">
            <Link href="/" className="hover:text-white transition">Main Store</Link>
            <Link href="/orders" className="hover:text-white transition">My Orders</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
          </div>
          <p className="text-xs text-white/25">{config.copyright}</p>
        </div>
      </footer>
    </div>
  )
}

export default function PreownedProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"/>
      </div>
    }>
      <PreownedProducts />
    </Suspense>
  )
}