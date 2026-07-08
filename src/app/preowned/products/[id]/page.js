'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import config from '@/lib/config'

const CONDITIONS = {
  excellent: { label: 'Excellent', desc: 'Like new. Barely used, no visible wear.', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  good: { label: 'Good', desc: 'Minor signs of use. Fully functional.', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  fair: { label: 'Fair', desc: 'Visible wear but works perfectly.', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' }
}

export default function PreownedProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [added, setAdded] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    fetch(`/api/preowned/products/${id}`)
      .then(r => r.json())
      .then(d => { setProduct(d.product); setLoading(false) })

    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartCount(cart.reduce((s, i) => s + i.quantity, 0))
    }
    updateCart()
    window.addEventListener('storage', updateCart)
    return () => window.removeEventListener('storage', updateCart)
  }, [id])

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find(i => i.id === product.id && i.preowned)
    if (existing) { existing.quantity += 1 } else {
      cart.push({ ...product, quantity: 1, preowned: true })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('storage'))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
    setCartCount(cart.reduce((s, i) => s + i.quantity, 0))
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"/>
    </div>
  )

  if (!product) return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-4">📦</p>
        <p className="text-white/50 mb-4">Product not found</p>
        <Link href="/preowned/products" className="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black">Browse All</Link>
      </div>
    </div>
  )

  const condition = CONDITIONS[product.condition] || CONDITIONS.good
  const discount = product.originalPrice > product.price ? Math.round((1 - product.price / product.originalPrice) * 100) : 0

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
            <Link href="/preowned/products" className="hidden text-xs text-white/40 hover:text-white/70 transition md:block">← All Listings</Link>
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

      {/* Breadcrumb */}
      <div className="border-b border-white/8 px-5 py-3">
        <div className="mx-auto max-w-7xl flex items-center gap-2 text-xs text-white/30">
          <Link href="/preowned" className="hover:text-white transition">Preowned</Link>
          <span>/</span>
          <Link href="/preowned/products" className="hover:text-white transition">All Items</Link>
          <span>/</span>
          <span className="text-white/60 truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-10 lg:grid-cols-2">

          {/* Images */}
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/3 aspect-square">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={product.images?.[activeImage] || ''}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-full w-full object-cover"
                />
              </AnimatePresence>
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border transition ${activeImage === i ? 'border-emerald-500' : 'border-white/10 opacity-50 hover:opacity-80'}`}>
                    <img src={img} alt="" className="h-full w-full object-cover"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${condition.color}`}>
                  {condition.label} Condition
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">{product.category}</span>
                {product.featured && <span className="rounded-full bg-emerald-500/15 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">⭐ Featured</span>}
              </div>
              <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>
            </div>

            {/* Price */}
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-emerald-400">₹{product.price}</span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-white/30 line-through mb-0.5">₹{product.originalPrice}</span>
                    <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-bold text-black mb-0.5">{discount}% off</span>
                  </>
                )}
              </div>
              {product.originalPrice > product.price && (
                <p className="text-xs text-white/40 mt-1">You save ₹{product.originalPrice - product.price} vs original price</p>
              )}
            </div>

            {/* Condition info */}
            <div className={`rounded-2xl border p-4 ${condition.color}`}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1">Condition: {condition.label}</p>
              <p className="text-xs opacity-80">{condition.desc}</p>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Description</p>
              <p className="text-sm text-white/70 leading-relaxed">{product.description}</p>
            </div>

            {/* Stock */}
            <div>
              {product.stock === 0 ? (
                <p className="text-sm font-semibold text-red-400">❌ Sold Out</p>
              ) : product.stock <= 2 ? (
                <p className="text-sm font-semibold text-amber-400">⚠️ Only {product.stock} left!</p>
              ) : (
                <p className="text-sm font-semibold text-emerald-400">✓ Available</p>
              )}
              {product.sameDayPincodes?.length > 0 && (
                <p className="text-xs text-white/40 mt-1">⚡ Same-day delivery available in select pincodes</p>
              )}
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 rounded-full py-3.5 text-sm font-bold transition disabled:opacity-40 ${added ? 'bg-white text-black' : 'bg-emerald-500 text-black hover:bg-emerald-400'}`}
              >
                {added ? '✓ Added to Cart!' : product.stock === 0 ? 'Sold Out' : '🛒 Add to Cart'}
              </motion.button>
              <Link href="/checkout" className="flex-1 rounded-full border border-white/15 py-3.5 text-center text-sm font-semibold text-white/80 hover:border-white/30 hover:text-white transition">
                Buy Now →
              </Link>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: '🔍', text: 'Verified Item' },
                { icon: '↩️', text: 'Return Policy' },
                { icon: '🔒', text: 'Secure Payment' }
              ].map((b, i) => (
                <div key={i} className="rounded-xl border border-white/8 bg-white/3 p-3 text-center">
                  <p className="text-lg mb-1">{b.icon}</p>
                  <p className="text-[10px] text-white/50 font-medium">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/8 px-5 py-8 mt-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/preowned" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-black">P</div>
            <span className="text-sm font-semibold">{config.brandName} Preowned</span>
          </Link>
          <p className="text-xs text-white/25">{config.copyright}</p>
        </div>
      </footer>
    </div>
  )
}