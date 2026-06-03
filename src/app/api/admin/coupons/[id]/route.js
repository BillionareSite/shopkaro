import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req, { params }) {
  try {
    const { id } = await params
    const body = await req.json()

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        description: body.description,
        type: body.type,
        value: parseFloat(body.value),
        maxDiscount: parseFloat(body.maxDiscount) || 0,
        minCartValue: parseFloat(body.minCartValue) || 0,
        usageType: body.usageType,
        totalLimit: parseInt(body.totalLimit) || 0,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        isActive: body.isActive,
        isNewUserOnly: body.isNewUserOnly || false,
        categoryRestriction: body.categoryRestriction || ''
      }
    })

    return NextResponse.json({ message: 'Coupon updated!', coupon }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params
    await prisma.couponUsage.deleteMany({ where: { couponId: id } })
    await prisma.coupon.delete({ where: { id } })
    return NextResponse.json({ message: 'Coupon deleted!' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}