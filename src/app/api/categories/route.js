import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_CATEGORIES = [
  { name: 'Electronics', icon: '💻', sortOrder: 1 },
  { name: 'Fashion', icon: '👗', sortOrder: 2 },
  { name: 'Home', icon: '🏠', sortOrder: 3 },
  { name: 'Beauty', icon: '💄', sortOrder: 4 },
  { name: 'Sports', icon: '⚽', sortOrder: 5 },
  { name: 'Books', icon: '📚', sortOrder: 6 },
  { name: 'Toys', icon: '🧸', sortOrder: 7 },
]

export async function GET() {
  try {
    let categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })

    if (categories.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await prisma.category.create({ data: cat })
      }
      categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      })
    }

    return NextResponse.json({ categories }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}