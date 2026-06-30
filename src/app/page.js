'use client'
import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import config from '@/lib/config'

export default function Home() {
  const [products, setProducts] = useState([])
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])
  const [activeSlide, setActiveSlide] = useState(0)
  const [addedMap, setAddedMap] = useState({})

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const all = data.products || []
        setProducts(all)
        setFeatured(all.filter(p => p.featured))
      })

    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
  }, [])

  useEffect(() => {
    if (featured.length <= 1) return
    const timer = setInterval(() => {
      setActiveSlide(current => (current + 1) % featured.length)
    }, 4200)
    return () => clearInterval(timer)
  }, [featured.length])

  const currentFeatured = useMemo(() => featured[activeSlide], [featured, activeSlide])

  const nextSlide = () => setActiveSlide(current => (current + 1) % featured.length)
  const prevSlide = () => setActiveSlide(current => current === 0 ? featured.length - 1 : current - 1)

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

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171313]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-7 px-5 py-8 md:py-10 lg:grid-cols-[1fr_0.65fr]">
          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="w-fit rounded-full border border-[#241a14]/10 bg-white/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#7b4d36]">
              Modern essentials, picked better
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
              Premium finds for your everyday glow.
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#6f6258]">
              Shop stylish, useful, and reliable products with a cleaner buying experience. No loud clutter, just better picks.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href="/products" className="rounded-full bg-[#171313] px-8 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-[#3a2a21]">
                Explore Collection
              </a>
              <a href="#featured" className="rounded-full border border-[#241a14]/15 px-8 py-3.5 text-center text-sm font-semibold text-[#171313] transition hover:bg-white/55">
                View Featured
              </a>
            </div>
            <div className="mt-6 grid max-w-lg grid-cols-3 gap-4 border-t border-[#241a14]/10 pt-4">
              <div><p className="text-2xl font-semibold">100%</p><p className="mt-1 text-xs text-[#7b6f66]">Quality checked</p></div>
              <div><p className="text-2xl font-semibold">Fast</p><p className="mt-1 text-xs text-[#7b6f66]">Dispatch</p></div>
              <div><p className="text-2xl font-semibold">Easy</p><p className="mt-1 text-xs text-[#7b6f66]">Shopping</p></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.75, delay: 0.1 }} className="relative">
            <div className="overflow-hidden rounded-[2rem] bg-[#e8ddd1] shadow-2xl shadow-[#3d2619]/15">
              <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1400&auto=format&fit=crop" alt={config.brandName + ' collection'} className="h-[300px] w-full object-cover md:h-[360px]"/>
            </div>
            <div className="absolute bottom-4 left-4 right-4 rounded-3xl border border-white/55 bg-white/75 p-4 shadow-xl shadow-black/10 backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c6048]">Today's mood</p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <h3 className="text-lg font-semibold">Soft premium essentials</h3>
                <span className="text-sm text-[#6f6258]">New in</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Slideshow */}
      <section id="featured" className="px-5 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-end justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c6048]">Featured</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Featured products</h2>
            </div>
            <a href="/products" className="text-sm font-semibold text-[#7b6f66] hover:text-[#171313]">View all</a>
          </div>

          {featured.length === 0 ? (
            <div className="rounded-[2rem] border border-[#241a14]/10 bg-white/55 py-16 text-center">
              <p className="text-[#7b6f66]">No featured products yet.</p>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[2rem] border border-[#241a14]/10 bg-white/65 shadow-xl shadow-[#3d2619]/5">
              <AnimatePresence mode="wait">
                {currentFeatured && (
                  <motion.a
                    key={currentFeatured.id}
                    href={`/products/${currentFeatured.id}`}
                    initial={{ opacity: 0, x: 35 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -35 }}
                    transition={{ duration: 0.45 }}
                    className="grid min-h-[300px] md:grid-cols-2"
                  >
                    <div className="bg-[#eadfd4]">
                      {currentFeatured.images?.[0] ? (
                        <img src={currentFeatured.images[0]} alt={currentFeatured.name} className="h-full min-h-[240px] w-full object-cover"/>
                      ) : (
                        <div className="grid h-full min-h-[240px] place-items-center text-[#7b6f66]">No image</div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center p-6 md:p-8">
                      <p className="w-fit rounded-full bg-[#171313] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">Editor's pick</p>
                      <h3 className="mt-4 text-2xl font-semibold tracking-tight md:text-4xl">{currentFeatured.name}</h3>
                      <div className="mt-4 flex items-center gap-3">
                        <span className="text-2xl font-semibold">₹{currentFeatured.price}</span>
                        {currentFeatured.originalPrice > currentFeatured.price && (
                          <span className="text-base text-[#9b8f86] line-through">₹{currentFeatured.originalPrice}</span>
                        )}
                      </div>
                      <p className="mt-4 max-w-md text-sm leading-6 text-[#6f6258]">
                        A featured pick from {config.brandName}, selected for style, utility, and everyday value.
                      </p>
                      <div className="mt-5 flex items-center gap-3">
                        <div className="w-fit rounded-full bg-[#171313] px-6 py-2.5 text-sm font-semibold text-white">Shop product</div>
                        {currentFeatured.stock > 0 && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => handleAddToCart(e, currentFeatured)}
                            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${addedMap[currentFeatured.id] ? 'bg-green-600 text-white' : 'border border-[#241a14]/15 bg-white/55 text-[#171313] hover:bg-white'}`}
                          >
                            {addedMap[currentFeatured.id] ? '✓ Added!' : '🛒 Add to Cart'}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.a>
                )}
              </AnimatePresence>

              {featured.length > 1 && (
                <>
                  <button onClick={prevSlide} className="absolute left-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-xl shadow-lg backdrop-blur transition hover:bg-white">‹</button>
                  <button onClick={nextSlide} className="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-xl shadow-lg backdrop-blur transition hover:bg-white">›</button>
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                    {featured.map((item, index) => (
                      <button key={item.id} onClick={() => setActiveSlide(index)} className={`h-2 rounded-full transition ${activeSlide === index ? 'w-8 bg-[#171313]' : 'w-2 bg-[#171313]/25'}`}/>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="px-5 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c6048]">Categories</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Shop by mood</h2>
          </div>
          {categories.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {categories.slice(0, 4).map((cat, index) => (
                <motion.a
                  key={cat.id}
                  href={`/products?category=${cat.name}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  className="group overflow-hidden rounded-[1.6rem] bg-white shadow-lg shadow-[#3d2619]/5"
                >
                  {/* ── FIXED: show image if available, fallback to emoji ── */}
                  <div className="aspect-[4/5] overflow-hidden bg-[#eadfd4] flex items-center justify-center">
                    {cat.image && cat.image.trim() !== '' ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-7xl">{cat.icon}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-5">
                    <h3 className="font-semibold">{cat.name}</h3>
                    <span className="text-[#8c6048]">→</span>
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Products */}
      <section className="px-5 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c6048]">Collection</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Latest products</h2>
          </div>
          {products.length === 0 ? (
            <div className="rounded-[2rem] border border-[#241a14]/10 bg-white/55 py-16 text-center">
              <p className="text-[#7b6f66]">No products available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {products.map((product, index) => (
                <motion.a
                  key={product.id}
                  href={`/products/${product.id}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.18) }}
                  className="group overflow-hidden rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 flex flex-col"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#eadfd4] flex-shrink-0">
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
                    {product.stock > 0 && (
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={(e) => handleAddToCart(e, product)}
                        className={`absolute top-2 right-2 w-9 h-9 rounded-full shadow-lg flex items-center justify-center text-sm transition ${addedMap[product.id] ? 'bg-green-500 text-white' : 'bg-white/90 hover:bg-white text-[#171313]'}`}
                      >
                        {addedMap[product.id] ? '✓' : '🛒'}
                      </motion.button>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="truncate text-sm font-semibold md:text-base">{product.name}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-semibold">₹{product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-sm text-[#9b8f86] line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                    {/* ── FIXED: show "Limited Stock!" instead of exact number ── */}
                    {product.stock > 0 && product.stock <= 5 && (
                      <p className="text-xs text-red-500 font-medium mt-1">⚠️ Limited Stock!</p>
                    )}
                    <div className="mt-3 rounded-full border border-[#241a14]/10 px-4 py-2 text-center text-sm font-semibold transition group-hover:bg-[#171313] group-hover:text-white mt-auto">
                      {product.stock === 0 ? 'Out of Stock' : 'View Product'}
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Banner */}
      <section className="px-5 py-12">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-[2rem] bg-[#171313] p-10 md:p-14 flex flex-col md:flex-row gap-6 justify-between items-center text-center md:text-left"
          >
            <div className="relative z-10">
              <h3 className="text-3xl font-semibold text-white mb-2">Special Deals 🎉</h3>
              <p className="text-[#9b8f86]">Up to 70% off on selected items. Limited time only!</p>
            </div>
            <a href="/products" className="relative z-10 flex-shrink-0">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[#171313] transition hover:bg-[#f6f1ea]">
                Explore Deals
              </motion.button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#241a14]/10 px-5 py-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#171313] text-xs font-semibold text-white">{config.shortCode}</div>
              <h3 className="text-xl font-semibold">{config.brandName}</h3>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#7b6f66]">Premium everyday products curated with style, quality, and trust.</p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm md:grid-cols-3">
            <div>
              <h4 className="font-semibold">Company</h4>
              <div className="mt-4 space-y-3 text-[#7b6f66]">
                <a href="/about" className="block hover:text-[#171313]">About</a>
                <a href="/contact" className="block hover:text-[#171313]">Contact</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold">Support</h4>
              <div className="mt-4 space-y-3 text-[#7b6f66]">
                <a href="/help" className="block hover:text-[#171313]">Help Center</a>
                <a href="/contact" className="block hover:text-[#171313]">Contact Us</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold">Social</h4>
              <div className="mt-4 space-y-3 text-[#7b6f66]">
                <a href={config.social.instagram} className="block hover:text-[#171313]">Instagram</a>
                <a href={config.social.twitter} className="block hover:text-[#171313]">Twitter</a>
                <a href={config.social.youtube} className="block hover:text-[#171313]">YouTube</a>
              </div>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-7xl border-t border-[#241a14]/10 pt-6 text-sm text-[#9b8f86]">{config.copyright}</p>
      </footer>
    </main>
  )
}