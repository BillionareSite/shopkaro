import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const { code, cartTotal, email, items } = await req.json()

    if (!code || !cartTotal || !email) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })

    if (!coupon) {
      return NextResponse.json({ message: 'Invalid coupon code!' }, { status: 404 })
    }

    if (!coupon.isActive) {
      return NextResponse.json({ message: 'This coupon is no longer active!' }, { status: 400 })
    }

    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return NextResponse.json({ message: 'This coupon has expired!' }, { status: 400 })
    }

    if (coupon.minCartValue > 0 && cartTotal < coupon.minCartValue) {
      return NextResponse.json({ message: `Minimum cart value of ₹${coupon.minCartValue} required!` }, { status: 400 })
    }

    if (coupon.totalLimit > 0 && coupon.totalUsed >= coupon.totalLimit) {
      return NextResponse.json({ message: 'This coupon has reached its usage limit!' }, { status: 400 })
    }

    if (coupon.categoryRestriction) {
      const restrictedCategory = coupon.categoryRestriction.toLowerCase()
      const hasValidItem = items.some(item => item.category?.toLowerCase() === restrictedCategory)
      if (!hasValidItem) {
        return NextResponse.json({ message: `This coupon is only valid for ${coupon.categoryRestriction} products!` }, { status: 400 })
      }
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ message: 'User not found!' }, { status: 404 })
    }

    if (coupon.isNewUserOnly) {
      const orderCount = await prisma.order.count({ where: { email } })
      if (orderCount > 0) {
        return NextResponse.json({ message: 'This coupon is only for new users!' }, { status: 400 })
      }
    }

    if (coupon.usageType === 'one_per_user') {
      const existingUsage = await prisma.couponUsage.findFirst({
        where: { couponId: coupon.id, userId: user.id }
      })
      if (existingUsage) {
        return NextResponse.json({ message: 'You have already used this coupon!' }, { status: 400 })
      }
    }

    let discount = 0
    if (coupon.type === 'percentage') {
      discount = (cartTotal * coupon.value) / 100
      if (coupon.maxDiscount > 0) {
        discount = Math.min(discount, coupon.maxDiscount)
      }
    } else {
      discount = coupon.value
    }

    discount = Math.min(discount, cartTotal)
    discount = Math.round(discount)

    return NextResponse.json({
      message: 'Coupon applied successfully!',
      discount,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        maxDiscount: coupon.maxDiscount
      }
    }, { status: 200 })

  } catch (error) {
    console.log('COUPON VALIDATE ERROR:', error.message)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}