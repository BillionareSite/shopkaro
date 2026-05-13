import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const { name, email, subject, message } = await req.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    const ticket = await prisma.ticket.create({
      data: { name, email, subject, message }
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