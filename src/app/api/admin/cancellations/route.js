import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const requests = await prisma.cancellationRequest.findMany({
      include: { order: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ requests }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}