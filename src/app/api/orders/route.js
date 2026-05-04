import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, phone, address, pincode, items, total, email } = body

    if (!name || !phone || !address || !pincode || !items || !total) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    // Create the order
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