'use client'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import config from '@/lib/config'

export default function About() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <Navbar />

      {/* Hero */}
      <section className="text-center py-20 px-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="w-fit mx-auto rounded-full border border-[var(--border)]/10 bg-[var(--bg-card)]/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            About Us
          </p>
          <h1 className="mt-6 text-4xl md:text-6xl font-semibold leading-tight tracking-tight">
            We are {config.brandName} 🛍️
          </h1>
          <p className="mt-4 text-[var(--text-muted)] max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            {config.brandName} is your one stop destination for everything — from electronics to fashion, home goods to accessories. We bring you the best deals at the best prices.
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="px-5 py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { number: '100+', label: 'Products' },
            { number: '50+', label: 'Happy Customers' },
            { number: '10+', label: 'Categories' },
            { number: '100%', label: 'Satisfaction' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-[1.4rem] bg-white shadow-lg shadow-[var(--shadow)]/5 p-6 text-center"
            >
              <p className="text-3xl font-semibold mb-1">{stat.number}</p>
              <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="px-5 py-10">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.4rem] bg-white shadow-lg shadow-[var(--shadow)]/5 p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">Our Story 📖</h2>
            <div className="space-y-4 text-[var(--text-muted)] text-sm md:text-base leading-relaxed">
              <p>{config.brandName} was born from a simple idea — everyone deserves access to quality products at fair prices. We started as a small operation and have been growing ever since.</p>
              <p>We specialize in secondhand electronics, fashion, home goods and much more. Every product on our platform is carefully curated to ensure quality and value for money.</p>
              <p>Our mission is simple: <span className="text-[var(--text-primary)] font-semibold">make shopping easy, affordable and enjoyable for everyone.</span></p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="px-5 py-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">Why Choose {config.brandName}? 🌟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '💰', title: 'Best Prices', desc: 'We offer the most competitive prices on all our products. No hidden charges, no surprises.' },
              { icon: '✅', title: 'Quality Assured', desc: 'Every product is carefully checked before listing. We stand behind everything we sell.' },
              { icon: '🚀', title: 'Fast Delivery', desc: 'Quick processing and fast delivery to your doorstep anywhere in India.' },
              { icon: '🔒', title: 'Secure Shopping', desc: 'Your data and payments are completely secure with us. Shop with confidence.' },
              { icon: '🎧', title: '24/7 Support', desc: 'Our support team is always ready to help you with any questions or issues.' },
              { icon: '↩️', title: 'Easy Returns', desc: 'Not satisfied? We have a hassle-free return policy to make things right.' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-[1.4rem] bg-white shadow-lg shadow-[var(--shadow)]/5 p-6 hover:shadow-xl transition"
              >
                <p className="text-3xl mb-3">{item.icon}</p>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-5 py-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">Meet the Team 👥</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
            {[
              { name: 'Ashu', role: 'Co-Founder & CEO', emoji: '👨‍💼' },
              { name: 'Shourya', role: 'Co-Founder & CTO', emoji: '👨‍💻' }
            ].map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-[1.4rem] bg-white shadow-lg shadow-[var(--shadow)]/5 p-6 text-center"
              >
                <p className="text-5xl mb-4">{member.emoji}</p>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-10 mb-10">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] bg-[var(--btn-dark)] p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">Ready to Start Shopping? 🛒</h2>
            <p className="text-[var(--text-placeholder)] mb-8">Discover thousands of products at amazing prices</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/products">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg)]">
                  Shop Now →
                </motion.button>
              </a>
              <a href="/contact">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
                  Contact Us
                </motion.button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)]/10 px-5 py-10">
        <p className="text-center text-sm text-[var(--text-placeholder)]">{config.copyright}</p>
      </footer>
    </main>
  )
}