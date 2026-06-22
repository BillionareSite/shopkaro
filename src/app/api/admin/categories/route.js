import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' }
    })
    return NextResponse.json({ categories }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { name, icon, image } = await req.json()

    if (!name?.trim()) {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 })
    }

    const existing = await prisma.category.findUnique({
      where: { name: name.trim() }
    })

    if (existing) {
      return NextResponse.json({ message: 'Category already exists!' }, { status: 400 })
    }

    const count = await prisma.category.count()

    const category = await prisma.category.create({
     data: {
  name: name.trim(),
  icon: icon?.trim() || '🛍️',
  image: image?.trim() || '',   // ← ADD THIS
  isActive: true,
  sortOrder: count + 1
}
    })

    return NextResponse.json({ message: 'Category created!', category }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}