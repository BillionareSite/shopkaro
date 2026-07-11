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
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0))
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
      window.location.href = '/products?search=' + encodeURIComponent(search.trim())
    }
  }

  return (
    <header className={`sticky top-0 z-50 border-b border-[var(--border)]/10 transition-all duration-300 ${scrolled ? 'bg-[var(--bg)]/95 backdrop-blur-xl shadow-sm' : 'bg-[var(--bg)]/85 backdrop-blur-xl'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 gap-4">

        {/* Logo */}
<a href="/" className="flex items-center gap-3 flex-shrink-0">
  {config.logo ? (
    <img
      src={config.logo}
      alt={config.brandName}
      className="h-11 w-11 rounded-full object-cover"
    />
  ) : (
    <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--btn-dark)] text-sm font-semibold text-[#f6f1ea]">
      {config.shortCode}
    </div>
  )}
  <div className="hidden sm:block">
    <p className="text-xl font-semibold tracking-tight">{config.brandName}</p>
    <p className="text-xs text-[var(--text-muted)]">{config.tagline}</p>
  </div>
</a>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--text-muted)] md:flex">
          <a href="/" className="transition hover:text-[var(--text-primary)]">Home</a>
          <a href="/products" className="transition hover:text-[var(--text-primary)]">Products</a>
          <a href="/about" className="transition hover:text-[var(--text-primary)]">About</a>
          <a href="/contact" className="transition hover:text-[var(--text-primary)]">Contact</a>
          <a href="/help" className="transition hover:text-[var(--text-primary)]">Help</a>
          {isLoggedIn ? (
            <>
              <a href="/orders" className="transition hover:text-[var(--text-primary)]">Orders</a>
              <a href="/profile" className="transition hover:text-[var(--text-primary)]">Profile</a>
            </>
          ) : (
            <>
              <a href="/auth/login" className="transition hover:text-[var(--text-primary)]">Login</a>
              <a href="/auth/signup" className="transition hover:text-[var(--text-primary)]">Signup</a>
            </>
          )}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">

          {/* Search */}
          <div className="relative hidden md:block">
            <AnimatePresence>
              {searchOpen ? (
                <motion.form
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
                    className="w-full rounded-full border border-[var(--border)]/15 bg-white/70 px-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none focus:border-[var(--border)]/30"
                  />
                  <button type="button" onClick={() => { setSearchOpen(false); setSearch('') }} className="ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">✕</button>
                </motion.form>
              ) : (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-2 rounded-full border border-[var(--border)]/15 bg-[var(--bg-card)]/55 px-4 py-2 text-sm text-[var(--text-muted)] transition hover:bg-white/80"
                >
                  <span>🔍</span>
                  <span className="hidden lg:block">Search</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Cart */}
          <a href="/cart" className="relative flex items-center gap-2 rounded-full border border-[var(--border)]/15 bg-[var(--bg-card)]/55 px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:bg-white/80">
            <span>🛒</span>
            <span className="hidden sm:block">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--btn-dark)] text-xs font-bold text-white">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </a>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border)]/15 bg-[var(--bg-card)]/55 text-[var(--text-primary)]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-5 pb-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-full border border-[var(--border)]/15 bg-white/70 px-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none"
          />
          <button type="submit" className="flex-shrink-0 rounded-full bg-[var(--btn-dark)] px-4 py-2 text-sm font-semibold text-white">Go</button>
        </form>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[var(--border)]/10 bg-[var(--bg)]/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {[
                { href: '/', label: 'Home' },
                { href: '/products', label: 'Products' },
                { href: '/about', label: 'About' },
                { href: '/contact', label: 'Contact' },
                { href: '/help', label: 'Help 🎧' },
              ].map(link => (
                <a key={link.href} href={link.href} className="rounded-xl px-4 py-3 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--bg-card)]/55 hover:text-[var(--text-primary)]">
                  {link.label}
                </a>
              ))}
              <div className="border-t border-[var(--border)]/10 mt-2 pt-2">
                {isLoggedIn ? (
                  <>
                    <a href="/orders" className="block rounded-xl px-4 py-3 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--bg-card)]/55 hover:text-[var(--text-primary)]">My Orders 📦</a>
                    <a href="/profile" className="block rounded-xl px-4 py-3 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--bg-card)]/55 hover:text-[var(--text-primary)]">Profile</a>
                  </>
                ) : (
                  <>
                    <a href="/auth/login" className="block rounded-xl px-4 py-3 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--bg-card)]/55 hover:text-[var(--text-primary)]">Login</a>
                    <a href="/auth/signup" className="block mt-2 rounded-full bg-[var(--btn-dark)] px-4 py-3 text-center text-sm font-semibold text-white">Sign Up</a>
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