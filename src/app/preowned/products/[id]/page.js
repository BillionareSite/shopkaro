'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import config from '@/lib/config'

const CONDITIONS = {
  excellent: {
    label: 'Excellent',
    desc: 'Almost new. Clean, checked, and ready to flex.',
    className: 'bg-[#ccff2f] text-black',
  },
  good: {
    label: 'Good',
    desc: 'Lightly used with minor signs of wear. Still a solid pick.',
    className: 'bg-[#dff8c9] text-black',
  },
  fair: {
    label: 'Fair',
    desc: 'Visible wear, but usable and properly checked.',
    className: 'bg-[#ffcf5a] text-black',
  },
}

export default function PreownedProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [added, setAdded] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await fetch(`/api/preowned/products/${id}`)
        const data = await res.json()

        if (data.product) {
          setProduct(data.product)
        } else {
          setProduct(null)
        }

        const allRes = await fetch('/api/preowned/products')
        const allData = await allRes.json()
        const allProducts = allData.products || []

        const baseProduct = data.product
        setRelated(
          allProducts
            .filter((item) => item.id !== id && (!baseProduct?.category || item.category === baseProduct.category))
            .slice(0, 4)
        )
      } catch {
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()

    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0))
    }

    updateCart()
    window.addEventListener('storage', updateCart)
    return () => window.removeEventListener('storage', updateCart)
  }, [id])

  const images = useMemo(() => product?.images?.filter(Boolean) || [], [product])
  const condition = product ? CONDITIONS[product.condition] || CONDITIONS.good : CONDITIONS.good
  const discount =
    product?.originalPrice > product?.price
      ? Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)
      : 0

  const addToCart = () => {
    if (!product || product.stock === 0) return

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
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fffaf0]">
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-black border-t-[#ccff2f]" />
      </main>
    )
  }

  if (!product) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fffaf0] px-5 text-black">
        <div className="max-w-md rounded-[30px] border border-black/10 bg-white p-10 text-center shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
          <h1 className="text-3xl font-black">Item not found</h1>
          <p className="mt-2 text-sm font-semibold text-black/50">This preowned drop is unavailable now.</p>
          <Link href="/preowned/products" className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-black text-white">
            Browse drops
          </Link>
        </div>
      </main>
    )
  }

  const soldOut = product.stock === 0

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

      <section className="mx-auto max-w-7xl px-5 pb-14 pt-6">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-sm font-bold text-black/45">
          <Link href="/preowned" className="hover:text-black">Preowned</Link>
          <span>/</span>
          <Link href="/preowned/products" className="hover:text-black">All drops</Link>
          <span>/</span>
          <span className="max-w-[240px] truncate text-black">{product.name}</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[34px] border border-black/10 bg-white p-3 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
            <div className="relative h-[360px] overflow-hidden rounded-[26px] bg-[#f4eedf] md:h-[560px]">
              {images.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    src={images[activeImage]}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="h-full w-full object-cover"
                  />
                </AnimatePresence>
              ) : (
                <div className="grid h-full place-items-center text-sm font-black text-black/30">No image</div>
              )}

              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <span className={`rounded-full px-4 py-2 text-xs font-black ${condition.className}`}>
                  {condition.label}
                </span>
                {discount > 0 && (
                  <span className="rounded-full bg-[#ff5fa2] px-4 py-2 text-xs font-black text-black">
                    {discount}% off
                  </span>
                )}
              </div>
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    key={image + index}
                    onClick={() => setActiveImage(index)}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border transition ${
                      activeImage === index ? 'border-black opacity-100' : 'border-black/10 opacity-55 hover:opacity-100'
                    }`}
                  >
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[34px] border border-black/10 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.08)] md:p-8">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-black/10 bg-[#fffaf0] px-4 py-2 text-xs font-black">
                {product.category || 'Preowned'}
              </span>
              {product.featured && (
                <span className="rounded-full bg-[#ccff2f] px-4 py-2 text-xs font-black text-black">
                  Featured
                </span>
              )}
            </div>

            <h1 className="text-4xl font-black leading-[0.98] tracking-tight md:text-6xl">
              {product.name}
            </h1>

            <p className="mt-4 max-w-xl text-sm font-semibold leading-relaxed text-black/55">
              {product.description || 'Verified preowned product from DropEZ.'}
            </p>

            <div className="mt-6 rounded-[28px] bg-[#090909] p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ccff2f]">Price check</p>
              <div className="mt-2 flex flex-wrap items-end gap-3">
                <p className="text-4xl font-black">Rs. {product.price}</p>
                {product.originalPrice > product.price && (
                  <p className="pb-1 text-lg font-bold text-white/35 line-through">Rs. {product.originalPrice}</p>
                )}
              </div>
              {discount > 0 && (
                <p className="mt-2 text-sm font-bold text-white/60">
                  You save Rs. {Number(product.originalPrice) - Number(product.price)} on this drop.
                </p>
              )}
            </div>

            <div className="mt-5 rounded-[24px] border border-black/10 bg-[#fffaf0] p-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff2f87]">Condition report</p>
              <h3 className="mt-2 text-xl font-black">{condition.label}</h3>
              <p className="mt-1 text-sm font-semibold text-black/55">{condition.desc}</p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                ['Checked', 'Quality'],
                ['Secure', 'Payment'],
                ['Easy', 'Support'],
              ].map(([title, sub], index) => (
                <div
                  key={title}
                  className={`rounded-3xl p-4 ${
                    index === 0 ? 'bg-[#ccff2f]' : index === 1 ? 'bg-[#ff5fa2]' : 'bg-[#f2eee4]'
                  }`}
                >
                  <p className="text-lg font-black">{title}</p>
                  <p className="text-xs font-bold opacity-60">{sub}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              {soldOut ? (
                <p className="mb-3 text-sm font-black text-red-500">Sold out</p>
              ) : product.stock <= 2 ? (
                <p className="mb-3 text-sm font-black text-[#ff2f87]">Only {product.stock} left</p>
              ) : (
                <p className="mb-3 text-sm font-black text-[#0c6b45]">Available now</p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={addToCart}
                  disabled={soldOut}
                  className={`flex-1 rounded-full px-6 py-4 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    added ? 'bg-[#ccff2f] text-black' : 'bg-black text-white hover:bg-[#202020]'
                  }`}
                >
                  {added ? 'Added to bag' : soldOut ? 'Sold out' : 'Add to bag'}
                </motion.button>

                <Link
                  href="/checkout"
                  className="flex-1 rounded-full border border-black/15 px-6 py-4 text-center text-sm font-black transition hover:border-black hover:bg-black hover:text-white"
                >
                  Buy now
                </Link>
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#ff2f87]">More heat</p>
                <h2 className="text-3xl font-black">Related drops</h2>
              </div>
              <Link href="/preowned/products" className="text-sm font-black text-black/55 hover:text-black">
                View all
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((item) => {
                const itemCondition = CONDITIONS[item.condition] || CONDITIONS.good

                return (
                  <Link
                    key={item.id}
                    href={`/preowned/products/${item.id}`}
                    className="group overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_14px_35px_rgba(0,0,0,0.06)] transition hover:-translate-y-1"
                  >
                    <div className="relative h-40 overflow-hidden bg-[#f4eedf] md:h-52">
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-xs font-black text-black/30">No image</div>
                      )}
                      <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-black ${itemCondition.className}`}>
                        {itemCondition.label}
                      </span>
                    </div>

                    <div className="p-4">
                      <h3 className="truncate text-sm font-black">{item.name}</h3>
                      <p className="mt-2 text-base font-black">Rs. {item.price}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </section>
    </main>
  )
}