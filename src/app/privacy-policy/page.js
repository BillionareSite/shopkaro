import config from '@/lib/config'

export const metadata = {
  title: `Privacy Policy — ${config.brandName}`,
  description: `Privacy Policy for ${config.brandName}`
}

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-[var(--text-muted)] text-sm mb-10">Last updated: July 2026</p>

        {[
          {
            title: '1. Information We Collect',
            content: `We collect information you provide when creating an account or placing an order: name, email address, phone number, WhatsApp number, delivery address, and pincode. We also collect payment-related information such as UPI transaction IDs and payment screenshots for verification purposes. We do not store card details — all card payments are processed securely by Razorpay.`
          },
          {
            title: '2. How We Use Your Information',
            content: `We use your information to process and deliver your orders, send order confirmations and updates via email, provide customer support, verify payments, and improve our services. We do not sell your personal information to third parties.`
          },
          {
            title: '3. Data Storage & Security',
            content: `Your data is stored securely on encrypted servers. Passwords are hashed and never stored in plain text. Payment processing is handled by Razorpay, which is PCI-DSS compliant. We take reasonable measures to protect your information from unauthorized access.`
          },
          {
            title: '4. Cookies',
            content: `We use essential cookies to keep you logged in and maintain your shopping cart. We do not use tracking or advertising cookies.`
          },
          {
            title: '5. Third-Party Services',
            content: `We use the following third-party services: Razorpay (payment processing), Cloudinary (image hosting), and Gmail (email notifications). These services have their own privacy policies.`
          },
          {
            title: '6. Your Rights',
            content: `You can request access to, correction of, or deletion of your personal data at any time by contacting us at ${config.email}. You can also delete your account by reaching out to our support team.`
          },
          {
            title: '7. Contact Us',
            content: `If you have any questions about this Privacy Policy, please contact us at ${config.email} or visit our Contact page.`
          }
        ].map((section, i) => (
          <div key={i} className="mb-8">
            <h2 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">{section.title}</h2>
            <p className="text-[var(--text-muted)] text-sm leading-7">{section.content}</p>
          </div>
        ))}
      </div>
    </main>
  )
}