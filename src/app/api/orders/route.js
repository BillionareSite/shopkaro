import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTelegramNotification } from '@/lib/telegram'

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, phone, address, pincode, items, total, email } = body

    if (!name || !phone || !address || !pincode || !items || !total) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    const order = await prisma.order.create({
      data: { name, phone, address, pincode, items, total, email: email || '' }
    })

    // Decrease stock for each item
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id }
      })
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity)
        await prisma.product.update({
          where: { id: item.id },
          data: { stock: newStock }
        })
      }
    }

    // Build items list for Telegram
    const itemsList = items.map(item =>
      `  • ${item.name} x${item.quantity} — ₹${item.price * item.quantity}`
    ).join('\n')

    // Send Telegram notification
    const message = `
🛍️ <b>New Order Received!</b>

👤 <b>Customer:</b> ${name}
📧 <b>Email:</b> ${email || 'Guest'}
📱 <b>Phone:</b> ${phone}
📍 <b>Address:</b> ${address}, ${pincode}

🛒 <b>Items:</b>
${itemsList}

💰 <b>Total: ₹${total}</b>
🕐 <b>Time:</b> ${new Date().toLocaleString('en-IN')}
📦 <b>Order ID:</b> #${order.id.slice(-8).toUpperCase()}
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