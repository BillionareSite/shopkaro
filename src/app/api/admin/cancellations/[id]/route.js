import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req, { params }) {
  try {
    const { id } = await params
    const { action } = await req.json()

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 })
    }

    const cancellationRequest = await prisma.cancellationRequest.findUnique({
      where: { id },
      include: { order: true }
    })

    if (!cancellationRequest) {
      return NextResponse.json({ message: 'Request not found!' }, { status: 404 })
    }

    const updatedRequest = await prisma.cancellationRequest.update({
      where: { id },
      data: { status: action === 'approve' ? 'approved' : 'rejected' }
    })

    if (action === 'approve') {
      await prisma.order.update({
        where: { id: cancellationRequest.orderId },
        data: { status: 'cancelled' }
      })

      for (const item of cancellationRequest.order.items) {
        const product = await prisma.product.findUnique({ where: { id: item.id } })
        if (product) {
          await prisma.product.update({
            where: { id: item.id },
            data: { stock: product.stock + item.quantity }
          })
        }
      }
    }

    return NextResponse.json({ message: action === 'approve' ? 'Order cancelled!' : 'Request rejected!', request: updatedRequest }, { status: 200 })
  } catch (error) {
    console.log('CANCELLATION PATCH ERROR:', error.message)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}