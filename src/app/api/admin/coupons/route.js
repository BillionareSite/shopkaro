import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { usages: true } } }
    })
    return NextResponse.json({ coupons }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const {
      code, description, type, value, maxDiscount,
      minCartValue, usageType, totalLimit,
      expiryDate, isActive, isNewUserOnly, categoryRestriction
    } = body

    if (!code || !value) {
      return NextResponse.json({ message: 'Code and value are required' }, { status: 400 })
    }

    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
    if (existing) {
      return NextResponse.json({ message: 'Coupon code already exists!' }, { status: 400 })
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        description: description || '',
        type: type || 'percentage',
        value: parseFloat(value),
        maxDiscount: parseFloat(maxDiscount) || 0,
        minCartValue: parseFloat(minCartValue) || 0,
        usageType: usageType || 'one_per_user',
        totalLimit: parseInt(totalLimit) || 0,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive: isActive !== false,
        isNewUserOnly: isNewUserOnly || false,
        categoryRestriction: categoryRestriction || ''
      }
    })

    return NextResponse.json({ message: 'Coupon created!', coupon }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}