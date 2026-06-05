'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import config from '@/lib/config'

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    paymentMethods: { cod: true, upi: false, bank: false, card: false },
    upiId: '',
    bankDetails: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setSettings({
            paymentMethods: data.settings.paymentMethods || { cod: true, upi: false, bank: false, card: false },
            upiId: data.settings.upiId || '',
            bankDetails: data.settings.bankDetails || ''
          })
        }
        setLoading(false)
      })
  }, [])

  const togglePayment = (method) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: !prev.paymentMethods[method]
      }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
    const data = await res.json()
    setSaving(false)
    setMessage(data.message)
    setTimeout(() => setMessage(''), 3000)
  }

  const paymentOptions = [
    { id: 'cod', icon: '💵', label: 'Cash on Delivery', desc: 'Customer pays when order arrives' },
    { id: 'upi', icon: '📱', label: 'UPI Payment', desc: 'Customer pays via UPI' },
    { id: 'bank', icon: '🏦', label: 'Bank Transfer', desc: 'Customer transfers to bank account' },
    { id: 'card', icon: '💳', label: 'Card Payment', desc: 'Credit or debit card' }
  ]

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#171313]">

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
          <span className="text-sm text-[#7b6f66]">Admin — Settings</span>
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

      <div className="mx-auto max-w-3xl px-5 py-8 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c6048]">Configuration</p>
          <h2 className="mt-1 text-3xl font-semibold">Store Settings</h2>
          <p className="mt-1 text-sm text-[#7b6f66]">Configure payment methods and store preferences</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#171313] border-t-transparent animate-spin mx-auto mb-3"/>
            <p className="text-sm text-[#7b6f66]">Loading settings...</p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Payment Methods */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
              <h3 className="text-lg font-semibold mb-2">💳 Payment Methods</h3>
              <p className="text-sm text-[#7b6f66] mb-6">Enable or disable payment options shown to customers during checkout</p>
              <div className="space-y-3">
                {paymentOptions.map(option => (
                  <div key={option.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition ${settings.paymentMethods[option.id] ? 'border-[#171313] bg-[#f6f1ea]' : 'border-[#241a14]/10 bg-[#f6f1ea]/50'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <p className="font-semibold text-sm">{option.label}</p>
                        <p className="text-xs text-[#9b8f86] mt-0.5">{option.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => togglePayment(option.id)}
                      className={`w-12 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 ${settings.paymentMethods[option.id] ? 'bg-[#171313]' : 'bg-[#241a14]/20'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${settings.paymentMethods[option.id] ? 'left-7 bg-white' : 'left-1 bg-[#9b8f86]'}`}/>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* UPI Settings */}
            {settings.paymentMethods.upi && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
                <h3 className="text-lg font-semibold mb-2">📱 UPI Configuration</h3>
                <p className="text-sm text-[#7b6f66] mb-4">This UPI ID will be shown to customers when they select UPI payment</p>
                <div>
                  <label className="text-sm text-[#7b6f66] mb-1 block">Your UPI ID</label>
                  <input
                    type="text"
                    placeholder="yourname@paytm or yourname@upi"
                    value={settings.upiId}
                    onChange={(e) => setSettings(prev => ({ ...prev, upiId: e.target.value }))}
                    className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition"
                  />
                </div>
              </motion.div>
            )}

            {/* Bank Transfer Settings */}
            {settings.paymentMethods.bank && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.4rem] bg-white shadow-lg shadow-[#3d2619]/5 p-6">
                <h3 className="text-lg font-semibold mb-2">🏦 Bank Transfer Details</h3>
                <p className="text-sm text-[#7b6f66] mb-4">These details will be shown to customers who select bank transfer</p>
                <div>
                  <label className="text-sm text-[#7b6f66] mb-1 block">Bank Details</label>
                  <textarea
                    placeholder={`Bank: HDFC Bank\nAccount Name: Your Name\nAccount Number: XXXXXXXXXXXX\nIFSC Code: HDFC0001234\nBranch: Your Branch`}
                    value={settings.bankDetails}
                    onChange={(e) => setSettings(prev => ({ ...prev, bankDetails: e.target.value }))}
                    rows={5}
                    className="w-full rounded-2xl border border-[#241a14]/15 bg-[#f6f1ea] px-4 py-3 text-sm placeholder-[#9b8f86] focus:outline-none focus:border-[#171313]/30 transition resize-none font-mono"
                  />
                </div>
              </motion.div>
            )}

            {message && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-2xl p-4 text-center text-sm font-medium ${message.includes('!') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                {message.includes('!') ? '✅ ' : '❌ '}{message}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-full bg-[#171313] py-4 font-semibold text-sm text-white transition hover:bg-[#3a2a21] disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </motion.button>
          </div>
        )}
      </div>

      <footer className="border-t border-[#241a14]/10 px-5 py-10">
        <p className="text-center text-sm text-[#9b8f86]">{config.copyright}</p>
      </footer>
    </main>
  )
}