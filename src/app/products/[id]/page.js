'use client'
import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../../components/Navbar'

export default function ProductDetail({ params }) {
  const { id } = use(params)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    fetch('/api/products/' + id)
      .then(res => res.json())
      .then(data => {
        setProduct(data.product)
        setLoading(false)
      })
  }, [id])

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find(item => item.id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      cart.push({ ...product, quantity })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('storage'))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return (
    <main className="min-h-screen bg-[#f6f1ea] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#171313] border-t-transparent animate-spin mx-auto mb-3"/>
        <p className="text-[#7b6f66] text-sm">Loading product...</p>
      </div>
    </main>
  )

  if (!product) return (
    <main className="min-h-screen bg-[#f6f1ea] flex items-center justify-center">
      <p className="text-[#7b6f66]">Product not found!</p>
    </main>
  )

  const discount = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
  const images = product.images?.length > 0 ? product.images : []

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171313]">
      <Navbar />

      <div className="mx-auto max-w-6xl px-5 py-8">
        <a href="/products" className="inline-flex items-center gap-2 text-sm text-[#7b6f66] hover:text-[#171313] transition mb-8">
          ← Back to Products
        </a>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="overflow-hidden rounded-[2rem] bg-[#eadfd4] shadow-xl shadow-[#3d2619]/10 flex items-center justify-center h-80 md:h-[460px] mb-4">
              {images.length > 0 ? (
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-6xl">🛍️</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 transition ${activeImage === index ? 'border-[#171313]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex flex-col justify-center">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-[#8c6048] border border-[#241a14]/15 bg-white/55 px-3 py-1 rounded-full w-fit mb-4">
              {product.category}
            </span>

            <h1 className="text-3xl md:text-4xl font-semibold leading-tight mb-4">{product.name}</h1>

            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl font-semibold">₹{product.price}</span>
              {discount > 0 && (
                <>
                  <span className="line-through text-xl text-[#9b8f86]">₹{product.originalPrice}</span>
                  <span className="rounded-full bg-[#171313] text-white text-xs font-semibold px-3 py-1">{discount}% off</span>
                </>
              )}
            </div>

            <p className={`text-sm mb-6 font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✕ Out of Stock'}
            </p>

            <div className="flex items-center gap-4 mb-8">
              <span className="text-sm text-[#7b6f66]">Quantity:</span>
              <div className="flex items-center gap-3 rounded-full border border-[#241a14]/15 bg-white/55 px-4 py-2">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-lg font-semibold text-[#7b6f66] hover:text-[#171313] transition">−</button>
                <span className="w-6 text-center font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="text-lg font-semibold text-[#7b6f66] hover:text-[#171313] transition">+</button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 rounded-full py-4 font-semibold text-sm transition ${added ? 'bg-green-600 text-white' : product.stock === 0 ? 'bg-[#241a14]/10 text-[#9b8f86] cursor-not-allowed' : 'bg-[#171313] text-white hover:bg-[#3a2a21]'}`}
              >
                {added ? '✓ Added to Cart!' : 'Add to Cart 🛒'}
              </motion.button>
              <a href="/cart" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full rounded-full border border-[#241a14]/15 bg-white/55 py-4 font-semibold text-sm transition hover:bg-white/80"
                >
                  View Cart
                </motion.button>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Description Section */}
        {product.description && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12"
          >
            <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 overflow-hidden">
              <div className="border-b border-[#241a14]/10 px-8 py-5">
                <h2 className="text-xl font-semibold">Product Description</h2>
              </div>
              <div className="px-8 py-6">
                <p className="text-[#6f6258] text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { icon: '🚚', title: 'Fast Delivery', desc: 'Ships within 1-3 business days' },
            { icon: '✅', title: 'Quality Checked', desc: 'Every product is verified before shipping' },
            { icon: '↩️', title: 'Easy Returns', desc: '7-day hassle-free return policy' }
          ].map((item, i) => (
            <div key={i} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-5 flex items-start gap-4">
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-[#7b6f66] mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <footer className="border-t border-[#241a14]/10 px-5 py-10 mt-12">
        <p className="text-center text-sm text-[#9b8f86]">© 2026 Shropping. All rights reserved.</p>
      </footer>
    </main>
  )
}