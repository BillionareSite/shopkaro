import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req, { params }) {
  try {
    const { id } = await params
    const body = await req.json()

    const updateData = {}
    if (body.reply !== undefined) updateData.reply = body.reply
    if (body.status !== undefined) updateData.status = body.status

    const ticket = await prisma.ticket.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ message: 'Ticket updated!', ticket }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}