'use client'
import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import config from '@/lib/config'

const CONDITIONS = {
  excellent: { label: 'Excellent', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  good: { label: 'Good', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  fair: { label: 'Fair', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' }
}

export default function PreownedHome() {
  const [products, setProducts] = useState([])
  const [featured, setFeatured] = useState([])
  const [activeSlide, setActiveSlide] = useState(0)
  const [addedMap, setAddedMap] = useState({})
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    fetch('/api/preowned/products')
      .then(r => r.json())
      .then(d => {
        const all = d.products || []
        setProducts(all)
        setFeatured(all.filter(p => p.featured))
      })

    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartCount(cart.reduce((s, i) => s + i.quantity, 0))
    }
    updateCart()
    window.addEventListener('storage', updateCart)
    return () => window.removeEventListener('storage', updateCart)
  }, [])

  useEffect(() => {
    if (featured.length <= 1) return
    const t = setInterval(() => setActiveSlide(c => (c + 1) % featured.length), 4500)
    return () => clearInterval(t)
  }, [featured.length])

  const currentFeatured = useMemo(() => featured[activeSlide], [featured, activeSlide])

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

  const categories = [...new Set(products.map(p => p.category))].filter(Boolean)

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
            <Link href="/preowned/products" className="hidden rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:border-white/30 hover:text-white transition sm:block">Browse All</Link>
            <Link href="/cart" className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 hover:border-emerald-500/50 transition">
              <span className="text-sm">🛒</span>
              {cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-black">{cartCount}</span>}
            </Link>
            <Link href="/auth/login" className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-black hover:bg-emerald-400 transition">Account</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/8">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent"/>
        <div className="mx-auto max-w-7xl px-5 py-16 md:py-24">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
                ♻️ Sustainable Shopping
              </span>
              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                Pre-loved.<br/>
                <span className="text-emerald-400">Priced right.</span>
              </h1>
              <p className="mt-4 text-base text-white/50 md:text-lg">
                Verified secondhand products from {config.brandName}. Every item inspected, fairly priced, and ready to find a new home.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/preowned/products" className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-black hover:bg-emerald-400 transition">
                  Browse Listings
                </Link>
                <Link href="/" className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/80 hover:border-white/30 hover:text-white transition">
                  New Items →
                </Link>
              </div>
              <div className="mt-10 flex gap-6 border-t border-white/8 pt-6">
                {[
                  { value: products.length + '+', label: 'Listings' },
                  { value: '100%', label: 'Verified' },
                  { value: 'Upto 70%', label: 'Off MRP' }
                ].map((s, i) => (
                  <div key={i}>
                    <p className="text-xl font-bold text-white">{s.value}</p>
                    <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Slideshow */}
      {featured.length > 0 && (
        <section className="border-b border-white/8 px-5 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Featured</p>
                <h2 className="mt-1 text-2xl font-bold">Top Picks</h2>
              </div>
              <Link href="/preowned/products?featured=true" className="text-sm text-white/40 hover:text-white transition">View all →</Link>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/3">
              <AnimatePresence mode="wait">
                {currentFeatured && (
                  <motion.div key={currentFeatured.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }}
                    className="grid md:grid-cols-2 min-h-[320px]">
                    <div className="bg-white/5 overflow-hidden">
                      {currentFeatured.images?.[0]
                        ? <img src={currentFeatured.images[0]} alt={currentFeatured.name} className="h-full min-h-[260px] w-full object-cover"/>
                        : <div className="grid h-full min-h-[260px] place-items-center text-white/20 text-4xl">📦</div>
                      }
                    </div>
                    <div className="flex flex-col justify-center p-6 md:p-10">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">Featured</span>
                        {currentFeatured.condition && (
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${CONDITIONS[currentFeatured.condition]?.color || CONDITIONS.good.color}`}>
                            {CONDITIONS[currentFeatured.condition]?.label || 'Good'} Condition
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold md:text-3xl">{currentFeatured.name}</h3>
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-2xl font-bold text-emerald-400">₹{currentFeatured.price}</span>
                        {currentFeatured.originalPrice > currentFeatured.price && (
                          <span className="text-base text-white/30 line-through">₹{currentFeatured.originalPrice}</span>
                        )}
                        {currentFeatured.originalPrice > currentFeatured.price && (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-400">
                            {Math.round((1 - currentFeatured.price / currentFeatured.originalPrice) * 100)}% off
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-sm text-white/50 line-clamp-2">{currentFeatured.description}</p>
                      <div className="mt-6 flex gap-3">
                        <Link href={`/preowned/products/${currentFeatured.id}`} className="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 transition">
                          View Item
                        </Link>
                        {currentFeatured.stock > 0 && (
                          <button onClick={(e) => handleAddToCart(e, currentFeatured)} className={`rounded-full px-5 py-2.5 text-sm font-semibold border transition ${addedMap[currentFeatured.id] ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-white/15 text-white/80 hover:border-white/30'}`}>
                            {addedMap[currentFeatured.id] ? '✓ Added!' : '🛒 Add to Cart'}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {featured.length > 1 && (
                <>
                  <button onClick={() => setActiveSlide(c => c === 0 ? featured.length - 1 : c - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition">‹</button>
                  <button onClick={() => setActiveSlide(c => (c + 1) % featured.length)} className="absolute right-3 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition">›</button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {featured.map((_, i) => <button key={i} onClick={() => setActiveSlide(i)} className={`h-1.5 rounded-full transition-all ${activeSlide === i ? 'w-6 bg-emerald-400' : 'w-1.5 bg-white/20'}`}/>)}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="border-b border-white/8 px-5 py-12">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">Browse</p>
            <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/preowned/products" className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/70 hover:border-emerald-500/40 hover:text-white hover:bg-emerald-500/5 transition">
                All Items
              </Link>
              {categories.map(cat => (
                <Link key={cat} href={`/preowned/products?category=${cat}`} className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/70 hover:border-emerald-500/40 hover:text-white hover:bg-emerald-500/5 transition">
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Products */}
      <section className="px-5 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">Latest</p>
              <h2 className="text-2xl font-bold">Recent Listings</h2>
            </div>
            <Link href="/preowned/products" className="text-sm text-white/40 hover:text-white transition">View all →</Link>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-white/3 py-20 text-center">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-white/40">No listings yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
              {products.slice(0, 8).map((product, i) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i * 0.04, 0.2) }}>
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
                    </div>
                    <div className="p-3">
                      <div className="mb-1.5">
                        {product.condition && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${CONDITIONS[product.condition]?.color || CONDITIONS.good.color}`}>
                            {CONDITIONS[product.condition]?.label}
                          </span>
                        )}
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
      </section>

      {/* Why Preowned */}
      <section className="border-t border-white/8 px-5 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-8 md:p-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">Why Preowned?</p>
            <h2 className="text-2xl font-bold mb-8">Better for you. Better for the planet.</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                { icon: '🔍', title: 'Verified Condition', desc: 'Every item is personally inspected and graded before listing. No surprises.' },
                { icon: '💰', title: 'Fair Pricing', desc: 'Up to 70% off original retail price. You get real value, not inflated secondhand markups.' },
                { icon: '♻️', title: 'Sustainable', desc: 'Give quality products a second life instead of letting them go to waste.' }
              ].map((item, i) => (
                <div key={i} className="rounded-xl border border-white/8 bg-white/3 p-5">
                  <p className="text-2xl mb-3">{item.icon}</p>
                  <p className="font-semibold text-white mb-1">{item.title}</p>
                  <p className="text-sm text-white/40">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 px-5 py-10">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-black">P</div>
            <span className="text-sm font-semibold text-white">{config.brandName} Preowned</span>
          </div>
          <div className="flex gap-6 text-sm text-white/40">
            <Link href="/" className="hover:text-white transition">Main Store</Link>
            <Link href="/preowned/products" className="hover:text-white transition">All Listings</Link>
            <Link href="/orders" className="hover:text-white transition">My Orders</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
          </div>
          <p className="text-xs text-white/25">{config.copyright}</p>
        </div>
      </footer>
    </div>
  )
}