import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    const { email, otp, newPassword } = await req.json()

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ message: 'User not found!' }, { status: 404 })
    }

    if (user.otp !== otp) {
      return NextResponse.json({ message: 'Invalid OTP!' }, { status: 400 })
    }

    if (new Date() > new Date(user.otpExpiry)) {
      return NextResponse.json({ message: 'OTP expired! Please try again.' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiry: null
      }
    })

    return NextResponse.json({ message: 'Password reset successfully!' }, { status: 200 })
  } catch (error) {
    console.log('RESET PASSWORD ERROR:', error.message)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}