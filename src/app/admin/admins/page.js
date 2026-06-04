'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import config from '@/lib/config'

const ALL_PERMISSIONS = [
  { id: 'view_orders', label: '📦 View Orders', desc: 'Can view all orders' },
  { id: 'update_order_status', label: '✅ Update Order Status', desc: 'Can change order status' },
  { id: 'view_products', label: '🛍️ View Products', desc: 'Can view all products' },
  { id: 'add_product', label: '➕ Add Products', desc: 'Can add new products' },
  { id: 'edit_product', label: '✏️ Edit Products', desc: 'Can edit existing products' },
  { id: 'delete_product', label: '🗑️ Delete Products', desc: 'Can delete products' },
  { id: 'view_tickets', label: '🎧 View Support Tickets', desc: 'Can view support tickets' },
  { id: 'reply_tickets', label: '💬 Reply to Tickets', desc: 'Can reply and resolve tickets' },
  { id: 'view_stats', label: '📊 View Stats', desc: 'Can view dashboard statistics' },
  { id: 'view_users', label: '👥 View Users', desc: 'Can view user list' },
  { id: 'reset_password', label: '🔐 Reset User Password', desc: 'Can reset user passwords' },
  { id: 'manage_coupons', label: '🎟️ Manage Coupons', desc: 'Can create and manage coupons' },
]

export default function AdminManagement() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editAdmin, setEditAdmin] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    permissions: [],
    isActive: true
  })

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = () => {
    fetch('/api/admin/admins')
      .then(res => res.json())
      .then(data => {
        setAdmins(data.admins || [])
        setLoading(false)
      })
  }

  const resetForm = () => {
    setForm({ name: '', email: '', password: '', permissions: [], isActive: true })
    setEditAdmin(null)
    setMessage('')
  }

  const openEdit = (admin) => {
    setEditAdmin(admin)
    setForm({
      name: admin.name,
      email: admin.email,
      password: '',
      permissions: Array.isArray(admin.permissions) ? admin.permissions : [],
      isActive: admin.isActive
    })
    setShowForm(true)
  }

  const togglePermission = (permId) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }))
  }

  const selectAll = () => setForm(prev => ({ ...prev, permissions: ALL_PERMISSIONS.map(p => p.id) }))
  const clearAll = () => setForm(prev => ({ ...prev, permissions: [] }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    const url = editAdmin ? `/api/admin/admins/${editAdmin.id}` : '/api/admin/admins'
    const method = editAdmin ? 'PATCH' : 'POST'

    const body = { ...form }
    if (editAdmin && !body.password) delete body.password

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    setSubmitting(false)

    if (res.ok) {
      setMessage(editAdmin ? 'Admin updated!' : 'Admin created!')
      fetchAdmins()
      setTimeout(() => {
        resetForm()
        setShowForm(false)
        setMessage('')
      }, 1500)
    } else {
      setMessage(data.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this admin?')) return
    await fetch(`/api/admin/admins/${id}`, { method: 'DELETE' })
    fetchAdmins()
  }

  const handleToggle = async (admin) => {
    await fetch(`/api/admin/admins/${admin.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...admin, permissions: admin.permissions, isActive: !admin.isActive })
    })
    fetchAdmins()
  }

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
          <span className="text-sm text-[#7b6f66]">Admin — Team Management</span>
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-sm text-[#7b6f66] hover:text-[#171313] transition">← Dashboard</a>
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

      <div className="mx-auto max-w-5xl px-5 py-8 pb-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c6048]">Team</p>
            <h2 className="mt-1 text-3xl font-semibold">Admin Management</h2>
            <p className="mt-1 text-sm text-[#7b6f66]">Create and manage sub-admins with limited permissions</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { resetForm(); setShowForm(!showForm) }}
            className="rounded-full bg-[#171313] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3a2a21]"
          >
            {showForm ? '✕ Cancel' : '+ Add Admin'}
          </motion.button>
        </motion.div>

        {/* Sub Admin Login Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-blue-50 border border-blue-200 p-4 mb-6">
          <p className="text-sm text-blue-700 font-semibold mb-1">ℹ️ Sub-admin Login</p>
          <p className="text-xs text-blue-600">Sub-admins can login at <span className="font-mono font-bold">/admin/sub-login</span> with their email and password. They will only see pages they have permission for.</p>
        </motion.div>

        {/* Create/Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
                <h3 className="text-lg font-semibold mb-6">{editAdmin ? 'Edit Admin' : 'Create New Admin'}</h3>
                <form onSubmit={handleSubmit} className="space-y-5">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-[#7b6f66] mb-1 block">Full Name *</label>
                      <input type="text" placeholder="e.g. Rahul Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition" required/>
                    </div>
                    <div>
                      <label className="text-sm text-[#7b6f66] mb-1 block">Email *</label>
                      <input type="email" placeholder="admin@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={!!editAdmin} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition disabled:opacity-50 disabled:cursor-not-allowed" required={!editAdmin}/>
                    </div>
                    <div>
                      <label className="text-sm text-[#7b6f66] mb-1 block">{editAdmin ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                      <input type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition" required={!editAdmin}/>
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center justify-between bg-[#f6f1ea] border border-[#241a14]/15 rounded-2xl px-4 py-3 h-fit mt-auto">
                      <div>
                        <p className="text-sm font-medium">Active</p>
                        <p className="text-xs text-[#9b8f86]">Allow login access</p>
                      </div>
                      <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })} className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${form.isActive ? 'bg-[#171313]' : 'bg-[#241a14]/20'}`}>
                        <span className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${form.isActive ? 'left-7 bg-white' : 'left-1 bg-[#9b8f86]'}`}/>
                      </button>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm text-[#7b6f66] font-medium">Permissions ({form.permissions.length}/{ALL_PERMISSIONS.length})</label>
                      <div className="flex gap-2">
                        <button type="button" onClick={selectAll} className="text-xs text-[#7b6f66] hover:text-[#171313] border border-[#241a14]/15 px-3 py-1 rounded-full transition">Select All</button>
                        <button type="button" onClick={clearAll} className="text-xs text-[#7b6f66] hover:text-[#171313] border border-[#241a14]/15 px-3 py-1 rounded-full transition">Clear All</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {ALL_PERMISSIONS.map(perm => (
                        <button
                          key={perm.id}
                          type="button"
                          onClick={() => togglePermission(perm.id)}
                          className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition ${
                            form.permissions.includes(perm.id)
                              ? 'border-[#171313] bg-[#171313] text-white'
                              : 'border-[#241a14]/15 bg-[#f6f1ea] hover:bg-white'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${form.permissions.includes(perm.id) ? 'border-white bg-white' : 'border-[#9b8f86]'}`}>
                            {form.permissions.includes(perm.id) && <div className="w-2.5 h-2.5 rounded-full bg-[#171313]"/>}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{perm.label}</p>
                            <p className={`text-xs mt-0.5 ${form.permissions.includes(perm.id) ? 'text-white/70' : 'text-[#9b8f86]'}`}>{perm.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {message && (
                    <p className={`text-sm text-center font-medium ${message.includes('!') && !message.toLowerCase().includes('error') && !message.toLowerCase().includes('already') ? 'text-green-600' : 'text-red-500'}`}>
                      {message}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button type="button" onClick={() => { resetForm(); setShowForm(false) }} className="flex-1 rounded-full border border-[#241a14]/15 py-3 text-sm font-semibold text-[#6d625a] transition hover:bg-[#f6f1ea]">Cancel</button>
                    <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={submitting} className="flex-1 rounded-full bg-[#171313] py-3 text-sm font-semibold text-white transition hover:bg-[#3a2a21] disabled:opacity-50">
                      {submitting ? 'Saving...' : editAdmin ? 'Update Admin' : 'Create Admin'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admins List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#171313] border-t-transparent animate-spin mx-auto mb-3"/>
            <p className="text-sm text-[#7b6f66]">Loading admins...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-20 rounded-[2rem] border border-[#241a14]/10 bg-white/55">
            <p className="text-4xl mb-4">👥</p>
            <p className="text-lg font-semibold mb-2">No sub-admins yet!</p>
            <p className="text-sm text-[#7b6f66] mb-6">Add team members with limited permissions</p>
            <button onClick={() => setShowForm(true)} className="rounded-full bg-[#171313] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3a2a21]">
              Add First Admin
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {admins.map((admin, i) => (
              <motion.div
                key={admin.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-5 ${!admin.isActive ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#171313] text-white flex items-center justify-center text-lg font-semibold flex-shrink-0">
                      {admin.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{admin.name}</p>
                      <p className="text-sm text-[#7b6f66]">{admin.email}</p>
                      <p className="text-xs text-[#9b8f86] mt-0.5">
                        {Array.isArray(admin.permissions) ? admin.permissions.length : 0} permissions •
                        Joined {new Date(admin.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${admin.isActive ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'}`}>
                      {admin.isActive ? '✓ Active' : '✕ Inactive'}
                    </span>
                    <button onClick={() => handleToggle(admin)} className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${admin.isActive ? 'bg-[#171313]' : 'bg-[#241a14]/20'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 ${admin.isActive ? 'left-5 bg-white' : 'left-0.5 bg-[#9b8f86]'}`}/>
                    </button>
                    <button onClick={() => openEdit(admin)} className="text-xs px-3 py-1.5 rounded-full border border-[#241a14]/15 text-[#6d625a] hover:bg-[#f6f1ea] transition">Edit</button>
                    <button onClick={() => handleDelete(admin.id)} className="text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition">Delete</button>
                  </div>
                </div>

                {/* Permissions */}
                {Array.isArray(admin.permissions) && admin.permissions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#241a14]/10">
                    <p className="text-xs text-[#9b8f86] mb-2">Permissions:</p>
                    <div className="flex flex-wrap gap-2">
                      {admin.permissions.map(permId => {
                        const perm = ALL_PERMISSIONS.find(p => p.id === permId)
                        return perm ? (
                          <span key={permId} className="text-xs bg-[#f6f1ea] border border-[#241a14]/10 px-2 py-0.5 rounded-full text-[#6f6258]">
                            {perm.label}
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-[#241a14]/10 px-5 py-10">
        <p className="text-center text-sm text-[#9b8f86]">{config.copyright}</p>
      </footer>
    </main>
  )
}