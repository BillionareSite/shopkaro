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
      .then((res) => res.json())
      .then((data) => {
        const all = data.products || []
        setProducts(all)
        setFeatured(all.filter((p) => p.featured))
      })

    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]))
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

  const categoryNames = useMemo(() => {
    const names = categories.map((cat) => (typeof cat === 'string' ? cat : cat.name))
    return names.length ? ['All', ...names] : ['All', 'Fashion', 'Electronics', 'Beauty', 'Home']
  }, [categories])

  const nextSlide = () => {
    if (!featured.length) return
    setActiveSlide((current) => (current + 1) % featured.length)
  }

  const prevSlide = () => {
    if (!featured.length) return
    setActiveSlide((current) => (current === 0 ? featured.length - 1 : current - 1))
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
    const existing = cart.find((item) => item.id === product.id)

    if (existing) existing.quantity += 1
    else cart.push({ ...product, quantity: 1 })

    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('storage'))

    setAddedMap((prev) => ({ ...prev, [product.id]: true }))
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [product.id]: false }))
    }, 1400)
  }

  const formatPrice = (price) => `Rs. ${price}`

  const ProductCard = ({ product, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.035, 0.18) }}
      className="group overflow-hidden rounded-[1.25rem] border border-[var(--border-light)] bg-[var(--bg-card)] shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <a href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-muted)]">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-[var(--text-muted)]">
              No image
            </div>
          )}

          {product.originalPrice > product.price && product.stock > 0 && (
            <span className="absolute left-2 top-2 rounded-full bg-[var(--btn-dark)] px-2.5 py-1 text-[10px] font-black text-white">
              {Math.round((1 - product.price / product.originalPrice) * 100)}% off
            </span>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 grid place-items-center bg-black/45">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-black">
                Sold out
              </span>
            </div>
          )}
        </div>
      </a>

      <div className="p-3.5">
        <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-black">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-[var(--text-placeholder)] line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
            Verified
          </span>

          {product.stock > 0 && (
            <button
              onClick={(e) => handleAddToCart(e, product)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-black transition ${
                addedMap[product.id]
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[var(--btn-dark)] text-white hover:opacity-90'
              }`}
            >
              {addedMap[product.id] ? 'Added' : 'Add'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text-primary)]">
      <Navbar />

      <section className="border-b border-[var(--border-light)] px-4 py-8 sm:px-5">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <h1 className="max-w-2xl text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
              Curated finds,
              <br />
              verified for real life.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--text-muted)]">
              Quality you can trust. Styles you will actually use. Shop new
              drops, essentials, and verified picks from DropEZ.
            </p>

            <div className="mt-7 grid max-w-2xl gap-4 sm:grid-cols-3">
              {[
                ['Verified quality', 'Inspected and listed with care'],
                ['Easy returns', 'Simple support when needed'],
                ['Better choice', 'Useful products, less noise'],
              ].map(([title, sub]) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--border-light)]">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-bold">{title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-[var(--text-muted)]">
                      {sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/products"
                className="rounded-xl bg-[var(--btn-dark)] px-7 py-3.5 text-sm font-black text-white transition hover:opacity-90"
              >
                Shop now
              </a>

              <a
                href="/preowned"
                className="rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] px-7 py-3.5 text-sm font-black text-[var(--text-primary)] transition hover:opacity-80"
              >
                Preowned
              </a>
            </div>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-3">
            {(featured.length ? featured.slice(0, 3) : products.slice(0, 3)).map((product, index) => (
              <motion.a
                key={product.id || index}
                href={product.id ? `/products/${product.id}` : '/products'}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="group overflow-hidden rounded-[1.3rem] border border-[var(--border-light)] bg-[var(--bg-card)] shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[var(--bg-muted)]">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-sm text-[var(--text-muted)]">
                      DropEZ
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 p-3.5">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold">
                      {product.name || 'Curated drop'}
                    </h3>
                    <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                      {product.category || 'Shop now'}
                    </p>
                  </div>

                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--border-light)] bg-white">
                    →
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-5">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categoryNames.slice(0, 8).map((cat, index) => (
              <a
                key={cat}
                href={index === 0 ? '/products' : `/products?category=${cat}`}
                className={`whitespace-nowrap rounded-full px-6 py-3 text-sm font-bold transition ${
                  index === 0
                    ? 'bg-[var(--btn-dark)] text-white'
                    : 'border border-[var(--border-light)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-white'
                }`}
              >
                {cat}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-5 sm:px-5">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight">Featured picks</h2>

            <a
              href="/products"
              className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              View all
            </a>
          </div>

          {featured.length === 0 ? (
            <div className="rounded-[1.5rem] border border-[var(--border-light)] bg-[var(--bg-card)] py-12 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                No featured products yet.
              </p>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[1.7rem] border border-[var(--border-light)] bg-[var(--bg-card)] shadow-sm">
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
                    <a
                      href={`/products/${currentFeatured.id}`}
                      className="relative h-[260px] overflow-hidden bg-[var(--bg-muted)] md:h-[330px]"
                    >
                      {currentFeatured.images?.[0] ? (
                        <img
                          src={currentFeatured.images[0]}
                          alt={currentFeatured.name}
                          className="h-full w-full object-cover object-top"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-sm text-[var(--text-muted)]">
                          No image
                        </div>
                      )}
                    </a>

                    <div className="flex flex-col justify-center p-5 md:p-8">
                      <p className="w-fit rounded-full bg-[var(--btn-dark)] px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-white">
                        Auto sliding pick
                      </p>

                      <h3 className="mt-4 text-2xl font-black tracking-tight md:text-4xl">
                        {currentFeatured.name}
                      </h3>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="text-2xl font-black">
                          {formatPrice(currentFeatured.price)}
                        </span>

                        {currentFeatured.originalPrice > currentFeatured.price && (
                          <span className="text-sm text-[var(--text-placeholder)] line-through">
                            {formatPrice(currentFeatured.originalPrice)}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 max-w-md text-sm leading-6 text-[var(--text-muted)]">
                        Swipe this card on mobile or use arrows. It also changes automatically every few seconds.
                      </p>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <a
                          href={`/products/${currentFeatured.id}`}
                          className="rounded-full bg-[var(--btn-dark)] px-6 py-2.5 text-sm font-black text-white transition hover:opacity-90"
                        >
                          View product
                        </a>

                        {currentFeatured.stock > 0 && (
                          <button
                            onClick={(e) => handleAddToCart(e, currentFeatured)}
                            className={`rounded-full px-5 py-2.5 text-sm font-black transition ${
                              addedMap[currentFeatured.id]
                                ? 'bg-emerald-600 text-white'
                                : 'border border-[var(--border-light)] bg-[var(--bg)] text-[var(--text-primary)] hover:opacity-80'
                            }`}
                          >
                            {addedMap[currentFeatured.id] ? 'Added' : 'Add to cart'}
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
                    className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-lg font-black shadow-lg backdrop-blur transition hover:bg-white"
                    aria-label="Previous product"
                  >
                    {'<'}
                  </button>

                  <button
                    onClick={nextSlide}
                    className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-lg font-black shadow-lg backdrop-blur transition hover:bg-white"
                    aria-label="Next product"
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
                            ? 'w-7 bg-[var(--btn-dark)]'
                            : 'w-1.5 bg-[var(--border-light)]'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="px-4 py-7 sm:px-5">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight">Fresh listings</h2>

            <a
              href="/products"
              className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              View all
            </a>
          </div>

          {products.length === 0 ? (
            <div className="rounded-[1.5rem] border border-[var(--border-light)] bg-[var(--bg-card)] py-12 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                No products available yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {products.slice(0, 12).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-[var(--border-light)] px-5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row">
          <div>
            <div className="flex items-center gap-3">
              {config.logo ? (
                <img
                  src={config.logo}
                  alt={config.brandName}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--btn-dark)] text-xs font-black text-white">
                  {config.shortCode}
                </div>
              )}

              <div>
                <h3 className="text-xl font-black">{config.brandName}</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {config.tagline}
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--text-muted)]">
              Premium everyday products curated with style, quality, and trust.
            </p>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-7xl border-t border-[var(--border-light)] pt-6 text-sm text-[var(--text-placeholder)]">
          {config.copyright}
        </p>
      </footer>
    </main>
  )
}