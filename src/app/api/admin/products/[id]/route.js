import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(req, { params }) {
  try {
    const { id } = await params
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ message: 'Product deleted!' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, description, price, originalPrice, images, category, stock, featured } = body

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        originalPrice: parseFloat(originalPrice) || parseFloat(price),
        images: images || [],
        category,
        stock: parseInt(stock) || 0,
        featured: featured || false
      }
    })

    return NextResponse.json({ message: 'Product updated!', product }, { status: 200 })
  } catch (error) {
    console.log('PUT ERROR:', error.message)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}