import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req, { params }) {
  try {
    const { id } = await params
    const body = await req.json()

    const category = await prisma.category.update({
      where: { id },
    data: {
  name: body.name?.trim(),
  icon: body.icon?.trim(),
  image: body.image?.trim() ?? undefined,,
  isActive: body.isActive,
  sortOrder: body.sortOrder
}
    })

    return NextResponse.json({ message: 'Category updated!', category }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params

    const productsUsingCategory = await prisma.product.count({
      where: { category: { equals: (await prisma.category.findUnique({ where: { id } }))?.name } }
    })

    if (productsUsingCategory > 0) {
      return NextResponse.json({
        message: `Cannot delete — ${productsUsingCategory} product(s) use this category. Reassign them first.`
      }, { status: 400 })
    }

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ message: 'Category deleted!' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}