import config from '@/lib/config'

export const metadata = {
  title: `Return & Refund Policy — ${config.brandName}`,
  description: `Return and Refund Policy for ${config.brandName}`
}

export default function ReturnPolicy() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-4xl font-bold mb-2">Return & Refund Policy</h1>
        <p className="text-[var(--text-muted)] text-sm mb-10">Last updated: July 2026</p>

        <div className="mb-8 rounded-2xl bg-green-50 border border-green-200 p-5">
          <p className="text-green-700 font-semibold text-sm">✅ We offer a 7-day return policy on most products.</p>
        </div>

        {[
          {
            title: '1. Return Eligibility',
            content: `You may request a return within 7 days of delivery if: the product is damaged or defective, the wrong item was delivered, or the product is significantly different from what was described. Items must be unused, in original packaging, with all tags and accessories intact.`
          },
          {
            title: '2. Non-Returnable Items',
            content: `The following items are not eligible for return: products that have been used, items without original packaging, products damaged due to misuse, and items marked as "Final Sale" or "Non-Returnable" on the product page.`
          },
          {
            title: '3. How to Request a Return',
            content: `To initiate a return, go to My Orders on our website, find the delivered order, and click "Request Return". Fill in the reason and submit. Our team will review your request within 24-48 hours and contact you with further instructions.`
          },
          {
            title: '4. Refund Process',
            content: `Once your return is approved and we receive the product, we will process your refund within 5-7 business days. Refunds are issued to the original payment method. UPI/Bank transfers are refunded to the same account. COD orders are refunded via bank transfer or UPI.`
          },
          {
            title: '5. Return Shipping',
            content: `For defective or incorrect items, we will arrange pickup at no cost to you. For other returns, you may be required to ship the product back to us. Shipping costs for non-defective returns are borne by the customer.`
          },
          {
            title: '6. Preowned Products',
            content: `Preowned products are sold as-is with the condition clearly listed. Returns for preowned items are accepted only if the actual condition is significantly worse than described, or if the wrong item was sent.`
          },
          {
            title: '7. Contact',
            content: `For return-related queries, contact us at ${config.email} or visit our Help Center.`
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