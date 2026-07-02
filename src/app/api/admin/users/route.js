import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        dob: true,
        gender: true,
        address: true,
        pincode: true,
        verified: true,
        createdAt: true,
        _count: { select: { couponUsages: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}