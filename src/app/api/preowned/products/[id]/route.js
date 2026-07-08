import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    const { id } = await params
    const product = await prisma.preownedProduct.findUnique({ where: { id } })
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 })
    return NextResponse.json({ product }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params
    const body = await req.json()
    const product = await prisma.preownedProduct.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        originalPrice: parseFloat(body.originalPrice || body.price),
        images: body.images || [],
        category: body.category,
        condition: body.condition || 'good',
        stock: parseInt(body.stock) || 0,
        featured: body.featured || false,
        sameDayPincodes: body.sameDayPincodes || []
      }
    })
    return NextResponse.json({ message: 'Product updated!', product }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params
    await prisma.preownedProduct.delete({ where: { id } })
    return NextResponse.json({ message: 'Product deleted!' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}