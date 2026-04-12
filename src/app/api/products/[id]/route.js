import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id }
    })
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ product }, { status: 200 })
  } catch (error) {
    console.log('ERROR:', error.message)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}