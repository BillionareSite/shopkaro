import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ message: 'Email already registered!' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: { name, email, password: hashedPassword }
    })

    return NextResponse.json({ message: 'Account created successfully! Please login.' }, { status: 201 })

  } catch (error) {
    console.log('SIGNUP ERROR:', error.message)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}