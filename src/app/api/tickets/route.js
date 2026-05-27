import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const { name, email, subject, message } = await req.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    const initialMessage = {
      sender: 'user',
      text: message,
      createdAt: new Date().toISOString()
    }

    const ticket = await prisma.ticket.create({
      data: {
        name,
        email,
        subject,
        message,
        messages: [initialMessage]
      }
    })

    return NextResponse.json({ message: 'Ticket submitted!', ticket }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ message: 'Email required' }, { status: 400 })
    }

    const tickets = await prisma.ticket.findMany({
      where: { email },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ tickets }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const { id, text, email } = await req.json()

    if (!id || !text || !email) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    const ticket = await prisma.ticket.findUnique({ where: { id } })

    if (!ticket) {
      return NextResponse.json({ message: 'Ticket not found!' }, { status: 404 })
    }

    if (ticket.email !== email) {
      return NextResponse.json({ message: 'Unauthorized!' }, { status: 403 })
    }

    const existingMessages = Array.isArray(ticket.messages) ? ticket.messages : []

    const newMessage = {
      sender: 'user',
      text,
      createdAt: new Date().toISOString()
    }

    const updatedMessages = [...existingMessages, newMessage]

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        messages: updatedMessages,
        status: 'open'
      }
    })

    return NextResponse.json({ message: 'Reply sent!', ticket: updatedTicket }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}