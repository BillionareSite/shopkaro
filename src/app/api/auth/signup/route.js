import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendOTPEmail } from '@/lib/email'

export async function POST(req) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      if (!existingUser.verified) {
        // Resend OTP if user exists but not verified
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
        await prisma.user.update({
          where: { email },
          data: { otp, otpExpiry }
        })
        await sendOTPEmail(email, otp, existingUser.name)
        return NextResponse.json({
          message: 'OTP resent! Please verify your email.',
          redirect: true
        }, { status: 200 })
      }
      return NextResponse.json({ message: 'Email already registered!' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verified: false,
        otp,
        otpExpiry
      }
    })

    await sendOTPEmail(email, otp, name)

    return NextResponse.json({
      message: 'OTP sent to your email!',
      redirect: true
    }, { status: 201 })

  } catch (error) {
    console.log('SIGNUP ERROR:', error.message)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}