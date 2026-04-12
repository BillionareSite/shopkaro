'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">

      {/* Navbar */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="border-b border-gray-800 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <a href="/" className="text-2xl font-bold tracking-wide">ShopKaro</a>

          <div className="hidden md:flex gap-6 text-gray-300 text-sm">
            <a href="/" className="hover:text-white transition">Home</a>
            <a href="/products" className="hover:text-white transition">Products</a>
            <a href="/auth/login" className="hover:text-white transition">Login</a>
            <a href="/auth/signup" className="hover:text-white transition">Signup</a>
          </div>

          <a href="/cart" className="hidden md:block">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-4 py-2 rounded-lg font-semibold text-sm"
            >
              Cart 🛒
            </motion.button>
          </a>

          <button
            className="md:hidden text-white text-2xl focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-4 flex flex-col gap-4 border-t border-gray-800 pt-4 text-sm"
          >
            <a href="/" className="text-gray-300 hover:text-white transition">Home</a>
            <a href="/products" className="text-gray-300 hover:text-white transition">Products</a>
            <a href="/auth/login" className="text-gray-300 hover:text-white transition">Login</a>
            <a href="/auth/signup" className="bg-white text-black text-center py-2 rounded-lg font-semibold">Sign Up</a>
            <a href="/cart" className="border border-gray-700 text-white text-center py-2 rounded-lg hover:border-white transition">Cart 🛒</a>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero */}
      <section className="text-center py-20 px-6">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs font-bold uppercase tracking-widest text-gray-500 border border-gray-700 px-3 py-1 rounded-full"
        >
          New Arrivals 🔥
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold mt-6 mb-4 leading-tight"
        >
          Premium Dark Store
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 max-w-xl mx-auto mb-8 text-sm md:text-base"
        >
          Clean. Fast. Minimal. Built for modern ecommerce experience.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a href="/products">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-8 py-3 rounded-lg font-semibold"
            >
              Shop Now
            </motion.button>
          </a>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border border-gray-700 text-white px-8 py-3 rounded-lg font-semibold hover:border-white transition"
          >
            View Deals
          </motion.button>
        </motion.div>
      </section>

      {/* Category Pills */}
      <section className="px-6 py-4 flex gap-3 overflow-x-auto">
        {["All", "Electronics", "Fashion", "Home", "Beauty", "Sports", "Books", "Toys"].map((cat) => (
          <a href={'/products?category=' + cat} key={cat}>
            <button className="whitespace-nowrap px-4 py-2 rounded-full border border-gray-700 text-sm text-gray-400 hover:border-white hover:text-white transition">
              {cat}
            </button>
          </a>
        ))}
      </section>

      {/* Products */}
      <section className="px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl md:text-2xl font-semibold">Featured Products</h3>
          <a href="/products" className="text-gray-400 text-sm hover:text-white transition">View all →</a>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } }
          }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {[
            { name: "Wireless Earbuds", price: "₹1,299", original: "₹2,499", tag: "52% off" },
            { name: "Smart Watch", price: "₹2,999", original: "₹5,999", tag: "50% off" },
            { name: "Running Shoes", price: "₹899", original: "₹1,799", tag: "50% off" },
            { name: "Backpack", price: "₹599", original: "₹999", tag: "40% off" },
            { name: "Sunglasses", price: "₹399", original: "₹799", tag: "50% off" },
            { name: "Water Bottle", price: "₹249", original: "₹499", tag: "50% off" },
            { name: "Desk Lamp", price: "₹699", original: "₹1,299", tag: "46% off" },
            { name: "Phone Stand", price: "₹199", original: "₹399", tag: "50% off" },
          ].map((product, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ scale: 1.03, borderColor: "#fff" }}
              transition={{ duration: 0.2 }}
              className="bg-[#111] border border-gray-800 rounded-xl p-4 cursor-pointer"
            >
              <div className="relative bg-[#1a1a1a] h-36 md:h-44 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-4xl">🛍️</span>
                <span className="absolute top-2 left-2 bg-white text-black text-xs font-bold px-2 py-1 rounded-full">
                  {product.tag}
                </span>
              </div>
              <h4 className="font-semibold text-sm mb-1">{product.name}</h4>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{product.price}</span>
                <span className="text-gray-600 text-xs line-through">{product.original}</span>
              </div>
              <a href="/products">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-3 w-full bg-white text-black text-sm py-2 rounded-lg font-semibold"
                >
                  Shop Now
                </motion.button>
              </a>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Banner */}
      <motion.section
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mx-4 md:mx-6 my-10 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row gap-4 justify-between items-center text-center md:text-left"
      >
        <div>
          <h4 className="text-2xl font-bold">Midnight Sale 🎉</h4>
          <p className="text-gray-400 mt-1">Up to 70% off on selected items</p>
        </div>
        <a href="/products">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black px-8 py-3 rounded-lg font-semibold whitespace-nowrap"
          >
            Explore Deals
          </motion.button>
        </a>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-10 mt-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-500">
          <div>
            <h5 className="text-white font-bold mb-3">ShopKaro</h5>
            <p>Your premium dark store for everything.</p>
          </div>
          <div>
            <h5 className="text-white font-bold mb-3">Company</h5>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-3">Support</h5>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition">Returns</a></li>
              <li><a href="#" className="hover:text-white transition">Track Order</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-3">Follow Us</h5>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">Instagram</a></li>
              <li><a href="#" className="hover:text-white transition">Twitter</a></li>
              <li><a href="#" className="hover:text-white transition">YouTube</a></li>
            </ul>
          </div>
        </div>
        <p className="text-center text-gray-700 text-xs mt-8">© 2026 ShopKaro. All rights reserved.</p>
      </footer>

    </main>
  )
}