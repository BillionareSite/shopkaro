import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ message: 'No account found with this email!' }, { status: 404 })
    }

    if (!user.verified) {
      return NextResponse.json({ message: 'Please verify your account first!' }, { status: 400 })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiry }
    })

    await sendPasswordResetEmail(email, otp, user.name)

    return NextResponse.json({ message: 'OTP sent to your email!', redirect: true }, { status: 200 })
  } catch (error) {
    console.log('FORGOT PASSWORD ERROR:', error.message)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}