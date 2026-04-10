'use client'

import { motion } from "framer-motion"

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">

      {/* Navbar */}
      <motion.nav 
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="border-b border-gray-800 px-6 py-4 flex items-center justify-between"
      >
        <h1 className="text-2xl font-bold tracking-wide">ShopKaro</h1>

        <div className="hidden md:flex gap-6 text-gray-300">
          <a href="/" className="hover:text-white transition">Home</a>
          <a href="/products" className="hover:text-white transition">Products</a>
          <a href="/auth/login" className="hover:text-white transition">Login</a>
          <a href="/auth/signup" className="hover:text-white transition">Signup</a>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-black px-4 py-2 rounded-lg font-semibold"
        >
          Cart
        </motion.button>
      </motion.nav>

      {/* Hero */}
      <section className="text-center py-28 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold mb-4"
        >
          Premium Dark Store
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 max-w-xl mx-auto mb-8"
        >
          Clean. Fast. Minimal. Built for modern ecommerce experience.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-black px-8 py-3 rounded-lg font-semibold"
        >
          Shop Now
        </motion.button>
      </section>

      {/* Products */}
      <section className="px-6 py-12">
        <h3 className="text-2xl font-semibold mb-8">Featured Products</h3>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.08
              }
            }
          }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[1,2,3,4,5,6,7,8].map((item) => (
            <motion.div
              key={item}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ 
                scale: 1.04,
                borderColor: "#fff"
              }}
              transition={{ duration: 0.2 }}
              className="bg-[#111] border border-gray-800 rounded-xl p-4 cursor-pointer"
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-[#1a1a1a] h-40 rounded-lg mb-4"
              />

              <h4 className="font-semibold">Product {item}</h4>
              <p className="text-gray-400 text-sm">Premium Quality</p>

              <div className="flex items-center justify-between mt-3">
                <span className="font-bold">₹999</span>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-white text-black px-3 py-1 rounded-lg text-sm"
                >
                  Add
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Banner */}
      <motion.section
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mx-6 my-16 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-2xl p-10 flex justify-between items-center"
      >
        <div>
          <h4 className="text-2xl font-bold">Midnight Sale</h4>
          <p className="text-gray-400 mt-1">
            Up to 70% off on selected items
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          className="bg-white text-black px-6 py-2 rounded-lg font-semibold"
        >
          Explore
        </motion.button>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-10 text-center text-gray-500">
        © 2026 ShopKaro
      </footer>

    </main>
  )
}