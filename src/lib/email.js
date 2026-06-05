import nodemailer from 'nodemailer'
import config from '@/lib/config'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
})

const emailStyles = `
  body { margin: 0; padding: 0; background-color: #f6f1ea; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .wrapper { max-width: 560px; margin: 32px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(55,35,20,0.08); }
  .header { background: #171313; padding: 32px 40px; text-align: center; }
  .header h1 { color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; }
  .header p { color: rgba(255,255,255,0.55); font-size: 13px; margin: 6px 0 0; }
  .body { padding: 36px 40px; }
  .greeting { font-size: 16px; color: #171313; font-weight: 600; margin: 0 0 8px; }
  .subtext { font-size: 14px; color: #6f6258; line-height: 1.6; margin: 0 0 28px; }
  .otp-box { background: #f6f1ea; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 28px; }
  .otp-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #8c6048; margin: 0 0 12px; }
  .otp-code { font-size: 44px; font-weight: 800; letter-spacing: 14px; color: #171313; margin: 0; font-family: 'Courier New', monospace; }
  .otp-expiry { font-size: 12px; color: #9b8f86; margin: 10px 0 0; }
  .divider { border: none; border-top: 1px solid #f0ebe4; margin: 0 0 24px; }
  .note { font-size: 12px; color: #9b8f86; line-height: 1.6; margin: 0; }
  .footer { background: #f6f1ea; padding: 20px 40px; text-align: center; }
  .footer p { font-size: 11px; color: #9b8f86; margin: 0; }
`

export async function sendOTPEmail(email, otp, name) {
  await transporter.sendMail({
    from: { name: config.brandName, address: process.env.GMAIL_USER },
    to: email,
    subject: `${otp} is your ${config.brandName} verification code`,
    text: `Hi ${name},\n\nYour ${config.brandName} verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't create an account, ignore this email.\n\n${config.copyright}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your ${config.brandName} account</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>${config.brandName}</h1>
      <p>${config.tagline}</p>
    </div>
    <div class="body">
      <p class="greeting">Hi ${name}! 👋</p>
      <p class="subtext">Welcome to ${config.brandName}! Use the code below to verify your email address.</p>
      <div class="otp-box">
        <p class="otp-label">Your Verification Code</p>
        <p class="otp-code">${otp}</p>
        <p class="otp-expiry">⏱ Valid for 10 minutes only</p>
      </div>
      <hr class="divider"/>
      <p class="note">If you didn't create an account on ${config.brandName}, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>${config.copyright} · Sent to ${email}</p>
    </div>
  </div>
</body>
</html>`.trim()
  })
}

export async function sendPasswordResetEmail(email, otp, name) {
  await transporter.sendMail({
    from: { name: config.brandName, address: process.env.GMAIL_USER },
    to: email,
    subject: `${otp} is your ${config.brandName} password reset code`,
    text: `Hi ${name},\n\nYour ${config.brandName} password reset code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, ignore this email.\n\n${config.copyright}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset your ${config.brandName} password</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>${config.brandName}</h1>
      <p>${config.tagline}</p>
    </div>
    <div class="body">
      <p class="greeting">Hi ${name}! 👋</p>
      <p class="subtext">We received a request to reset your ${config.brandName} password. Use the code below.</p>
      <div class="otp-box">
        <p class="otp-label">Password Reset Code</p>
        <p class="otp-code">${otp}</p>
        <p class="otp-expiry">⏱ Valid for 10 minutes only</p>
      </div>
      <hr class="divider"/>
      <p class="note">If you didn't request a password reset, ignore this email. Your password remains unchanged.</p>
    </div>
    <div class="footer">
      <p>${config.copyright} · Sent to ${email}</p>
    </div>
  </div>
</body>
</html>`.trim()
  })
}

export async function sendOrderConfirmationEmail(email, order, items, needsVerification = false) {
  const paymentLabels = {
    cod: 'Cash on Delivery',
    upi: 'UPI Payment',
    bank: 'Bank Transfer',
    card: 'Card Payment'
  }

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0ebe4;font-size:14px;color:#171313;">${item.name}<br/><span style="font-size:12px;color:#9b8f86;">Qty: ${item.quantity}</span></td>
      <td style="padding:10px 0;border-bottom:1px solid #f0ebe4;text-align:right;font-size:14px;font-weight:600;color:#171313;">₹${item.price * item.quantity}</td>
    </tr>
  `).join('')

  const verificationNote = needsVerification ? `
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;padding:16px 20px;margin-bottom:24px;">
      <p style="font-size:13px;font-weight:700;color:#c2410c;margin:0 0 6px;">⏳ Payment Verification Pending</p>
      <p style="font-size:13px;color:#9a3412;margin:0;line-height:1.6;">Your order will be confirmed as soon as we verify your payment. This usually takes a few minutes to a few hours.</p>
    </div>
  ` : `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:16px 20px;margin-bottom:24px;">
      <p style="font-size:13px;font-weight:700;color:#15803d;margin:0 0 6px;">✅ Order Confirmed!</p>
      <p style="font-size:13px;color:#166534;margin:0;line-height:1.6;">Your order is confirmed and being processed. We'll update you when it ships.</p>
    </div>
  `

  await transporter.sendMail({
    from: { name: config.brandName, address: process.env.GMAIL_USER },
    to: email,
    subject: `Order ${needsVerification ? 'Placed' : 'Confirmed'} — ${order.orderId} | ${config.brandName}`,
    text: `Hi ${order.name},\n\nYour order ${order.orderId} has been placed!\n\nTotal: ₹${order.total}\nPayment: ${paymentLabels[order.paymentMethod] || order.paymentMethod}\n\n${needsVerification ? 'Your order will be confirmed after payment verification.' : 'Your order is confirmed!'}\n\n${config.copyright}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order ${order.orderId} | ${config.brandName}</title>
</head>
<body style="margin:0;padding:0;background:#f6f1ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(55,35,20,0.08);">
    <div style="background:#171313;padding:32px 40px;text-align:center;">
      <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.15em;">Order ${needsVerification ? 'Placed' : 'Confirmed'}</p>
      <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0;">${config.brandName}</h1>
      <p style="color:rgba(255,255,255,0.55);font-size:13px;margin:6px 0 0;">${config.tagline}</p>
    </div>
    <div style="padding:36px 40px;">
      <p style="font-size:16px;color:#171313;font-weight:600;margin:0 0 6px;">Hi ${order.name}! 🎉</p>
      <p style="font-size:14px;color:#6f6258;line-height:1.6;margin:0 0 24px;">Your order has been placed successfully. Here's your complete order summary:</p>
      <div style="background:#f6f1ea;border-radius:16px;padding:16px 20px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="font-size:11px;color:#9b8f86;text-transform:uppercase;letter-spacing:0.1em;padding-bottom:4px;">Order ID</td>
            <td style="font-size:11px;color:#9b8f86;text-align:right;padding-bottom:4px;">Date</td>
          </tr>
          <tr>
            <td style="font-size:16px;color:#171313;font-weight:800;font-family:monospace;">${order.orderId}</td>
            <td style="font-size:13px;color:#171313;text-align:right;">${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
          </tr>
        </table>
      </div>
      ${verificationNote}
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr>
            <th style="text-align:left;font-size:11px;color:#9b8f86;text-transform:uppercase;letter-spacing:0.1em;padding-bottom:8px;border-bottom:2px solid #f0ebe4;">Item</th>
            <th style="text-align:right;font-size:11px;color:#9b8f86;text-transform:uppercase;letter-spacing:0.1em;padding-bottom:8px;border-bottom:2px solid #f0ebe4;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="background:#f6f1ea;border-radius:16px;padding:16px 20px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          ${order.discount > 0 ? `
          <tr><td style="font-size:13px;color:#6f6258;padding:3px 0;">Subtotal</td><td style="text-align:right;font-size:13px;">₹${order.total + order.discount}</td></tr>
          <tr><td style="font-size:13px;color:#22c55e;padding:3px 0;">Coupon (${order.couponCode})</td><td style="text-align:right;font-size:13px;color:#22c55e;">−₹${order.discount}</td></tr>
          ` : ''}
          <tr><td style="font-size:13px;color:#6f6258;padding:3px 0;">Delivery</td><td style="text-align:right;font-size:13px;color:#22c55e;">FREE</td></tr>
          <tr>
            <td style="font-size:15px;color:#171313;font-weight:700;padding-top:10px;border-top:1px solid #e8e0d8;">Total Paid</td>
            <td style="text-align:right;font-size:15px;color:#171313;font-weight:700;padding-top:10px;border-top:1px solid #e8e0d8;">₹${order.total}</td>
          </tr>
        </table>
      </div>
      <div style="background:#f6f1ea;border-radius:16px;padding:16px 20px;margin-bottom:20px;">
        <p style="font-size:11px;color:#9b8f86;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 10px;">Delivery Details</p>
        <p style="font-size:13px;color:#171313;margin:0 0 4px;font-weight:600;">${order.name}</p>
        <p style="font-size:13px;color:#6f6258;margin:0 0 4px;">${order.address}, ${order.pincode}</p>
        <p style="font-size:13px;color:#6f6258;margin:0 0 4px;">📱 ${order.phone}</p>
        <p style="font-size:13px;color:#6f6258;margin:0;">💳 ${paymentLabels[order.paymentMethod] || order.paymentMethod}</p>
      </div>
      <p style="font-size:13px;color:#6f6258;line-height:1.6;margin:0;">If you have any questions, visit our <a href="https://${config.domain}/help" style="color:#8c6048;">Help Center</a>.</p>
    </div>
    <div style="background:#f6f1ea;padding:20px 40px;text-align:center;">
      <p style="font-size:11px;color:#9b8f86;margin:0;">${config.copyright}</p>
    </div>
  </div>
</body>
</html>`.trim()
  })
}