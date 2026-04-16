'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Admin() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    name: '', description: '', price: '', originalPrice: '',
    images: [''], category: 'Electronics', stock: '', featured: false
  })
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || [])
        setLoading(false)
      })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        images: form.images.filter(url => url.trim() !== ''),
        price: parseFloat(form.price),
        originalPrice: parseFloat(form.originalPrice),
        stock: parseInt(form.stock)
      })
    })
    const data = await res.json()
    setMessage(data.message)
    setSubmitting(false)
    if (res.ok) {
      setForm({ name: '', description: '', price: '', originalPrice: '', images: [''], category: 'Electronics', stock: '', featured: false })
      fetchProducts()
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await fetch('/api/admin/products/' + id, { method: 'DELETE' })
    fetchProducts()
  }

  const openEdit = (product) => {
    setEditProduct(product)
    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      images: product.images?.length > 0 ? product.images : [''],
      category: product.category,
      stock: product.stock,
      featured: product.featured || false
    })
  }

  const handleUpdate = async () => {
    setUpdating(true)
    try {
      const res = await fetch('/api/admin/products/' + editProduct.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          images: editForm.images.filter(url => url.trim() !== ''),
          price: parseFloat(editForm.price),
          originalPrice: parseFloat(editForm.originalPrice),
          stock: parseInt(editForm.stock)
        })
      })
      const data = await res.json()
      if (res.ok) {
        setEditProduct(null)
        setEditForm(null)
        fetchProducts()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setUpdating(false)
  }

  const toggleFeatured = async (product) => {
    await fetch('/api/admin/products/' + product.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...product, featured: !product.featured })
    })
    fetchProducts()
  }

  return (
    <main className="min-h-screen bg-black text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-2xl font-bold">ShopKaro</a>
        <span className="text-gray-400 text-sm">Admin Dashboard</span>
        <div className="flex items-center gap-4">
          <a href="/admin/orders" className="text-sm text-gray-400 hover:text-white transition">📦 Orders</a>
          <a href="/products" className="text-sm text-gray-400 hover:text-white transition">View Store</a>
          <button
            onClick={async () => {
              await fetch('/api/admin/logout', { method: 'POST' })
              window.location.href = '/admin-login'
            }}
            className="text-sm border border-red-900 text-red-500 px-3 py-1 rounded-lg hover:bg-red-500 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8"
        >
          Admin Dashboard
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Add Product Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#111] border border-gray-800 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold mb-6">Add New Product</h3>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Wireless Earbuds"
                  value={form.name}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                <textarea
                  placeholder="Describe your product..."
                  value={form.description}
                  rows={3}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition resize-none"
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Price (₹)</label>
                  <input
                    type="number"
                    placeholder="999"
                    value={form.price}
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition"
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Original Price (₹)</label>
                  <input
                    type="number"
                    placeholder="1999"
                    value={form.originalPrice}
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition"
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Category</label>
                  <select
                    value={form.category}
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition"
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books', 'Toys'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Stock</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={form.stock}
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition"
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Multiple Images */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Product Images</label>
                {form.images.map((img, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder={`Image URL ${index + 1}`}
                      value={img}
                      onChange={(e) => {
                        const updated = [...form.images]
                        updated[index] = e.target.value
                        setForm({ ...form, images: updated })
                      }}
                      className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition"
                    />
                    {form.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = form.images.filter((_, i) => i !== index)
                          setForm({ ...form, images: updated })
                        }}
                        className="text-red-500 hover:text-red-400 px-3 text-lg"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, images: [...form.images, ''] })}
                  className="text-gray-400 hover:text-white text-sm transition mt-1"
                >
                  + Add another image
                </button>
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center justify-between bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Featured Product</p>
                  <p className="text-xs text-gray-500">Show on homepage</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, featured: !form.featured })}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                    form.featured ? 'bg-white' : 'bg-gray-700'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${
                    form.featured ? 'left-7 bg-black' : 'left-1 bg-gray-400'
                  }`}/>
                </button>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={submitting}
                className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-100 transition"
              >
                {submitting ? 'Adding...' : 'Add Product'}
              </motion.button>

              {message && (
                <p className={`text-center text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </p>
              )}
            </form>
          </motion.div>

          {/* Products List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#111] border border-gray-800 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold mb-6">Products ({products.length})</h3>

            {loading ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : products.length === 0 ? (
              <p className="text-gray-500 text-sm">No products yet. Add your first product!</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {products.map(product => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 bg-[#1a1a1a] border border-gray-800 rounded-xl p-3"
                  >
                    <div className="w-12 h-12 bg-[#222] rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover"/>
                      ) : (
                        <span className="text-xl">🛍️</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{product.name}</p>
                      <p className="text-gray-400 text-xs">₹{product.price} · {product.category}</p>
                      <p className="text-xs mt-1">
                        {product.featured
                          ? <span className="text-yellow-400">⭐ Featured</span>
                          : <span className="text-gray-600">Not featured</span>
                        }
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleFeatured(product)}
                        className={`text-xs px-2 py-1 rounded-lg border transition ${
                          product.featured
                            ? 'border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black'
                            : 'border-gray-600 text-gray-400 hover:border-white hover:text-white'
                        }`}
                      >
                        {product.featured ? '★ Unfeature' : '☆ Feature'}
                      </button>
                      <button
                        onClick={() => openEdit(product)}
                        className="text-xs px-2 py-1 rounded-lg border border-gray-600 text-gray-400 hover:border-white hover:text-white transition"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-xs px-2 py-1 rounded-lg border border-red-900 text-red-500 hover:bg-red-500 hover:text-white transition"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editProduct && editForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) { setEditProduct(null); setEditForm(null) } }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Edit Product</h3>
                <button
                  onClick={() => { setEditProduct(null); setEditForm(null) }}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Product Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Price (₹)</label>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Original Price (₹)</label>
                    <input
                      type="number"
                      value={editForm.originalPrice}
                      onChange={(e) => setEditForm({ ...editForm, originalPrice: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Category</label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition"
                    >
                      {['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books', 'Toys'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Stock</label>
                    <input
                      type="number"
                      value={editForm.stock}
                      onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition"
                    />
                  </div>
                </div>

                {/* Edit Images */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Product Images</label>
                  {editForm.images.map((img, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder={`Image URL ${index + 1}`}
                        value={img}
                        onChange={(e) => {
                          const updated = [...editForm.images]
                          updated[index] = e.target.value
                          setEditForm({ ...editForm, images: updated })
                        }}
                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white transition"
                      />
                      {editForm.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editForm.images.filter((_, i) => i !== index)
                            setEditForm({ ...editForm, images: updated })
                          }}
                          className="text-red-500 hover:text-red-400 px-3 text-lg"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, images: [...editForm.images, ''] })}
                    className="text-gray-400 hover:text-white text-sm transition mt-1"
                  >
                    + Add another image
                  </button>
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center justify-between bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Featured Product</p>
                    <p className="text-xs text-gray-500">Show on homepage</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, featured: !editForm.featured })}
                    className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                      editForm.featured ? 'bg-white' : 'bg-gray-700'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${
                      editForm.featured ? 'left-7 bg-black' : 'left-1 bg-gray-400'
                    }`}/>
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setEditProduct(null); setEditForm(null) }}
                    className="flex-1 border border-gray-700 text-white font-semibold py-3 rounded-xl hover:border-white transition"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpdate}
                    disabled={updating}
                    className="flex-1 bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-100 transition"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  )
}