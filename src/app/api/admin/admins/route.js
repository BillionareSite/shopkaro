import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const admins = await prisma.adminUser.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ admins }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { name, email, password, permissions } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    const existing = await prisma.adminUser.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ message: 'Email already exists!' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await prisma.adminUser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        permissions: permissions || [],
        isActive: true
      }
    })

    return NextResponse.json({ message: 'Admin created!', admin }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}