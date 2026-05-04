import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ message: 'User not found!' }, { status: 404 })
    }

    if (user.verified) {
      return NextResponse.json({ message: 'Account already verified!' }, { status: 400 })
    }

    if (user.otp !== otp) {
      return NextResponse.json({ message: 'Invalid OTP!' }, { status: 400 })
    }

    if (new Date() > new Date(user.otpExpiry)) {
      return NextResponse.json({ message: 'OTP expired! Please signup again.' }, { status: 400 })
    }

    await prisma.user.update({
      where: { email },
      data: {
        verified: true,
        otp: null,
        otpExpiry: null
      }
    })

    return NextResponse.json({ message: 'Account verified! You can now login.' }, { status: 200 })

  } catch (error) {
    console.log('VERIFY ERROR:', error.message)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}