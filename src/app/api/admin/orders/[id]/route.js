import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req, { params }) {
  try {
    const { id } = await params
    const body = await req.json()

    const updateData = {}
    if (body.status !== undefined) updateData.status = body.status
    if (body.paymentVerified !== undefined) updateData.paymentVerified = body.paymentVerified

    const order = await prisma.order.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ message: 'Order updated!', order }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}