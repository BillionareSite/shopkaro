import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.user.updateMany({
      where: { verified: false },
      data: { verified: true }
    })
    return NextResponse.json({ message: 'All users verified!' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}