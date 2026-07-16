import config from '@/lib/config'

export const metadata = {
  title: `Shipping Policy — ${config.brandName}`,
  description: `Shipping Policy for ${config.brandName}`
}

export default function ShippingPolicy() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-4xl font-bold mb-2">Shipping Policy</h1>
        <p className="text-[var(--text-muted)] text-sm mb-10">Last updated: July 2026</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: '📦', title: 'Processing Time', value: '1-2 business days' },
            { icon: '🚚', title: 'Standard Delivery', value: '3-7 business days' },
            { icon: '⚡', title: 'Same Day Delivery', value: 'Select pincodes only' }
          ].map((item, i) => (
            <div key={i} className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-card)] p-4 text-center">
              <p className="text-2xl mb-2">{item.icon}</p>
              <p className="text-xs text-[var(--text-muted)] mb-1">{item.title}</p>
              <p className="text-sm font-semibold">{item.value}</p>
            </div>
          ))}
        </div>

        {[
          {
            title: '1. Delivery Areas',
            content: `We currently deliver across India. Same-day delivery is available for select pincodes in Dehradun. You can check same-day eligibility on the product page by entering your pincode.`
          },
          {
            title: '2. Processing Time',
            content: `Orders are processed within 1-2 business days after payment confirmation. For UPI and Bank Transfer payments, processing begins after payment verification by our team.`
          },
          {
            title: '3. Delivery Time',
            content: `Standard delivery takes 3-7 business days depending on your location. Remote areas may take up to 10 business days. Same-day delivery orders placed before 12 PM are delivered the same day for eligible pincodes.`
          },
          {
            title: '4. Delivery Charges',
            content: `Delivery charges are calculated at checkout based on your order total and location. Orders above the free delivery threshold (shown at checkout) qualify for free delivery. Same-day delivery may have additional charges.`
          },
          {
            title: '5. Order Tracking',
            content: `Once your order is shipped, you can track its status on your Orders page. You will also receive updates via email. For further tracking information, contact us with your Order ID.`
          },
          {
            title: '6. Failed Delivery',
            content: `If delivery fails due to wrong address, unavailability of recipient, or refusal to accept — the order will be returned to us. We will contact you to reattempt delivery. Additional shipping charges may apply for reattempts.`
          },
          {
            title: '7. Contact',
            content: `For shipping-related queries, contact us at ${config.email}.`
          }
        ].map((section, i) => (
          <div key={i} className="mb-8">
            <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
            <p className="text-[var(--text-muted)] text-sm leading-7">{section.content}</p>
          </div>
        ))}
      </div>
    </main>
  )
}