import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
})

export async function sendOTPEmail(email, otp, name) {
  await transporter.sendMail({
    from: `"ShopKaro" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Verify your ShopKaro account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #000; color: #fff; padding: 40px; border-radius: 16px;">
        <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 8px;">ShopKaro 🛍️</h1>
        <p style="color: #888; margin-bottom: 32px;">Your Premium Store</p>
        
        <h2 style="font-size: 20px; margin-bottom: 16px;">Hi ${name}! 👋</h2>
        <p style="color: #ccc; margin-bottom: 24px;">Thanks for signing up! Use the OTP below to verify your account:</p>
        
        <div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="color: #888; font-size: 14px; margin-bottom: 8px;">Your OTP</p>
          <h1 style="font-size: 48px; font-weight: bold; letter-spacing: 12px; margin: 0;">${otp}</h1>
          <p style="color: #888; font-size: 12px; margin-top: 12px;">Valid for 10 minutes</p>
        </div>
        
        <p style="color: #666; font-size: 12px;">If you didn't create an account on ShopKaro, please ignore this email.</p>
      </div>
    `
  })
}