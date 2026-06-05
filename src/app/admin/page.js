'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import config from '@/lib/config'

export default function Admin() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    name: '', description: '', price: '', originalPrice: '',
    images: [''], category: 'Electronics', stock: '', featured: false,
    sameDayPincodes: []
  })
  const [pincodeInput, setPincodeInput] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [editPincodeInput, setEditPincodeInput] = useState('')
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

  const addPincode = (pincodes, setPincodes, input, setInput) => {
    const trimmed = input.trim()
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
      alert('Please enter a valid 6-digit pincode!')
      return
    }
    if (pincodes.includes(trimmed)) {
      alert('Pincode already added!')
      return
    }
    setPincodes([...pincodes, trimmed])
    setInput('')
  }

  const removePincode = (pincodes, setPincodes, pincode) => {
    setPincodes(pincodes.filter(p => p !== pincode))
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
      setForm({ name: '', description: '', price: '', originalPrice: '', images: [''], category: 'Electronics', stock: '', featured: false, sameDayPincodes: [] })
      setPincodeInput('')
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
      featured: product.featured || false,
      sameDayPincodes: product.sameDayPincodes || []
    })
    setEditPincodeInput('')
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

  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5)
  const outOfStockProducts = products.filter(p => p.stock === 0)

  const PincodeManager = ({ pincodes, setPincodes, input, setInput }) => (
    <div>
      <label className="text-sm text-[#7b6f66] mb-2 block">Same Day Delivery Pincodes</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Enter 6-digit pincode"
          value={input}
          onChange={(e) => setInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPincode(pincodes, setPincodes, input, setInput) } }}
          className="flex-1 rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-2.5 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition"
          maxLength={6}
        />
        <button
          type="button"
          onClick={() => addPincode(pincodes, setPincodes, input, setInput)}
          className="rounded-full bg-[#171313] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3a2a21]"
        >
          Add
        </button>
      </div>
      {pincodes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pincodes.map(pin => (
            <span key={pin} className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-xs font-mono font-bold px-3 py-1 rounded-full">
              {pin}
              <button type="button" onClick={() => removePincode(pincodes, setPincodes, pin)} className="text-green-500 hover:text-red-500 ml-1">✕</button>
            </span>
          ))}
        </div>
      )}
      {pincodes.length === 0 && (
        <p className="text-xs text-[#9b8f86]">No pincodes added — same day delivery disabled for this product</p>
      )}
    </div>
  )

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171313]">

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#241a14]/10 bg-[#f6f1ea]/95 backdrop-blur-xl px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            {config.logo ? (
              <img src={config.logo} alt={config.brandName} className="h-9 w-9 rounded-full object-cover"/>
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#171313] text-xs font-semibold text-white">{config.shortCode}</div>
            )}
            <span className="text-lg font-semibold">{config.brandName}</span>
          </a>
          <span className="text-sm text-[#7b6f66]">Master Admin</span>
          <div className="flex items-center gap-3 flex-wrap">
            <a href="/admin/stats" className="text-sm text-[#7b6f66] hover:text-[#171313] transition">📊 Stats</a>
            <a href="/admin/orders" className="text-sm text-[#7b6f66] hover:text-[#171313] transition">📦 Orders</a>
            <a href="/admin/tickets" className="text-sm text-[#7b6f66] hover:text-[#171313] transition">🎧 Support</a>
            <a href="/admin/coupons" className="text-sm text-[#7b6f66] hover:text-[#171313] transition">🎟️ Coupons</a>
            <a href="/admin/settings" className="text-sm text-[#7b6f66] hover:text-[#171313] transition">⚙️ Settings</a>
            <a href="/admin/admins" className="text-sm text-[#7b6f66] hover:text-[#171313] transition">👥 Admins</a>
            <a href="/products" className="text-sm text-[#7b6f66] hover:text-[#171313] transition">View Store</a>
            <button
              onClick={async () => {
                await fetch('/api/admin/logout', { method: 'POST' })
                window.location.href = '/admin-login'
              }}
              className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c6048]">Master Admin</p>
          <h2 className="mt-1 text-3xl font-semibold">Admin Dashboard</h2>
        </motion.div>

        {/* Stock Warnings */}
        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 space-y-3">
            {outOfStockProducts.length > 0 && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-red-700 font-semibold text-sm mb-2">🚫 Out of Stock ({outOfStockProducts.length})</p>
                <div className="flex flex-wrap gap-2">
                  {outOfStockProducts.map(p => (
                    <span key={p.id} className="text-xs bg-white border border-red-200 text-red-600 px-3 py-1 rounded-full">{p.name}</span>
                  ))}
                </div>
              </div>
            )}
            {lowStockProducts.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-amber-700 font-semibold text-sm mb-2">⚠️ Low Stock ({lowStockProducts.length})</p>
                <div className="flex flex-wrap gap-2">
                  {lowStockProducts.map(p => (
                    <span key={p.id} className="text-xs bg-white border border-amber-200 text-amber-600 px-3 py-1 rounded-full">{p.name} — {p.stock} left</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-8">

          {/* Add Product Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
            <h3 className="text-xl font-semibold mb-6">Add New Product</h3>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="text-sm text-[#7b6f66] mb-1 block">Product Name</label>
                <input type="text" placeholder="e.g. Wireless Earbuds" value={form.name} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition" onChange={(e) => setForm({ ...form, name: e.target.value })} required/>
              </div>

              <div>
                <label className="text-sm text-[#7b6f66] mb-1 block">Description</label>
                <textarea placeholder="Describe your product..." value={form.description} rows={3} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition resize-none" onChange={(e) => setForm({ ...form, description: e.target.value })} required/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#7b6f66] mb-1 block">Price (₹)</label>
                  <input type="number" placeholder="999" value={form.price} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition" onChange={(e) => setForm({ ...form, price: e.target.value })} required/>
                </div>
                <div>
                  <label className="text-sm text-[#7b6f66] mb-1 block">Original Price (₹)</label>
                  <input type="number" placeholder="1999" value={form.originalPrice} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition" onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} required/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#7b6f66] mb-1 block">Category</label>
                  <select value={form.category} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none focus:border-[#171313]/30 transition" onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books', 'Toys'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-[#7b6f66] mb-1 block">Stock</label>
                  <input type="number" placeholder="100" value={form.stock} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition" onChange={(e) => setForm({ ...form, stock: e.target.value })} required/>
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="text-sm text-[#7b6f66] mb-2 block">Product Images</label>
                {form.images.map((img, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input type="text" placeholder={`Image URL ${index + 1}`} value={img} onChange={(e) => { const updated = [...form.images]; updated[index] = e.target.value; setForm({ ...form, images: updated }) }} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-2.5 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition"/>
                    {form.images.length > 1 && (
                      <button type="button" onClick={() => { const updated = form.images.filter((_, i) => i !== index); setForm({ ...form, images: updated }) }} className="text-red-500 hover:text-red-700 px-2">✕</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setForm({ ...form, images: [...form.images, ''] })} className="text-sm text-[#7b6f66] hover:text-[#171313] transition">+ Add another image</button>
              </div>

              {/* Same Day Delivery Pincodes */}
              <PincodeManager
                pincodes={form.sameDayPincodes}
                setPincodes={(pincodes) => setForm({ ...form, sameDayPincodes: pincodes })}
                input={pincodeInput}
                setInput={setPincodeInput}
              />

              {/* Featured Toggle */}
              <div className="flex items-center justify-between bg-[#f6f1ea] border border-[#241a14]/15 rounded-2xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Featured Product</p>
                  <p className="text-xs text-[#9b8f86]">Show on homepage</p>
                </div>
                <button type="button" onClick={() => setForm({ ...form, featured: !form.featured })} className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${form.featured ? 'bg-[#171313]' : 'bg-[#241a14]/20'}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${form.featured ? 'left-7 bg-white' : 'left-1 bg-[#9b8f86]'}`}/>
                </button>
              </div>

              <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={submitting} className="w-full rounded-full bg-[#171313] py-3.5 text-sm font-semibold text-white transition hover:bg-[#3a2a21] disabled:opacity-50">
                {submitting ? 'Adding...' : 'Add Product'}
              </motion.button>

              {message && (
                <p className={`text-center text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>
              )}
            </form>
          </motion.div>

          {/* Products List */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
            <h3 className="text-xl font-semibold mb-6">Products ({products.length})</h3>
            {loading ? (
              <p className="text-sm text-[#7b6f66]">Loading...</p>
            ) : products.length === 0 ? (
              <p className="text-sm text-[#7b6f66]">No products yet. Add your first product!</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {products.map(product => (
                  <div key={product.id} className={`flex items-center gap-3 rounded-2xl p-3 border ${product.stock === 0 ? 'bg-red-50 border-red-200' : product.stock <= 5 ? 'bg-amber-50 border-amber-200' : 'bg-[#f6f1ea] border-[#241a14]/10'}`}>
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#eadfd4]">
                      {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover"/> : <div className="grid h-full place-items-center text-xl">🛍️</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{product.name}</p>
                      <p className="text-xs text-[#7b6f66]">₹{product.price} · {product.category}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {product.stock === 0 ? (
                          <span className="text-xs text-red-600 font-semibold">🚫 Out of Stock</span>
                        ) : product.stock <= 5 ? (
                          <span className="text-xs text-amber-600 font-semibold">⚠️ Low — {product.stock} left</span>
                        ) : (
                          <span className="text-xs text-green-600">✓ {product.stock} in stock</span>
                        )}
                        {product.sameDayPincodes?.length > 0 && (
                          <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">⚡ Same Day</span>
                        )}
                        {product.featured && <span className="text-xs text-amber-600">⭐ Featured</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <button onClick={() => toggleFeatured(product)} className={`text-xs px-2 py-1 rounded-full border transition ${product.featured ? 'border-amber-300 text-amber-600 hover:bg-amber-50' : 'border-[#241a14]/15 text-[#6d625a] hover:bg-white'}`}>
                        {product.featured ? '★' : '☆'}
                      </button>
                      <button onClick={() => openEdit(product)} className="text-xs px-2 py-1 rounded-full border border-[#241a14]/15 text-[#6d625a] hover:bg-white transition">✏️</button>
                      <button onClick={() => handleDelete(product.id)} className="text-xs px-2 py-1 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition">🗑️</button>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { setEditProduct(null); setEditForm(null) } }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[1.4rem] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Edit Product</h3>
                <button onClick={() => { setEditProduct(null); setEditForm(null) }} className="text-[#9b8f86] hover:text-[#171313] text-xl">✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[#7b6f66] mb-1 block">Product Name</label>
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none focus:border-[#171313]/30 transition"/>
                </div>

                <div>
                  <label className="text-sm text-[#7b6f66] mb-1 block">Description</label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none focus:border-[#171313]/30 transition resize-none"/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[#7b6f66] mb-1 block">Price (₹)</label>
                    <input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none focus:border-[#171313]/30 transition"/>
                  </div>
                  <div>
                    <label className="text-sm text-[#7b6f66] mb-1 block">Original Price (₹)</label>
                    <input type="number" value={editForm.originalPrice} onChange={(e) => setEditForm({ ...editForm, originalPrice: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none focus:border-[#171313]/30 transition"/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[#7b6f66] mb-1 block">Category</label>
                    <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none focus:border-[#171313]/30 transition">
                      {['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books', 'Toys'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-[#7b6f66] mb-1 block">Stock</label>
                    <input type="number" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none focus:border-[#171313]/30 transition"/>
                  </div>
                </div>

                {/* Edit Images */}
                <div>
                  <label className="text-sm text-[#7b6f66] mb-2 block">Product Images</label>
                  {editForm.images.map((img, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input type="text" placeholder={`Image URL ${index + 1}`} value={img} onChange={(e) => { const updated = [...editForm.images]; updated[index] = e.target.value; setEditForm({ ...editForm, images: updated }) }} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-2.5 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition"/>
                      {editForm.images.length > 1 && (
                        <button type="button" onClick={() => { const updated = editForm.images.filter((_, i) => i !== index); setEditForm({ ...editForm, images: updated }) }} className="text-red-500 hover:text-red-700 px-2">✕</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => setEditForm({ ...editForm, images: [...editForm.images, ''] })} className="text-sm text-[#7b6f66] hover:text-[#171313] transition">+ Add another image</button>
                </div>

                {/* Edit Same Day Pincodes */}
                <PincodeManager
                  pincodes={editForm.sameDayPincodes}
                  setPincodes={(pincodes) => setEditForm({ ...editForm, sameDayPincodes: pincodes })}
                  input={editPincodeInput}
                  setInput={setEditPincodeInput}
                />

                {/* Featured Toggle */}
                <div className="flex items-center justify-between bg-[#f6f1ea] border border-[#241a14]/15 rounded-2xl px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Featured Product</p>
                    <p className="text-xs text-[#9b8f86]">Show on homepage</p>
                  </div>
                  <button type="button" onClick={() => setEditForm({ ...editForm, featured: !editForm.featured })} className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${editForm.featured ? 'bg-[#171313]' : 'bg-[#241a14]/20'}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${editForm.featured ? 'left-7 bg-white' : 'left-1 bg-[#9b8f86]'}`}/>
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setEditProduct(null); setEditForm(null) }} className="flex-1 rounded-full border border-[#241a14]/15 py-3 text-sm font-semibold text-[#6d625a] transition hover:bg-[#f6f1ea]">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleUpdate} disabled={updating} className="flex-1 rounded-full bg-[#171313] py-3 text-sm font-semibold text-white transition hover:bg-[#3a2a21] disabled:opacity-50">
                    {updating ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t border-[#241a14]/10 px-5 py-10 mt-10">
        <p className="text-center text-sm text-[#9b8f86]">{config.copyright}</p>
      </footer>
    </main>
  )
}