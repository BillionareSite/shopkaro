import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const body = await req.json()
    console.log('Received:', body)
    console.log('Prisma:', prisma)

    const { name, description, price, originalPrice, image, category, stock } = body

    if (!name || !price || !category) {
      return NextResponse.json({ message: 'Name, price and category are required' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        originalPrice: parseFloat(originalPrice) || parseFloat(price),
        image: image || '',
        category,
        stock: parseInt(stock) || 0
      }
    })

    return NextResponse.json({ message: 'Product added successfully!', product }, { status: 201 })

  } catch (error) {
    console.log('ERROR:', error.message)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}