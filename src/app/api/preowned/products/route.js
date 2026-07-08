import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    const where = {}
    if (category) where.category = category
    if (featured === 'true') where.featured = true

    const products = await prisma.preownedProduct.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ products }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, description, price, originalPrice, images, category, condition, stock, featured, sameDayPincodes } = body

    if (!name || !description || !price || !category) {
      return NextResponse.json({ message: 'Required fields missing' }, { status: 400 })
    }

    const product = await prisma.preownedProduct.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        originalPrice: parseFloat(originalPrice || price),
        images: images || [],
        category,
        condition: condition || 'good',
        stock: parseInt(stock) || 1,
        featured: featured || false,
        sameDayPincodes: sameDayPincodes || []
      }
    })

    return NextResponse.json({ message: 'Product added!', product }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}