import config from '@/lib/config'

export const metadata = {
  title: `Terms & Conditions — ${config.brandName}`,
  description: `Terms and Conditions for ${config.brandName}`
}

export default function Terms() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-4xl font-bold mb-2">Terms & Conditions</h1>
        <p className="text-[var(--text-muted)] text-sm mb-10">Last updated: July 2026</p>

        {[
          {
            title: '1. Acceptance of Terms',
            content: `By accessing and using ${config.brandName} (${config.domain}), you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our website.`
          },
          {
            title: '2. Products & Pricing',
            content: `All prices are listed in Indian Rupees (₹) and include applicable taxes. We reserve the right to change prices at any time without prior notice. Product images are for reference only and may slightly differ from the actual product.`
          },
          {
            title: '3. Orders & Payments',
            content: `By placing an order, you confirm that the information provided is accurate and complete. We accept Cash on Delivery, UPI, Bank Transfer, and Card/Wallet payments via Razorpay. Orders are subject to availability and we reserve the right to cancel any order due to stock unavailability, pricing errors, or suspected fraud.`
          },
          {
            title: '4. Cancellations',
            content: `You may request cancellation of your order before it is shipped. Once dispatched, cancellations are not accepted. Cancellation requests can be submitted through your Orders page. We reserve the right to approve or reject cancellation requests.`
          },
          {
            title: '5. User Accounts',
            content: `You are responsible for maintaining the confidentiality of your account credentials. You agree not to share your account with others or use another person's account. We reserve the right to terminate accounts that violate these terms.`
          },
          {
            title: '6. Intellectual Property',
            content: `All content on this website including text, images, logos, and design is the property of ${config.brandName} and is protected by applicable intellectual property laws. You may not reproduce or redistribute any content without written permission.`
          },
          {
            title: '7. Limitation of Liability',
            content: `${config.brandName} shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Our maximum liability is limited to the amount paid for the specific order in question.`
          },
          {
            title: '8. Governing Law',
            content: `These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Dehradun, Uttarakhand, India.`
          },
          {
            title: '9. Contact',
            content: `For any questions regarding these terms, contact us at ${config.email}.`
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