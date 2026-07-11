'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import config from '@/lib/config'

const CONDITIONS = {
  excellent: { label: 'Excellent', className: 'bg-[#ccff2f] text-black' },
  good: { label: 'Good', className: 'bg-[#dff8c9] text-black' },
  fair: { label: 'Fair', className: 'bg-[#ffcf5a] text-black' },
}

const categoryPills = ['All', 'Sneakers', 'Streetwear', 'Hoodies', 'Tops', 'Bottoms', 'Accessories', 'Tech']

export default function PreownedProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cartCount, setCartCount] = useState(0)
  const [addedMap, setAddedMap] = useState({})
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedCondition, setSelectedCondition] = useState('All')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const category = params.get('category')
    if (category) setSelectedCategory(category)

    fetch('/api/preowned/products')
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))

    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0))
    }

    updateCart()
    window.addEventListener('storage', updateCart)
    return () => window.removeEventListener('storage', updateCart)
  }, [])

  const categories = useMemo(() => {
    const fromProducts = products.map((p) => p.category).filter(Boolean)
    return ['All', ...new Set([...categoryPills.filter((c) => c !== 'All'), ...fromProducts])]
  }, [products])

  const filtered = useMemo(() => {
    return products
      .filter((p) => selectedCategory === 'All' || p.category === selectedCategory)
      .filter((p) => selectedCondition === 'All' || p.condition === selectedCondition)
      .filter((p) => {
        const text = `${p.name || ''} ${p.description || ''} ${p.category || ''}`.toLowerCase()
        return text.includes(search.toLowerCase())
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return Number(a.price || 0) - Number(b.price || 0)
        if (sortBy === 'price_high') return Number(b.price || 0) - Number(a.price || 0)
        if (sortBy === 'discount') {
          const da = a.originalPrice ? 1 - Number(a.price || 0) / Number(a.originalPrice) : 0
          const db = b.originalPrice ? 1 - Number(b.price || 0) / Number(b.originalPrice) : 0
          return db - da
        }
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      })
  }, [products, selectedCategory, selectedCondition, search, sortBy])

  const addToCart = (e, product) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.stock === 0) return

    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find((item) => item.id === product.id && item.preowned)

    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({ ...product, quantity: 1, preowned: true })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('storage'))

    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0))
    setAddedMap((prev) => ({ ...prev, [product.id]: true }))

    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [product.id]: false }))
    }, 1400)
  }

  return (
    <main className="min-h-screen bg-[#fffaf0] text-black">
      <header className="sticky top-0 z-50 px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-[26px] bg-[#090909] px-4 py-3 text-white shadow-[0_16px_40px_rgba(0,0,0,0.18)] md:px-6">
          <Link href="/preowned" className="flex items-center gap-3">
            {config.logo ? (
              <img src={config.logo} alt={config.brandName} className="h-10 w-10 rounded-full bg-white object-cover" />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#ccff2f] font-black text-black">D</div>
            )}
            <div className="leading-tight">
              <p className="text-xl font-black tracking-tight">
                Drop<span className="text-[#ccff2f]">EZ</span>
              </p>
              <p className="-mt-0.5 w-fit rounded-full bg-[#ff5fa2] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-black">
                Preowned
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-white/85 md:flex">
            <Link href="/preowned">Home</Link>
            <Link href="/preowned/products">Shop</Link>
            <Link href="/">Main Store</Link>
            <Link href="/contact">Help</Link>
          </nav>

          <Link href="/cart" className="relative grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/5 text-lg">
            Bag
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#ff5fa2] px-1 text-xs font-black text-black">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-5 pt-6 md:pt-8">
        <div className="grid gap-5 rounded-[28px] border border-black/10 bg-white/70 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.08)] md:grid-cols-[1fr_0.8fr] md:p-7">
          <div>
            <p className="mb-3 w-fit rotate-[-2deg] bg-[#ccff2f] px-3 py-1 text-xs font-black uppercase tracking-widest">
              Verified heat only
            </p>
            <h1 className="max-w-3xl text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-6xl">
              Pre-loved but still slaps.
            </h1>
            <p className="mt-4 max-w-xl text-sm font-medium text-black/60 md:text-base">
              Checked items, lowkey prices, fresh fits. No random chaos, only verified drops.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-black/40">Search</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Find sneakers, hoodies, bags..."
                  className="h-13 w-full rounded-full border border-black/15 bg-white px-4 py-3 pl-[74px] text-sm font-semibold outline-none transition placeholder:text-black/35 focus:border-black"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-13 rounded-full border border-black/15 bg-white px-4 py-3 text-sm font-bold outline-none"
              >
                <option value="newest">Newest first</option>
                <option value="price_low">Price low</option>
                <option value="price_high">Price high</option>
                <option value="discount">Best discount</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              ['100%', 'Verified'],
              ['Fast', 'Dispatch'],
              ['Easy', 'Returns'],
            ].map(([title, sub], index) => (
              <div
                key={title}
                className={`rounded-3xl p-4 ${
                  index === 1 ? 'bg-[#ff5fa2]' : index === 2 ? 'bg-[#ccff2f]' : 'bg-[#090909] text-white'
                }`}
              >
                <p className="text-2xl font-black">{title}</p>
                <p className="mt-1 text-xs font-bold opacity-70">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-black transition ${
                selectedCategory === cat
                  ? 'border-black bg-black text-white'
                  : 'border-black/15 bg-white text-black hover:border-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
          {['All', 'excellent', 'good', 'fair'].map((condition) => (
            <button
              key={condition}
              onClick={() => setSelectedCondition(condition)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black transition ${
                selectedCondition === condition
                  ? 'border-black bg-[#ccff2f] text-black'
                  : 'border-black/15 bg-white text-black/60 hover:text-black'
              }`}
            >
              {condition === 'All' ? 'All condition' : CONDITIONS[condition]?.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#ff2f87]">Hot drops</p>
            <h2 className="text-3xl font-black tracking-tight">All preowned items</h2>
          </div>
          <p className="text-sm font-bold text-black/50">{filtered.length} items</p>
        </div>

        {loading ? (
          <div className="grid min-h-[280px] place-items-center rounded-[28px] border border-black/10 bg-white">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-[#ccff2f]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[28px] border border-black/10 bg-white p-12 text-center">
            <h3 className="text-2xl font-black">No drops found</h3>
            <p className="mt-2 text-sm font-medium text-black/50">Try another search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {filtered.map((product, index) => {
              const condition = CONDITIONS[product.condition] || CONDITIONS.good
              const soldOut = product.stock === 0

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.18) }}
                >
                  <Link
                    href={`/preowned/products/${product.id}`}
                    className="group block overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_14px_35px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.11)]"
                  >
                    <div className="relative h-44 overflow-hidden bg-[#f4eedf] md:h-52">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-sm font-black text-black/30">No image</div>
                      )}

                      <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-black ${condition.className}`}>
                        {condition.label}
                      </span>

                      <button
                        onClick={(e) => addToCart(e, product)}
                        disabled={soldOut}
                        className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-black/10 text-xs font-black transition ${
                          addedMap[product.id] ? 'bg-[#ccff2f] text-black' : 'bg-white/90 text-black hover:bg-black hover:text-white'
                        }`}
                      >
                        {addedMap[product.id] ? 'OK' : '+'}
                      </button>

                      {soldOut && (
                        <div className="absolute inset-0 grid place-items-center bg-black/55">
                          <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-black">Sold out</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="truncate text-sm font-black">{product.name}</h3>
                      <p className="mt-1 truncate text-xs font-semibold text-black/45">{product.category || 'Preowned'}</p>

                      <div className="mt-3 flex items-end justify-between gap-2">
                        <div>
                          <p className="text-base font-black">Rs. {product.price}</p>
                          {product.originalPrice > product.price && (
                            <p className="text-xs font-bold text-black/35 line-through">Rs. {product.originalPrice}</p>
                          )}
                        </div>
                        <span className="rounded-full bg-[#f2eee4] px-3 py-1 text-[10px] font-black text-black/70">
                          View
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}