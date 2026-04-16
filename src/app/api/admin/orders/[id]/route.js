import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req, { params }) {
  try {
    const { id } = await params
    const { status } = await req.json()

    console.log('Updating order:', id, 'to status:', status)

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json({ message: 'Order updated!', order }, { status: 200 })
  } catch (error) {
    console.log('PATCH ERROR:', error.message)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}