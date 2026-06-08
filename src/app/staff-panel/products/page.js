'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import config from '@/lib/config'

export default function StaffProducts() {
  const [admin, setAdmin] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editProduct, setEditProduct] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', description: '', price: '', originalPrice: '', images: [''], category: '', stock: '', featured: false, sameDayPincodes: [] })
  const [addMessage, setAddMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('sub_admin_token')
    if (!token) { window.location.href = '/staff-login'; return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp && Date.now() / 1000 > payload.exp) { localStorage.removeItem('sub_admin_token'); window.location.href = '/staff-login'; return }
      const perms = Array.isArray(payload.permissions) ? payload.permissions : []
      if (!perms.includes('view_products')) { window.location.href = '/staff-panel'; return }
      setAdmin(payload); setPermissions(perms)
      fetchProducts(); fetchCategories()
    } catch { window.location.href = '/staff-login' }
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data.products || []); setLoading(false)
  }

  const fetchCategories = async () => {
    const res = await fetch('/api/admin/categories')
    const data = await res.json()
    setCategories(data.categories || [])
  }

  const handleEdit = async () => {
    if (!permissions.includes('edit_product')) { alert('No permission.'); return }
    setSaving(true)
    const res = await fetch('/api/admin/products/' + editProduct.id, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editForm, price: parseFloat(editForm.price), originalPrice: parseFloat(editForm.originalPrice), stock: parseInt(editForm.stock) })
    })
    const data = await res.json()
    setSaving(false); setMessage(data.message)
    if (res.ok) { setEditProduct(null); setEditForm(null); fetchProducts() }
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDelete = async (id) => {
    if (!permissions.includes('delete_product')) { alert('No permission to delete products.'); return }
    if (!confirm('Delete this product?')) return
    await fetch('/api/admin/products/' + id, { method: 'DELETE' })
    fetchProducts()
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!permissions.includes('add_product')) { alert('No permission.'); return }
    setSubmitting(true)
    const res = await fetch('/api/admin/products', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...addForm, images: addForm.images.filter(u => u.trim()), price: parseFloat(addForm.price), originalPrice: parseFloat(addForm.originalPrice), stock: parseInt(addForm.stock) })
    })
    const data = await res.json(); setAddMessage(data.message); setSubmitting(false)
    if (res.ok) {
      setAddForm({ name: '', description: '', price: '', originalPrice: '', images: [''], category: '', stock: '', featured: false, sameDayPincodes: [] })
      setShowAddForm(false); fetchProducts()
    }
  }

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()))

  if (!admin) return <main className="min-h-screen bg-[#f6f1ea] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-[#171313] border-t-transparent animate-spin"/></main>

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171313]">
      <header className="sticky top-0 z-50 border-b border-[#241a14]/10 bg-[#f6f1ea]/95 backdrop-blur-xl px-5 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/staff-panel" className="text-sm text-[#7b6f66] hover:text-[#171313] transition">← Panel</a>
            <span className="text-lg font-semibold">🛍️ Products</span>
          </div>
          <div className="flex items-center gap-3">
            {permissions.includes('add_product') && (
              <button onClick={() => setShowAddForm(!showAddForm)} className="rounded-full bg-[#171313] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3a2a21]">
                {showAddForm ? '✕ Cancel' : '+ Add Product'}
              </button>
            )}
            <button onClick={() => { localStorage.removeItem('sub_admin_token'); window.location.href = '/staff-login' }} className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100">Logout</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 pb-16 space-y-6">

        {/* Add Form */}
        {showAddForm && permissions.includes('add_product') && (
          <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="text-sm text-[#7b6f66] mb-1 block">Name *</label><input type="text" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none" required/></div>
                <div><label className="text-sm text-[#7b6f66] mb-1 block">Category *</label>
                  <select value={addForm.category} onChange={e => setAddForm({...addForm, category: e.target.value})} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none" required>
                    <option value="">Select category</option>
                    {categories.filter(c=>c.isActive).map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div><label className="text-sm text-[#7b6f66] mb-1 block">Price (₹) *</label><input type="number" value={addForm.price} onChange={e => setAddForm({...addForm, price: e.target.value})} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none" required/></div>
                <div><label className="text-sm text-[#7b6f66] mb-1 block">Original Price (₹) *</label><input type="number" value={addForm.originalPrice} onChange={e => setAddForm({...addForm, originalPrice: e.target.value})} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none" required/></div>
                <div><label className="text-sm text-[#7b6f66] mb-1 block">Stock *</label><input type="number" value={addForm.stock} onChange={e => setAddForm({...addForm, stock: e.target.value})} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none" required/></div>
                <div><label className="text-sm text-[#7b6f66] mb-1 block">Image URL</label><input type="text" value={addForm.images[0]} onChange={e => setAddForm({...addForm, images: [e.target.value]})} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none" placeholder="https://..."/></div>
              </div>
              <div><label className="text-sm text-[#7b6f66] mb-1 block">Description</label><textarea value={addForm.description} onChange={e => setAddForm({...addForm, description: e.target.value})} rows={2} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none resize-none"/></div>
              {addMessage && <p className={`text-sm ${addMessage.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{addMessage}</p>}
              <button type="submit" disabled={submitting} className="w-full rounded-full bg-[#171313] py-3.5 text-sm font-semibold text-white transition hover:bg-[#3a2a21] disabled:opacity-50">
                {submitting ? 'Adding...' : 'Add Product'}
              </button>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b8f86]">🔍</span>
          <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-full border border-[#241a14]/15 bg-white pl-10 pr-4 py-2.5 text-sm placeholder-[#9b8f86] focus:outline-none transition"/>
        </div>

        {message && <p className={`text-sm text-center ${message.includes('!') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}

        {loading ? (
          <div className="text-center py-20"><div className="w-8 h-8 rounded-full border-2 border-[#171313] border-t-transparent animate-spin mx-auto"/></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(product => (
              <div key={product.id} className={`rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 overflow-hidden ${product.stock === 0 ? 'border-2 border-red-200' : product.stock <= 5 ? 'border-2 border-amber-200' : ''}`}>
                <div className="aspect-square bg-[#eadfd4] overflow-hidden">
                  {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover"/> : <div className="grid h-full place-items-center text-4xl">🛍️</div>}
                </div>
                <div className="p-4">
                  <p className="font-semibold truncate">{product.name}</p>
                  <p className="text-xs text-[#7b6f66] mt-0.5">{product.category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-semibold text-sm">₹{product.price}</span>
                    {product.originalPrice > product.price && <span className="text-xs text-[#9b8f86] line-through">₹{product.originalPrice}</span>}
                  </div>
                  <p className={`text-xs mt-1 font-medium ${product.stock === 0 ? 'text-red-600' : product.stock <= 5 ? 'text-amber-600' : 'text-green-600'}`}>
                    {product.stock === 0 ? '🚫 Out of Stock' : product.stock <= 5 ? `⚠️ Only ${product.stock} left` : `✓ ${product.stock} in stock`}
                  </p>
                  <div className="flex gap-2 mt-3">
                    {permissions.includes('edit_product') && (
                      <button
                        onClick={() => { setEditProduct(product); setEditForm({ name: product.name, description: product.description || '', price: product.price, originalPrice: product.originalPrice, category: product.category, stock: product.stock }) }}
                        className="flex-1 text-xs px-3 py-2 rounded-full border border-[#241a14]/15 text-[#6d625a] hover:bg-[#f6f1ea] transition font-medium"
                      >
                        ✏️ Edit
                      </button>
                    )}
                    {permissions.includes('delete_product') && (
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 text-xs px-3 py-2 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition font-medium"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="col-span-full text-center py-20 rounded-[2rem] border border-[#241a14]/10 bg-white/55"><p className="text-4xl mb-4">🛍️</p><p className="text-[#7b6f66]">No products found!</p></div>}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editProduct && editForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) { setEditProduct(null); setEditForm(null) }}}>
          <div className="bg-white rounded-[1.4rem] p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Edit Product</h3>
              <button onClick={() => { setEditProduct(null); setEditForm(null) }} className="text-[#9b8f86] hover:text-[#171313] text-xl">✕</button>
            </div>
            <div className="space-y-4">
              <div><label className="text-sm text-[#7b6f66] mb-1 block">Name</label><input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm text-[#7b6f66] mb-1 block">Price (₹)</label><input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none"/></div>
                <div><label className="text-sm text-[#7b6f66] mb-1 block">Stock</label><input type="number" value={editForm.stock} onChange={e => setEditForm({...editForm, stock: e.target.value})} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none"/></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setEditProduct(null); setEditForm(null) }} className="flex-1 rounded-full border border-[#241a14]/15 py-3 text-sm font-semibold text-[#6d625a]">Cancel</button>
                <button onClick={handleEdit} disabled={saving} className="flex-1 rounded-full bg-[#171313] py-3 text-sm font-semibold text-white disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}