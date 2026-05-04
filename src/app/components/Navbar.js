'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0))

    const handleStorage = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0))
      setIsLoggedIn(!!localStorage.getItem('token'))
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return (
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
          {isLoggedIn ? (
            <a href="/profile" className="hover:text-white transition">Profile</a>
          ) : (
            <>
              <a href="/auth/login" className="hover:text-white transition">Login</a>
              <a href="/auth/signup" className="hover:text-white transition">Signup</a>
            </>
          )}
        </div>

        <a href="/cart" className="hidden md:block relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black px-4 py-2 rounded-lg font-semibold text-sm"
          >
            Cart 🛒
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
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
          {isLoggedIn ? (
            <a href="/profile" className="text-gray-300 hover:text-white transition">Profile</a>
          ) : (
            <>
              <a href="/auth/login" className="text-gray-300 hover:text-white transition">Login</a>
              <a href="/auth/signup" className="bg-white text-black text-center py-2 rounded-lg font-semibold">Sign Up</a>
            </>
          )}
          <a href="/cart" className="border border-gray-700 text-white text-center py-2 rounded-lg hover:border-white transition">
            Cart 🛒 {cartCount > 0 && `(${cartCount})`}
          </a>
        </motion.div>
      )}
    </motion.nav>
  )
}