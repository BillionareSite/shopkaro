'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import config from '@/lib/config'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))

    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0))

    const handleStorage = () => {
      const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartCount(updatedCart.reduce((sum, item) => sum + item.quantity, 0))
      setIsLoggedIn(!!localStorage.getItem('token'))
    }

    const handleScroll = () => setScrolled(window.scrollY > 20)

    window.addEventListener('storage', handleStorage)
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()

    if (search.trim()) {
      window.location.href =
        '/products?search=' + encodeURIComponent(search.trim())
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b border-[#241a14]/10 transition-all duration-300 ${
        scrolled
          ? 'bg-[#f6f1ea]/95 backdrop-blur-xl shadow-sm'
          : 'bg-[#f6f1ea]/85 backdrop-blur-xl'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        {/* Logo */}
        <a href="/" className="flex flex-shrink-0 items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-[#171313] text-sm font-semibold text-[#f6f1ea]">
            {config.shortCode}
          </div>

          <div className="hidden sm:block">
            <p className="text-xl font-semibold tracking-tight">
              {config.brandName}
            </p>
            <p className="text-xs text-[#7b6f66]">{config.tagline}</p>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#6d625a] md:flex">
          <a href="/" className="transition hover:text-[#171313]">
            Home
          </a>
          <a href="/products" className="transition hover:text-[#171313]">
            Products
          </a>
          <a href="/about" className="transition hover:text-[#171313]">
            About
          </a>
          <a href="/contact" className="transition hover:text-[#171313]">
            Contact
          </a>
          <a href="/help" className="transition hover:text-[#171313]">
            Help
          </a>

          {isLoggedIn ? (
            <a href="/profile" className="transition hover:text-[#171313]">
              Profile
            </a>
          ) : (
            <>
              <a
                href="/auth/login"
                className="transition hover:text-[#171313]"
              >
                Login
              </a>
              <a
                href="/auth/signup"
                className="transition hover:text-[#171313]"
              >
                Signup
              </a>
            </>
          )}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <AnimatePresence mode="wait">
              {searchOpen ? (
                <motion.form
                  key="search-form"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSearch}
                  className="flex items-center"
                >
                  <input
                    autoFocus
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full rounded-full border border-[#241a14]/15 bg-white/70 px-4 py-2 text-sm text-[#171313] placeholder-[#9b8f86] focus:border-[#171313]/30 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false)
                      setSearch('')
                    }}
                    className="ml-2 text-[#7b6f66] transition hover:text-[#171313]"
                    aria-label="Close search"
                  >
                    ✕
                  </button>
                </motion.form>
              ) : (
                <motion.button
                  key="search-button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-2 rounded-full border border-[#241a14]/15 bg-white/55 px-4 py-2 text-sm text-[#6d625a] transition hover:bg-white/80"
                  aria-label="Open search"
                >
                  <span>🔍</span>
                  <span className="hidden lg:block">Search</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Cart */}
          <a
            href="/cart"
            className="relative flex items-center gap-2 rounded-full border border-[#241a14]/15 bg-white/55 px-4 py-2 text-sm font-medium text-[#171313] transition hover:bg-white/80"
          >
            <span>🛒</span>
            <span className="hidden sm:block">Cart</span>

            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#171313] text-xs font-bold text-white">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </a>

          {/* Mobile Hamburger */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#241a14]/15 bg-white/55 text-[#171313] md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="px-5 pb-3 md:hidden">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-full border border-[#241a14]/15 bg-white/70 px-4 py-2 text-sm text-[#171313] placeholder-[#9b8f86] focus:outline-none"
          />

          <button
            type="submit"
            className="flex-shrink-0 rounded-full bg-[#171313] px-4 py-2 text-sm font-semibold text-white"
          >
            Go
          </button>
        </form>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-[#241a14]/10 bg-[#f6f1ea]/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {[
                { href: '/', label: 'Home' },
                { href: '/products', label: 'Products' },
                { href: '/about', label: 'About' },
                { href: '/contact', label: 'Contact' },
                { href: '/help', label: 'Help' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-[#6d625a] transition hover:bg-white/55 hover:text-[#171313]"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}

              <div className="mt-2 border-t border-[#241a14]/10 pt-2">
                {isLoggedIn ? (
                  <a
                    href="/profile"
                    className="block rounded-xl px-4 py-3 text-sm font-medium text-[#6d625a] transition hover:bg-white/55 hover:text-[#171313]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </a>
                ) : (
                  <>
                    <a
                      href="/auth/login"
                      className="block rounded-xl px-4 py-3 text-sm font-medium text-[#6d625a] transition hover:bg-white/55 hover:text-[#171313]"
                      onClick={() => setMenuOpen(false)}
                    >
                      Login
                    </a>

                    <a
                      href="/auth/signup"
                      className="mt-2 block rounded-full bg-[#171313] px-4 py-3 text-center text-sm font-semibold text-white"
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign Up
                    </a>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}