import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req, { params }) {
  try {
    const { id } = await params
    const { reply, status } = await req.json()

    const ticket = await prisma.ticket.findUnique({ where: { id } })
    if (!ticket) {
      return NextResponse.json({ message: 'Ticket not found!' }, { status: 404 })
    }

    const existingMessages = Array.isArray(ticket.messages) ? ticket.messages : []
    let updatedMessages = [...existingMessages]

    if (reply) {
      const adminMessage = {
        sender: 'admin',
        text: reply,
        createdAt: new Date().toISOString()
      }
      updatedMessages = [...existingMessages, adminMessage]
    }

    const updateData = { messages: updatedMessages }
    if (reply) updateData.reply = reply
    if (status) updateData.status = status

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ message: 'Ticket updated!', ticket: updatedTicket }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}