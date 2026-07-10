import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTelegramNotification } from '@/lib/telegram'
import { sendOrderConfirmationEmail } from '@/lib/email'
import config from '@/lib/config'

export async function POST(req) {
  try {
    const body = await req.json()
    const {
      name, phone, whatsapp, address, pincode, items, email,
      couponCode, paymentMethod,
      paymentSenderName, paymentUTR, paymentScreenshot,
      paymentVerified, razorpayOrderId, razorpayPaymentId
    } = body

    if (!name || !phone || !address || !pincode || !items || items.length === 0) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    // Separate regular and preowned items
    const regularItems = items.filter(i => !i.preowned)
    const preownedItems = items.filter(i => i.preowned)

    const regularIds = regularItems.map(i => i.id)
    const preownedIds = preownedItems.map(i => i.id)

    // Fetch real prices from BOTH tables
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

    // Calculate subtotal and build verified items list
    let subtotal = 0
    const verifiedItems = []

    for (const item of items) {
      const dbProduct = allDbProducts.find(p => p.id === item.id)
      if (!dbProduct) {
        return NextResponse.json({ message: `Product not found: ${item.name || item.id}` }, { status: 400 })
      }
      if (dbProduct.stock < item.quantity) {
        return NextResponse.json({ message: `Not enough stock for ${dbProduct.name}` }, { status: 400 })
      }
      subtotal += dbProduct.price * item.quantity
      verifiedItems.push({
        id: dbProduct.id,
        name: dbProduct.name,
        price: dbProduct.price,
        quantity: item.quantity,
        images: dbProduct.images,
        sameDayPincodes: dbProduct.sameDayPincodes || [],
        preowned: dbProduct.preowned || false
      })
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

    if (paymentMethod === 'card' && razorpayPaymentId) {
      if (!paymentVerified) {
        return NextResponse.json({ message: 'Payment not verified' }, { status: 400 })
      }
    }

    const isSameDay = verifiedItems.some(item => item.sameDayPincodes?.includes(pincode.trim()))

    const orderCount = await prisma.order.count()
    const year = new Date().getFullYear()
    const orderNumber = String(orderCount + 1).padStart(4, '0')
    const orderId = `ORD-${year}-${orderNumber}`
    const needsVerification = paymentMethod === 'upi' || paymentMethod === 'bank'

    const order = await prisma.order.create({
      data: {
        orderId,
        name,
        phone,
        whatsapp: whatsapp || '',
        address,
        pincode,
        items: verifiedItems,
        total,
        email: email || '',
        discount: discount || 0,
        couponCode: validCouponCode,
        paymentMethod: paymentMethod || 'cod',
        paymentSenderName: paymentSenderName || '',
        paymentUTR: razorpayPaymentId || paymentUTR || '',
        paymentScreenshot: paymentScreenshot || '',
        paymentVerified: paymentMethod === 'cod' ? true : !!paymentVerified,
        isSameDay: isSameDay || false,
        status: 'pending'
      }
    })

    // Track coupon usage
    if (validCouponId && email) {
      const user = await prisma.user.findUnique({ where: { email } })
      if (user) {
        await prisma.couponUsage.create({
          data: { couponId: validCouponId, userId: user.id, email, orderId: order.id }
        })
        await prisma.coupon.update({
          where: { id: validCouponId },
          data: { totalUsed: { increment: 1 } }
        })
      }
    }

    // Reduce stock in the correct table
    for (const item of verifiedItems) {
      if (item.preowned) {
        const product = await prisma.preownedProduct.findUnique({ where: { id: item.id } })
        if (product) {
          await prisma.preownedProduct.update({
            where: { id: item.id },
            data: { stock: Math.max(0, product.stock - item.quantity) }
          })
        }
      } else {
        const product = await prisma.product.findUnique({ where: { id: item.id } })
        if (product) {
          await prisma.product.update({
            where: { id: item.id },
            data: { stock: Math.max(0, product.stock - item.quantity) }
          })
        }
      }
    }

    const paymentLabels = {
      cod: 'Cash on Delivery',
      upi: 'UPI Payment',
      bank: 'Bank Transfer',
      card: 'Razorpay (Card/UPI/Wallet)'
    }

    const itemsList = verifiedItems.map(item =>
      `  • ${item.preowned ? '[Preowned] ' : ''}${item.name} x${item.quantity} — ₹${item.price * item.quantity}`
    ).join('\n')

    const hasPreowned = verifiedItems.some(i => i.preowned)

    const telegramMessage = `
🛍️ <b>New Order Received!</b>
${isSameDay ? '\n⚡ <b>SAME DAY DELIVERY ORDER!</b>' : ''}
${hasPreowned ? '\n♻️ <b>Contains Preowned Items</b>' : ''}

🔖 <b>Order ID:</b> ${orderId}
👤 <b>Customer:</b> ${name}
📧 <b>Email:</b> ${email || 'Guest'}
📱 <b>Phone:</b> ${phone}
${whatsapp ? `💬 <b>WhatsApp:</b> ${whatsapp}\n` : ''}📍 <b>Address:</b> ${address}, ${pincode}
💳 <b>Payment:</b> ${paymentLabels[paymentMethod] || paymentMethod}
${needsVerification ? `🔍 <b>Payment Status:</b> Verification Pending\n👤 <b>Sender:</b> ${paymentSenderName}\n🔢 <b>UTR:</b> ${paymentUTR}\n` : ''}${paymentMethod === 'card' ? `✅ <b>Payment Status:</b> Verified via Razorpay\n🔢 <b>Payment ID:</b> ${razorpayPaymentId}\n` : ''}
🛒 <b>Items:</b>
${itemsList}

${discount > 0 ? `🎟️ <b>Coupon:</b> ${validCouponCode} (−₹${discount})\n` : ''}💰 <b>Total: ₹${total}</b>
🕐 <b>Time:</b> ${new Date().toLocaleString('en-IN')}
🏪 <b>Store:</b> ${config.brandName}
    `.trim()

    await sendTelegramNotification(telegramMessage)

    if (email) {
      try {
        await sendOrderConfirmationEmail(
          email,
          { ...order, orderId, paymentMethod: paymentMethod || 'cod' },
          verifiedItems,
          needsVerification
        )
      } catch (emailError) {
        console.log('ORDER EMAIL ERROR:', emailError.message)
      }
    }

    return NextResponse.json({ message: 'Order placed!', order }, { status: 201 })
  } catch (error) {
    console.log('ORDER ERROR:', error.message)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    if (!email) return NextResponse.json({ message: 'Email required' }, { status: 400 })
    const orders = await prisma.order.findMany({
      where: { email },
      include: { cancellationRequest: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ orders }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}