import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } })

    if (!admin) {
      return NextResponse.json({ message: 'Invalid credentials!' }, { status: 401 })
    }

    if (!admin.isActive) {
      return NextResponse.json({ message: 'Your account has been deactivated!' }, { status: 403 })
    }

    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials!' }, { status: 401 })
    }

    const token = jwt.sign(
      { adminId: admin.id, name: admin.name, email: admin.email, permissions: admin.permissions },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    const response = NextResponse.json({ message: 'Login successful!', token }, { status: 200 })
    response.cookies.set('sub_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    return response
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}