import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, phone, address, pincode, items, total } = body

    if (!name || !phone || !address || !pincode || !items || !total) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    const order = await prisma.order.create({
      data: { name, phone, address, pincode, items, total }
    })

    return NextResponse.json({ message: 'Order placed!', order }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}