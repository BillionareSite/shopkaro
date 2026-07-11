'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import config from '@/lib/config'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [orderCount, setOrderCount] = useState(0)
  const [token, setToken] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [form, setForm] = useState({
    name: '', phone: '', whatsapp: '', dob: '', gender: '', address: '', pincode: ''
  })

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (!t) { window.location.href = '/auth/login'; return }
    setToken(t)
    try {
      const payload = JSON.parse(atob(t.split('.')[1]))
      // Fetch full profile from DB
      fetch('/api/user', { headers: { 'Authorization': 'Bearer ' + t } })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user)
            setForm({
              name: data.user.name || '',
              phone: data.user.phone || '',
              whatsapp: data.user.whatsapp || '',
              dob: data.user.dob || '',
              gender: data.user.gender || '',
              address: data.user.address || '',
              pincode: data.user.pincode || ''
            })
          }
        })
      fetch('/api/orders?email=' + payload.email)
        .then(res => res.json())
        .then(data => setOrderCount((data.orders || []).length))
    } catch { window.location.href = '/auth/login' }
  }, [])

  const handleSave = async () => {
    if (!form.name.trim()) { setSaveMessage('Name cannot be empty!'); return }
    setSaving(true)
    setSaveMessage('')
    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) {
      setUser(data.user)
      setEditing(false)
      setSaveMessage('Profile updated!')
      setTimeout(() => setSaveMessage(''), 3000)
    } else {
      setSaveMessage(data.message || 'Something went wrong!')
    }
  }

  const handleLogout = () => { localStorage.removeItem('token'); window.location.href = '/' }

  const profileCompletion = () => {
    const fields = [form.name, form.phone, form.dob, form.gender, form.address, form.pincode]
    const filled = fields.filter(f => f && f.trim() !== '').length
    return Math.round((filled / fields.length) * 100)
  }

  if (!user) return (
    <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#171313] border-t-transparent animate-spin"/>
    </main>
  )

  const completion = profileCompletion()

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <Navbar />
      <div className="mx-auto max-w-3xl px-5 py-10 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Account</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">My Profile</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Manage your account details and preferences</p>
        </motion.div>

        {/* Profile Header Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-[1.4rem] bg-white shadow-lg shadow-[var(--shadow)]/5 p-6 mb-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-[var(--btn-dark)] text-white flex items-center justify-center text-2xl font-semibold flex-shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
                <p className="text-xs text-green-600 font-semibold mt-1">✓ Verified Account</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setEditing(!editing); setSaveMessage('') }}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition flex-shrink-0 ${editing ? 'border border-[var(--border)]/15 text-[var(--text-muted)] hover:bg-[var(--bg)]' : 'bg-[var(--btn-dark)] text-white hover:bg-[var(--btn-dark-hover)]'}`}
            >
              {editing ? '✕ Cancel' : '✏️ Edit Profile'}
            </motion.button>
          </div>

          {/* Profile completion bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-[var(--text-muted)] font-medium">Profile completion</p>
              <p className="text-xs font-bold text-[var(--text-primary)]">{completion}%</p>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--bg)] border border-[var(--border)]/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: completion + '%' }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className={`h-full rounded-full ${completion === 100 ? 'bg-green-500' : completion >= 60 ? 'bg-blue-500' : 'bg-amber-500'}`}
              />
            </div>
            {completion < 100 && <p className="text-xs text-[var(--text-placeholder)] mt-1.5">Fill in all details for a complete profile</p>}
          </div>
        </motion.div>

        {/* Save message */}
        <AnimatePresence>
          {saveMessage && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`mb-4 rounded-2xl px-4 py-3 text-sm font-semibold text-center ${saveMessage.includes('updated') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
              {saveMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Details / Edit Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[1.4rem] bg-white shadow-lg shadow-[var(--shadow)]/5 p-6 mb-5">
          <h3 className="text-lg font-semibold mb-5">👤 Personal Details</h3>

          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">

                <div>
                  <label className="text-sm text-[var(--text-muted)] mb-1 block">Full Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" className="w-full rounded-2xl border border-[var(--border)]/15 bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none focus:border-[var(--border)]/30 transition"/>
                </div>

                {/* Email - read only */}
                <div>
                  <label className="text-sm text-[var(--text-muted)] mb-1 block">Email Address <span className="text-[var(--text-placeholder)] text-xs">(cannot be changed)</span></label>
                  <input type="email" value={user.email} readOnly className="w-full rounded-2xl border border-[var(--border)]/10 bg-[var(--bg)]/50 px-4 py-3 text-sm text-[var(--text-placeholder)] cursor-not-allowed"/>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[var(--text-muted)] mb-1 block">Phone Number</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" className="w-full rounded-2xl border border-[var(--border)]/15 bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none focus:border-[var(--border)]/30 transition"/>
                  </div>
                  <div>
                    <label className="text-sm text-[var(--text-muted)] mb-1 block">WhatsApp Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">💬</span>
                      <input type="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="WhatsApp number" className="w-full rounded-2xl border border-[var(--border)]/15 bg-[var(--bg)] pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none focus:border-[var(--border)]/30 transition"/>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[var(--text-muted)] mb-1 block">Date of Birth</label>
                    <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className="w-full rounded-2xl border border-[var(--border)]/15 bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border)]/30 transition"/>
                  </div>
                  <div>
                    <label className="text-sm text-[var(--text-muted)] mb-1 block">Gender</label>
                    <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full rounded-2xl border border-[var(--border)]/15 bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border)]/30 transition">
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-[var(--text-muted)] mb-1 block">Default Delivery Address</label>
                  <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House No, Street, Area, City" rows={3} className="w-full rounded-2xl border border-[var(--border)]/15 bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none focus:border-[var(--border)]/30 transition resize-none"/>
                </div>

                <div>
                  <label className="text-sm text-[var(--text-muted)] mb-1 block">Pincode</label>
                  <input type="text" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} placeholder="248001" className="w-full rounded-2xl border border-[var(--border)]/15 bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none focus:border-[var(--border)]/30 transition"/>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full rounded-full bg-[var(--btn-dark)] py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--btn-dark-hover)] disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes ✓'}
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {[
                  { label: 'Full Name', value: user.name, icon: '👤' },
                  { label: 'Email Address', value: user.email, icon: '📧' },
                  { label: 'Phone Number', value: user.phone || '—', icon: '📱' },
                  { label: 'WhatsApp', value: user.whatsapp || '—', icon: '💬' },
                  { label: 'Date of Birth', value: user.dob ? new Date(user.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—', icon: '🎂' },
                  { label: 'Gender', value: user.gender || '—', icon: '👥' },
                  { label: 'Address', value: user.address || '—', icon: '📍' },
                  { label: 'Pincode', value: user.pincode || '—', icon: '🗺️' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-2xl bg-[var(--bg)] border border-[var(--border)]/10 px-4 py-3">
                    <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--text-placeholder)] mb-0.5">{item.label}</p>
                      <p className={`text-sm font-semibold truncate ${item.value === '—' ? 'text-[var(--text-placeholder)]' : 'text-[var(--text-primary)]'}`}>{item.value}</p>
                    </div>
                  </div>
                ))}
                <button onClick={() => setEditing(true)} className="w-full rounded-full border border-[var(--border)]/15 py-3 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-[var(--bg)] mt-2">
                  ✏️ Edit Details
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: 'Orders', value: orderCount, icon: '📦', color: 'text-[var(--text-primary)]' },
            { label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), icon: '📅', color: 'text-blue-600' },
            { label: 'Status', value: 'Active', icon: '✓', color: 'text-green-600' }
          ].map((stat, i) => (
            <div key={i} className="rounded-[1.4rem] bg-white shadow-lg shadow-[var(--shadow)]/5 p-4 text-center">
              <p className="text-xl mb-1">{stat.icon}</p>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-[var(--text-placeholder)] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-4 mb-6">
          {[
            { href: '/orders', icon: '📦', title: 'My Orders', sub: `${orderCount} order${orderCount !== 1 ? 's' : ''} placed` },
            { href: '/products', icon: '🛍️', title: 'Browse Products', sub: 'Explore our store' },
            { href: '/cart', icon: '🛒', title: 'My Cart', sub: 'View your cart' },
            { href: '/help', icon: '🎧', title: 'Help & Support', sub: 'Get assistance' },
            { href: '/contact', icon: '📬', title: 'Contact Us', sub: 'Reach out to us' },
            { href: '/auth/forgot-password', icon: '🔐', title: 'Change Password', sub: 'Update your password' }
          ].map((item, i) => (
            <a key={i} href={item.href}>
              <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[var(--shadow)]/5 p-5 hover:shadow-xl transition cursor-pointer h-full">
                <p className="text-2xl mb-2">{item.icon}</p>
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-[var(--text-placeholder)] mt-1">{item.sub}</p>
              </div>
            </a>
          ))}
        </motion.div>

        {/* Logout */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full rounded-full border border-red-200 bg-red-50 py-3.5 font-semibold text-sm text-red-600 transition hover:bg-red-100"
          >
            Logout
          </motion.button>
        </motion.div>
      </div>

      <footer className="border-t border-[var(--border)]/10 px-5 py-10">
        <p className="text-center text-sm text-[var(--text-placeholder)]">{config.copyright}</p>
      </footer>
    </main>
  )
}