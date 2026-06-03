'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import config from '@/lib/config'

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editCoupon, setEditCoupon] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    maxDiscount: '',
    minCartValue: '',
    usageType: 'one_per_user',
    totalLimit: '',
    expiryDate: '',
    isActive: true,
    isNewUserOnly: false,
    categoryRestriction: ''
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = () => {
    fetch('/api/admin/coupons')
      .then(res => res.json())
      .then(data => {
        setCoupons(data.coupons || [])
        setLoading(false)
      })
  }

  const resetForm = () => {
    setForm({
      code: '', description: '', type: 'percentage', value: '',
      maxDiscount: '', minCartValue: '', usageType: 'one_per_user',
      totalLimit: '', expiryDate: '', isActive: true,
      isNewUserOnly: false, categoryRestriction: ''
    })
    setEditCoupon(null)
    setMessage('')
  }

  const openEdit = (coupon) => {
    setEditCoupon(coupon)
    setForm({
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount,
      minCartValue: coupon.minCartValue,
      usageType: coupon.usageType,
      totalLimit: coupon.totalLimit,
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      isActive: coupon.isActive,
      isNewUserOnly: coupon.isNewUserOnly,
      categoryRestriction: coupon.categoryRestriction
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    const url = editCoupon ? `/api/admin/coupons/${editCoupon.id}` : '/api/admin/coupons'
    const method = editCoupon ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    setSubmitting(false)

    if (res.ok) {
      setMessage(editCoupon ? 'Coupon updated!' : 'Coupon created!')
      fetchCoupons()
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
    if (!confirm('Delete this coupon?')) return
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    fetchCoupons()
  }

  const handleToggle = async (coupon) => {
    await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...coupon, isActive: !coupon.isActive })
    })
    fetchCoupons()
  }

  const isExpired = (expiryDate) => expiryDate && new Date() > new Date(expiryDate)

  const categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books', 'Toys']

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
          <span className="text-sm text-[#7b6f66]">Admin — Coupons</span>
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-sm text-[#7b6f66] hover:text-[#171313] transition">← Dashboard</a>
            <a href="/admin/orders" className="text-sm text-[#7b6f66] hover:text-[#171313] transition">📦 Orders</a>
            <a href="/admin/stats" className="text-sm text-[#7b6f66] hover:text-[#171313] transition">📊 Stats</a>
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

      <div className="mx-auto max-w-6xl px-5 py-8 pb-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c6048]">Discounts</p>
            <h2 className="mt-1 text-3xl font-semibold">Coupon Codes</h2>
            <p className="mt-1 text-sm text-[#7b6f66]">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''} total</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { resetForm(); setShowForm(!showForm) }}
            className="rounded-full bg-[#171313] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3a2a21]"
          >
            {showForm ? '✕ Cancel' : '+ Create Coupon'}
          </motion.button>
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
                <h3 className="text-lg font-semibold mb-6">{editCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h3>
                <form onSubmit={handleSubmit} className="space-y-5">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Code */}
                    <div>
                      <label className="text-sm text-[#7b6f66] mb-1 block">Coupon Code *</label>
                      <input
                        type="text"
                        placeholder="e.g. SAVE10"
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                        disabled={!!editCoupon}
                        className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm uppercase font-mono font-bold placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-sm text-[#7b6f66] mb-1 block">Description</label>
                      <input
                        type="text"
                        placeholder="e.g. 10% off for new users"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition"
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label className="text-sm text-[#7b6f66] mb-1 block">Discount Type *</label>
                      <select
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none focus:border-[#171313]/30 transition"
                      >
                        <option value="percentage">Percentage (e.g. 10%)</option>
                        <option value="flat">Flat Amount (e.g. ₹50 off)</option>
                      </select>
                    </div>

                    {/* Value */}
                    <div>
                      <label className="text-sm text-[#7b6f66] mb-1 block">
                        {form.type === 'percentage' ? 'Discount Percentage (%) *' : 'Flat Discount Amount (₹) *'}
                      </label>
                      <input
                        type="number"
                        placeholder={form.type === 'percentage' ? 'e.g. 10' : 'e.g. 50'}
                        value={form.value}
                        onChange={(e) => setForm({ ...form, value: e.target.value })}
                        className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition"
                        required
                      />
                    </div>

                    {/* Max Discount */}
                    {form.type === 'percentage' && (
                      <div>
                        <label className="text-sm text-[#7b6f66] mb-1 block">Max Discount Cap (₹) <span className="text-[#9b8f86]">optional</span></label>
                        <input
                          type="number"
                          placeholder="e.g. 150 (0 = no cap)"
                          value={form.maxDiscount}
                          onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                          className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition"
                        />
                      </div>
                    )}

                    {/* Min Cart Value */}
                    <div>
                      <label className="text-sm text-[#7b6f66] mb-1 block">Minimum Cart Value (₹) <span className="text-[#9b8f86]">optional</span></label>
                      <input
                        type="number"
                        placeholder="e.g. 799 (0 = no minimum)"
                        value={form.minCartValue}
                        onChange={(e) => setForm({ ...form, minCartValue: e.target.value })}
                        className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition"
                      />
                    </div>

                    {/* Usage Type */}
                    <div>
                      <label className="text-sm text-[#7b6f66] mb-1 block">Usage Restriction *</label>
                      <select
                        value={form.usageType}
                        onChange={(e) => setForm({ ...form, usageType: e.target.value })}
                        className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none focus:border-[#171313]/30 transition"
                      >
                        <option value="one_per_user">One use per user</option>
                        <option value="one_per_order">One use per order</option>
                        <option value="total_limit">Total coupon limit</option>
                        <option value="unlimited">Unlimited uses</option>
                      </select>
                    </div>

                    {/* Total Limit */}
                    {(form.usageType === 'total_limit') && (
                      <div>
                        <label className="text-sm text-[#7b6f66] mb-1 block">Total Usage Limit</label>
                        <input
                          type="number"
                          placeholder="e.g. 500 (first 500 users)"
                          value={form.totalLimit}
                          onChange={(e) => setForm({ ...form, totalLimit: e.target.value })}
                          className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition"
                        />
                      </div>
                    )}

                    {/* Expiry Date */}
                    <div>
                      <label className="text-sm text-[#7b6f66] mb-1 block">Expiry Date <span className="text-[#9b8f86]">optional</span></label>
                      <input
                        type="date"
                        value={form.expiryDate}
                        onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                        className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none focus:border-[#171313]/30 transition"
                      />
                    </div>

                    {/* Category Restriction */}
                    <div>
                      <label className="text-sm text-[#7b6f66] mb-1 block">Category Restriction <span className="text-[#9b8f86]">optional</span></label>
                      <select
                        value={form.categoryRestriction}
                        onChange={(e) => setForm({ ...form, categoryRestriction: e.target.value })}
                        className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none focus:border-[#171313]/30 transition"
                      >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between bg-[#f6f1ea] border border-[#241a14]/15 rounded-2xl px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">Active</p>
                        <p className="text-xs text-[#9b8f86]">Enable this coupon</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, isActive: !form.isActive })}
                        className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${form.isActive ? 'bg-[#171313]' : 'bg-[#241a14]/20'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${form.isActive ? 'left-7 bg-white' : 'left-1 bg-[#9b8f86]'}`}/>
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-[#f6f1ea] border border-[#241a14]/15 rounded-2xl px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">New Users Only</p>
                        <p className="text-xs text-[#9b8f86]">Only for first-time buyers</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, isNewUserOnly: !form.isNewUserOnly })}
                        className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${form.isNewUserOnly ? 'bg-[#171313]' : 'bg-[#241a14]/20'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${form.isNewUserOnly ? 'left-7 bg-white' : 'left-1 bg-[#9b8f86]'}`}/>
                      </button>
                    </div>
                  </div>

                  {/* Preview */}
                  {form.code && form.value && (
                    <div className="rounded-2xl bg-[#f6f1ea] border border-[#241a14]/10 p-4">
                      <p className="text-xs text-[#9b8f86] mb-2 font-semibold uppercase tracking-wider">Preview</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono font-bold text-lg text-[#171313] bg-white border border-[#241a14]/15 px-3 py-1 rounded-xl">{form.code}</span>
                        <div className="text-sm text-[#6f6258]">
                          {form.type === 'percentage' ? (
                            <span>{form.value}% off{form.maxDiscount > 0 ? ` (max ₹${form.maxDiscount})` : ''}</span>
                          ) : (
                            <span>₹{form.value} off</span>
                          )}
                          {form.minCartValue > 0 && <span className="ml-2">• Min ₹{form.minCartValue}</span>}
                          {form.isNewUserOnly && <span className="ml-2">• New users only</span>}
                          {form.expiryDate && <span className="ml-2">• Expires {new Date(form.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                          {form.categoryRestriction && <span className="ml-2">• {form.categoryRestriction} only</span>}
                        </div>
                      </div>
                    </div>
                  )}

                  {message && (
                    <p className={`text-sm text-center font-medium ${message.includes('!') && !message.includes('error') ? 'text-green-600' : 'text-red-500'}`}>
                      {message}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { resetForm(); setShowForm(false) }}
                      className="flex-1 rounded-full border border-[#241a14]/15 py-3 text-sm font-semibold text-[#6d625a] transition hover:bg-[#f6f1ea]"
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={submitting}
                      className="flex-1 rounded-full bg-[#171313] py-3 text-sm font-semibold text-white transition hover:bg-[#3a2a21] disabled:opacity-50"
                    >
                      {submitting ? 'Saving...' : editCoupon ? 'Update Coupon' : 'Create Coupon'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coupons List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#171313] border-t-transparent animate-spin mx-auto mb-3"/>
            <p className="text-sm text-[#7b6f66]">Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-20 rounded-[2rem] border border-[#241a14]/10 bg-white/55">
            <p className="text-4xl mb-4">🎟️</p>
            <p className="text-lg font-semibold mb-2">No coupons yet!</p>
            <p className="text-sm text-[#7b6f66] mb-6">Create your first coupon to offer discounts</p>
            <button onClick={() => setShowForm(true)} className="rounded-full bg-[#171313] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3a2a21]">
              Create First Coupon
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {coupons.map((coupon, i) => (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 overflow-hidden ${!coupon.isActive || isExpired(coupon.expiryDate) ? 'opacity-60' : ''}`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">

                    {/* Coupon Code & Info */}
                    <div className="flex items-start gap-4">
                      <div className="bg-[#f6f1ea] border border-[#241a14]/10 rounded-2xl px-4 py-3 text-center flex-shrink-0">
                        <p className="font-mono font-bold text-lg text-[#171313]">{coupon.code}</p>
                        <p className="text-xs text-[#8c6048] font-semibold mt-0.5">
                          {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold">{coupon.description || coupon.code}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {coupon.maxDiscount > 0 && (
                            <span className="text-xs bg-[#f6f1ea] border border-[#241a14]/10 px-2 py-0.5 rounded-full text-[#6f6258]">Max ₹{coupon.maxDiscount}</span>
                          )}
                          {coupon.minCartValue > 0 && (
                            <span className="text-xs bg-[#f6f1ea] border border-[#241a14]/10 px-2 py-0.5 rounded-full text-[#6f6258]">Min ₹{coupon.minCartValue}</span>
                          )}
                          {coupon.isNewUserOnly && (
                            <span className="text-xs bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full text-blue-700">New users only</span>
                          )}
                          {coupon.categoryRestriction && (
                            <span className="text-xs bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full text-purple-700">{coupon.categoryRestriction} only</span>
                          )}
                          {coupon.expiryDate && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${isExpired(coupon.expiryDate) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                              {isExpired(coupon.expiryDate) ? '⚠️ Expired' : `Expires ${new Date(coupon.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-start gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-[#9b8f86]">Used</p>
                        <p className="font-semibold">{coupon.totalUsed}{coupon.totalLimit > 0 ? `/${coupon.totalLimit}` : ''}</p>
                        <p className="text-xs text-[#9b8f86] mt-1">{coupon.usageType.replace(/_/g, ' ')}</p>
                      </div>

                      <div className="flex flex-col gap-2">
                        {/* Active Toggle */}
                        <button
                          onClick={() => handleToggle(coupon)}
                          className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${coupon.isActive ? 'bg-[#171313]' : 'bg-[#241a14]/20'}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 ${coupon.isActive ? 'left-5 bg-white' : 'left-0.5 bg-[#9b8f86]'}`}/>
                        </button>

                        <button onClick={() => openEdit(coupon)} className="text-xs px-3 py-1 rounded-full border border-[#241a14]/15 text-[#6d625a] hover:bg-[#f6f1ea] transition">
                          Edit
                        </button>

                        <button onClick={() => handleDelete(coupon.id)} className="text-xs px-3 py-1 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Usage Progress */}
                  {coupon.totalLimit > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#241a14]/10">
                      <div className="flex items-center justify-between text-xs text-[#9b8f86] mb-1">
                        <span>Usage</span>
                        <span>{coupon.totalUsed}/{coupon.totalLimit} used</span>
                      </div>
                      <div className="w-full bg-[#f6f1ea] rounded-full h-2">
                        <div
                          className="bg-[#171313] h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((coupon.totalUsed / coupon.totalLimit) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Suggested New User Coupon */}
        {coupons.length === 0 && !showForm && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 rounded-[1.4rem] bg-[#171313] text-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">💡 Suggested Coupon</p>
            <p className="font-semibold text-lg mb-1">New User Welcome Coupon</p>
            <p className="text-white/70 text-sm mb-4">10% off up to ₹150 • Min order ₹799 • One time only • New users only</p>
            <button
              onClick={() => {
                setForm({
                  code: 'WELCOME10',
                  description: '10% off for new users up to ₹150',
                  type: 'percentage',
                  value: '10',
                  maxDiscount: '150',
                  minCartValue: '799',
                  usageType: 'one_per_user',
                  totalLimit: '',
                  expiryDate: '',
                  isActive: true,
                  isNewUserOnly: true,
                  categoryRestriction: ''
                })
                setShowForm(true)
              }}
              className="rounded-full bg-white text-[#171313] px-6 py-2.5 text-sm font-semibold transition hover:bg-[#f6f1ea]"
            >
              Use this template
            </button>
          </motion.div>
        )}
      </div>

      <footer className="border-t border-[#241a14]/10 px-5 py-10">
        <p className="text-center text-sm text-[#9b8f86]">{config.copyright}</p>
      </footer>
    </main>
  )
}