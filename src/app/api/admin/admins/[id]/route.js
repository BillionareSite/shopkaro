import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PATCH(req, { params }) {
  try {
    const { id } = await params
    const body = await req.json()

    const updateData = {
      name: body.name,
      permissions: body.permissions || [],
      isActive: body.isActive
    }

    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10)
    }

    const admin = await prisma.adminUser.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ message: 'Admin updated!', admin }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params
    await prisma.adminUser.delete({ where: { id } })
    return NextResponse.json({ message: 'Admin deleted!' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}