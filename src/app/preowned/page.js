'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import config from '@/lib/config'

const CONDITIONS = {
  excellent: {
    label: 'Excellent',
    className: 'bg-[#ccff2f] text-black border-[#ccff2f]',
  },
  good: {
    label: 'Good',
    className: 'bg-[#f75ca8] text-black border-[#f75ca8]',
  },
  fair: {
    label: 'Fair',
    className: 'bg-yellow-300 text-black border-yellow-300',
  },
}

const fallbackCategories = [
  'All',
  'Sneakers',
  'Streetwear',
  'Hoodies',
  'Tops',
  'Bottoms',
  'Accessories',
  'Tech',
]

export default function PreownedHome() {
  const [products, setProducts] = useState([])
  const [featured, setFeatured] = useState([])
  const [activeSlide, setActiveSlide] = useState(0)
  const [addedMap, setAddedMap] = useState({})
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    fetch('/api/preowned/products')
      .then((r) => r.json())
      .then((d) => {
        const all = d.products || []
        setProducts(all)
        setFeatured(all.filter((p) => p.featured))
      })

    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0))
    }

    updateCart()
    window.addEventListener('storage', updateCart)

    return () => window.removeEventListener('storage', updateCart)
  }, [])

  useEffect(() => {
    if (featured.length <= 1) return

    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % featured.length)
    }, 3500)

    return () => clearInterval(timer)
  }, [featured.length])

  const currentFeatured = useMemo(
    () => featured[activeSlide],
    [featured, activeSlide]
  )

  const categories = useMemo(() => {
    const productCategories = [
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ]

    return productCategories.length > 0
      ? ['All', ...productCategories.slice(0, 7)]
      : fallbackCategories
  }, [products])

  const hotDrops = featured.length > 0 ? featured : products

  const nextSlide = () => {
    if (!featured.length) return
    setActiveSlide((current) => (current + 1) % featured.length)
  }

  const prevSlide = () => {
    if (!featured.length) return
    setActiveSlide((current) =>
      current === 0 ? featured.length - 1 : current - 1
    )
  }

  const handleDragEnd = (_, info) => {
    if (info.offset.x < -70) nextSlide()
    if (info.offset.x > 70) prevSlide()
  }

  const handleAddToCart = (e, product) => {
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

  const formatPrice = (price) => `Rs. ${price}`

  const ProductCard = ({ product, index }) => {
    const condition = CONDITIONS[product.condition] || CONDITIONS.good

    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.2) }}
      >
        <Link
          href={`/preowned/products/${product.id}`}
          className="group block h-full overflow-hidden rounded-[1.25rem] border border-black/10 bg-white/75 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-[#f2eadf]">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="grid h-full place-items-center text-sm text-black/40">
                No image
              </div>
            )}

            <span
              className={`absolute left-2 top-2 rounded-full border px-2.5 py-1 text-[10px] font-black ${condition.className}`}
            >
              {product.condition === 'excellent' ? 'Verified' : 'Lowkey steal'}
            </span>

            <span className="absolute right-2 top-2 text-xl leading-none text-black">
              ♡
            </span>

            {product.stock === 0 && (
              <div className="absolute inset-0 grid place-items-center bg-black/55">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-black">
                  Sold
                </span>
              </div>
            )}
          </div>

          <div className="p-3.5">
            <h3 className="line-clamp-2 min-h-[40px] text-sm font-black leading-5 text-black">
              {product.name}
            </h3>

            <div className="mt-2 flex items-center gap-2">
              <span className="text-base font-black text-black">
                {formatPrice(product.price)}
              </span>

              {product.originalPrice > product.price && (
                <span className="text-xs font-bold text-black/35 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="rounded-lg bg-black/5 px-2 py-1 text-[10px] font-bold text-black/70">
                {product.stock === 0 ? 'Sold out' : product.category || 'Preowned'}
              </span>

              {product.stock > 0 && (
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className={`rounded-full px-3 py-1 text-[10px] font-black transition ${
                    addedMap[product.id]
                      ? 'bg-[#ccff2f] text-black'
                      : 'bg-black text-white hover:bg-[#ccff2f] hover:text-black'
                  }`}
                >
                  {addedMap[product.id] ? 'Added' : 'Add'}
                </button>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fffaf0] text-black">
      {/* Navbar */}
      <nav className="px-3 pt-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-[1.75rem] bg-[#101010] px-5 py-4 text-white shadow-xl shadow-black/10">
          <Link href="/preowned" className="flex items-center gap-3">
            <div>
              <p className="text-3xl font-black leading-none tracking-tight">
                Drop<span className="text-[#ccff2f]">EZ</span>
              </p>
              <p className="-mt-0.5 w-fit rounded-full bg-[#f75ca8] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-black">
                Preowned
              </p>
            </div>

            <div className="hidden text-3xl text-[#ccff2f] sm:block">☺</div>
          </Link>

          <div className="hidden min-w-[280px] max-w-sm flex-1 items-center rounded-full border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white/50 md:mx-8 md:flex">
            <span className="mr-2">⌕</span>
            <span>Search for heat...</span>
          </div>

          <div className="hidden items-center gap-7 text-sm font-bold lg:flex">
            <Link href="/preowned/products" className="hover:text-[#ccff2f]">
              Shop
            </Link>
            <Link href="#categories" className="hover:text-[#ccff2f]">
              Categories
            </Link>
            <Link href="#featured" className="hover:text-[#ccff2f]">
              Featured
            </Link>
            <Link href="#how" className="hover:text-[#ccff2f]">
              How it works
            </Link>
            <Link href="/contact" className="hover:text-[#ccff2f]">
              Sell your stuff
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="hidden rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10 sm:block"
            >
              Login
            </Link>

            <Link
              href="/auth/signup"
              className="hidden rounded-xl bg-[#ccff2f] px-4 py-2 text-sm font-black text-black transition hover:bg-white sm:block"
            >
              Sign up
            </Link>

            <Link
              href="/cart"
              className="relative grid h-10 w-10 place-items-center rounded-full border border-white/15 text-sm font-black"
            >
              Bag
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[#f75ca8] text-[10px] font-black text-black">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 py-7 sm:px-5">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="relative">
              <h1 className="max-w-xl text-6xl font-black uppercase leading-[0.82] tracking-[-0.05em] sm:text-7xl lg:text-8xl">
                Pre-loved
                <br />
                but still
                <br />
                <span className="font-black text-[#f75ca8]">slaps</span>
              </h1>

              <span className="absolute right-6 top-16 hidden -rotate-12 rounded-sm bg-[#ccff2f] px-4 py-2 text-2xl font-black uppercase leading-none shadow-md sm:block">
                Lowkey
                <br />
                steals
              </span>
            </div>

            <p className="mt-5 text-xl text-black">
              Verified finds. Low prices.{' '}
              <span className="rounded-full border-2 border-[#f75ca8] px-2">
                Big fits.
              </span>
            </p>

            <Link
              href="/preowned/products"
              className="mt-5 inline-flex items-center gap-4 rounded-xl bg-black px-7 py-4 text-lg font-black text-white transition hover:bg-[#ccff2f] hover:text-black"
            >
              Shop the drop
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ccff2f] text-black">
                →
              </span>
            </Link>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['✓', 'Verified finds', 'Every item checked. No cap.', 'Quality you can trust'],
              ['🔥', 'Lowkey steals', 'Top brands. Way less.', 'Prices that slap'],
              ['□', 'Sustainable flex', 'Pre-loved > overpriced.', 'Flex smart'],
            ].map(([icon, title, desc, tag], index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="relative min-h-[245px] rounded-[1.5rem] bg-[#101010] p-6 text-white shadow-xl shadow-black/10"
              >
                <div className="text-5xl text-[#ccff2f]">{icon}</div>
                <h2 className="mt-7 text-3xl font-black uppercase leading-[0.95]">
                  {title}
                </h2>
                <p className="mt-4 text-lg leading-6 text-white">{desc}</p>
                <div className="mt-7 w-fit rounded-full bg-[#ccff2f] px-4 py-2 text-xs font-black text-black">
                  {tag}
                </div>

                {index === 0 && (
                  <div className="absolute -right-5 -top-6 rotate-12 rounded-full bg-[#f75ca8] px-4 py-4 text-sm font-black text-black">
                    VERIFIED
                  </div>
                )}

                {index === 1 && (
                  <div className="absolute -right-2 -top-5 text-5xl text-[#f75ca8]">
                    ☺
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="px-4 pb-6 sm:px-5">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((cat, index) => {
              const href =
                index === 0
                  ? '/preowned/products'
                  : `/preowned/products?category=${cat}`

              return (
                <Link
                  key={cat}
                  href={href}
                  className={`whitespace-nowrap rounded-full px-6 py-3 text-sm font-black transition ${
                    index === 0
                      ? 'bg-black text-white'
                      : 'border border-black/10 bg-white/60 text-black hover:bg-white'
                  }`}
                >
                  {cat}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Slider */}
      {featured.length > 0 && (
        <section id="featured" className="px-4 py-5 sm:px-5">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black uppercase tracking-[-0.04em]">
                  Featured heat
                </h2>
                <span className="-rotate-6 bg-[#ccff2f] px-3 py-1 text-xs font-black uppercase">
                  Auto sliding
                </span>
              </div>

              <Link
                href="/preowned/products?featured=true"
                className="text-sm font-black text-black hover:underline"
              >
                View all →
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-[1.5rem] bg-[#101010] text-white shadow-xl">
              <AnimatePresence mode="wait">
                {currentFeatured && (
                  <motion.div
                    key={currentFeatured.id}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.14}
                    onDragEnd={handleDragEnd}
                    initial={{ opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -28 }}
                    transition={{ duration: 0.35 }}
                    className="grid h-[520px] cursor-grab active:cursor-grabbing md:h-[330px] md:grid-cols-[0.85fr_1fr]"
                  >
                    <Link
                      href={`/preowned/products/${currentFeatured.id}`}
                      className="relative h-[260px] overflow-hidden bg-black md:h-[330px]"
                    >
                      {currentFeatured.images?.[0] ? (
                        <img
                          src={currentFeatured.images[0]}
                          alt={currentFeatured.name}
                          className="h-full w-full object-cover object-top"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-white/40">
                          No image
                        </div>
                      )}
                    </Link>

                    <div className="flex h-[260px] flex-col justify-center p-5 md:h-[330px] md:p-8">
                      <p className="w-fit rounded-full bg-[#ccff2f] px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-black">
                        Featured preowned
                      </p>

                      <h3 className="mt-4 line-clamp-2 text-2xl font-black tracking-tight md:text-4xl">
                        {currentFeatured.name}
                      </h3>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="text-2xl font-black text-[#ccff2f]">
                          {formatPrice(currentFeatured.price)}
                        </span>

                        {currentFeatured.originalPrice >
                          currentFeatured.price && (
                          <span className="text-sm text-white/35 line-through">
                            {formatPrice(currentFeatured.originalPrice)}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 line-clamp-2 max-w-md text-sm leading-6 text-white/60">
                        Swipe on mobile or use arrows. Auto changes every few
                        seconds.
                      </p>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                          href={`/preowned/products/${currentFeatured.id}`}
                          className="rounded-full bg-white px-6 py-2.5 text-sm font-black text-black"
                        >
                          View item
                        </Link>

                        {currentFeatured.stock > 0 && (
                          <button
                            onClick={(e) => handleAddToCart(e, currentFeatured)}
                            className={`rounded-full px-5 py-2.5 text-sm font-black transition ${
                              addedMap[currentFeatured.id]
                                ? 'bg-[#ccff2f] text-black'
                                : 'border border-white/15 bg-white/10 text-white hover:bg-white/15'
                            }`}
                          >
                            {addedMap[currentFeatured.id]
                              ? 'Added'
                              : 'Add to bag'}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {featured.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-lg font-black backdrop-blur transition hover:bg-white/20"
                    aria-label="Previous featured item"
                  >
                    {'<'}
                  </button>

                  <button
                    onClick={nextSlide}
                    className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-lg font-black backdrop-blur transition hover:bg-white/20"
                    aria-label="Next featured item"
                  >
                    {'>'}
                  </button>

                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {featured.map((item, index) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSlide(index)}
                        className={`h-1.5 rounded-full transition-all ${
                          activeSlide === index
                            ? 'w-7 bg-[#ccff2f]'
                            : 'w-1.5 bg-white/25'
                        }`}
                        aria-label={`Go to featured slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Hot Drops */}
      <section className="px-4 py-5 sm:px-5">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black uppercase tracking-[-0.04em]">
                Hot drops
              </h2>
              <span className="text-3xl text-[#f75ca8]">🔥</span>
              <span className="-rotate-6 bg-[#ccff2f] px-3 py-1 text-xs font-black uppercase">
                New heat daily
              </span>
            </div>

            <Link
              href="/preowned/products"
              className="text-sm font-black text-black hover:underline"
            >
              View all →
            </Link>
          </div>

          {hotDrops.length === 0 ? (
            <div className="rounded-[1.5rem] border border-black/10 bg-white/60 py-14 text-center">
              <p className="font-bold text-black/50">
                No listings yet. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {hotDrops.slice(0, 6).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Strip */}
      <section id="how" className="px-4 py-7 sm:px-5">
        <div className="mx-auto grid max-w-7xl gap-3 rounded-[1.5rem] bg-[#101010] p-4 text-white md:grid-cols-5">
          {[
            ['100% authentic', 'No fakes, ever.'],
            ['Fast shipping', 'Get your drip, quick.'],
            ['Easy returns', 'Changed your mind? All good.'],
            ['Real support', 'We got your back.'],
            ['4.8/5 rating', 'People love us.'],
          ].map(([title, desc], index) => (
            <div
              key={title}
              className={`p-4 ${
                index !== 0 ? 'md:border-l md:border-white/10' : ''
              }`}
            >
              <p className="text-sm font-black uppercase">{title}</p>
              <p className="mt-1 text-xs text-white/55">{desc}</p>
              <div className="mt-3 h-1 w-16 rounded-full bg-[#ccff2f]" />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/10 px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 md:flex-row">
          <div>
            <p className="text-xl font-black">
              Drop
              <span className="text-[#ccff2f] [text-shadow:_1px_1px_0_#000]">
                EZ
              </span>{' '}
              <span className="rounded-full bg-[#f75ca8] px-2 py-0.5 text-xs uppercase">
                Preowned
              </span>
            </p>
            <p className="mt-1 text-sm text-black/50">
              Pre-loved but still slaps.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-5 text-sm font-bold text-black/55">
            <Link href="/" className="hover:text-black">
              Main Store
            </Link>
            <Link href="/preowned/products" className="hover:text-black">
              All Listings
            </Link>
            <Link href="/orders" className="hover:text-black">
              My Orders
            </Link>
            <Link href="/contact" className="hover:text-black">
              Contact
            </Link>
          </div>

          <p className="text-xs text-black/40">{config.copyright}</p>
        </div>
      </footer>
    </main>
  )
}