import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const { orderId, reason, details } = await req.json()

    if (!orderId || !reason) {
      return NextResponse.json({ message: 'Order ID and reason are required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { cancellationRequest: true }
    })

    if (!order) {
      return NextResponse.json({ message: 'Order not found!' }, { status: 404 })
    }

    if (order.status === 'delivered') {
      return NextResponse.json({ message: 'Cannot cancel a delivered order!' }, { status: 400 })
    }

    if (order.status === 'cancelled') {
      return NextResponse.json({ message: 'Order is already cancelled!' }, { status: 400 })
    }

    if (order.cancellationRequest) {
      return NextResponse.json({ message: 'Cancellation request already submitted!' }, { status: 400 })
    }

    const cancellationRequest = await prisma.cancellationRequest.create({
      data: {
        orderId: order.id,
        reason,
        details: details || '',
        status: 'pending'
      }
    })

    return NextResponse.json({ message: 'Cancellation request submitted!', cancellationRequest }, { status: 201 })
  } catch (error) {
    console.log('CANCELLATION ERROR:', error.message)
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

    const requests = await prisma.cancellationRequest.findMany({
      where: { order: { email } },
      include: { order: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ requests }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}