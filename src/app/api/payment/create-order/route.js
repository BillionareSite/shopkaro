import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { prisma } from '@/lib/prisma'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export async function POST(req) {
  try {
    const { items, couponCode } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ message: 'Cart is empty' }, { status: 400 })
    }

    // Separate regular and preowned items
    const regularItems = items.filter(i => !i.preowned)
    const preownedItems = items.filter(i => i.preowned)

    // Fetch real prices from DB for both tables
    const regularIds = regularItems.map(i => i.id)
    const preownedIds = preownedItems.map(i => i.id)

    const [dbRegular, dbPreowned] = await Promise.all([
      regularIds.length > 0 ? prisma.product.findMany({ where: { id: { in: regularIds } } }) : [],
      preownedIds.length > 0 ? prisma.preownedProduct.findMany({ where: { id: { in: preownedIds } } }) : []
    ])

    const allDbProducts = [
      ...dbRegular.map(p => ({ ...p, preowned: false })),
      ...dbPreowned.map(p => ({ ...p, preowned: true }))
    ]

    if (allDbProducts.length === 0) {
      return NextResponse.json({ message: 'No valid products found' }, { status: 400 })
    }

    // Calculate subtotal using DB prices
    let subtotal = 0
    for (const item of items) {
      const dbProduct = allDbProducts.find(p => p.id === item.id)
      if (!dbProduct) {
        return NextResponse.json({ message: `Product not found: ${item.name || item.id}` }, { status: 400 })
      }
      if (dbProduct.stock < item.quantity) {
        return NextResponse.json({ message: `Not enough stock for ${dbProduct.name}` }, { status: 400 })
      }
      subtotal += dbProduct.price * item.quantity
    }

    // Validate coupon server-side
    let discount = 0
    let validCouponCode = ''
    let validCouponId = ''

    if (couponCode && couponCode.trim()) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() }
      })
      if (coupon && coupon.isActive) {
        const now = new Date()
        const notExpired = !coupon.expiryDate || now < new Date(coupon.expiryDate)
        const meetsMinCart = subtotal >= (coupon.minCartValue || 0)
        if (notExpired && meetsMinCart) {
          if (coupon.type === 'percentage') {
            discount = (subtotal * coupon.value) / 100
            if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount)
          } else {
            discount = coupon.value
          }
          discount = Math.round(Math.min(discount, subtotal))
          validCouponCode = coupon.code
          validCouponId = coupon.id
        }
      }
    }

    const total = Math.max(0, subtotal - discount)

    if (total <= 0) {
      return NextResponse.json({ message: 'Invalid total amount' }, { status: 400 })
    }

    // Create Razorpay order with SERVER-calculated amount
    const order = await razorpay.orders.create({
      amount: Math.round(total * 100), // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      serverTotal: total,
      serverDiscount: discount,
      serverSubtotal: subtotal,
      validCouponCode,
      validCouponId,
    }, { status: 200 })

  } catch (error) {
    console.log('RAZORPAY CREATE ORDER ERROR:', error.message)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}