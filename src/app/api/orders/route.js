import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTelegramNotification } from '@/lib/telegram'
import config from '@/lib/config'

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, phone, address, pincode, items, total, email, discount, couponCode, couponId } = body

    if (!name || !phone || !address || !pincode || !items || !total) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    const orderCount = await prisma.order.count()
    const year = new Date().getFullYear()
    const orderNumber = String(orderCount + 1).padStart(4, '0')
    const orderId = `ORD-${year}-${orderNumber}`

    const order = await prisma.order.create({
      data: {
        orderId,
        name,
        phone,
        address,
        pincode,
        items,
        total,
        email: email || '',
        discount: discount || 0,
        couponCode: couponCode || ''
      }
    })

    if (couponId && email) {
      const user = await prisma.user.findUnique({ where: { email } })
      if (user) {
        await prisma.couponUsage.create({
          data: {
            couponId,
            userId: user.id,
            email,
            orderId: order.id
          }
        })
        await prisma.coupon.update({
          where: { id: couponId },
          data: { totalUsed: { increment: 1 } }
        })
      }
    }

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.id } })
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity)
        await prisma.product.update({ where: { id: item.id }, data: { stock: newStock } })
      }
    }

    const itemsList = items.map(item =>
      `  • ${item.name} x${item.quantity} — ₹${item.price * item.quantity}`
    ).join('\n')

    const message = `
🛍️ <b>New Order Received!</b>

🔖 <b>Order ID:</b> ${orderId}
👤 <b>Customer:</b> ${name}
📧 <b>Email:</b> ${email || 'Guest'}
📱 <b>Phone:</b> ${phone}
📍 <b>Address:</b> ${address}, ${pincode}

🛒 <b>Items:</b>
${itemsList}

${discount > 0 ? `🎟️ <b>Coupon:</b> ${couponCode} (−₹${discount})\n` : ''}💰 <b>Total: ₹${total}</b>
🕐 <b>Time:</b> ${new Date().toLocaleString('en-IN')}
🏪 <b>Store:</b> ${config.brandName}
    `.trim()

    await sendTelegramNotification(message)

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

    if (!email) {
      return NextResponse.json({ message: 'Email required' }, { status: 400 })
    }

    const orders = await prisma.order.findMany({
      where: { email },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ orders }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}