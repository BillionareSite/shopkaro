import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(req, { params }) {
  try {
    const { id } = await params  // ← just add await here
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ message: 'Product deleted!' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}