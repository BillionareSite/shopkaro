'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import config from '@/lib/config'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'orders', label: 'Orders', icon: '📦' },
  { id: 'products', label: 'Products', icon: '🛍️' },
  { id: 'cancellations', label: 'Cancellations', icon: '❌' },
  { id: 'tickets', label: 'Support', icon: '🎧' },
  { id: 'coupons', label: 'Coupons', icon: '🎟️' },
  { id: 'categories', label: 'Categories', icon: '🗂️' },
  { id: 'admins', label: 'Team', icon: '👥' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
  { id: 'stats', label: 'Statistics', icon: '📈' },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Data states
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [tickets, setTickets] = useState([])
  const [coupons, setCoupons] = useState([])
  const [admins, setAdmins] = useState([])
  const [cancellations, setCancellations] = useState([])
  const [settings, setSettings] = useState({ paymentMethods: { cod: true, upi: false, bank: false, card: false }, upiId: '', bankDetails: '' })
  const [loading, setLoading] = useState({})
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [viewBill, setViewBill] = useState(null)
  const [viewScreenshot, setViewScreenshot] = useState(null)
  const [updating, setUpdating] = useState(null)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsMessage, setSettingsMessage] = useState('')

  // Product form
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', originalPrice: '', images: [''], category: 'Electronics', stock: '', featured: false, sameDayPincodes: [] })
  const [pincodeInput, setPincodeInput] = useState('')
  const [productMessage, setProductMessage] = useState('')
  const [submittingProduct, setSubmittingProduct] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [editPincodeInput, setEditPincodeInput] = useState('')

  // Ticket states
  const [replyForm, setReplyForm] = useState({})
  const [expandedTicket, setExpandedTicket] = useState(null)
  const [expandedUser, setExpandedUser] = useState(null)
  const [userOrders, setUserOrders] = useState({})
  const [sendingReply, setSendingReply] = useState(null)

  // Coupon form
  const [showCouponForm, setShowCouponForm] = useState(false)
  const [editCoupon, setEditCoupon] = useState(null)
  const [couponForm, setCouponForm] = useState({ code: '', description: '', type: 'percentage', value: '', maxDiscount: '', minCartValue: '', usageType: 'one_per_user', totalLimit: '', expiryDate: '', isActive: true, isNewUserOnly: false, categoryRestriction: '' })
  const [couponMessage, setCouponMessage] = useState('')
  const [submittingCoupon, setSubmittingCoupon] = useState(false)

  // Admin form
  const [showAdminForm, setShowAdminForm] = useState(false)
  const [editAdmin, setEditAdmin] = useState(null)
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '', permissions: [], isActive: true })
  const [adminMessage, setAdminMessage] = useState('')
  const [submittingAdmin, setSubmittingAdmin] = useState(false)

  // Category states
  const [categories, setCategories] = useState([])
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '🛍️', image: '' })
  const [editCategory, setEditCategory] = useState(null)
  const [categoryMessage, setCategoryMessage] = useState('')
  const [submittingCategory, setSubmittingCategory] = useState(false)

  const ALL_PERMISSIONS = [
    { id: 'view_orders', label: '📦 View Orders' },
    { id: 'update_order_status', label: '✅ Update Order Status' },
    { id: 'view_products', label: '🛍️ View Products' },
    { id: 'add_product', label: '➕ Add Products' },
    { id: 'edit_product', label: '✏️ Edit Products' },
    { id: 'delete_product', label: '🗑️ Delete Products' },
    { id: 'view_tickets', label: '🎧 View Tickets' },
    { id: 'reply_tickets', label: '💬 Reply Tickets' },
    { id: 'view_stats', label: '📊 View Stats' },
    { id: 'view_users', label: '👥 View Users' },
    { id: 'reset_password', label: '🔐 Reset Password' },
    { id: 'manage_coupons', label: '🎟️ Manage Coupons' },
  ]

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    fetchOrders()
    fetchProducts()
    fetchTickets()
    fetchCoupons()
    fetchAdmins()
    fetchCancellations()
    fetchStats()
    fetchSettings()
    fetchCategories()
  }

  const fetchOrders = () => {
    setLoading(l => ({ ...l, orders: true }))
    fetch('/api/admin/orders').then(r => r.json()).then(d => { setOrders(d.orders || []); setLoading(l => ({ ...l, orders: false })) })
  }

  const fetchProducts = () => {
    fetch('/api/products').then(r => r.json()).then(d => setProducts(d.products || []))
  }

  const fetchTickets = () => {
    fetch('/api/admin/tickets').then(r => r.json()).then(d => setTickets(d.tickets || []))
  }

  const fetchCoupons = () => {
    fetch('/api/admin/coupons').then(r => r.json()).then(d => setCoupons(d.coupons || []))
  }

  const fetchAdmins = () => {
    fetch('/api/admin/admins').then(r => r.json()).then(d => setAdmins(d.admins || []))
  }

  const fetchCancellations = () => {
    fetch('/api/admin/cancellations').then(r => r.json()).then(d => setCancellations(d.requests || []))
  }

  const fetchStats = () => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => setStats(d))
  }

  const fetchSettings = () => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      if (d.settings) setSettings({ paymentMethods: d.settings.paymentMethods || { cod: true, upi: false, bank: false, card: false }, upiId: d.settings.upiId || '', bankDetails: d.settings.bankDetails || '' })
    })
  }

  const fetchCategories = () => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(d => setCategories(d.categories || []))
  }

  const paymentLabels = { cod: 'Cash on Delivery', upi: 'UPI Payment', bank: 'Bank Transfer', card: 'Razorpay' }
  const statusColor = (s) => s === 'delivered' ? 'text-green-700 bg-green-50 border-green-200' : s === 'confirmed' ? 'text-blue-700 bg-blue-50 border-blue-200' : s === 'cancelled' ? 'text-red-700 bg-red-50 border-red-200' : s === 'rejected' ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-amber-700 bg-amber-50 border-amber-200'

  // Order functions
  const handleStatusUpdate = async (id, status) => {
    setUpdating(id + '_' + status)
    await fetch('/api/admin/orders/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    setUpdating(null)
    fetchOrders()
  }

  const handleVerifyPayment = async (id) => {
    setUpdating(id + '_verify')
    await fetch('/api/admin/orders/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentVerified: true, status: 'confirmed' }) })
    setUpdating(null)
    fetchOrders()
  }

  // Cancellation functions
  const handleCancellation = async (id, action) => {
    setUpdating(id + '_' + action)
    await fetch('/api/admin/cancellations/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
    setUpdating(null)
    fetchCancellations()
    fetchOrders()
  }

  // Product functions
  const addPincode = (pincodes, setPincodes, input, setInput) => {
    const trimmed = input.trim()
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) { alert('Please enter a valid 6-digit pincode!'); return }
    if (pincodes.includes(trimmed)) { alert('Pincode already added!'); return }
    setPincodes([...pincodes, trimmed])
    setInput('')
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setSubmittingProduct(true)
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...productForm, images: productForm.images.filter(u => u.trim()), price: parseFloat(productForm.price), originalPrice: parseFloat(productForm.originalPrice), stock: parseInt(productForm.stock) })
    })
    const data = await res.json()
    setProductMessage(data.message)
    setSubmittingProduct(false)
    if (res.ok) {
      setProductForm({ name: '', description: '', price: '', originalPrice: '', images: [''], category: 'Electronics', stock: '', featured: false, sameDayPincodes: [] })
      setPincodeInput('')
      fetchProducts()
    }
  }

  const handleUpdateProduct = async () => {
    setUpdating('product')
    await fetch('/api/admin/products/' + editProduct.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editForm, images: editForm.images.filter(u => u.trim()), price: parseFloat(editForm.price), originalPrice: parseFloat(editForm.originalPrice), stock: parseInt(editForm.stock) })
    })
    setUpdating(null)
    setEditProduct(null)
    setEditForm(null)
    fetchProducts()
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    await fetch('/api/admin/products/' + id, { method: 'DELETE' })
    fetchProducts()
  }

  const toggleFeatured = async (product) => {
    await fetch('/api/admin/products/' + product.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...product, featured: !product.featured }) })
    fetchProducts()
  }

  // Ticket functions
  const handleTicketReply = async (ticketId) => {
    const text = replyForm[ticketId]
    if (!text?.trim()) return
    setSendingReply(ticketId)
    await fetch('/api/admin/tickets/' + ticketId, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reply: text }) })
    setSendingReply(null)
    setReplyForm(prev => ({ ...prev, [ticketId]: '' }))
    fetchTickets()
  }

  const handleTicketResolve = async (id, status) => {
    await fetch('/api/admin/tickets/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    fetchTickets()
  }

  const fetchUserOrders = async (email) => {
    if (userOrders[email]) { setExpandedUser(expandedUser === email ? null : email); return }
    const res = await fetch('/api/orders?email=' + email)
    const data = await res.json()
    setUserOrders(prev => ({ ...prev, [email]: data.orders || [] }))
    setExpandedUser(email)
  }

  // Coupon functions
  const handleCouponSubmit = async (e) => {
    e.preventDefault()
    setSubmittingCoupon(true)
    const url = editCoupon ? '/api/admin/coupons/' + editCoupon.id : '/api/admin/coupons'
    const method = editCoupon ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(couponForm) })
    const data = await res.json()
    setCouponMessage(data.message)
    setSubmittingCoupon(false)
    if (res.ok) { fetchCoupons(); setTimeout(() => { setShowCouponForm(false); setEditCoupon(null); setCouponForm({ code: '', description: '', type: 'percentage', value: '', maxDiscount: '', minCartValue: '', usageType: 'one_per_user', totalLimit: '', expiryDate: '', isActive: true, isNewUserOnly: false, categoryRestriction: '' }); setCouponMessage('') }, 1500) }
  }

  const handleDeleteCoupon = async (id) => {
    if (!confirm('Delete this coupon?')) return
    await fetch('/api/admin/coupons/' + id, { method: 'DELETE' })
    fetchCoupons()
  }

  // Admin functions
  const handleAdminSubmit = async (e) => {
    e.preventDefault()
    setSubmittingAdmin(true)
    const url = editAdmin ? '/api/admin/admins/' + editAdmin.id : '/api/admin/admins'
    const method = editAdmin ? 'PATCH' : 'POST'
    const body = { ...adminForm }
    if (editAdmin && !body.password) delete body.password
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    setAdminMessage(data.message)
    setSubmittingAdmin(false)
    if (res.ok) { fetchAdmins(); setTimeout(() => { setShowAdminForm(false); setEditAdmin(null); setAdminForm({ name: '', email: '', password: '', permissions: [], isActive: true }); setAdminMessage('') }, 1500) }
  }

  const handleDeleteAdmin = async (id) => {
    if (!confirm('Delete this admin?')) return
    await fetch('/api/admin/admins/' + id, { method: 'DELETE' })
    fetchAdmins()
  }

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    const res = await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) })
    const data = await res.json()
    setSavingSettings(false)
    setSettingsMessage(data.message)
    setTimeout(() => setSettingsMessage(''), 3000)
  }

  // Category functions
  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!categoryForm.name.trim()) return
    setSubmittingCategory(true)
    setCategoryMessage('')
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryForm)
    })
    const data = await res.json()
    setSubmittingCategory(false)
    setCategoryMessage(data.message)
    if (res.ok) {
      setCategoryForm({ name: '', icon: '🛍️', image: '' })
      fetchCategories()
      setTimeout(() => setCategoryMessage(''), 3000)
    }
  }

  const handleToggleCategory = async (category) => {
    await fetch('/api/admin/categories/' + category.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...category, isActive: !category.isActive })
    })
    fetchCategories()
  }

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category? Make sure no products use it.')) return
    const res = await fetch('/api/admin/categories/' + id, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { alert(data.message); return }
    fetchCategories()
  }

  const handleUpdateCategory = async (category) => {
    await fetch('/api/admin/categories/' + category.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editCategory.name, icon: editCategory.icon, image: editCategory.image || '', isActive: category.isActive, sortOrder: category.sortOrder })
    })
    setEditCategory(null)
    fetchCategories()
  }

  const printBill = (order) => {
    const items = order.items || []
    const subtotal = order.total + (order.discount || 0)
    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html><html><head><title>Invoice ${order.orderId}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:13px;color:#171313;padding:32px}.header{text-align:center;border-bottom:2px solid #171313;padding-bottom:16px;margin-bottom:20px}.brand{font-size:24px;font-weight:800}.invoice-title{font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-top:8px;color:#8c6048}.meta{display:flex;justify-content:space-between;margin-bottom:20px;gap:8px}.meta-box{background:#f6f1ea;border-radius:8px;padding:12px 16px;flex:1}.meta-label{font-size:10px;color:#9b8f86;text-transform:uppercase;letter-spacing:.1em}.meta-value{font-size:13px;font-weight:700;margin-top:2px}table{width:100%;border-collapse:collapse;margin-bottom:16px}th{text-align:left;font-size:11px;text-transform:uppercase;color:#9b8f86;padding:8px 0;border-bottom:2px solid #f0ebe4}td{padding:10px 0;border-bottom:1px solid #f6f1ea;font-size:13px}.totals{margin-left:auto;width:240px}.total-row{display:flex;justify-content:space-between;padding:4px 0;font-size:13px}.total-row.final{font-size:15px;font-weight:800;border-top:2px solid #171313;margin-top:8px;padding-top:8px}.footer{text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #f0ebe4;font-size:11px;color:#9b8f86}</style></head><body><div class="header"><div class="brand">${config.brandName}</div><div class="invoice-title">Tax Invoice</div></div><div class="meta"><div class="meta-box"><div class="meta-label">Order ID</div><div class="meta-value">${order.orderId}</div></div><div class="meta-box"><div class="meta-label">Date</div><div class="meta-value">${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div></div><div class="meta-box"><div class="meta-label">Payment</div><div class="meta-value">${paymentLabels[order.paymentMethod] || 'N/A'}</div></div><div class="meta-box"><div class="meta-label">Status</div><div class="meta-value">${order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}</div></div></div><div class="meta"><div class="meta-box" style="flex:1;margin:0"><div class="meta-label">Billed To</div><div class="meta-value" style="margin-top:6px">${order.name}</div><div style="color:#6f6258;font-size:12px;margin-top:2px">${order.email}</div><div style="color:#6f6258;font-size:12px;margin-top:2px">📱 ${order.phone}</div>${order.whatsapp ? `<div style="color:#6f6258;font-size:12px;margin-top:2px">💬 ${order.whatsapp}</div>` : ''}<div style="color:#6f6258;font-size:12px;margin-top:2px">📍 ${order.address}, ${order.pincode}</div></div></div><table><thead><tr><th>Item</th><th>Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Total</th></tr></thead><tbody>${items.map(item => `<tr><td>${item.name}</td><td>${item.quantity}</td><td style="text-align:right">₹${item.price}</td><td style="text-align:right;font-weight:600">₹${item.price * item.quantity}</td></tr>`).join('')}</tbody></table><div class="totals"><div class="total-row"><span>Subtotal</span><span>₹${subtotal}</span></div>${order.discount > 0 ? `<div class="total-row" style="color:#22c55e"><span>Coupon (${order.couponCode})</span><span>−₹${order.discount}</span></div>` : ''}<div class="total-row"><span>Delivery</span><span style="color:#22c55e">FREE</span></div><div class="total-row final"><span>Grand Total</span><span>₹${order.total}</span></div></div><div class="footer"><p>Thank you for shopping with ${config.brandName}!</p></div></body></html>`)
    win.document.close()
    win.print()
  }

  const filteredOrders = orders
    .filter(o => statusFilter === 'All' || o.status === statusFilter)
    .filter(o => o.name?.toLowerCase().includes(search.toLowerCase()) || o.email?.toLowerCase().includes(search.toLowerCase()) || o.orderId?.toLowerCase().includes(search.toLowerCase()) || o.phone?.includes(search))

  const pendingVerification = orders.filter(o => (o.paymentMethod === 'upi' || o.paymentMethod === 'bank') && !o.paymentVerified && o.status === 'pending')
  const pendingCancellations = cancellations.filter(c => c.status === 'pending')
  const openTickets = tickets.filter(t => t.status === 'open')

  return (
    <div className="min-h-screen bg-[#f6f1ea] text-[#171313] flex [&_input]:text-[#171313] [&_textarea]:text-[#171313] [&_select]:text-[#171313] [&_option]:text-[#171313] [&_input]:placeholder:text-[#9b8f86] [&_textarea]:placeholder:text-[#9b8f86]">

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-[#171313] z-40 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-56' : 'w-16'}`}>
        {/* Logo */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          {config.logo ? (
            <img src={config.logo} alt={config.brandName} className="w-8 h-8 rounded-full object-cover flex-shrink-0"/>
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{config.shortCode}</div>
          )}
          {sidebarOpen && <span className="text-white font-semibold text-sm truncate">{config.brandName}</span>}
        </div>

        {/* Toggle */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 border-b border-white/10 text-white/50 hover:text-white transition text-center">
          {sidebarOpen ? '◀' : '▶'}
        </button>

        {/* Nav Items */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {TABS.map(tab => {
            const badge = tab.id === 'orders' && pendingVerification.length > 0 ? pendingVerification.length
              : tab.id === 'cancellations' && pendingCancellations.length > 0 ? pendingCancellations.length
              : tab.id === 'tickets' && openTickets.length > 0 ? openTickets.length
              : 0

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-left ${activeTab === tab.id ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/8 hover:text-white'}`}
              >
                <span className="text-lg flex-shrink-0">{tab.icon}</span>
                {sidebarOpen && (
                  <span className="text-sm font-medium flex-1 truncate">{tab.label}</span>
                )}
                {badge > 0 && sidebarOpen && (
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">{badge}</span>
                )}
                {badge > 0 && !sidebarOpen && (
                  <span className="absolute left-8 top-0 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">{badge}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom Links */}
        <div className="p-2 border-t border-white/10 space-y-1">
          <a href="/" className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/8 transition ${!sidebarOpen ? 'justify-center' : ''}`}>
            <span className="text-lg">🏪</span>
            {sidebarOpen && <span className="text-sm">View Store</span>}
          </a>
          <button
            onClick={async () => { await fetch('/api/admin/logout', { method: 'POST' }); window.location.href = '/admin-login' }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            <span className="text-lg">🚪</span>
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-56' : 'ml-16'}`}>

        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#f6f1ea]/95 backdrop-blur-xl border-b border-[#241a14]/10 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{TABS.find(t => t.id === activeTab)?.icon} {TABS.find(t => t.id === activeTab)?.label}</h1>
            <p className="text-xs text-[#9b8f86] mt-0.5">Master Admin Panel</p>
          </div>
          <div className="flex items-center gap-3">
            {pendingVerification.length > 0 && (
              <button onClick={() => setActiveTab('orders')} className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-full font-semibold">
                🔔 {pendingVerification.length} Payment{pendingVerification.length > 1 ? 's' : ''} to Verify
              </button>
            )}
            {pendingCancellations.length > 0 && (
              <button onClick={() => setActiveTab('cancellations')} className="text-xs bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-full font-semibold">
                ❌ {pendingCancellations.length} Cancellation{pendingCancellations.length > 1 ? 's' : ''}
              </button>
            )}
          </div>
        </header>

        <div className="p-6">

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Orders', value: orders.length, icon: '📦', color: 'text-[#171313]' },
                  { label: 'Total Products', value: products.length, icon: '🛍️', color: 'text-blue-600' },
                  { label: 'Open Tickets', value: openTickets.length, icon: '🎧', color: 'text-amber-600' },
                  { label: 'Revenue', value: `₹${orders.reduce((s, o) => s + o.total, 0).toLocaleString()}`, icon: '💰', color: 'text-green-600' }
                ].map((stat, i) => (
                  <div key={i} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-5">
                    <p className="text-2xl mb-2">{stat.icon}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-[#9b8f86] mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {TABS.filter(t => t.id !== 'dashboard').map(tab => {
                  const badge = tab.id === 'orders' && pendingVerification.length > 0 ? pendingVerification.length
                    : tab.id === 'cancellations' && pendingCancellations.length > 0 ? pendingCancellations.length
                    : tab.id === 'tickets' && openTickets.length > 0 ? openTickets.length : 0
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-5 text-left hover:shadow-xl transition relative">
                      <p className="text-2xl mb-2">{tab.icon}</p>
                      <p className="font-semibold text-sm">{tab.label}</p>
                      {badge > 0 && <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>}
                    </button>
                  )
                })}
              </div>

              {/* Recent Orders */}
              <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Recent Orders</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-[#7b6f66] hover:text-[#171313]">View all →</button>
                </div>
                <div className="space-y-3">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-[#f6f1ea]">
                      <div>
                        <p className="text-sm font-semibold font-mono">{order.orderId}</p>
                        <p className="text-xs text-[#9b8f86]">{order.name} · {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">₹{order.total}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColor(order.status)}`}>{order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}</span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-sm text-[#9b8f86] text-center py-4">No orders yet</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {pendingVerification.length > 0 && (
                <div className="rounded-2xl bg-orange-50 border border-orange-200 p-4">
                  <p className="text-sm font-semibold text-orange-700">🔔 {pendingVerification.length} order{pendingVerification.length > 1 ? 's' : ''} awaiting payment verification</p>
                </div>
              )}

              <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-48">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b8f86]">🔍</span>
                  <input type="text" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-full border border-[#241a14]/15 bg-white pl-10 pr-4 py-2.5 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition"/>
                </div>
                <div  className="flex gap-2 overflow-x-auto">
                  {['All', 'pending', 'confirmed', 'delivered', 'cancelled', 'rejected'].map(s => (
  <button key={s} onClick={() => setStatusFilter(s)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition flex-shrink-0 ${statusFilter === s ? 'bg-[#171313] text-white' : 'border border-[#241a14]/15 bg-white text-[#6d625a] hover:bg-[#f6f1ea]'}`}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {loading.orders ? (
                <div className="text-center py-20"><div className="w-8 h-8 rounded-full border-2 border-[#171313] border-t-transparent animate-spin mx-auto"/></div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map(order => (
                    <div key={order.id} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 overflow-hidden">

                      {/* Payment verification alert */}
                      {(order.paymentMethod === 'upi' || order.paymentMethod === 'bank') && !order.paymentVerified && order.status === 'pending' && (
                        <div className="px-5 py-3 bg-orange-50 border-b border-orange-200 flex items-center justify-between gap-3 flex-wrap">
                          <p className="text-xs text-orange-700 font-semibold">🔔 Payment verification required</p>
                          <div className="flex gap-2">
                            {order.paymentScreenshot && <button onClick={() => setViewScreenshot(order)} className="text-xs px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition">👁 Screenshot</button>}
                            <button onClick={() => handleVerifyPayment(order.id)} disabled={updating === order.id + '_verify'} className="text-xs px-3 py-1.5 rounded-full bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50">{updating === order.id + '_verify' ? '...' : '✅ Verify'}</button>
                          </div>
                        </div>
                      )}

                      {/* Cancellation request alert */}
                      {order.cancellationRequest && order.cancellationRequest.status === 'pending' && (
                        <div className="px-5 py-3 bg-red-50 border-b border-red-200">
                          <p className="text-xs text-red-700 font-semibold">⚠️ Cancellation requested: "{order.cancellationRequest.reason}"</p>
                        </div>
                      )}

                      <div className="p-5 border-b border-[#241a14]/10">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex flex-wrap gap-4">
                            <div><p className="text-xs text-[#9b8f86]">Order ID</p><p className="font-mono font-bold text-sm">{order.orderId}</p></div>
                            <div><p className="text-xs text-[#9b8f86]">Customer</p><p className="text-sm font-semibold">{order.name}</p><p className="text-xs text-[#9b8f86]">{order.email}</p></div>
                            <div><p className="text-xs text-[#9b8f86]">Phone</p><p className="text-sm">{order.phone}</p>{order.whatsapp && <p className="text-xs text-green-600">💬 {order.whatsapp}</p>}</div>
                            <div><p className="text-xs text-[#9b8f86]">Total</p><p className="text-sm font-bold">₹{order.total}</p>{order.discount > 0 && <p className="text-xs text-green-600">−₹{order.discount}</p>}</div>
                            <div><p className="text-xs text-[#9b8f86]">Payment</p><p className="text-sm">{paymentLabels[order.paymentMethod] || 'COD'}</p></div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                            {order.isSameDay && <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">⚡ Same Day</span>}
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColor(order.status)}`}>{order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}</span>
                            <button onClick={() => setViewBill(order)} className="text-xs px-3 py-1.5 rounded-full border border-[#241a14]/15 text-[#6d625a] hover:bg-[#f6f1ea] transition">🧾</button>
                            <button onClick={() => printBill(order)} className="text-xs px-3 py-1.5 rounded-full border border-[#241a14]/15 text-[#6d625a] hover:bg-[#f6f1ea] transition">🖨️</button>
                          </div>
                        </div>
                      </div>

                      {(order.paymentMethod === 'upi' || order.paymentMethod === 'bank') && (order.paymentSenderName || order.paymentUTR) && (
                        <div className="px-5 py-3 border-b border-[#241a14]/10 bg-[#f6f1ea] flex flex-wrap gap-4">
                          {order.paymentSenderName && <div><p className="text-xs text-[#9b8f86]">Sender</p><p className="text-sm font-semibold">{order.paymentSenderName}</p></div>}
                          {order.paymentUTR && <div><p className="text-xs text-[#9b8f86]">UTR</p><p className="text-sm font-mono font-semibold">{order.paymentUTR}</p></div>}
                          {order.paymentScreenshot && <div><p className="text-xs text-[#9b8f86]">Screenshot</p><button onClick={() => setViewScreenshot(order)} className="text-xs text-blue-600 underline">View</button></div>}
                        </div>
                      )}

                      <div className="px-5 py-4">
                        <div className="space-y-2 mb-4">
                          {(order.items || []).map((item, j) => (
                            <div key={j} className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#eadfd4]">
                                {item.images?.[0] ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover"/> : <div className="grid h-full place-items-center text-sm">🛍️</div>}
                              </div>
                              <div className="flex-1 min-w-0"><p className="text-sm truncate">{item.name}</p><p className="text-xs text-[#9b8f86]">Qty: {item.quantity} × ₹{item.price}</p></div>
                              <p className="text-sm font-semibold flex-shrink-0">₹{item.price * item.quantity}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <p className="text-xs text-[#9b8f86]">📍 {order.address}, {order.pincode}</p>
                          <div className="flex gap-2 flex-wrap">
                            {['pending', 'confirmed', 'delivered', 'cancelled', 'rejected'].map(s => (
  <button key={s} onClick={() => handleStatusUpdate(order.id, s)} disabled={order.status === s || !!updating} className={`text-xs px-3 py-1.5 rounded-full border transition ${order.status === s ? statusColor(s) + ' font-semibold' : 'border-[#241a14]/15 text-[#6d625a] hover:bg-[#f6f1ea]'} disabled:opacity-50`}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredOrders.length === 0 && <div className="text-center py-20 rounded-[2rem] border border-[#241a14]/10 bg-white/55"><p className="text-4xl mb-4">📦</p><p className="text-[#7b6f66]">No orders found!</p></div>}
                </div>
              )}
            </motion.div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6">

              {/* Add Product Form */}
              <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
                <h3 className="text-lg font-semibold mb-6">Add New Product</h3>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div><label className="text-sm text-[#7b6f66] mb-1 block">Name</label><input type="text" placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none transition" required/></div>
                  <div><label className="text-sm text-[#7b6f66] mb-1 block">Description</label><textarea placeholder="Description" value={productForm.description} rows={3} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none transition resize-none" required/></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm text-[#7b6f66] mb-1 block">Price (₹)</label><input type="number" placeholder="999" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none transition" required/></div>
                    <div><label className="text-sm text-[#7b6f66] mb-1 block">Original Price (₹)</label><input type="number" placeholder="1999" value={productForm.originalPrice} onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none transition" required/></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm text-[#7b6f66] mb-1 block">Category</label>
                      <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none transition">
                        {categories.length > 0
                          ? categories.filter(c => c.isActive).map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)
                          : ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books', 'Toys'].map(c => <option key={c} value={c}>{c}</option>)
                        }
                      </select>
                    </div>
                    <div><label className="text-sm text-[#7b6f66] mb-1 block">Stock</label><input type="number" placeholder="100" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none transition" required/></div>
                  </div>
                  <div>
                    <label className="text-sm text-[#7b6f66] mb-2 block">Images</label>
                    {productForm.images.map((img, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input type="text" placeholder={`Image URL ${index + 1}`} value={img} onChange={(e) => { const u = [...productForm.images]; u[index] = e.target.value; setProductForm({ ...productForm, images: u }) }} className="flex-1 rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-2.5 text-sm placeholder-[#9b8f86] focus:outline-none transition"/>
                        {productForm.images.length > 1 && <button type="button" onClick={() => setProductForm({ ...productForm, images: productForm.images.filter((_, i) => i !== index) })} className="text-red-500 px-2">✕</button>}
                      </div>
                    ))}
                    <button type="button" onClick={() => setProductForm({ ...productForm, images: [...productForm.images, ''] })} className="text-sm text-[#7b6f66] hover:text-[#171313] transition">+ Add image</button>
                  </div>
                  <div>
                    <label className="text-sm text-[#7b6f66] mb-2 block">Same Day Delivery Pincodes</label>
                    <div className="flex gap-2 mb-2">
                      <input type="text" placeholder="6-digit pincode" value={pincodeInput} onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPincode(productForm.sameDayPincodes, (p) => setProductForm({ ...productForm, sameDayPincodes: p }), pincodeInput, setPincodeInput) } }} className="flex-1 rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-2.5 text-sm placeholder-[#9b8f86] focus:outline-none transition"/>
                      <button type="button" onClick={() => addPincode(productForm.sameDayPincodes, (p) => setProductForm({ ...productForm, sameDayPincodes: p }), pincodeInput, setPincodeInput)} className="rounded-full bg-[#171313] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3a2a21]">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {productForm.sameDayPincodes.map(pin => (
                        <span key={pin} className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-xs font-mono font-bold px-3 py-1 rounded-full">
                          {pin}<button type="button" onClick={() => setProductForm({ ...productForm, sameDayPincodes: productForm.sameDayPincodes.filter(p => p !== pin) })} className="text-green-500 hover:text-red-500 ml-1">✕</button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-[#f6f1ea] border border-[#241a14]/15 rounded-2xl px-4 py-3">
                    <div><p className="text-sm font-medium">Featured</p><p className="text-xs text-[#9b8f86]">Show on homepage</p></div>
                    <button type="button" onClick={() => setProductForm({ ...productForm, featured: !productForm.featured })} className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${productForm.featured ? 'bg-[#171313]' : 'bg-[#241a14]/20'}`}>
                      <span className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${productForm.featured ? 'left-7 bg-white' : 'left-1 bg-[#9b8f86]'}`}/>
                    </button>
                  </div>
                  {productMessage && <p className={`text-sm text-center ${productMessage.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{productMessage}</p>}
                  <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={submittingProduct} className="w-full rounded-full bg-[#171313] py-3.5 text-sm font-semibold text-white transition hover:bg-[#3a2a21] disabled:opacity-50">
                    {submittingProduct ? 'Adding...' : 'Add Product'}
                  </motion.button>
                </form>
              </div>

              {/* Products List */}
              <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
                <h3 className="text-lg font-semibold mb-4">Products ({products.length})</h3>
                <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                  {products.map(product => (
                    <div key={product.id} className={`flex items-center gap-3 rounded-2xl p-3 border ${product.stock === 0 ? 'bg-red-50 border-red-200' : product.stock <= 5 ? 'bg-amber-50 border-amber-200' : 'bg-[#f6f1ea] border-[#241a14]/10'}`}>
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#eadfd4]">
                        {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover"/> : <div className="grid h-full place-items-center">🛍️</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{product.name}</p>
                        <p className="text-xs text-[#7b6f66]">₹{product.price} · {product.category}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {product.stock === 0 ? <span className="text-xs text-red-600 font-semibold">🚫 Out of Stock</span> : product.stock <= 5 ? <span className="text-xs text-amber-600 font-semibold">⚠️ {product.stock} left</span> : <span className="text-xs text-green-600">✓ {product.stock}</span>}
                          {product.sameDayPincodes?.length > 0 && <span className="text-xs text-blue-600">⚡ Same Day</span>}
                          {product.featured && <span className="text-xs text-amber-600">⭐</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <button onClick={() => toggleFeatured(product)} className={`text-xs px-2 py-1 rounded-full border transition ${product.featured ? 'border-amber-300 text-amber-600' : 'border-[#241a14]/15 text-[#6d625a]'}`}>{product.featured ? '★' : '☆'}</button>
                        <button onClick={() => { setEditProduct(product); setEditForm({ name: product.name, description: product.description, price: product.price, originalPrice: product.originalPrice, images: product.images?.length > 0 ? product.images : [''], category: product.category, stock: product.stock, featured: product.featured || false, sameDayPincodes: product.sameDayPincodes || [] }); setEditPincodeInput('') }} className="text-xs px-2 py-1 rounded-full border border-[#241a14]/15 text-[#6d625a] hover:bg-white transition">✏️</button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="text-xs px-2 py-1 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition">🗑️</button>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && <p className="text-sm text-[#9b8f86] text-center py-8">No products yet</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* CANCELLATIONS TAB */}
          {activeTab === 'cancellations' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: 'Pending', value: cancellations.filter(c => c.status === 'pending').length, color: 'text-amber-700 bg-amber-50 border-amber-200' },
                  { label: 'Approved', value: cancellations.filter(c => c.status === 'approved').length, color: 'text-green-700 bg-green-50 border-green-200' },
                  { label: 'Rejected', value: cancellations.filter(c => c.status === 'rejected').length, color: 'text-red-700 bg-red-50 border-red-200' }
                ].map(s => (
                  <span key={s.label} className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${s.color}`}>{s.label}: {s.value}</span>
                ))}
              </div>

              {cancellations.length === 0 ? (
                <div className="text-center py-20 rounded-[2rem] border border-[#241a14]/10 bg-white/55">
                  <p className="text-4xl mb-4">✅</p>
                  <p className="text-[#7b6f66]">No cancellation requests!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cancellations.map((req, i) => (
                    <motion.div key={req.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                        <div>
                          <p className="font-mono font-bold text-sm">{req.order?.orderId}</p>
                          <p className="text-sm text-[#7b6f66] mt-1">{req.order?.name} · {req.order?.email}</p>
                          <p className="text-xs text-[#9b8f86] mt-1">{new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${req.status === 'approved' ? 'text-green-700 bg-green-50 border-green-200' : req.status === 'rejected' ? 'text-red-700 bg-red-50 border-red-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <div className="rounded-2xl bg-[#f6f1ea] border border-[#241a14]/10 p-3">
                          <p className="text-xs text-[#9b8f86] mb-1">Order Total</p>
                          <p className="font-semibold">₹{req.order?.total}</p>
                        </div>
                        <div className="rounded-2xl bg-[#f6f1ea] border border-[#241a14]/10 p-3">
                          <p className="text-xs text-[#9b8f86] mb-1">Payment Method</p>
                          <p className="font-semibold text-sm">{paymentLabels[req.order?.paymentMethod] || 'N/A'}</p>
                        </div>
                        <div className="rounded-2xl bg-[#f6f1ea] border border-[#241a14]/10 p-3">
                          <p className="text-xs text-[#9b8f86] mb-1">Order Status</p>
                          <p className={`font-semibold text-sm ${req.order?.status === 'cancelled' ? 'text-red-600' : 'text-[#171313]'}`}>{req.order?.status?.charAt(0).toUpperCase() + req.order?.status?.slice(1)}</p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-red-50 border border-red-200 p-4 mb-4">
                        <p className="text-xs text-red-600 font-semibold mb-1">Reason for Cancellation</p>
                        <p className="text-sm text-red-700 font-semibold">{req.reason}</p>
                        {req.details && <p className="text-sm text-red-600 mt-1">{req.details}</p>}
                      </div>

                      {req.status === 'pending' && (
                        <div className="flex gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCancellation(req.id, 'approve')}
                            disabled={updating === req.id + '_approve'}
                            className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                          >
                            {updating === req.id + '_approve' ? '...' : '✅ Approve Cancellation'}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCancellation(req.id, 'reject')}
                            disabled={updating === req.id + '_reject'}
                            className="flex-1 rounded-full border border-[#241a14]/15 py-2.5 text-sm font-semibold text-[#6d625a] transition hover:bg-[#f6f1ea] disabled:opacity-50"
                          >
                            {updating === req.id + '_reject' ? '...' : '❌ Reject Request'}
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TICKETS TAB */}
          {activeTab === 'tickets' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex gap-2">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full border text-amber-700 bg-amber-50 border-amber-200">Open: {openTickets.length}</span>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full border text-green-700 bg-green-50 border-green-200">Resolved: {tickets.filter(t => t.status === 'resolved').length}</span>
              </div>
              {tickets.length === 0 ? (
                <div className="text-center py-20 rounded-[2rem] border border-[#241a14]/10 bg-white/55"><p className="text-4xl mb-4">🎧</p><p className="text-[#7b6f66]">No tickets yet!</p></div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket, i) => {
                    const messages = Array.isArray(ticket.messages) ? ticket.messages : []
                    const isExpanded = expandedTicket === ticket.id
                    return (
                      <motion.div key={ticket.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 overflow-hidden">
                        <button onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)} className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-[#f9f6f2] transition">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{ticket.subject}</p>
                            <p className="text-sm text-[#7b6f66] mt-0.5">{ticket.name} · {ticket.email}</p>
                            <p className="text-xs text-[#9b8f86] mt-0.5">{messages.length} messages</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${ticket.status === 'resolved' ? 'text-green-700 bg-green-50 border-green-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>{ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}</span>
                            <span className="text-[#9b8f86] text-sm">{isExpanded ? '▲' : '▼'}</span>
                          </div>
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-[#241a14]/10">
                              <div className="p-5 space-y-3 max-h-80 overflow-y-auto bg-[#f6f1ea]">
                                {messages.map((msg, j) => (
                                  <div key={j} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.sender === 'admin' ? 'bg-[#171313] text-white rounded-br-sm' : 'bg-white border border-[#241a14]/10 text-[#171313] rounded-bl-sm'}`}>
                                      <p className={`text-xs font-semibold mb-1 ${msg.sender === 'admin' ? 'text-white/60' : 'text-[#8c6048]'}`}>{msg.sender === 'admin' ? 'Support Team' : ticket.name}</p>
                                      <p className="text-sm leading-relaxed">{msg.text}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="p-4 border-t border-[#241a14]/10 bg-white">
                                <button onClick={() => fetchUserOrders(ticket.email)} className="text-xs text-[#7b6f66] hover:text-[#171313] border border-[#241a14]/15 px-3 py-1.5 rounded-full transition mb-3">
                                  {expandedUser === ticket.email ? '▲ Hide Orders' : '▼ View Order History'}
                                </button>
                                {expandedUser === ticket.email && userOrders[ticket.email] && (
                                  <div className="mb-3 space-y-2 max-h-40 overflow-y-auto">
                                    {userOrders[ticket.email].map(order => (
                                      <div key={order.id} className="flex items-center justify-between bg-[#f6f1ea] rounded-xl p-2">
                                        <div><p className="text-xs font-mono">{order.orderId}</p><p className="text-xs text-[#9b8f86]">{order.items?.length} items</p></div>
                                        <div className="text-right"><p className="text-xs font-semibold">₹{order.total}</p><span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColor(order.status)}`}>{order.status}</span></div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <textarea
                                    placeholder="Type reply..."
                                    value={replyForm[ticket.id] || ''}
                                    onChange={(e) => setReplyForm(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                                    rows={2}
                                    className="flex-1 rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-2.5 text-sm placeholder-[#9b8f86] focus:outline-none transition resize-none"
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTicketReply(ticket.id) } }}
                                  />
                                  <div className="flex flex-col gap-2">
                                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleTicketReply(ticket.id)} disabled={sendingReply === ticket.id || !replyForm[ticket.id]?.trim()} className="rounded-full bg-[#171313] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
                                      {sendingReply === ticket.id ? '...' : 'Send'}
                                    </motion.button>
                                    <button onClick={() => handleTicketResolve(ticket.id, ticket.status === 'resolved' ? 'open' : 'resolved')} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${ticket.status === 'resolved' ? 'border border-amber-200 bg-amber-50 text-amber-700' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                                      {ticket.status === 'resolved' ? 'Reopen' : 'Resolve'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* COUPONS TAB */}
          {activeTab === 'coupons' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => { setShowCouponForm(!showCouponForm); setEditCoupon(null); setCouponForm({ code: '', description: '', type: 'percentage', value: '', maxDiscount: '', minCartValue: '', usageType: 'one_per_user', totalLimit: '', expiryDate: '', isActive: true, isNewUserOnly: false, categoryRestriction: '' }) }} className="rounded-full bg-[#171313] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3a2a21]">
                  {showCouponForm ? '✕ Cancel' : '+ Create Coupon'}
                </button>
              </div>

              <AnimatePresence>
                {showCouponForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
                      <h3 className="text-lg font-semibold mb-6">{editCoupon ? 'Edit Coupon' : 'Create Coupon'}</h3>
                      <form onSubmit={handleCouponSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><label className="text-sm text-[#7b6f66] mb-1 block">Code *</label><input type="text" placeholder="SAVE10" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} disabled={!!editCoupon} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm uppercase font-mono font-bold placeholder-[#9b8f86] focus:outline-none transition disabled:opacity-50" required/></div>
                          <div><label className="text-sm text-[#7b6f66] mb-1 block">Description</label><input type="text" placeholder="10% off for new users" value={couponForm.description} onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none transition"/></div>
                          <div><label className="text-sm text-[#7b6f66] mb-1 block">Type *</label>
                            <select value={couponForm.type} onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none transition">
                              <option value="percentage">Percentage (%)</option>
                              <option value="flat">Flat (₹)</option>
                            </select>
                          </div>
                          <div><label className="text-sm text-[#7b6f66] mb-1 block">Value *</label><input type="number" placeholder={couponForm.type === 'percentage' ? '10' : '50'} value={couponForm.value} onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none transition" required/></div>
                          {couponForm.type === 'percentage' && <div><label className="text-sm text-[#7b6f66] mb-1 block">Max Discount (₹)</label><input type="number" placeholder="150" value={couponForm.maxDiscount} onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none transition"/></div>}
                          <div><label className="text-sm text-[#7b6f66] mb-1 block">Min Cart Value (₹)</label><input type="number" placeholder="799" value={couponForm.minCartValue} onChange={(e) => setCouponForm({ ...couponForm, minCartValue: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none transition"/></div>
                          <div><label className="text-sm text-[#7b6f66] mb-1 block">Usage Type *</label>
                            <select value={couponForm.usageType} onChange={(e) => setCouponForm({ ...couponForm, usageType: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none transition">
                              <option value="one_per_user">One per user</option>
                              <option value="one_per_order">One per order</option>
                              <option value="total_limit">Total limit</option>
                              <option value="unlimited">Unlimited</option>
                            </select>
                          </div>
                          {couponForm.usageType === 'total_limit' && <div><label className="text-sm text-[#7b6f66] mb-1 block">Total Limit</label><input type="number" placeholder="500" value={couponForm.totalLimit} onChange={(e) => setCouponForm({ ...couponForm, totalLimit: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none transition"/></div>}
                          <div><label className="text-sm text-[#7b6f66] mb-1 block">Expiry Date</label><input type="date" value={couponForm.expiryDate} onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none transition"/></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center justify-between bg-[#f6f1ea] border border-[#241a14]/15 rounded-2xl px-4 py-3">
                            <div><p className="text-sm font-medium">Active</p></div>
                            <button type="button" onClick={() => setCouponForm({ ...couponForm, isActive: !couponForm.isActive })} className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${couponForm.isActive ? 'bg-[#171313]' : 'bg-[#241a14]/20'}`}><span className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${couponForm.isActive ? 'left-7 bg-white' : 'left-1 bg-[#9b8f86]'}`}/></button>
                          </div>
                          <div className="flex items-center justify-between bg-[#f6f1ea] border border-[#241a14]/15 rounded-2xl px-4 py-3">
                            <div><p className="text-sm font-medium">New Users Only</p></div>
                            <button type="button" onClick={() => setCouponForm({ ...couponForm, isNewUserOnly: !couponForm.isNewUserOnly })} className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${couponForm.isNewUserOnly ? 'bg-[#171313]' : 'bg-[#241a14]/20'}`}><span className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${couponForm.isNewUserOnly ? 'left-7 bg-white' : 'left-1 bg-[#9b8f86]'}`}/></button>
                          </div>
                        </div>
                        {couponMessage && <p className={`text-sm text-center ${couponMessage.includes('!') ? 'text-green-600' : 'text-red-500'}`}>{couponMessage}</p>}
                        <div className="flex gap-3">
                          <button type="button" onClick={() => setShowCouponForm(false)} className="flex-1 rounded-full border border-[#241a14]/15 py-3 text-sm font-semibold text-[#6d625a] transition hover:bg-[#f6f1ea]">Cancel</button>
                          <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={submittingCoupon} className="flex-1 rounded-full bg-[#171313] py-3 text-sm font-semibold text-white transition hover:bg-[#3a2a21] disabled:opacity-50">{submittingCoupon ? 'Saving...' : editCoupon ? 'Update' : 'Create'}</motion.button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {coupons.length === 0 && !showCouponForm ? (
                <div className="text-center py-20 rounded-[2rem] border border-[#241a14]/10 bg-white/55"><p className="text-4xl mb-4">🎟️</p><p className="text-[#7b6f66]">No coupons yet!</p></div>
              ) : (
                <div className="space-y-4">
                  {coupons.map(coupon => (
                    <div key={coupon.id} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-4">
                          <div className="bg-[#f6f1ea] border border-[#241a14]/10 rounded-2xl px-4 py-3 text-center flex-shrink-0">
                            <p className="font-mono font-bold text-lg">{coupon.code}</p>
                            <p className="text-xs text-[#8c6048] font-semibold mt-0.5">{coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}</p>
                          </div>
                          <div>
                            <p className="font-semibold">{coupon.description || coupon.code}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {coupon.maxDiscount > 0 && <span className="text-xs bg-[#f6f1ea] border border-[#241a14]/10 px-2 py-0.5 rounded-full text-[#6f6258]">Max ₹{coupon.maxDiscount}</span>}
                              {coupon.minCartValue > 0 && <span className="text-xs bg-[#f6f1ea] border border-[#241a14]/10 px-2 py-0.5 rounded-full text-[#6f6258]">Min ₹{coupon.minCartValue}</span>}
                              {coupon.isNewUserOnly && <span className="text-xs bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full text-blue-700">New users only</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right"><p className="text-xs text-[#9b8f86]">Used</p><p className="font-semibold">{coupon.totalUsed}{coupon.totalLimit > 0 ? `/${coupon.totalLimit}` : ''}</p></div>
                          <button onClick={() => { setEditCoupon(coupon); setCouponForm({ code: coupon.code, description: coupon.description, type: coupon.type, value: coupon.value, maxDiscount: coupon.maxDiscount, minCartValue: coupon.minCartValue, usageType: coupon.usageType, totalLimit: coupon.totalLimit, expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '', isActive: coupon.isActive, isNewUserOnly: coupon.isNewUserOnly, categoryRestriction: coupon.categoryRestriction }); setShowCouponForm(true) }} className="text-xs px-3 py-1.5 rounded-full border border-[#241a14]/15 text-[#6d625a] hover:bg-[#f6f1ea] transition">Edit</button>
                          <button onClick={() => handleDeleteCoupon(coupon.id)} className="text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-6">

              {/* Add Category Form */}
              <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
                <h3 className="text-lg font-semibold mb-6">Add New Category</h3>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-[#7b6f66] mb-1 block">Category Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Gaming, Furniture..."
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition"
                        required
                      />
                    </div>
                    <div>
  <label className="text-sm text-[#7b6f66] mb-1 block">Emoji Icon</label>
  <input
    type="text"
    placeholder="🛍️"
    value={categoryForm.icon}
    onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
    className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition"
  />
</div>
<div className="md:col-span-2">
  <label className="text-sm text-[#7b6f66] mb-1 block">Category Image URL <span className="text-[#9b8f86] text-xs">(from Cloudinary)</span></label>
  <input
    type="text"
    placeholder="https://res.cloudinary.com/your-cloud/image/upload/..."
    value={categoryForm.image}
    onChange={(e) => setCategoryForm(prev => ({ ...prev, image: e.target.value }))}
    className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition"
  />
  {categoryForm.image && (
    <img src={categoryForm.image} alt="preview" className="mt-2 h-20 w-20 rounded-2xl object-cover border border-[#241a14]/10"/>
  )}
</div>
                  </div>
                  {categoryForm.name && (
                    <div className="flex items-center gap-3 bg-[#f6f1ea] rounded-2xl p-4">
                      <span className="text-3xl">{categoryForm.icon || '🛍️'}</span>
                      <div>
                        <p className="text-xs text-[#9b8f86]">Preview</p>
                        <p className="font-semibold">{categoryForm.name}</p>
                      </div>
                    </div>
                  )}
                  {categoryMessage && (
                    <p className={`text-sm ${categoryMessage.includes('!') && !categoryMessage.includes('Cannot') && !categoryMessage.includes('already') ? 'text-green-600' : 'text-red-500'}`}>
                      {categoryMessage}
                    </p>
                  )}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={submittingCategory || !categoryForm.name.trim()}
                    className="w-full rounded-full bg-[#171313] py-3.5 text-sm font-semibold text-white transition hover:bg-[#3a2a21] disabled:opacity-50"
                  >
                    {submittingCategory ? 'Adding...' : '+ Add Category'}
                  </motion.button>
                </form>
              </div>

              {/* Categories List */}
              <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
                <h3 className="text-lg font-semibold mb-2">All Categories ({categories.length})</h3>
                <p className="text-xs text-[#9b8f86] mb-6">Toggle to enable/disable. Disabled categories won't show in the store filters.</p>

                {categories.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-4xl mb-3">🗂️</p>
                    <p className="text-sm text-[#7b6f66]">No categories yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categories.map(category => (
                      <div key={category.id} className={`rounded-2xl border-2 p-4 transition ${category.isActive ? 'border-[#241a14]/10 bg-[#f6f1ea]' : 'border-[#241a14]/5 bg-[#f6f1ea]/50 opacity-60'}`}>
                        {editCategory?.id === category.id ? (
                          <div className="flex items-center gap-3 flex-wrap">
                            <input
                              type="text"
                              value={editCategory.icon}
                              onChange={(e) => setEditCategory(prev => ({ ...prev, icon: e.target.value }))}
                              className="w-16 rounded-xl border border-[#241a14]/15 bg-white px-3 py-2 text-sm text-center focus:outline-none"
                              placeholder="Icon"
                            />
                            <input
  type="text"
  value={editCategory.name}
  onChange={(e) => setEditCategory(prev => ({ ...prev, name: e.target.value }))}
  className="flex-1 rounded-xl border border-[#241a14]/15 bg-white px-3 py-2 text-sm focus:outline-none"
  placeholder="Category name"
/>
<input
  type="text"
  value={editCategory.image || ''}
  onChange={(e) => setEditCategory(prev => ({ ...prev, image: e.target.value }))}
  className="flex-1 rounded-xl border border-[#241a14]/15 bg-white px-3 py-2 text-sm focus:outline-none"
  placeholder="Image URL (Cloudinary)"
/>
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleUpdateCategory(category)}
                                className="rounded-full bg-[#171313] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#3a2a21]"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditCategory(null)}
                                className="rounded-full border border-[#241a14]/15 px-4 py-2 text-xs font-semibold text-[#6d625a] transition hover:bg-white"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-2xl flex-shrink-0">{category.icon}</span>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm">{category.name}</p>
                                <p className="text-xs text-[#9b8f86] mt-0.5">
                                  {category.isActive ? '✓ Active in store' : '✕ Hidden from store'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <button
                                onClick={() => handleToggleCategory(category)}
                                className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${category.isActive ? 'bg-[#171313]' : 'bg-[#241a14]/20'}`}
                              >
                                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${category.isActive ? 'left-6' : 'left-1'}`}/>
                              </button>
                              <button
                                onClick={() => setEditCategory({ id: category.id, name: category.name, icon: category.icon, image: category.image || '' })}
                                className="text-xs px-3 py-1.5 rounded-full border border-[#241a14]/15 text-[#6d625a] hover:bg-white transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.id)}
                                className="text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
                <p className="text-sm text-blue-700 font-semibold mb-1">ℹ️ How categories work</p>
                <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
                  <li>Add categories here and they appear in product filters and store navigation</li>
                  <li>Toggle off to hide a category from shoppers without deleting it</li>
                  <li>You can't delete a category that has products assigned to it</li>
                  <li>Icons support any emoji character</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* ADMINS TAB */}
          {activeTab === 'admins' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => { setShowAdminForm(!showAdminForm); setEditAdmin(null); setAdminForm({ name: '', email: '', password: '', permissions: [], isActive: true }) }} className="rounded-full bg-[#171313] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3a2a21]">
                  {showAdminForm ? '✕ Cancel' : '+ Add Admin'}
                </button>
              </div>

              <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
                <p className="text-sm text-blue-700 font-semibold mb-1">ℹ️ Sub-admin Login</p>
                <p className="text-xs text-blue-600">Sub-admins login at <span className="font-mono font-bold">/admin/sub-login</span></p>
              </div>

              <AnimatePresence>
                {showAdminForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
                      <h3 className="text-lg font-semibold mb-6">{editAdmin ? 'Edit Admin' : 'Create Admin'}</h3>
                      <form onSubmit={handleAdminSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><label className="text-sm text-[#7b6f66] mb-1 block">Full Name *</label><input type="text" placeholder="Rahul Sharma" value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none transition" required/></div>
                          <div><label className="text-sm text-[#7b6f66] mb-1 block">Email *</label><input type="email" placeholder="admin@example.com" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} disabled={!!editAdmin} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none transition disabled:opacity-50" required={!editAdmin}/></div>
                          <div className="md:col-span-2"><label className="text-sm text-[#7b6f66] mb-1 block">{editAdmin ? 'New Password (leave blank to keep)' : 'Password *'}</label><input type="password" placeholder="••••••••" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none transition" required={!editAdmin}/></div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-sm text-[#7b6f66] font-medium">Permissions ({adminForm.permissions.length}/{ALL_PERMISSIONS.length})</label>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => setAdminForm({ ...adminForm, permissions: ALL_PERMISSIONS.map(p => p.id) })} className="text-xs text-[#7b6f66] hover:text-[#171313] border border-[#241a14]/15 px-3 py-1 rounded-full transition">All</button>
                              <button type="button" onClick={() => setAdminForm({ ...adminForm, permissions: [] })} className="text-xs text-[#7b6f66] hover:text-[#171313] border border-[#241a14]/15 px-3 py-1 rounded-full transition">None</button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {ALL_PERMISSIONS.map(perm => (
                              <button key={perm.id} type="button" onClick={() => setAdminForm({ ...adminForm, permissions: adminForm.permissions.includes(perm.id) ? adminForm.permissions.filter(p => p !== perm.id) : [...adminForm.permissions, perm.id] })} className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition text-sm ${adminForm.permissions.includes(perm.id) ? 'border-[#171313] bg-[#171313] text-white' : 'border-[#241a14]/15 bg-[#f6f1ea] hover:bg-white'}`}>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${adminForm.permissions.includes(perm.id) ? 'border-white bg-white' : 'border-[#9b8f86]'}`}>
                                  {adminForm.permissions.includes(perm.id) && <div className="w-2 h-2 rounded-full bg-[#171313]"/>}
                                </div>
                                {perm.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        {adminMessage && <p className={`text-sm text-center ${adminMessage.includes('!') ? 'text-green-600' : 'text-red-500'}`}>{adminMessage}</p>}
                        <div className="flex gap-3">
                          <button type="button" onClick={() => setShowAdminForm(false)} className="flex-1 rounded-full border border-[#241a14]/15 py-3 text-sm font-semibold text-[#6d625a] transition hover:bg-[#f6f1ea]">Cancel</button>
                          <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={submittingAdmin} className="flex-1 rounded-full bg-[#171313] py-3 text-sm font-semibold text-white transition hover:bg-[#3a2a21] disabled:opacity-50">{submittingAdmin ? 'Saving...' : editAdmin ? 'Update' : 'Create'}</motion.button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {admins.length === 0 && !showAdminForm ? (
                <div className="text-center py-20 rounded-[2rem] border border-[#241a14]/10 bg-white/55"><p className="text-4xl mb-4">👥</p><p className="text-[#7b6f66]">No admins yet!</p></div>
              ) : (
                <div className="space-y-4">
                  {admins.map(admin => (
                    <div key={admin.id} className={`rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-5 ${!admin.isActive ? 'opacity-60' : ''}`}>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#171313] text-white flex items-center justify-center text-lg font-semibold flex-shrink-0">{admin.name?.charAt(0).toUpperCase()}</div>
                          <div>
                            <p className="font-semibold">{admin.name}</p>
                            <p className="text-sm text-[#7b6f66]">{admin.email}</p>
                            <p className="text-xs text-[#9b8f86] mt-0.5">{Array.isArray(admin.permissions) ? admin.permissions.length : 0} permissions</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${admin.isActive ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'}`}>{admin.isActive ? '✓ Active' : '✕ Inactive'}</span>
                          <button onClick={() => { setEditAdmin(admin); setAdminForm({ name: admin.name, email: admin.email, password: '', permissions: Array.isArray(admin.permissions) ? admin.permissions : [], isActive: admin.isActive }); setShowAdminForm(true) }} className="text-xs px-3 py-1.5 rounded-full border border-[#241a14]/15 text-[#6d625a] hover:bg-[#f6f1ea] transition">Edit</button>
                          <button onClick={() => handleDeleteAdmin(admin.id)} className="text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-6">
              <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
                <h3 className="text-lg font-semibold mb-2">💳 Payment Methods</h3>
                <p className="text-sm text-[#7b6f66] mb-6">Enable or disable payment options for customers</p>
                <div className="space-y-3">
                  {[
                    { id: 'cod', icon: '💵', label: 'Cash on Delivery', desc: 'Customer pays on arrival' },
                    { id: 'upi', icon: '📱', label: 'UPI Payment', desc: 'Customer pays via UPI' },
                    { id: 'bank', icon: '🏦', label: 'Bank Transfer', desc: 'Customer transfers to bank' },
                    { id: 'card', icon: '💳', label: 'Razor Pay', desc: 'Credit or debit card' }
                  ].map(option => (
                    <div key={option.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition ${settings.paymentMethods[option.id] ? 'border-[#171313] bg-[#f6f1ea]' : 'border-[#241a14]/10 bg-[#f6f1ea]/50'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{option.icon}</span>
                        <div><p className="font-semibold text-sm">{option.label}</p><p className="text-xs text-[#9b8f86] mt-0.5">{option.desc}</p></div>
                      </div>
                      <button onClick={() => setSettings(prev => ({ ...prev, paymentMethods: { ...prev.paymentMethods, [option.id]: !prev.paymentMethods[option.id] } }))} className={`w-12 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 ${settings.paymentMethods[option.id] ? 'bg-[#171313]' : 'bg-[#241a14]/20'}`}>
                        <span className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${settings.paymentMethods[option.id] ? 'left-7 bg-white' : 'left-1 bg-[#9b8f86]'}`}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {settings.paymentMethods.upi && (
                <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
                  <h3 className="text-lg font-semibold mb-4">📱 UPI Details</h3>
                  <div><label className="text-sm text-[#7b6f66] mb-1 block">Your UPI ID</label><input type="text" placeholder="yourname@paytm" value={settings.upiId} onChange={(e) => setSettings(prev => ({ ...prev, upiId: e.target.value }))} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none transition"/></div>
                </div>
              )}

              {settings.paymentMethods.bank && (
                <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
                  <h3 className="text-lg font-semibold mb-4">🏦 Bank Details</h3>
                  <div><label className="text-sm text-[#7b6f66] mb-1 block">Bank Details</label><textarea placeholder={`Bank: HDFC Bank\nAccount Name: Your Name\nAccount Number: XXXXXXXXXXXX\nIFSC: HDFC0001234`} value={settings.bankDetails} onChange={(e) => setSettings(prev => ({ ...prev, bankDetails: e.target.value }))} rows={5} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none transition resize-none font-mono"/></div>
                </div>
              )}

              {settingsMessage && (
                <div className={`rounded-2xl p-4 text-center text-sm font-medium ${settingsMessage.includes('!') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                  {settingsMessage}
                </div>
              )}

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveSettings} disabled={savingSettings} className="w-full rounded-full bg-[#171313] py-4 font-semibold text-sm text-white transition hover:bg-[#3a2a21] disabled:opacity-50">
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </motion.button>
            </motion.div>
          )}

          {/* STATS TAB */}
          {activeTab === 'stats' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Orders', value: orders.length, icon: '📦', color: 'text-[#171313]' },
                  { label: 'Revenue', value: `₹${orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0).toLocaleString()}`, icon: '💰', color: 'text-green-600' },
                  { label: 'Products', value: products.length, icon: '🛍️', color: 'text-blue-600' },
                  { label: 'Open Tickets', value: tickets.filter(t => t.status === 'open').length, icon: '🎧', color: 'text-amber-600' }
                ].map((stat, i) => (
                  <div key={i} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-5">
                    <p className="text-3xl mb-3">{stat.icon}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-[#9b8f86] mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: 'text-amber-600 bg-amber-50 border-amber-200' },
                  { label: 'Confirmed', value: orders.filter(o => o.status === 'confirmed').length, color: 'text-blue-600 bg-blue-50 border-blue-200' },
                  { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: 'text-green-600 bg-green-50 border-green-200' },
                  { label: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, color: 'text-red-600 bg-red-50 border-red-200' }
                ].map((stat, i) => (
                  <div key={i} className={`rounded-[1.4rem] border p-5 ${stat.color}`}>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs mt-1 opacity-80">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Low Stock */}
              <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
                <h3 className="text-lg font-semibold mb-4">⚠️ Low Stock Products</h3>
                {products.filter(p => p.stock <= 5).length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-3xl mb-2">✅</p>
                    <p className="text-sm text-[#7b6f66]">All products are well stocked!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock).map(product => (
                      <div key={product.id} className={`flex items-center justify-between p-3 rounded-2xl border ${product.stock === 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                        <div className="flex items-center gap-3">
                          {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0"/>}
                          <div>
                            <p className={`text-sm font-semibold ${product.stock === 0 ? 'text-red-700' : 'text-amber-700'}`}>{product.name}</p>
                            <p className="text-xs text-[#9b8f86]">{product.category}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {product.stock === 0 ? '🚫 Out of Stock' : `⚠️ ${product.stock} left`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Orders */}
              <div className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent Orders</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-[#7b6f66] hover:text-[#171313] border border-[#241a14]/15 px-3 py-1.5 rounded-full transition">View All →</button>
                </div>
                <div className="space-y-3">
                  {orders.slice(0, 8).map(order => (
                    <div key={order.id} className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-[#f6f1ea]">
                      <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
                        <div>
                          <p className="text-xs text-[#9b8f86]">Order ID</p>
                          <p className="text-sm font-mono font-bold">{order.orderId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#9b8f86]">Customer</p>
                          <p className="text-sm">{order.name}</p>
                        </div>
                        {order.isSameDay && (
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">⚡ Same Day</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-semibold">₹{order.total}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColor(order.status)}`}>
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-sm text-[#9b8f86] text-center py-4">No orders yet</p>}
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </main>

      {/* Screenshot Modal */}
      <AnimatePresence>
        {viewScreenshot && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setViewScreenshot(null) }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[1.4rem] w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="bg-[#171313] p-5 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">Payment Screenshot</p>
                  <p className="text-white/60 text-xs mt-0.5">{viewScreenshot.orderId} — {viewScreenshot.name}</p>
                </div>
                <button onClick={() => setViewScreenshot(null)} className="text-white/60 hover:text-white text-xl transition">✕</button>
              </div>
              <div className="p-5">
                <div className="rounded-2xl overflow-hidden border-2 border-[#241a14]/10 mb-5">
                  <img src={viewScreenshot.paymentScreenshot} alt="Payment Screenshot" className="w-full object-contain max-h-96 bg-[#f6f1ea]"/>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {viewScreenshot.paymentSenderName && (
                    <div className="rounded-2xl bg-[#f6f1ea] border border-[#241a14]/10 p-4">
                      <p className="text-xs text-[#9b8f86] mb-1 font-medium uppercase tracking-wider">Sender Name</p>
                      <p className="text-sm font-bold text-[#171313]">{viewScreenshot.paymentSenderName}</p>
                    </div>
                  )}
                  {viewScreenshot.paymentUTR && (
                    <div className="rounded-2xl bg-[#f6f1ea] border border-[#241a14]/10 p-4">
                      <p className="text-xs text-[#9b8f86] mb-1 font-medium uppercase tracking-wider">UTR / Transaction</p>
                      <p className="text-sm font-bold font-mono text-[#171313]">{viewScreenshot.paymentUTR}</p>
                    </div>
                  )}
                </div>
                <div className="rounded-2xl bg-[#f6f1ea] border border-[#241a14]/10 p-4 mb-5">
                  <p className="text-xs text-[#9b8f86] mb-1 font-medium uppercase tracking-wider">Order ID</p>
                  <p className="text-sm font-bold font-mono text-[#171313]">{viewScreenshot.orderId}</p>
                  <p className="text-xs text-[#9b8f86] mt-2">Amount: <span className="font-bold text-[#171313]">₹{viewScreenshot.total}</span></p>
                  <p className="text-xs text-[#9b8f86] mt-1">Payment: <span className="font-bold text-[#171313]">{paymentLabels[viewScreenshot.paymentMethod] || viewScreenshot.paymentMethod}</span></p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setViewScreenshot(null)} className="flex-1 rounded-full border-2 border-[#241a14]/15 py-3 text-sm font-semibold text-[#171313] transition hover:bg-[#f6f1ea]">Close</button>
                  {!viewScreenshot.paymentVerified && (
                    <button onClick={() => { handleVerifyPayment(viewScreenshot.id); setViewScreenshot(null) }} className="flex-1 rounded-full bg-green-600 py-3 text-sm font-semibold text-white transition hover:bg-green-700">✅ Verify & Confirm</button>
                  )}
                  {viewScreenshot.paymentVerified && (
                    <div className="flex-1 rounded-full bg-green-50 border-2 border-green-200 py-3 text-sm font-semibold text-green-700 text-center">✓ Already Verified</div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bill Modal */}
      <AnimatePresence>
        {viewBill && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setViewBill(null) }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[1.4rem] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="bg-[#171313] rounded-t-[1.4rem] p-6 text-center">
                <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Tax Invoice</p>
                <h2 className="text-white text-2xl font-bold">{config.brandName}</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[{ label: 'Order ID', value: viewBill.orderId }, { label: 'Date', value: new Date(viewBill.createdAt).toLocaleDateString('en-IN') }, { label: 'Payment', value: paymentLabels[viewBill.paymentMethod] || 'N/A' }, { label: 'Status', value: viewBill.status?.charAt(0).toUpperCase() + viewBill.status?.slice(1) }].map((item, i) => (
                    <div key={i} className="rounded-2xl bg-[#f6f1ea] border border-[#241a14]/10 px-4 py-3"><p className="text-xs text-[#9b8f86] mb-1">{item.label}</p><p className="text-sm font-semibold">{item.value}</p></div>
                  ))}
                </div>
                <div className="rounded-2xl bg-[#f6f1ea] border border-[#241a14]/10 p-4">
                  <p className="text-xs text-[#9b8f86] mb-2 font-semibold uppercase tracking-wider">Billed To</p>
                  <p className="font-semibold">{viewBill.name}</p>
                  <p className="text-sm text-[#7b6f66]">{viewBill.email}</p>
                  <p className="text-sm text-[#7b6f66]">📱 {viewBill.phone}</p>
                  {viewBill.whatsapp && <p className="text-sm text-[#7b6f66]">💬 {viewBill.whatsapp}</p>}
                  <p className="text-sm text-[#7b6f66]">📍 {viewBill.address}, {viewBill.pincode}</p>
                </div>
                <div className="space-y-2">
                  {(viewBill.items || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[#f6f1ea] rounded-2xl p-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#eadfd4]">{item.images?.[0] ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover"/> : <div className="grid h-full place-items-center">🛍️</div>}</div>
                      <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{item.name}</p><p className="text-xs text-[#9b8f86]">Qty: {item.quantity} × ₹{item.price}</p></div>
                      <p className="text-sm font-bold flex-shrink-0">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl bg-[#f6f1ea] border border-[#241a14]/10 p-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-[#7b6f66]">Subtotal</span><span>₹{viewBill.total + (viewBill.discount || 0)}</span></div>
                  {viewBill.discount > 0 && <div className="flex justify-between text-sm"><span className="text-green-600">Coupon ({viewBill.couponCode})</span><span className="text-green-600">−₹{viewBill.discount}</span></div>}
                  <div className="flex justify-between text-sm"><span className="text-[#7b6f66]">Delivery</span><span className="text-green-600">FREE</span></div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-[#241a14]/10"><span>Grand Total</span><span>₹{viewBill.total}</span></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setViewBill(null)} className="flex-1 rounded-full border border-[#241a14]/15 py-3 text-sm font-semibold text-[#6d625a] transition hover:bg-[#f6f1ea]">Close</button>
                  <button onClick={() => printBill(viewBill)} className="flex-1 rounded-full bg-[#171313] py-3 text-sm font-semibold text-white transition hover:bg-[#3a2a21]">🖨️ Print</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editProduct && editForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { setEditProduct(null); setEditForm(null) } }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[1.4rem] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Edit Product</h3>
                <button onClick={() => { setEditProduct(null); setEditForm(null) }} className="text-[#9b8f86] hover:text-[#171313] text-xl">✕</button>
              </div>
              <div className="space-y-4">
                <div><label className="text-sm text-[#7b6f66] mb-1 block">Name</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none transition"/></div>
                <div><label className="text-sm text-[#7b6f66] mb-1 block">Description</label><textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none transition resize-none"/></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm text-[#7b6f66] mb-1 block">Price (₹)</label><input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none transition"/></div>
                  <div><label className="text-sm text-[#7b6f66] mb-1 block">Original Price (₹)</label><input type="number" value={editForm.originalPrice} onChange={(e) => setEditForm({ ...editForm, originalPrice: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none transition"/></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm text-[#7b6f66] mb-1 block">Category</label>
                    <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none transition">
                      {categories.length > 0
                        ? categories.filter(c => c.isActive).map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)
                        : ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books', 'Toys'].map(c => <option key={c} value={c}>{c}</option>)
                      }
                    </select>
                  </div>
                  <div><label className="text-sm text-[#7b6f66] mb-1 block">Stock</label><input type="number" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm focus:outline-none transition"/></div>
                </div>
                <div>
                  <label className="text-sm text-[#7b6f66] mb-2 block">Images</label>
                  {editForm.images.map((img, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input type="text" placeholder={`Image URL ${index + 1}`} value={img} onChange={(e) => { const u = [...editForm.images]; u[index] = e.target.value; setEditForm({ ...editForm, images: u }) }} className="flex-1 rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-2.5 text-sm placeholder-[#9b8f86] focus:outline-none transition"/>
                      {editForm.images.length > 1 && <button type="button" onClick={() => setEditForm({ ...editForm, images: editForm.images.filter((_, i) => i !== index) })} className="text-red-500 px-2">✕</button>}
                    </div>
                  ))}
                  <button type="button" onClick={() => setEditForm({ ...editForm, images: [...editForm.images, ''] })} className="text-sm text-[#7b6f66] hover:text-[#171313] transition">+ Add image</button>
                </div>
                <div>
                  <label className="text-sm text-[#7b6f66] mb-2 block">Same Day Pincodes</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" placeholder="6-digit pincode" value={editPincodeInput} onChange={(e) => setEditPincodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPincode(editForm.sameDayPincodes, (p) => setEditForm({ ...editForm, sameDayPincodes: p }), editPincodeInput, setEditPincodeInput) } }} className="flex-1 rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-2.5 text-sm placeholder-[#9b8f86] focus:outline-none transition"/>
                    <button type="button" onClick={() => addPincode(editForm.sameDayPincodes, (p) => setEditForm({ ...editForm, sameDayPincodes: p }), editPincodeInput, setEditPincodeInput)} className="rounded-full bg-[#171313] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3a2a21]">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editForm.sameDayPincodes.map(pin => (
                      <span key={pin} className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-xs font-mono font-bold px-3 py-1 rounded-full">
                        {pin}<button type="button" onClick={() => setEditForm({ ...editForm, sameDayPincodes: editForm.sameDayPincodes.filter(p => p !== pin) })} className="text-green-500 hover:text-red-500 ml-1">✕</button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between bg-[#f6f1ea] border border-[#241a14]/15 rounded-2xl px-4 py-3">
                  <div><p className="text-sm font-medium">Featured</p></div>
                  <button type="button" onClick={() => setEditForm({ ...editForm, featured: !editForm.featured })} className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${editForm.featured ? 'bg-[#171313]' : 'bg-[#241a14]/20'}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${editForm.featured ? 'left-7 bg-white' : 'left-1 bg-[#9b8f86]'}`}/>
                  </button>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setEditProduct(null); setEditForm(null) }} className="flex-1 rounded-full border border-[#241a14]/15 py-3 text-sm font-semibold text-[#6d625a] transition hover:bg-[#f6f1ea]">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleUpdateProduct} disabled={updating === 'product'} className="flex-1 rounded-full bg-[#171313] py-3 text-sm font-semibold text-white transition hover:bg-[#3a2a21] disabled:opacity-50">
                    {updating === 'product' ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}